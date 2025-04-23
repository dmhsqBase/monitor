import { v4 as uuidv4 } from 'uuid';
import { 
  IMonitor,
  MonitorConfig, 
  MonitorEvent,
  EventType
} from './types';
import { ConfigManager } from './config';
import { 
  SDK_NAME, 
  SDK_VERSION, 
  STORAGE_KEY,
  SESSION_ID_KEY
} from './constants';

/**
 * 监控核心类
 */
export class Monitor implements IMonitor {
  private isRunning: boolean = false;
  private configManager: ConfigManager;
  private eventQueue: MonitorEvent[] = [];
  private reportTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private visibilityChangeHandler: (() => void) | null = null;
  
  constructor() {
    this.configManager = new ConfigManager();
    this.sessionId = this.getOrCreateSessionId();
  }
  
  /**
   * 初始化监控
   * @param config 监控配置
   */
  public init(config: MonitorConfig): void {
    this.configManager.init(config);
    this.loadCachedEvents();

    if (this.configManager.isDebugMode()) {
      console.log(`[${SDK_NAME}] 初始化完成，版本: ${SDK_VERSION}`);
    }
  }
  
  /**
   * 启动监控
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.startAutoReport();
    
    // 如果启用了页面可见性统计，添加事件监听
    if (this.configManager.getConfig().enablePageVisibility) {
      this.setupVisibilityTracking();
    }
    
    if (this.configManager.isDebugMode()) {
      console.log(`[${SDK_NAME}] 监控已启动`);
    }
  }
  
  /**
   * 停止监控
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    this.stopAutoReport();
    
    // 移除页面可见性事件监听
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
    
    if (this.configManager.isDebugMode()) {
      console.log(`[${SDK_NAME}] 监控已停止`);
    }
  }
  
  /**
   * 手动上报事件
   * @param event 事件对象
   */
  public report(event: Partial<MonitorEvent>): void {
    if (!event.type) {
      throw new Error('Event type is required');
    }
    
    const fullEvent: MonitorEvent = {
      id: event.id || uuidv4(),
      type: event.type,
      name: event.name || event.type,
      data: event.data || {},
      timestamp: event.timestamp || Date.now(),
    };
    
    this.addEvent(fullEvent);
    
    if (this.configManager.isDebugMode()) {
      console.log(`[${SDK_NAME}] 添加事件: `, fullEvent);
    }
  }
  
  /**
   * 获取当前配置
   */
  public getConfig(): MonitorConfig {
    return this.configManager.getConfig();
  }
  
  /**
   * 更新配置
   * @param config 新配置
   */
  public updateConfig(config: Partial<MonitorConfig>): void {
    this.configManager.updateConfig(config);
    
    // 重启自动上报定时器，应用新的上报间隔
    if (this.isRunning) {
      this.stopAutoReport();
      this.startAutoReport();
    }
  }
  
  /**
   * 添加事件到队列
   * @param event 事件对象
   */
  private addEvent(event: MonitorEvent): void {
    // 检查是否已存在相同的事件
    const isDuplicate = this.eventQueue.some(existingEvent => {
      if (event.type === 'error') {
        // 对于错误事件，使用消息和堆栈来比较
        return existingEvent.type === 'error' && 
               existingEvent.data.message === event.data.message &&
               existingEvent.data.stack === event.data.stack;
      }
      return false;
    });

    if (!isDuplicate) {
      this.eventQueue.push(event);
      
      // 如果超过最大缓存数，移除最早的事件
      if (this.eventQueue.length > this.configManager.getMaxCache()) {
        this.eventQueue.shift();
      }
      
      // 保存到本地
      this.saveEventsToStorage();
    }
  }
  
  /**
   * 将事件队列保存到本地存储
   */
  private saveEventsToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.eventQueue));
    } catch (e) {
      if (this.configManager.isDebugMode()) {
        console.error(`[${SDK_NAME}] 保存事件到本地存储失败: `, e);
      }
    }
  }
  
  /**
   * 从本地存储加载事件队列
   */
  private loadCachedEvents(): void {
    try {
      const cachedEvents = localStorage.getItem(STORAGE_KEY);
      if (cachedEvents) {
        this.eventQueue = JSON.parse(cachedEvents);
        
        if (this.configManager.isDebugMode()) {
          console.log(`[${SDK_NAME}] 从缓存加载 ${this.eventQueue.length} 条事件`);
        }
      }
    } catch (e) {
      if (this.configManager.isDebugMode()) {
        console.error(`[${SDK_NAME}] 从本地存储加载事件失败: `, e);
      }
    }
  }
  
  /**
   * 启动自动上报
   */
  private startAutoReport(): void {
    const interval = this.configManager.getReportInterval();
    
    this.reportTimer = setInterval(() => {
      this.sendEvents();
    }, interval);
  }
  
  /**
   * 停止自动上报
   */
  private stopAutoReport(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
  }
  
  /**
   * 发送事件到服务端
   */
  private sendEvents(): void {
    if (this.eventQueue.length === 0) {
      return;
    }
    
    // 创建要发送的事件副本
    const events = [...this.eventQueue];
    const context = this.getContext();
    
    // 发送事件
    fetch(this.configManager.getServerUrl() + 'collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': this.configManager.getConfig().appId,
        'X-App-Token': this.configManager.getConfig().appToken
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({
        events,
        context,
      }),
      keepalive: true,
    })
    .then(response => {
      if (response.ok) {
        // 只移除已成功发送的事件
        this.eventQueue = this.eventQueue.filter(event => 
          !events.some(sentEvent => sentEvent.id === event.id)
        );
        this.saveEventsToStorage();
        
        if (this.configManager.isDebugMode()) {
          console.log(`[${SDK_NAME}] 成功上报 ${events.length} 条事件`);
        }
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    })
    .catch(error => {
      if (this.configManager.isDebugMode()) {
        console.error(`[${SDK_NAME}] 上报事件失败: `, error);
      }
    });
  }
  
  /**
   * 获取或创建会话ID
   */
  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    
    return sessionId;
  }
  
  /**
   * 获取上下文信息
   */
  private getContext(): Record<string, any> {
    return {
      sdk: {
        name: SDK_NAME,
        version: SDK_VERSION,
      },
      app: {
        id: this.configManager.getAppId(),
      },
      session: {
        id: this.sessionId,
      },
      device: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
      },
      ...this.configManager.getContext(),
    };
  }

  private setupVisibilityTracking(): void {
    this.visibilityChangeHandler = () => {
      const visibilityState = document.visibilityState;
      this.report({
        type: EventType.BEHAVIOR,
        name: 'page_visibility',
        data: {
          state: visibilityState,
          timestamp: Date.now()
        }
      });
    };
    
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }
}

/**
 * 创建监控实例
 */
export function createMonitor(): IMonitor {
  return new Monitor();
}