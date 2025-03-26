import { UserIpInfo, GeoInfo } from '../types';
import { GeoProvider } from '../constants';

/**
 * 获取用户IP地址信息
 * @returns Promise<UserIpInfo>
 */
export async function getUserIp(): Promise<UserIpInfo> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    
    return {
      ip: data.ip,
      isPrivate: isPrivateIp(data.ip)
    };
  } catch (e) {
    // 如果外部服务失败，尝试使用备用方法
    return getIpFallback();
  }
}

/**
 * 备用获取IP方法
 * @returns UserIpInfo
 */
function getIpFallback(): UserIpInfo {
  return {
    ip: '0.0.0.0',
    isPrivate: true
  };
}

/**
 * 判断是否为私有IP
 * @param ip IP地址
 * @returns 是否为私有IP
 */
export function isPrivateIp(ip: string): boolean {
  // 检查是否为本地IP
  if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1') {
    return true;
  }
  
  // 检查是否为私有IP段
  const ipParts = ip.split('.').map(part => parseInt(part, 10));
  
  // 10.0.0.0 - 10.255.255.255
  if (ipParts[0] === 10) {
    return true;
  }
  
  // 172.16.0.0 - 172.31.255.255
  if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) {
    return true;
  }
  
  // 192.168.0.0 - 192.168.255.255
  if (ipParts[0] === 192 && ipParts[1] === 168) {
    return true;
  }
  
  return false;
}

/**
 * 获取地理位置信息
 * @param ip IP地址
 * @param provider 提供商
 * @returns Promise<GeoInfo>
 */
export async function getGeoInfo(
  ip: string,
  provider: GeoProvider = GeoProvider.IPAPI
): Promise<GeoInfo> {
  if (isPrivateIp(ip)) {
    return { 
      country: 'Local',
      region: 'Local',
      city: 'Local',
      isp: 'Local',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
  
  try {
    switch (provider) {
      case GeoProvider.IPAPI:
        return await getGeoFromIpApi(ip);
      case GeoProvider.IPINFO:
        return await getGeoFromIpInfo(ip);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (e) {
    // 返回一个空的地理信息对象
    return {};
  }
}

/**
 * 从ip-api.com获取地理位置信息
 * @param ip IP地址
 * @returns Promise<GeoInfo>
 */
async function getGeoFromIpApi(ip: string): Promise<GeoInfo> {
  const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,isp,timezone`);
  const data = await response.json();
  
  return {
    country: data.country,
    region: data.regionName,
    city: data.city,
    isp: data.isp,
    timezone: data.timezone
  };
}

/**
 * 从ipinfo.io获取地理位置信息
 * @param ip IP地址
 * @returns Promise<GeoInfo>
 */
async function getGeoFromIpInfo(ip: string): Promise<GeoInfo> {
  const response = await fetch(`https://ipinfo.io/${ip}/json`);
  const data = await response.json();
  
  return {
    country: data.country,
    region: data.region,
    city: data.city,
    isp: data.org,
    timezone: data.timezone
  };
} 