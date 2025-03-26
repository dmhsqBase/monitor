# @dmhsq_monitor/processor

监控数据处理器模块，提供数据聚合、去重、IP收集和错误分组等功能。

## 安装

```bash
npm install @dmhsq_monitor/processor
```

## 功能

- **数据去重**：识别并过滤重复的监控事件，避免数据冗余
- **数据聚合**：将相似的错误事件进行分组聚合，减少存储空间并提高分析效率
- **数据增强**：自动收集用户IP和地理位置信息，丰富监控数据
- **数据处理**：提供自定义处理器接口，支持灵活的数据处理逻辑

## 使用示例

### 基本使用

```javascript
import { Processor } from '@dmhsq_monitor/processor';
import { Monitor, EventType } from '@dmhsq_monitor/core';

// 创建监控实例
const monitor = new Monitor();
monitor.init({
  appId: 'your-app-id',
  serverUrl: 'https://your-server.com/collect'
});

// 创建处理器实例
const processor = new Processor();
processor.init({
  enableDeduplicate: true,
  collectUserIp: true,
  collectGeoInfo: true,
  mergeSimilarErrors: true
});

// 处理事件
monitor.on('beforeReport', async (events, context) => {
  // 批量处理事件
  const processedEvents = await processor.batchProcess(events, context);
  return processedEvents;
});

monitor.start();
```

### 自定义处理器

```javascript
import { Processor } from '@dmhsq_monitor/processor';
import { EventType } from '@dmhsq_monitor/core';

const processor = new Processor();

// 初始化处理器
processor.init({
  // 启用自定义处理器
  customProcessors: [
    // 过滤无效的错误
    (event, context) => {
      if (event.type === EventType.ERROR && !event.data.message) {
        return null; // 返回null表示过滤掉该事件
      }
      return event;
    },
    // 添加自定义标签
    (event, context) => {
      return {
        ...event,
        data: {
          ...event.data,
          tags: ['production', 'v1.0.0']
        }
      };
    }
  ]
});
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enableDeduplicate | boolean | true | 是否启用重复数据去重 |
| deduplicateWindow | number | 1800000 | 重复数据检测时间窗口（毫秒，默认30分钟） |
| collectUserIp | boolean | true | 是否收集用户IP |
| collectGeoInfo | boolean | false | 是否收集地理位置信息 |
| mergeSimilarErrors | boolean | true | 是否合并相似错误 |
| customProcessors | function[] | [] | 自定义数据处理函数 |

## 处理流程

数据处理器的工作流程如下：

1. **去重过滤**：识别并过滤重复的事件
2. **数据增强**：添加IP、地理位置和浏览器信息
3. **自定义处理**：应用用户定义的处理器
4. **错误聚合**：对相似的错误进行分组

## 注意事项

- 地理位置信息收集依赖外部服务，可能会有性能影响
- 默认情况下，30分钟内的重复错误会被合并
- 在客户端使用时请考虑用户隐私政策的合规性 