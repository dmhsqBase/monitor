/**
 * 将数字格式化为指定小数位数的字符串
 * @param num 源数字
 * @param digits 小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number, digits: number = 2): string {
  return num.toFixed(digits);
}

/**
 * 将数字格式化为带千分位的字符串
 * @param num 源数字
 * @returns 带千分位的字符串
 */
export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 将数字限制在指定范围内
 * @param num 源数字
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数字
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * 生成指定范围内的随机整数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
} 