import { MonitorEvent } from '@dmhsq_monitor/core';

/**
 * 处理器配置接口
 */
export interface ProcessorConfig {
  /** 是否启用重复数据去重 */
  enableDeduplicate?: boolean;
  /** 重复数据检测时间窗口（毫秒） */
  deduplicateWindow?: number;
  /** 是否收集用户IP */
  collectUserIp?: boolean;
  /** 是否收集用户地理位置信息 */
  collectGeoInfo?: boolean;
  /** 是否合并相似错误 */
  mergeSimilarErrors?: boolean;
  /** 自定义数据处理函数 */
  customProcessors?: Array<(event: MonitorEvent, context: any) => MonitorEvent>;
}

/**
 * 处理器接口
 */
export interface IProcessor {
  /** 初始化处理器 */
  init(config: ProcessorConfig): void;
  /** 处理单个事件 */
  process(event: MonitorEvent, context: any): Promise<MonitorEvent | null>;
  /** 批量处理事件 */
  batchProcess(events: MonitorEvent[], context: any): Promise<MonitorEvent[]>;
  /** 获取当前配置 */
  getConfig(): ProcessorConfig;
  /** 更新配置 */
  updateConfig(config: Partial<ProcessorConfig>): void;
}

/**
 * 处理结果接口
 */
export interface ProcessResult {
  /** 处理后的事件 */
  events: MonitorEvent[];
  /** 处理过程中的统计信息 */
  stats: {
    /** 原始事件数量 */
    totalEvents: number;
    /** 处理后事件数量 */
    processedEvents: number;
    /** 去重数量 */
    duplicates: number;
    /** 合并的错误数量 */
    mergedErrors: number;
  };
}

/**
 * 用户IP信息接口
 */
export interface UserIpInfo {
  /** IP地址 */
  ip: string;
  /** 是否为内网IP */
  isPrivate: boolean;
}

/**
 * 地理位置信息接口
 */
export interface GeoInfo {
  /** 国家 */
  country?: string;
  /** 地区/省份 */
  region?: string;
  /** 城市 */
  city?: string;
  /** 运营商 */
  isp?: string;
  /** 时区 */
  timezone?: string;
} 