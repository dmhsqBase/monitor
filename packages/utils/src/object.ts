/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const copy: Record<string, any> = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as Record<string, any>)[key]);
    });
    return copy as T;
  }

  return obj;
}

/**
 * 安全地获取嵌套对象属性值
 * @param obj 源对象
 * @param path 属性路径，如 'a.b.c'
 * @param defaultValue 默认值
 * @returns 属性值或默认值
 */
export function get(
  obj: Record<string, any>,
  path: string,
  defaultValue?: any
): any {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }

  return (result === undefined) ? defaultValue : result;
}

/**
 * 移除对象中的空值 (null, undefined, '')
 * @param obj 源对象
 * @returns 移除空值后的对象
 */
export function omitEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
  const result = { ...obj };
  
  Object.keys(result).forEach(key => {
    const value = result[key];
    if (value === null || value === undefined || value === '') {
      delete result[key];
    }
  });
  
  return result;
} 