import { MonitorEvent, EventType } from '@dmhsq_monitor/core';
import { IProcessor, ProcessorConfig, ProcessResult } from './types';
import { ConfigManager } from './config';
import { 
  isDuplicateEvent, 
  cleanupEventHashes,
  getUserIp,
  getGeoInfo,
  groupSimilarErrors
} from './utils';
import { 
  PROCESSOR_NAME,
  PROCESSOR_VERSION,
  ProcessStatus
} from './constants';
import { initDeduplication } from './utils/deduplication';

/**
 * 数据处理器核心类
 */
export class Processor implements IProcessor {
  private configManager: ConfigManager;
  
  constructor() {
    this.configManager = new ConfigManager();
    
    // 初始化重复检测功能
    initDeduplication();
    
    // 定期清理过期的去重哈希记录
    setInterval(() => {
      cleanupEventHashes();
    }, 60 * 60 * 1000); // 每小时清理一次
  }
  
  /**
   * 初始化处理器
   * @param config 配置对象
   */
  public init(config: ProcessorConfig): void {
    this.configManager.init(config);
    
    console.log(`[${PROCESSOR_NAME}] 初始化完成，版本: ${PROCESSOR_VERSION}`);
  }
  
  /**
   * 处理单个事件
   * @param event 监控事件
   * @param context 上下文信息
   * @returns 处理后的事件或null（如果被过滤）
   */
  public async process(event: MonitorEvent, context: any): Promise<MonitorEvent | null> {
    // 检查是否为重复事件
    if (this.configManager.isDeduplicateEnabled()) {
      if (isDuplicateEvent(event, this.configManager.getDeduplicateWindow())) {
        console.log(`[${PROCESSOR_NAME}] 检测到重复事件，已过滤: ${event.type} - ${event.name}`);
        return null;
      }
    }
    
    // 应用自定义处理器
    const customProcessors = this.configManager.getCustomProcessors();
    let processedEvent = { ...event };
    
    for (const processor of customProcessors) {
      try {
        const result = processor(processedEvent, context);
        if (!result) {
          console.log(`[${PROCESSOR_NAME}] 事件被自定义处理器过滤: ${processedEvent.type} - ${processedEvent.name}`);
          return null;
        }
        processedEvent = result;
      } catch (error) {
        console.error(`[${PROCESSOR_NAME}] 自定义处理器执行失败:`, error);
      }
    }
    
    // 扩充事件信息
    processedEvent = await this.enrichEvent(processedEvent, context);
    
    return processedEvent;
  }
  
  /**
   * 批量处理事件
   * @param events 事件数组
   * @param context 上下文信息
   * @returns 处理后的事件数组
   */
  public async batchProcess(events: MonitorEvent[], context: any): Promise<MonitorEvent[]> {
    const originalCount = events.length;
    let processedEvents: MonitorEvent[] = [];
    let duplicateCount = 0;
    
    // 1. 逐个处理事件
    for (const event of events) {
      const processedEvent = await this.process(event, context);
      if (processedEvent) {
        processedEvents.push(processedEvent);
      } else {
        duplicateCount++;
      }
    }
    
    // 2. 合并相似错误
    if (this.configManager.shouldMergeSimilarErrors()) {
      const beforeMergeCount = processedEvents.length;
      processedEvents = groupSimilarErrors(processedEvents);
      const mergedCount = beforeMergeCount - processedEvents.length;
      
      console.log(`[${PROCESSOR_NAME}] 合并了 ${mergedCount} 个相似错误`);
    }
    
    console.log(`[${PROCESSOR_NAME}] 批量处理完成: 原始=${originalCount}, 处理后=${processedEvents.length}, 去重=${duplicateCount}`);
    
    return processedEvents;
  }
  
  /**
   * 获取当前配置
   * @returns 配置对象
   */
  public getConfig(): ProcessorConfig {
    return this.configManager.getConfig();
  }
  
  /**
   * 更新配置
   * @param config 部分配置对象
   */
  public updateConfig(config: Partial<ProcessorConfig>): void {
    this.configManager.updateConfig(config);
  }
  
  /**
   * 清理重复事件缓存
   * 公开方法，用于手动清理缓存
   */
  public cleanupCache(maxAge?: number): void {
    cleanupEventHashes(maxAge);
  }
  
  /**
   * 使内部方法在调试时可访问
   * 注意：这些方法不应用于生产环境
   */
  _cleanupEventHashes = cleanupEventHashes;
  
  /**
   * 扩充事件信息
   * @param event 原始事件
   * @param context 上下文信息
   * @returns 扩充后的事件
   */
  private async enrichEvent(event: MonitorEvent, context: any): Promise<MonitorEvent> {
    const enrichedEvent = { ...event };
    const metadata: Record<string, any> = {};
    
    // 添加用户IP信息
    if (this.configManager.shouldCollectUserIp()) {
      try {
        const ipInfo = await getUserIp();
        metadata.userIp = ipInfo.ip;
        metadata.isPrivateIp = ipInfo.isPrivate;
        
        // 添加地理位置信息
        if (this.configManager.shouldCollectGeoInfo() && !ipInfo.isPrivate) {
          const geoInfo = await getGeoInfo(ipInfo.ip);
          metadata.geo = geoInfo;
        }
      } catch (error) {
        console.error(`[${PROCESSOR_NAME}] 获取IP信息失败:`, error);
      }
    }
    
    // 添加浏览器信息
    if (typeof navigator !== 'undefined') {
      metadata.browser = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform
      };
    }
    
    // 添加元数据
    enrichedEvent.data = {
      ...enrichedEvent.data,
      metadata: {
        ...enrichedEvent.data?.metadata,
        ...metadata,
        processor: {
          name: PROCESSOR_NAME,
          version: PROCESSOR_VERSION,
          processedAt: new Date().toISOString()
        }
      }
    };
    
    return enrichedEvent;
  }
} 