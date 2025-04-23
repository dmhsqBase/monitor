/**
 * 处理器名称
 */
export const PROCESSOR_NAME = 'DMHSQMonitorProcessor';

/**
 * 处理器版本
 */
export const PROCESSOR_VERSION = '1.0.20';

/**
 * 默认重复数据检测时间窗口（毫秒）
 * 30分钟内相同类型的错误只记录一次
 */
export const DEFAULT_DEDUPLICATE_WINDOW = 30 * 60 * 1000;

/**
 * 默认错误信息相似度阈值
 * 当相似度大于该值时认为是同一错误
 */
export const DEFAULT_ERROR_SIMILARITY_THRESHOLD = 0.85;

/**
 * 支持的地理位置查询服务提供商
 */
export enum GeoProvider {
  IPAPI = 'ipapi',
  IPINFO = 'ipinfo',
  CUSTOM = 'custom'
}

/**
 * 处理结果状态码
 */
export enum ProcessStatus {
  /** 成功 */
  SUCCESS = 'success',
  /** 被过滤 */
  FILTERED = 'filtered',
  /** 重复数据 */
  DUPLICATE = 'duplicate',
  /** 处理失败 */
  FAILED = 'failed'
} 