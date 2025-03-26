# @dmhsq_monitor/web

前端网页监控模块，提供网页性能监控和错误监控功能。

## 安装

```bash
npm install @dmhsq_monitor/web
```

## 功能

- **错误监控**：捕获JS错误、未处理的Promise拒绝、资源加载错误和控制台错误
- **性能监控**：收集页面加载性能数据、首次绘制时间、首次内容绘制时间等
- **灵活配置**：可自定义配置监控行为、采样率和忽略规则

## 版本更新

### v1.0.1
- 完善性能监控模块
- 改进错误监控采样率控制
- 修复错误处理异常问题
- 优化性能和内存占用

### v1.0.0
- 初始版本发布
- 实现基础监控功能
- 支持错误和性能监控

## 使用示例

### 基本使用

```javascript
import { WebMonitor } from '@dmhsq_monitor/web';

// 创建监控实例
const monitor = new WebMonitor({
  appId: 'your-app-id',
  serverUrl: 'https://your-server.com/collect'
});

// 启动监控
monitor.start();

// 停止监控
// monitor.stop();
```

### 自定义配置

```javascript
import { WebMonitor } from '@dmhsq_monitor/web';

const monitor = new WebMonitor({
  appId: 'your-app-id',
  serverUrl: 'https://your-server.com/collect',
  
  // 是否开启调试模式
  debug: true,
  
  // 错误监控相关配置
  enableError: true,
  enableAutoErrorCapture: true,
  enableConsoleMonitoring: true,
  
  // 性能监控相关配置
  enablePerformance: true,
  enablePerformanceMonitoring: true,
  
  // 采样率设置
  errorSamplingRate: 1.0,
  
  // 忽略特定错误
  ignoreErrors: [
    /^Script error\.?$/,
    /^ResizeObserver loop limit exceeded$/,
    'Network Error'
  ],
  
  // 忽略特定URL的错误
  ignoreUrls: [
    /example\.com/,
    /test\.png$/
  ],
  
  // 上报设置
  reportInterval: 5000,
  maxCache: 100
});

monitor.start();
```

### 手动上报

```javascript
import { WebMonitor } from '@dmhsq_monitor/web';
import { EventType } from '@dmhsq_monitor/core';

const monitor = new WebMonitor({
  appId: 'your-app-id',
  serverUrl: 'https://your-server.com/collect'
});

monitor.start();

// 手动上报自定义事件
monitor.report({
  type: EventType.CUSTOM,
  name: 'user_action',
  data: {
    action: 'click',
    element: 'submit_button',
    pageUrl: window.location.href
  }
});
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| appId | string | - | 应用ID（必填） |
| serverUrl | string | - | 服务端数据接收地址（必填） |
| debug | boolean | false | 是否开启调试模式 |
| enableError | boolean | true | 是否启用错误监控 |
| enablePerformance | boolean | true | 是否启用性能监控 |
| enableAutoErrorCapture | boolean | true | 是否自动捕获错误 |
| enableConsoleMonitoring | boolean | false | 是否监控控制台错误 |
| errorSamplingRate | number | 1.0 | 错误采样率 (0-1) |
| ignoreErrors | (string\|RegExp)[] | [] | 忽略的错误信息 |
| ignoreUrls | RegExp[] | [] | 忽略的URL |
| reportInterval | number | 5000 | 上报间隔时间(ms) |
| maxCache | number | 100 | 最大缓存条数 |

## 注意事项

- 建议在页面加载尽可能早的时机初始化监控，以便捕获更多错误和性能数据
- 生产环境建议设置合适的采样率，避免过多数据上报
- 配置合适的忽略规则，过滤不需要关注的错误 