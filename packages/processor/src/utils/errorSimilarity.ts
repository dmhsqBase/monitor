import { MonitorEvent, EventType } from '@dmhsq_monitor/core';
import { DEFAULT_ERROR_SIMILARITY_THRESHOLD } from '../constants';

/**
 * 计算两个错误消息的相似度
 * @param messageA 错误消息A
 * @param messageB 错误消息B
 * @returns 相似度，0-1之间的值
 */
export function calculateErrorSimilarity(messageA: string, messageB: string): number {
  // 使用Levenshtein距离计算相似度
  const distance = levenshteinDistance(messageA, messageB);
  const maxLength = Math.max(messageA.length, messageB.length);
  
  if (maxLength === 0) {
    return 1.0; // 两个空字符串视为相同
  }
  
  // 归一化相似度，转换为0-1之间的值
  return 1.0 - (distance / maxLength);
}

/**
 * 计算Levenshtein距离
 * @param a 字符串A
 * @param b 字符串B
 * @returns 距离值
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  
  // 创建距离矩阵
  const d: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  // 初始化第一行和第一列
  for (let i = 0; i <= m; i++) {
    d[i][0] = i;
  }
  
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }
  
  // 计算距离
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // 删除
        d[i][j - 1] + 1,      // 插入
        d[i - 1][j - 1] + cost // 替换
      );
    }
  }
  
  return d[m][n];
}

/**
 * 判断两个错误事件是否相似
 * @param eventA 错误事件A
 * @param eventB 错误事件B
 * @param threshold 相似度阈值，默认0.85
 * @returns 是否相似
 */
export function areErrorsSimilar(
  eventA: MonitorEvent,
  eventB: MonitorEvent,
  threshold: number = DEFAULT_ERROR_SIMILARITY_THRESHOLD
): boolean {
  // 只处理错误类型的事件
  if (eventA.type !== EventType.ERROR || eventB.type !== EventType.ERROR) {
    return false;
  }
  
  // 如果错误类型不同，认为不相似
  if (eventA.data.errorType !== eventB.data.errorType) {
    return false;
  }
  
  // 计算错误消息的相似度
  const similarity = calculateErrorSimilarity(
    eventA.data.message || '',
    eventB.data.message || ''
  );
  
  return similarity >= threshold;
}

/**
 * 对错误事件进行分组聚合
 * @param events 错误事件数组
 * @param threshold 相似度阈值
 * @returns 分组后的错误事件，每组中第一个为代表
 */
export function groupSimilarErrors(
  events: MonitorEvent[],
  threshold: number = DEFAULT_ERROR_SIMILARITY_THRESHOLD
): MonitorEvent[] {
  if (events.length <= 1) {
    return events;
  }
  
  // 只处理错误类型的事件
  const errorEvents = events.filter(event => event.type === EventType.ERROR);
  const otherEvents = events.filter(event => event.type !== EventType.ERROR);
  
  // 存储已分组的错误
  const groups: MonitorEvent[][] = [];
  
  // 遍历错误事件，进行分组
  for (const event of errorEvents) {
    let foundGroup = false;
    
    // 查找相似组
    for (const group of groups) {
      const representative = group[0];
      if (areErrorsSimilar(representative, event, threshold)) {
        // 将事件添加到已有组
        group.push(event);
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      // 创建新组
      groups.push([event]);
    }
  }
  
  // 每组保留第一个事件作为代表，并添加计数
  const result: MonitorEvent[] = groups.map(group => {
    const representative = { ...group[0] };
    // 添加计数信息
    if (group.length > 1) {
      representative.data = {
        ...representative.data,
        occurrences: group.length,
        firstOccurrence: group[0].timestamp,
        lastOccurrence: group[group.length - 1].timestamp
      };
    }
    return representative;
  });
  
  // 合并结果
  return [...result, ...otherEvents];
} 