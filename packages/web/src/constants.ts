/**
 * 事件类型常量
 */
export const EVENT_TYPES = {
  // 错误类型
  JS_ERROR: 'js_error',
  RESOURCE_ERROR: 'resource_error',
  UNHANDLED_REJECTION: 'unhandled_rejection',
  HTTP_ERROR: 'http_error',
  CONSOLE_ERROR: 'console_error',
  
  // 性能类型
  PAGE_LOAD: 'page_load',
  PAGE_VISIBILITY: 'page_visibility',
  RESOURCE_PERFORMANCE: 'resource_performance',
  LARGEST_CONTENTFUL_PAINT: 'largest_contentful_paint',
  FIRST_INPUT_DELAY: 'first_input_delay',
  CUMULATIVE_LAYOUT_SHIFT: 'cumulative_layout_shift',
  
  // 用户行为类型
  CLICK: 'click',
  PAGE_VIEW: 'page_view',
  CUSTOM: 'custom'
};

/**
 * Web监控版本
 */
export const WEB_MONITOR_VERSION = '1.0.10';

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  enableAutoErrorCapture: true,
  enablePerformanceMonitoring: true,
  enableRequestMonitoring: true,
  enableBehaviorMonitoring: false,
  enableRouteMonitoring: true,
  enableConsoleMonitoring: false,
  enablePerformance: true,
  enableError: true,
  errorSamplingRate: 1.0,
  behaviorSamplingRate: 0.5,
  maxCache: 100,
  reportInterval: 5000
};

/**
 * 最大内容长度 (用于截断收集的数据)
 */
export const MAX_CONTENT_LENGTH = 2000;

/**
 * 内容采样率 (特定内容的采样)
 */
export const CONTENT_SAMPLING_RATES = {
  ERROR_STACK: 1.0,
  CONSOLE_LOGS: 0.1,
  REQUEST_BODY: 0.1,
  RESPONSE_BODY: 0.1,
  INPUT_VALUES: 0.1
}; 