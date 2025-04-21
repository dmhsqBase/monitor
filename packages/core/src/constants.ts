/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  debug: false,
  reportInterval: 5000,  // 5秒
  maxCache: 100,
};

/**
 * SDK 版本
 */
export const SDK_VERSION = '1.0.9';

/**
 * SDK 名称
 */
export const SDK_NAME = 'monitor-sdk';

/**
 * 存储键名
 */
export const STORAGE_KEY = 'monitor_events';

/**
 * 用户ID存储键名
 */
export const USER_ID_KEY = 'monitor_user_id';

/**
 * 会话ID存储键名
 */
export const SESSION_ID_KEY = 'monitor_session_id';

/**
 * 最大重试次数
 */
export const MAX_RETRY_COUNT = 3;

/**
 * 重试延迟时间(ms)
 */
export const RETRY_DELAY = 1000;

/**
 * 错误类型
 */
export const ERROR_TYPES = {
  JS: 'js',
  RESOURCE: 'resource',
  PROMISE: 'promise',
  AJAX: 'ajax',
  OTHER: 'other',
}; 