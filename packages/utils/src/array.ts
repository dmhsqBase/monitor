/**
 * 去除数组中的重复项
 * @param arr 源数组
 * @returns 去重后的数组
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * 根据指定属性去除数组中的重复对象
 * @param arr 源数组
 * @param key 用于比较的对象属性
 * @returns 去重后的数组
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const map = new Map();
  return arr.filter(item => {
    const value = item[key];
    if (!map.has(value)) {
      map.set(value, true);
      return true;
    }
    return false;
  });
}

/**
 * 将数组分成指定大小的块
 * @param arr 源数组
 * @param size 每个块的大小
 * @returns 块数组
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

/**
 * 展平嵌套数组
 * @param arr 嵌套数组
 * @param depth 展平深度，默认为1
 * @returns 展平后的数组
 */
export function flatten<T>(arr: any[], depth: number = 1): T[] {
  if (depth < 1) return arr.slice();
  
  return arr.reduce((acc, val) => {
    return acc.concat(
      Array.isArray(val) && depth > 1
        ? flatten(val, depth - 1)
        : val
    );
  }, []);
}

/**
 * 对数组元素进行分组
 * @param arr 源数组
 * @param key 分组依据的对象属性
 * @returns 分组后的对象
 */
export function groupBy<T extends Record<string, any>>(
  arr: T[],
  key: keyof T
): Record<string, T[]> {
  return arr.reduce((result, item) => {
    const group = String(item[key]);
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
} 