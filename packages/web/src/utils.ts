import { truncate } from '@dmhsq_monitor/utils';
import { MAX_CONTENT_LENGTH } from './constants';

/**
 * 获取元素的路径
 * @param element 目标元素
 * @returns 元素路径字符串
 */
export function getElementPath(element: HTMLElement): string {
  if (!element) return '';
  
  const path: string[] = [];
  let currentElement: HTMLElement | null = element;
  
  while (currentElement && currentElement !== document.body) {
    let identifier = currentElement.tagName.toLowerCase();
    
    if (currentElement.id) {
      identifier += `#${currentElement.id}`;
    } else if (currentElement.className && typeof currentElement.className === 'string') {
      identifier += `.${currentElement.className.split(' ').join('.')}`;
    }
    
    path.unshift(identifier);
    currentElement = currentElement.parentElement;
  }
  
  return path.join(' > ');
}

/**
 * 获取元素内容
 * @param element 目标元素
 * @returns 元素内容
 */
export function getElementContent(element: HTMLElement): string {
  if (!element) return '';
  
  // 获取文本内容
  const content = element.textContent || element.innerText || '';
  
  // 截断长内容
  return truncate(content.trim(), MAX_CONTENT_LENGTH);
}

/**
 * 过滤敏感信息
 * @param obj 要过滤的对象
 * @returns 过滤后的对象
 */
export function filterSensitiveInfo(obj: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    'password', 'pwd', 'secret', 'token', 'auth', 'key', 'apiKey', 'api_key',
    'credentials', 'credit', 'card', 'cvv', 'ssn', 'social', 'passport'
  ];
  
  const result = { ...obj };
  
  Object.keys(result).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(k => lowerKey.includes(k))) {
      result[key] = '***FILTERED***';
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = filterSensitiveInfo(result[key]);
    }
  });
  
  return result;
}

/**
 * 检查是否应该采样
 * @param rate 采样率 (0-1)
 * @returns 是否采样
 */
export function shouldSample(rate: number): boolean {
  return Math.random() <= rate;
}

/**
 * 判断是否忽略错误
 * @param message 错误消息
 * @param ignorePatterns 忽略模式
 * @returns 是否忽略
 */
export function shouldIgnoreError(message: string, ignorePatterns: (string | RegExp)[] = []): boolean {
  if (!message) return false;
  return ignorePatterns.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(message);
    }
    return message.includes(pattern);
  });
}

/**
 * 判断是否忽略URL
 * @param url URL字符串
 * @param ignorePatterns 忽略模式
 * @returns 是否忽略
 */
export function shouldIgnoreUrl(url: string, ignorePatterns: RegExp[] = []): boolean {
  if (!url) return false;
  return ignorePatterns.some(pattern => pattern.test(url));
}

/**
 * 从错误对象提取重要信息
 * @param error 错误对象
 * @returns 错误信息对象
 */
export function extractErrorInfo(error: Error | any): Record<string, any> {
  if (!error) return { message: 'Unknown error' };
  
  // 基本错误信息
  const errorInfo: Record<string, any> = {
    message: error.message || String(error),
    stack: error.stack,
    name: error.name
  };
  
  // 添加额外属性
  for (const key in error) {
    if (key !== 'message' && key !== 'stack' && key !== 'name') {
      try {
        // 尝试序列化属性值
        const value = error[key];
        if (typeof value !== 'function' && typeof value !== 'symbol') {
          errorInfo[key] = value;
        }
      } catch (e) {
        // 忽略无法序列化的属性
      }
    }
  }
  
  return errorInfo;
} 