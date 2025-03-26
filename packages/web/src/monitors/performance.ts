import { IMonitor, EventType } from '@dmhsq_monitor/core';
import { WebMonitorConfig, PerformanceData } from '../types';
import { EVENT_TYPES } from '../constants';
import { shouldSample } from '../utils';

/**
 * 性能监控
 */
export class PerformanceMonitor {
  private monitor: IMonitor;
  private config: WebMonitorConfig;
  private isInstalled: boolean = false;
  private originalOnLoad: ((this: Window, ev: Event) => any) | null = null;
  private visibilityChangeHandler: ((event: Event) => void) | null = null;

  constructor(monitor: IMonitor, config: WebMonitorConfig) {
    this.monitor = monitor;
    this.config = config;
    this.originalOnLoad = null;
  }

  /**
   * 初始化性能监控
   */
  public install(): void {
    if (this.isInstalled) return;
    
    // 检查是否启用了性能监控
    if (this.config.enablePerformance === false && this.config.enablePerformanceMonitoring === false) {
      return;
    }

    // 注册页面加载性能收集
    this.setupLoadPerformanceMonitor();
    
    // 注册页面可见性变化监听
    this.setupVisibilityChangeMonitor();

    this.isInstalled = true;
  }

  /**
   * 卸载性能监控
   */
  public uninstall(): void {
    if (!this.isInstalled) return;

    // 移除页面可见性监听
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }

    this.isInstalled = false;
  }

  /**
   * 设置页面加载性能监控
   */
  private setupLoadPerformanceMonitor(): void {
    // 再次检查性能监控是否启用
    if (this.config.enablePerformance === false && this.config.enablePerformanceMonitoring === false) {
      return;
    }
    
    // 如果页面已加载，则立即收集
    if (document.readyState === 'complete') {
      this.collectPageLoadPerformance();
    } else {
      // 否则等待页面加载完成
      window.addEventListener('load', () => {
        // 延迟一点收集，确保所有性能数据都可用
        setTimeout(() => this.collectPageLoadPerformance(), 0);
      });
    }
  }

  /**
   * 收集页面加载性能数据
   */
  private collectPageLoadPerformance(): void {
    // 再次检查性能监控是否启用
    if (this.config.enablePerformance === false && this.config.enablePerformanceMonitoring === false) {
      return;
    }
    
    // 采样控制
    const samplingRate = this.config.errorSamplingRate || 1.0;
    if (!shouldSample(samplingRate)) return;
    
    // 使用Performance API获取性能数据
    if (!window.performance || !window.performance.timing) {
      return;
    }

    const timing = window.performance.timing;
    const performanceData: PerformanceData = {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domReadyTime: timing.domComplete - timing.domLoading,
      redirectTime: timing.redirectEnd - timing.redirectStart,
      dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
      tcpTime: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart,
      responseTime: timing.responseEnd - timing.responseStart,
      domContentLoadedTime: timing.domContentLoadedEventEnd - timing.navigationStart,
      url: window.location.href
    };

    // 收集首次绘制和首次内容绘制时间 (如果可用)
    this.collectPaintTimings(performanceData);

    // 上报性能数据
    this.monitor.report({
      type: EventType.PERFORMANCE,
      name: EVENT_TYPES.PAGE_LOAD,
      data: performanceData
    });
  }

  /**
   * 收集绘制时间指标
   * @param performanceData 性能数据对象
   */
  private collectPaintTimings(performanceData: PerformanceData): void {
    if (window.performance && 'getEntriesByType' in window.performance) {
      const paintMetrics = window.performance.getEntriesByType('paint');
      
      paintMetrics.forEach(entry => {
        const { name, startTime } = entry;
        
        if (name === 'first-paint') {
          performanceData.firstPaint = Math.round(startTime);
        } else if (name === 'first-contentful-paint') {
          performanceData.firstContentfulPaint = Math.round(startTime);
        }
      });
    }
  }

  /**
   * 设置页面可见性变化监控
   */
  private setupVisibilityChangeMonitor(): void {
    // 再次检查性能监控是否启用
    if (this.config.enablePerformance === false && this.config.enablePerformanceMonitoring === false) {
      return;
    }
    
    this.visibilityChangeHandler = () => {
      // 再次检查性能监控是否启用
      if (this.config.enablePerformance === false && this.config.enablePerformanceMonitoring === false) {
        return;
      }
      
      // 采样控制
      const samplingRate = this.config.errorSamplingRate || 1.0;
      if (!shouldSample(samplingRate)) return;
      
      const isVisible = document.visibilityState === 'visible';
      
      this.monitor.report({
        type: EventType.PERFORMANCE,
        name: EVENT_TYPES.PAGE_VISIBILITY,
        data: {
          isVisible,
          timestamp: Date.now(),
          url: window.location.href
        }
      });
    };
    
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }
} 