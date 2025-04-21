/**
 * 监控配置接口
 */
export interface MonitorConfig {
  /** 应用ID */
  appId: string;
  /** 应用Token */
  appToken: string;
  /** 服务端地址 */
  serverUrl: string;
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 上报间隔时间(ms) */
  reportInterval?: number;
  /** 最大缓存条数 */
  maxCache?: number;
  /** 自定义上下文信息 */
  context?: Record<string, any>;
}

/**
 * 监控事件类型枚举
 */
export enum EventType {
  /** 错误 */
  ERROR = 'error',
  /** 性能 */
  PERFORMANCE = 'performance',
  /** 用户行为 */
  BEHAVIOR = 'behavior',
  /** 自定义事件 */
  CUSTOM = 'custom'
}

/**
 * 监控事件接口
 */
export interface MonitorEvent {
  /** 事件类型 */
  type: EventType;
  /** 事件名称 */
  name: string;
  /** 事件数据 */
  data: any;
  /** 事件发生时间 */
  timestamp: number;
  /** 事件ID */
  id: string;
}

/**
 * 错误事件接口
 */
export interface ErrorEvent extends MonitorEvent {
  type: EventType.ERROR;
  data: {
    /** 错误消息 */
    message: string;
    /** 错误栈信息 */
    stack?: string;
    /** 错误类型 */
    errorType: 'js' | 'resource' | 'promise' | 'ajax' | 'other';
    /** 额外信息 */
    extra?: Record<string, any>;
  };
}

/**
 * 监控实例接口
 */
export interface IMonitor {
  /** 初始化监控 */
  init(config: MonitorConfig): void;
  /** 启动监控 */
  start(): void;
  /** 停止监控 */
  stop(): void;
  /** 手动上报事件 */
  report(event: Partial<MonitorEvent>): void;
  /** 获取当前配置 */
  getConfig(): MonitorConfig;
  /** 更新配置 */
  updateConfig(config: Partial<MonitorConfig>): void;
} 