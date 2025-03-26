import { Monitor, IMonitor } from '@dmhsq_monitor/core';
import { Processor } from '@dmhsq_monitor/processor';
import { WebMonitorConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import { ErrorMonitor, PerformanceMonitor } from './monitors';

/**
 * Web监控实例
 */
export class WebMonitor {
  private monitor: IMonitor;
  private processor: Processor;
  private config: WebMonitorConfig;
  private errorMonitor: ErrorMonitor | null = null;
  private performanceMonitor: PerformanceMonitor | null = null;
  private isStarted: boolean = false;

  /**
   * 创建Web监控实例
   * @param config 配置
   */
  constructor(config: WebMonitorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.monitor = new Monitor();
    this.processor = new Processor();
  }

  /**
   * 初始化并启动监控
   */
  public start(): void {
    if (this.isStarted) return;

    // 初始化核心监控
    this.monitor.init(this.config);
    
    // 初始化处理器
    this.processor.init({
      enableDeduplicate: this.config.enableDeduplicate !== false,
      collectUserIp: this.config.collectUserIp !== false,
      collectGeoInfo: !!this.config.collectGeoInfo,
      mergeSimilarErrors: this.config.mergeSimilarErrors !== false
    });

    // 注册事件处理钩子
    const originalOnReport = this.config.onReport;
    this.config.onReport = async (events, context) => {
      // 使用处理器处理事件
      const processedEvents = await this.processor.batchProcess(events, context);
      
      // 如果有自定义上报回调，则调用
      if (typeof originalOnReport === 'function') {
        return originalOnReport(processedEvents, context);
      }
      
      return processedEvents;
    };

    this.monitor.start();

    // 初始化错误监控
    if (this.config.enableError || this.config.enableAutoErrorCapture) {
      this.errorMonitor = new ErrorMonitor(this.monitor, this.config);
      this.errorMonitor.install();
    }

    // 初始化性能监控
    if (this.config.enablePerformance || this.config.enablePerformanceMonitoring) {
      this.performanceMonitor = new PerformanceMonitor(this.monitor, this.config);
      this.performanceMonitor.install();
    }

    this.isStarted = true;
  }

  /**
   * 停止监控
   */
  public stop(): void {
    if (!this.isStarted) return;

    // 停止错误监控
    if (this.errorMonitor) {
      this.errorMonitor.uninstall();
      this.errorMonitor = null;
    }

    // 停止性能监控
    if (this.performanceMonitor) {
      this.performanceMonitor.uninstall();
      this.performanceMonitor = null;
    }

    // 停止核心监控
    this.monitor.stop();
    this.isStarted = false;
  }

  /**
   * 手动上报事件
   * @param event 事件对象
   */
  public report(event: any): void {
    this.monitor.report(event);
  }

  /**
   * 获取核心监控实例
   */
  public getMonitor(): IMonitor {
    return this.monitor;
  }
  
  /**
   * 获取处理器实例
   */
  public getProcessor(): Processor {
    return this.processor;
  }
}

export * from './types';
export * from './monitors';
export * from './constants'; 