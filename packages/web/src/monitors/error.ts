import { IMonitor, EventType } from '@dmhsq_monitor/core';
import { WebMonitorConfig, JSError, ResourceError, UnhandledRejectionError } from '../types';
import { EVENT_TYPES } from '../constants';
import { 
  shouldIgnoreError,
  shouldIgnoreUrl,
  shouldSample
} from '../utils';

/**
 * 错误监控
 */
export class ErrorMonitor {
  private monitor: IMonitor;
  private config: WebMonitorConfig;
  private isInstalled: boolean = false;
  private originalOnError: OnErrorEventHandler | null = null;
  private originalOnUnhandledRejection: ((event: PromiseRejectionEvent) => void) | null = null;
  private originalConsoleError: (...data: any[]) => void;

  constructor(monitor: IMonitor, config: WebMonitorConfig) {
    this.monitor = monitor;
    this.config = config;
    this.originalOnError = null;
    this.originalOnUnhandledRejection = null;
    this.originalConsoleError = console.error;
  }

  /**
   * 初始化错误监控
   */
  public install(): void {
    if (this.isInstalled) return;

    // 注册JS错误捕获
    this.setupJsErrorHandler();
    
    // 注册Promise错误捕获
    this.setupPromiseErrorHandler();
    
    // 注册资源加载错误捕获
    this.setupResourceErrorHandler();
    
    // 注册控制台错误捕获
    if (this.config.enableConsoleMonitoring) {
      this.setupConsoleErrorHandler();
    }

    this.isInstalled = true;
  }

  /**
   * 卸载错误监控
   */
  public uninstall(): void {
    if (!this.isInstalled) return;

    // 恢复原始error处理函数
    if (this.originalOnError !== null) {
      window.onerror = this.originalOnError;
      this.originalOnError = null;
    }

    // 恢复原始unhandledrejection处理函数
    if (this.originalOnUnhandledRejection !== null) {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
      this.originalOnUnhandledRejection = null;
    }

    // 移除资源错误监听
    window.removeEventListener('error', this.handleResourceError, true);
    
    // 恢复原始console.error函数
    if (this.config.enableConsoleMonitoring) {
      console.error = this.originalConsoleError;
    }

    this.isInstalled = false;
  }

  /**
   * 设置JS错误处理函数
   */
  private setupJsErrorHandler(): void {
    this.originalOnError = window.onerror;

    window.onerror = (message, source, lineno, colno, error) => {
      // 首先调用原始的处理函数
      if (this.originalOnError) {
        this.originalOnError.call(window, message, source, lineno, colno, error);
      }

      this.handleJsError(message, source, lineno, colno, error);
    };
  }

  /**
   * 处理JS错误
   */
  private handleJsError(
    message: Event | string | null, 
    source?: string | null, 
    lineno?: number | null, 
    colno?: number | null, 
    error?: Error | null
  ): void {
    // 采样控制
    if (!shouldSample(this.config.errorSamplingRate || 1.0)) return;

    const errorMessage = error?.message || (typeof message === 'string' ? message : 'Unknown error');
    
    // 检查是否应该忽略该错误
    if (shouldIgnoreError(errorMessage, this.config.ignoreErrors)) return;
    if (source && shouldIgnoreUrl(source, this.config.ignoreUrls)) return;

    const errorInfo: JSError = {
      message: errorMessage,
      name: error?.name || 'Error',
      stack: error?.stack,
      url: source || window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };

    // 上报错误
    this.monitor.report({
      type: EventType.ERROR,
      name: EVENT_TYPES.JS_ERROR,
      data: errorInfo
    });
  }

  /**
   * 设置Promise错误处理函数
   */
  private setupPromiseErrorHandler(): void {
    this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  /**
   * 处理未捕获的Promise错误
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    // 采样控制
    if (!shouldSample(this.config.errorSamplingRate || 1.0)) return;
    
    event.preventDefault();
    
    const reason = event.reason;
    let message = 'Promise rejected';
    let stack = '';
    let name = 'UnhandledRejection';
    
    if (reason instanceof Error) {
      message = reason.message;
      stack = reason.stack || '';
      name = reason.name;
    } else if (typeof reason === 'string') {
      message = reason;
    } else if (reason !== null && typeof reason === 'object') {
      try {
        message = JSON.stringify(reason);
      } catch (e) {
        message = 'Unserializable promise rejection reason';
      }
    }

    // 检查是否应该忽略该错误
    if (shouldIgnoreError(message, this.config.ignoreErrors)) return;

    const errorInfo: UnhandledRejectionError = {
      message,
      stack,
      name,
      type: 'unhandledrejection',
      url: window.location.href,
      timestamp: Date.now()
    };

    // 上报错误
    this.monitor.report({
      type: EventType.ERROR,
      name: EVENT_TYPES.UNHANDLED_REJECTION,
      data: errorInfo
    });
  }

  /**
   * 设置资源加载错误处理函数
   */
  private setupResourceErrorHandler(): void {
    this.handleResourceError = this.handleResourceError.bind(this);
    window.addEventListener('error', this.handleResourceError, true);
  }

  /**
   * 处理资源加载错误
   */
  private handleResourceError(event: ErrorEvent): void {
    // 采样控制
    if (!shouldSample(this.config.errorSamplingRate || 1.0)) return;
    
    // 跳过JS错误(由onerror处理)
    if (!event.target || !(event.target as HTMLElement).tagName) {
      return;
    }

    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    
    // 只处理加载资源的标签
    if (!['img', 'link', 'script', 'audio', 'video'].includes(tagName)) {
      return;
    }

    const src = (target as HTMLMediaElement | HTMLScriptElement | HTMLImageElement).src || 
               (target as HTMLLinkElement).href || '';
    
    if (this.shouldIgnoreUrl(src)) {
      return;
    }

    const errorInfo: ResourceError = {
      tagName,
      src,
      href: (target as HTMLLinkElement).href,
      outerHTML: target.outerHTML.slice(0, 200), // 限制长度
      url: window.location.href,
      timestamp: Date.now()
    };

    // 上报错误
    this.monitor.report({
      type: EventType.ERROR,
      name: EVENT_TYPES.RESOURCE_ERROR,
      data: errorInfo
    });
  }

  /**
   * 设置控制台错误处理函数
   */
  private setupConsoleErrorHandler(): void {
    this.handleConsoleError = this.handleConsoleError.bind(this);
    
    // 保存原始console.error函数
    this.originalConsoleError = console.error;
    
    // 重写console.error函数
    console.error = (...args: any[]) => {
      // 调用原始控制台错误函数
      this.originalConsoleError.apply(console, args);
      
      // 处理错误
      this.handleConsoleError(...args);
    };
  }

  /**
   * 处理控制台错误
   */
  private handleConsoleError(...args: any[]): void {
    // 采样控制
    if (!shouldSample(this.config.errorSamplingRate || 1.0)) return;
    
    const message = args.map(arg => {
      if (arg instanceof Error) {
        return arg.message;
      } else if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      } else {
        return String(arg);
      }
    }).join(' ');
    
    // 检查是否应该忽略该错误
    if (shouldIgnoreError(message, this.config.ignoreErrors)) return;

    // 上报错误
    this.monitor.report({
      type: EventType.ERROR,
      name: EVENT_TYPES.CONSOLE_ERROR,
      data: {
        message,
        name: 'ConsoleError',
        timestamp: Date.now(),
        args: args.map(String).join(', ')
      }
    });
  }

  /**
   * 检查是否应该忽略该URL
   */
  private shouldIgnoreUrl(url: string): boolean {
    if (!url) return false;
    
    if (!this.config.ignoreUrls || !this.config.ignoreUrls.length) {
      return false;
    }

    return this.config.ignoreUrls.some(pattern => pattern.test(url));
  }
} 