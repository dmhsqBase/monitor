/**
 * 格式化日期为指定格式的字符串
 * @param date 日期对象或时间戳
 * @param format 格式字符串，如 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  
  const replacements: Record<string, string | number> = {
    'YYYY': d.getFullYear(),
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'),
    'HH': String(d.getHours()).padStart(2, '0'),
    'mm': String(d.getMinutes()).padStart(2, '0'),
    'ss': String(d.getSeconds()).padStart(2, '0'),
    'SSS': String(d.getMilliseconds()).padStart(3, '0')
  };
  
  return Object.entries(replacements).reduce(
    (result, [token, value]) => result.replace(token, String(value)),
    format
  );
}

/**
 * 在日期上增加指定的时间
 * @param date 源日期
 * @param amount 增加的数量
 * @param unit 时间单位（'days', 'hours', 'minutes', 'seconds', 'months', 'years'）
 * @returns 新日期对象
 */
export function addToDate(
  date: Date,
  amount: number,
  unit: 'days' | 'hours' | 'minutes' | 'seconds' | 'months' | 'years'
): Date {
  const d = new Date(date);
  
  switch (unit) {
    case 'days':
      d.setDate(d.getDate() + amount);
      break;
    case 'hours':
      d.setHours(d.getHours() + amount);
      break;
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount);
      break;
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount);
      break;
    case 'months':
      d.setMonth(d.getMonth() + amount);
      break;
    case 'years':
      d.setFullYear(d.getFullYear() + amount);
      break;
  }
  
  return d;
}

/**
 * 比较两个日期是否是同一天
 * @param dateA 第一个日期
 * @param dateB 第二个日期
 * @returns 是否是同一天
 */
export function isSameDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

/**
 * 获取相对时间描述（例如"3分钟前"）
 * @param date 日期对象或时间戳
 * @param now 当前时间，默认为当前时间
 * @returns 相对时间描述
 */
export function getRelativeTime(date: Date | number, now: Date | number = new Date()): string {
  const targetDate = new Date(date);
  const currentDate = new Date(now);
  
  const diff = Math.floor((currentDate.getTime() - targetDate.getTime()) / 1000);
  
  if (diff < 60) {
    return `${diff}秒前`;
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`;
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}小时前`;
  } else if (diff < 2592000) {
    return `${Math.floor(diff / 86400)}天前`;
  } else if (diff < 31536000) {
    return `${Math.floor(diff / 2592000)}个月前`;
  } else {
    return `${Math.floor(diff / 31536000)}年前`;
  }
} 