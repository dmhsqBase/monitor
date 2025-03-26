import { MonitorEvent, EventType } from '@dmhsq_monitor/core';
import { DEFAULT_DEDUPLICATE_WINDOW } from '../constants';

// 存储已处理的事件哈希值
const processedEventHashes: Map<string, number> = new Map();

/**
 * 生成事件哈希值
 * @param event 监控事件
 * @returns 哈希值
 */
export function generateEventHash(event: MonitorEvent): string {
  let hashSource = '';

  // 根据不同事件类型生成不同的哈希
  switch (event.type) {
    case EventType.ERROR:
      // 对于错误事件，使用错误类型、消息和堆栈生成哈希
      hashSource = `${event.type}_${event.data.errorType}_${event.data.message}_${event.data.stack?.substring(0, 100) || ''}`;
      break;
    case EventType.PERFORMANCE:
      // 对于性能事件，使用页面URL和指标名称生成哈希
      hashSource = `${event.type}_${event.data.url || ''}_${event.name}`;
      break;
    case EventType.BEHAVIOR:
      // 对于行为事件，使用行为类型和元素生成哈希
      hashSource = `${event.type}_${event.name}_${event.data.element || ''}`;
      break;
    default:
      // 默认使用事件类型和名称
      hashSource = `${event.type}_${event.name}`;
  }

  // 简单的哈希函数
  return hashString(hashSource);
}

/**
 * 简单的字符串哈希函数
 * @param str 输入字符串
 * @returns 哈希值
 */
function hashString(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString();
}

/**
 * 判断事件是否是重复事件
 * @param event 监控事件
 * @param deduplicateWindow 重复检测时间窗口
 * @returns 是否是重复事件
 */
export function isDuplicateEvent(
  event: MonitorEvent,
  deduplicateWindow: number = DEFAULT_DEDUPLICATE_WINDOW
): boolean {
  const hash = generateEventHash(event);
  const now = Date.now();
  
  // 检查是否存在相同哈希的事件，且在时间窗口内
  if (processedEventHashes.has(hash)) {
    const lastSeen = processedEventHashes.get(hash) || 0;
    if (now - lastSeen < deduplicateWindow) {
      // 更新时间戳
      processedEventHashes.set(hash, now);
      
      // 尝试保存到localStorage以在页面刷新后也能检测重复
      try {
        const storedHashes = JSON.parse(localStorage.getItem('dmhsq_monitor_hashes') || '{}');
        storedHashes[hash] = now;
        localStorage.setItem('dmhsq_monitor_hashes', JSON.stringify(storedHashes));
      } catch (e) {
        // 忽略存储错误
      }
      
      return true;
    }
  }
  
  // 记录新事件哈希值
  processedEventHashes.set(hash, now);
  
  // 尝试保存到localStorage
  try {
    const storedHashes = JSON.parse(localStorage.getItem('dmhsq_monitor_hashes') || '{}');
    storedHashes[hash] = now;
    localStorage.setItem('dmhsq_monitor_hashes', JSON.stringify(storedHashes));
  } catch (e) {
    // 忽略存储错误
  }
  
  return false;
}

/**
 * 清理过期的事件哈希记录
 * @param maxAge 最大保留时间（毫秒）
 */
export function cleanupEventHashes(maxAge: number = DEFAULT_DEDUPLICATE_WINDOW * 2): void {
  const now = Date.now();
  
  // 清理内存中的哈希
  for (const [hash, timestamp] of processedEventHashes.entries()) {
    if (now - timestamp > maxAge) {
      processedEventHashes.delete(hash);
    }
  }
  
  // 清理localStorage中的哈希
  try {
    const storedHashes = JSON.parse(localStorage.getItem('dmhsq_monitor_hashes') || '{}');
    let changed = false;
    
    for (const hash in storedHashes) {
      if (now - storedHashes[hash] > maxAge) {
        delete storedHashes[hash];
        changed = true;
      }
    }
    
    if (changed) {
      localStorage.setItem('dmhsq_monitor_hashes', JSON.stringify(storedHashes));
    }
  } catch (e) {
    // 忽略存储错误
  }
}

/**
 * 加载本地存储中的哈希记录
 * 在初始化时调用
 */
export function loadStoredHashes(): void {
  try {
    const storedHashes = JSON.parse(localStorage.getItem('dmhsq_monitor_hashes') || '{}');
    const now = Date.now();
    
    for (const hash in storedHashes) {
      const timestamp = storedHashes[hash];
      if (now - timestamp < DEFAULT_DEDUPLICATE_WINDOW * 2) {
        processedEventHashes.set(hash, timestamp);
      }
    }
  } catch (e) {
    // 忽略加载错误
  }
}

/**
 * 初始化重复检测
 * 在处理器初始化时调用
 */
export function initDeduplication(): void {
  // 加载已存储的哈希值
  loadStoredHashes();
  
  // 定期清理过期哈希
  setInterval(() => {
    cleanupEventHashes();
  }, 60000); // 每分钟清理一次
} 