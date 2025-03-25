/**
 * 验证字符串是否符合电子邮件格式
 * @param email 要验证的电子邮件
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return pattern.test(email);
}

/**
 * 验证字符串是否符合手机号格式（中国大陆）
 * @param phone 要验证的手机号
 * @returns 是否有效
 */
export function isValidChinesePhone(phone: string): boolean {
  const pattern = /^1[3-9]\d{9}$/;
  return pattern.test(phone);
}

/**
 * 验证字符串是否是有效的URL
 * @param url 要验证的URL
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 验证字符串是否是有效的JSON
 * @param str 要验证的字符串
 * @returns 是否是有效的JSON
 */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 验证字符串是否符合密码强度要求
 * @param password 要验证的密码
 * @param options 验证选项
 * @returns 是否符合要求
 */
export function isStrongPassword(
  password: string,
  options: {
    minLength?: number;
    requireNumbers?: boolean;
    requireLowercase?: boolean;
    requireUppercase?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): boolean {
  const {
    minLength = 8,
    requireNumbers = true,
    requireLowercase = true,
    requireUppercase = true,
    requireSpecialChars = true,
  } = options;
  
  if (password.length < minLength) return false;
  
  if (requireNumbers && !/\d/.test(password)) return false;
  
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  
  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) return false;
  
  return true;
} 