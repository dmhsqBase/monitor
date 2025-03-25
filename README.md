# Monitor

一个模块化的监控系统，由多个包组成，支持 TypeScript 和多种模块格式 (ESM, CJS, UMD)。

## 项目结构

- **@monitor/utils**: 工具库，提供基础工具函数
- **@monitor/core**: 核心库，提供监控系统的基础功能
- **@monitor/processor**: 加工库，处理和转换监控数据
- **@monitor/collector**: 采集库，负责采集各类监控数据
- **@monitor/notifier**: 通知库，提供告警和通知功能

## 开发

### 环境要求

- Node.js >= 14
- pnpm >= 7

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 所有包
pnpm dev

# 特定包
pnpm --filter @monitor/utils dev
```

### 构建

```bash
# 所有包
pnpm build

# 特定包
pnpm --filter @monitor/core build
```

## 使用示例

```js
import { createMonitor } from '@monitor/core';
import { initErrorCollector } from '@monitor/collector';

// 创建监控实例
const monitor = createMonitor();

// 初始化监控
monitor.init({
  appId: 'your-app-id',
  serverUrl: 'https://api.example.com/monitor',
  debug: true
});

// 初始化错误采集
initErrorCollector(monitor);

// 启动监控
monitor.start();
```

## 包之间的依赖关系

- **@monitor/utils**: 不依赖其他包
- **@monitor/core**: 依赖 @monitor/utils
- **@monitor/processor**: 依赖 @monitor/utils, @monitor/core
- **@monitor/collector**: 依赖 @monitor/utils, @monitor/core
- **@monitor/notifier**: 依赖 @monitor/utils, @monitor/core

## 许可证

ISC 