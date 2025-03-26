import { ProcessorConfig } from './types';
import { DEFAULT_DEDUPLICATE_WINDOW, DEFAULT_ERROR_SIMILARITY_THRESHOLD } from './constants';

/**
 * 处理器配置管理器
 */
export class ConfigManager {
  private config: ProcessorConfig = {
    enableDeduplicate: true,
    deduplicateWindow: DEFAULT_DEDUPLICATE_WINDOW,
    collectUserIp: true,
    collectGeoInfo: false,
    mergeSimilarErrors: true,
    customProcessors: []
  };
  
  /**
   * 初始化配置
   * @param config 配置对象
   */
  public init(config: ProcessorConfig): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
  
  /**
   * 更新配置
   * @param config 部分配置对象
   */
  public updateConfig(config: Partial<ProcessorConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
  
  /**
   * 获取完整配置
   * @returns 配置对象
   */
  public getConfig(): ProcessorConfig {
    return { ...this.config };
  }
  
  /**
   * 是否启用重复数据去重
   * @returns 是否启用
   */
  public isDeduplicateEnabled(): boolean {
    return !!this.config.enableDeduplicate;
  }
  
  /**
   * 获取重复数据检测时间窗口
   * @returns 时间窗口（毫秒）
   */
  public getDeduplicateWindow(): number {
    return this.config.deduplicateWindow || DEFAULT_DEDUPLICATE_WINDOW;
  }
  
  /**
   * 是否收集用户IP
   * @returns 是否收集
   */
  public shouldCollectUserIp(): boolean {
    return !!this.config.collectUserIp;
  }
  
  /**
   * 是否收集地理位置信息
   * @returns 是否收集
   */
  public shouldCollectGeoInfo(): boolean {
    return !!this.config.collectGeoInfo;
  }
  
  /**
   * 是否合并相似错误
   * @returns 是否合并
   */
  public shouldMergeSimilarErrors(): boolean {
    return !!this.config.mergeSimilarErrors;
  }
  
  /**
   * 获取自定义处理器
   * @returns 自定义处理器数组
   */
  public getCustomProcessors(): Array<(event: any, context: any) => any> {
    return this.config.customProcessors || [];
  }
} 