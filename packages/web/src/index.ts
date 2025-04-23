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
    // 处理显式禁用功能的情况
    const processedConfig = { ...DEFAULT_CONFIG, ...config };
    
    // 确保配置的一致性
    if (config.enablePerformance === false) {
      processedConfig.enablePerformance = false;
      processedConfig.enablePerformanceMonitoring = false;
    }
    
    if (config.enableError === false) {
      processedConfig.enableError = false;
      processedConfig.enableAutoErrorCapture = false;
    }
    
    this.config = processedConfig;
    this.monitor = new Monitor();
    
    // 立即初始化处理器，确保在其他操作前配置好
    this.processor = new Processor();
    this.processor.updateConfig({
      enableDeduplicate: this.config.enableDeduplicate !== false,
      collectGeoInfo: this.config.collectGeoInfo === true,
      mergeSimilarErrors: this.config.mergeSimilarErrors !== false,
      customProcessors: []
    });
    
    if (processedConfig.debug) {
      console.log('[WebMonitor] Processor initialized with config:', this.processor.getConfig());
    }
  }

  /**
   * 初始化并启动监控
   */
  public start(): void {
    if (this.isStarted) return;

    // 初始化核心监控
    this.monitor.init(this.config);
    
    // 注册事件处理钩子 - 确保在上报前进行数据处理
    const originalOnReport = this.config.onReport;
    this.config.onReport = async (events, context) => {
      try {
        // 使用处理器处理事件
        const processedEvents = await this.processor.batchProcess(events, context);
        
        // 如果有自定义上报回调，则调用
        if (typeof originalOnReport === 'function') {
          return originalOnReport(processedEvents, context);
        }
        
        return processedEvents;
      } catch (error) {
        console.error('[WebMonitor] Error processing events:', error);
        // 出错时仍然返回原始事件，确保数据不丢失
        return typeof originalOnReport === 'function' ? originalOnReport(events, context) : events;
      }
    };

    this.monitor.start();

    // 初始化错误监控
    if (this.config.enableError !== false && this.config.enableAutoErrorCapture !== false) {
      this.errorMonitor = new ErrorMonitor(this.monitor, this.config);
      this.errorMonitor.install();
    }

    // 初始化性能监控，只有当明确启用时才初始化
    if (this.config.enablePerformance === true && this.config.enablePerformanceMonitoring !== false) {
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
  
  /**
   * 手动清理处理器的重复事件缓存
   */
  public clearDeduplicationCache(): void {
    // 通过公开的API调用处理器的清理方法
    const cleanupFn = (this.processor as any)._cleanupEventHashes;
    if (typeof cleanupFn === 'function') {
      cleanupFn();
    }
  }
}

export * from './types';
export * from './monitors';
export * from './constants'; 