import { MonitorConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import { isEmpty, omitEmpty } from '@dmhsq_monitor/utils';

/**
 * 配置管理类
 */
export class ConfigManager {
  private config: MonitorConfig;

  constructor() {
    this.config = {} as MonitorConfig;
  }

  /**
   * 初始化配置
   * @param userConfig 用户配置
   */
  public init(userConfig: MonitorConfig): void {
    // 验证必填项
    if (!userConfig.appId) {
      throw new Error('appId is required');
    }

    if (!userConfig.serverUrl) {
      throw new Error('serverUrl is required');
    }

    // 合并默认配置和用户配置，并确保必需字段存在
    const cleanUserConfig = omitEmpty(userConfig);
    this.config = {
      ...DEFAULT_CONFIG,
      ...cleanUserConfig,
      // 显式指定必需字段，消除类型警告
      appId: userConfig.appId,
      serverUrl: userConfig.serverUrl
    };

    // 如果 serverUrl 结尾没有 /，则添加
    if (!this.config.serverUrl.endsWith('/')) {
      this.config.serverUrl += '/';
    }
  }

  /**
   * 获取配置
   */
  public getConfig(): MonitorConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   * @param newConfig 新配置
   */
  public updateConfig(newConfig: Partial<MonitorConfig>): void {
    if (isEmpty(JSON.stringify(newConfig))) {
      return;
    }

    // 更新配置，保留原有的必填字段
    const cleanNewConfig = omitEmpty(newConfig);
    this.config = {
      ...this.config,
      ...cleanNewConfig,
      // 确保必需字段不会被覆盖为 undefined
      appId: newConfig.appId || this.config.appId,
      serverUrl: newConfig.serverUrl || this.config.serverUrl
    };
  }

  /**
   * 获取应用ID
   */
  public getAppId(): string {
    return this.config.appId;
  }

  /**
   * 获取服务端地址
   */
  public getServerUrl(): string {
    return this.config.serverUrl;
  }

  /**
   * 是否开启调试模式
   */
  public isDebugMode(): boolean {
    return !!this.config.debug;
  }

  /**
   * 获取上报间隔时间
   */
  public getReportInterval(): number {
    return this.config.reportInterval || DEFAULT_CONFIG.reportInterval;
  }

  /**
   * 获取最大缓存条数
   */
  public getMaxCache(): number {
    return this.config.maxCache || DEFAULT_CONFIG.maxCache;
  }

  /**
   * 获取上下文信息
   */
  public getContext(): Record<string, any> {
    return this.config.context || {};
  }
}