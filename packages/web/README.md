# @dmhsq_monitor/web

Web监控库，用于捕获浏览器环境下的各类性能指标和错误信息。

## 特性

- 性能监控：页面加载时间、首次渲染、资源加载等
- 错误监控：JS异常、Promise拒绝、资源加载失败等
- 请求监控：捕获XHR和Fetch请求的时间和状态
- 用户行为：点击、滚动等用户交互行为收集
- 数据处理：支持数据去重、IP收集、错误聚合等高级功能

## 安装

```bash
npm install @dmhsq_monitor/web
```

## 使用方法

### 基础使用

```javascript
import { WebMonitor } from '@dmhsq_monitor/web';

// 创建并初始化监控实例
const monitor = new WebMonitor({
  appId: 'your-app-id',
  serverUrl: 'https://your-monitor-server.com',
  enablePerformance: true,
  enableError: true
});

// 启动监控
monitor.start();

// 手动上报事件
monitor.report({
  type: 'custom',
  name: 'userAction',
  data: { action: 'buttonClick', page: 'home' }
});

// 停止监控
// monitor.stop();
```

### 配置选项

```javascript
const monitor = new WebMonitor({
  // 基础配置
  appId: 'your-app-id',
  serverUrl: 'https://your-monitor-server.com',
  debug: true,  // 启用调试模式
  
  // 功能开关
  enablePerformance: true,  // 启用性能监控
  enableError: true,  // 启用错误监控
  enableRequestMonitoring: true,  // 监控Ajax/Fetch请求
  enableBehaviorMonitoring: true,  // 监控用户行为
  
  // 采样率配置
  errorSamplingRate: 1.0,  // 错误信息采样率
  behaviorSamplingRate: 0.5,  // 行为数据采样率
  
  // 过滤配置
  ignoreErrors: [/Script error/i, 'Network error'],  // 忽略特定错误
  ignoreUrls: [/example\.com/i],  // 忽略特定URL的错误
  
  // 数据处理配置
  enableDeduplicate: true,  // 启用数据去重
  collectUserIp: true,  // 收集用户IP
  collectGeoInfo: false,  // 收集地理位置信息
  mergeSimilarErrors: true,  // 合并相似错误
  
  // 自定义上报前处理
  onReport: (events, context) => {
    // 对事件进行自定义处理
    const filteredEvents = events.filter(event => {
      // 根据需要过滤事件
      return true;
    });
    return filteredEvents;
  }
});
```

## 功能模块

### 性能监控

```javascript
const monitor = new WebMonitor({
  appId: 'your-app-id',
  serverUrl: 'https://your-monitor-server.com',
  enablePerformance: true
});

monitor.start();
```

收集的性能指标包括：

- 页面加载时间
- DOM加载时间
- 重定向时间
- DNS解析时间
- TCP连接时间
- 首次字节时间(TTFB)
- 内容下载时间
- 首次渲染时间(FP)
- 首次内容渲染时间(FCP)

### 错误监控

```javascript
const monitor = new WebMonitor({
  appId: 'your-app-id',
  serverUrl: 'https://your-monitor-server.com',
  enableError: true,
  // 错误处理增强
  mergeSimilarErrors: true  // 合并相似错误
});

monitor.start();
```

捕获的错误类型：

- JavaScript错误
- Promise拒绝错误
- 资源加载错误
- AJAX/Fetch请求错误
- 控制台错误

### 数据处理能力

Web库现在集成了数据处理器功能，提供更强大的数据处理能力：

- **数据去重**：自动过滤短时间内的重复事件，减少数据传输量
- **错误聚合**：智能合并相似错误，提高分析效率
- **IP采集**：自动收集用户IP地址，实现故障地域分析
- **地理位置**：可选收集用户地理位置信息
- **数据增强**：自动添加浏览器、设备等环境信息

```javascript
// 获取处理器实例进行高级配置
const processor = monitor.getProcessor();
processor.updateConfig({
  deduplicateWindow: 10 * 60 * 1000,  // 10分钟去重窗口
  customProcessors: [
    // 添加自定义处理逻辑
    (event, context) => {
      // 自定义数据处理
      return event;
    }
  ]
});
```

## 版本说明

### 1.0.2
- 添加数据处理功能，集成processor包
- 支持数据去重和聚合
- 增加IP和地理位置信息收集功能

### 1.0.1
- 完善性能监控模块
- 改进错误监控采样率控制
- 修复错误处理异常问题
- 优化性能和内存占用

### 1.0.0
- 初始版本发布
- 实现基础监控功能
- 支持错误和性能监控

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