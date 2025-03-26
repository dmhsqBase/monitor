import { MonitorConfig } from '@dmhsq_monitor/core';

/**
 * Web监控配置接口，扩展核心配置
 */
export interface WebMonitorConfig extends MonitorConfig {
  /** 是否启用自动错误捕获 */
  enableAutoErrorCapture?: boolean;
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean;
  /** 是否启用XHR/Fetch请求监控 */
  enableRequestMonitoring?: boolean;
  /** 是否启用用户行为监控 */
  enableBehaviorMonitoring?: boolean;
  /** 是否启用路由变化监控 */
  enableRouteMonitoring?: boolean;
  /** 是否启用控制台错误监控 */
  enableConsoleMonitoring?: boolean;
  /** 错误采样率 (0-1) */
  errorSamplingRate?: number;
  /** 行为采样率 (0-1) */
  behaviorSamplingRate?: number;
  /** 忽略特定错误的正则表达式或字符串数组 */
  ignoreErrors?: (string | RegExp)[];
  /** 忽略特定URL的正则表达式数组 */
  ignoreUrls?: RegExp[];
  /**
   * 启用性能监控
   */
  enablePerformance?: boolean;
  /**
   * 启用错误监控
   */
  enableError?: boolean;
}

/**
 * 性能数据接口
 */
export interface PerformanceData {
  /**
   * 页面加载总时间
   */
  loadTime: number;
  /**
   * DOM加载时间
   */
  domReadyTime: number;
  /**
   * 重定向时间
   */
  redirectTime: number;
  /**
   * DNS解析时间
   */
  dnsTime: number;
  /**
   * TCP连接时间
   */
  tcpTime: number;
  /**
   * Time to First Byte (服务器响应时间)
   */
  ttfb: number;
  /**
   * 内容下载时间
   */
  responseTime: number;
  /**
   * DOM Content Loaded 事件触发时间
   */
  domContentLoadedTime: number;
  /**
   * 页面URL
   */
  url: string;
  /**
   * 首次绘制时间 (First Paint)
   */
  firstPaint?: number;
  /**
   * 首次内容绘制时间 (First Contentful Paint)
   */
  firstContentfulPaint?: number;
}

/**
 * 网络请求数据接口
 */
export interface RequestData {
  /** 请求URL */
  url: string;
  /** 请求方法 */
  method: string;
  /** 状态码 */
  status?: number;
  /** 请求开始时间 */
  startTime: number;
  /** 请求结束时间 */
  endTime?: number;
  /** 请求持续时间 */
  duration?: number;
  /** 请求头 */
  requestHeaders?: Record<string, string>;
  /** 响应头 */
  responseHeaders?: Record<string, string>;
  /** 请求体 */
  requestBody?: string;
  /** 响应体 */
  responseBody?: string;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  errorMessage?: string;
}

/**
 * 用户行为数据接口
 */
export interface BehaviorData {
  /** 行为类型 */
  type: 'click' | 'input' | 'scroll' | 'navigation' | 'custom';
  /** 页面URL */
  url: string;
  /** 元素路径 */
  path?: string;
  /** 元素ID */
  elementId?: string;
  /** 元素类名 */
  className?: string;
  /** 元素内容 */
  content?: string;
  /** 用户输入内容 */
  inputValue?: string;
  /** 滚动位置 */
  scrollPosition?: { x: number; y: number };
  /** 相关数据 */
  meta?: Record<string, any>;
}

export interface ErrorInfo {
  message: string;
  name: string;
  stack?: string;
  cause?: any;
}

export interface JSError extends ErrorInfo {
  url: string;
  timestamp: number;
  userAgent: string;
}

export interface ResourceError {
  tagName: string;
  src?: string;
  href?: string;
  outerHTML?: string;
  url: string;
  timestamp: number;
}

export interface UnhandledRejectionError extends ErrorInfo {
  type: string;
  url: string;
  timestamp: number;
} 