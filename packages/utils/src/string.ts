/**
 * 转换字符串为驼峰命名
 * @param str 源字符串
 * @returns 驼峰命名的字符串
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => 
      index === 0 ? letter.toLowerCase() : letter.toUpperCase()
    )
    .replace(/\s+|[-_]/g, '');
}

/**
 * 转换字符串为帕斯卡命名
 * @param str 源字符串
 * @returns 帕斯卡命名的字符串
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
    .replace(/\s+|[-_]/g, '');
}

/**
 * 截取字符串并添加省略号
 * @param str 源字符串
 * @param length 最大长度
 * @returns 截取后的字符串
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * 检查字符串是否为空或仅包含空白字符
 * @param str 源字符串
 * @returns 是否为空字符串
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim() === '';
} 