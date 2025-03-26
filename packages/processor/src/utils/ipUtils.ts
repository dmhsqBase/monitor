import { UserIpInfo, GeoInfo } from '../types';
import { GeoProvider } from '../constants';

// 存储IP信息缓存
const ipInfoCache: {
  ip: string | null;
  timestamp: number;
  isPrivate: boolean;
} = {
  ip: null,
  timestamp: 0,
  isPrivate: true
};

/**
 * 获取用户IP地址信息
 * @returns Promise<UserIpInfo>
 */
export async function getUserIp(): Promise<UserIpInfo> {
  const now = Date.now();
  
  // 如果缓存的IP信息不超过12小时，直接返回缓存
  if (ipInfoCache.ip && now - ipInfoCache.timestamp < 12 * 60 * 60 * 1000) {
    return {
      ip: ipInfoCache.ip,
      isPrivate: ipInfoCache.isPrivate
    };
  }
  
  try {
    // 尝试多个IP服务获取IP，使用Promise.race
    const ipInfo = await Promise.race([
      getIpFromIpify(),
      getIpFromAmazon(),
      getIpFromIpinfo()
    ]);
    
    // 更新缓存
    ipInfoCache.ip = ipInfo.ip;
    ipInfoCache.isPrivate = ipInfo.isPrivate;
    ipInfoCache.timestamp = now;
    
    // 尝试保存到localStorage
    try {
      localStorage.setItem('dmhsq_monitor_ip', JSON.stringify(ipInfoCache));
    } catch (e) {
      // 忽略存储错误
    }
    
    return ipInfo;
  } catch (e) {
    // 如果所有外部服务都失败，尝试从localStorage加载缓存，否则使用备用方法
    try {
      const cachedIp = localStorage.getItem('dmhsq_monitor_ip');
      if (cachedIp) {
        const parsed = JSON.parse(cachedIp);
        return {
          ip: parsed.ip,
          isPrivate: parsed.isPrivate
        };
      }
    } catch (e) {
      // 忽略解析错误
    }
    
    return getIpFallback();
  }
}

/**
 * 从ipify.org获取IP
 */
async function getIpFromIpify(): Promise<UserIpInfo> {
  const response = await fetch('https://api.ipify.org?format=json', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    timeout: 3000
  } as RequestInit);
  
  if (!response.ok) throw new Error('ipify服务失败');
  
  const data = await response.json();
  return {
    ip: data.ip,
    isPrivate: isPrivateIp(data.ip)
  };
}

/**
 * 从Amazon检查服务获取IP
 */
async function getIpFromAmazon(): Promise<UserIpInfo> {
  const response = await fetch('https://checkip.amazonaws.com/', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    timeout: 3000
  } as RequestInit);
  
  if (!response.ok) throw new Error('Amazon服务失败');
  
  const text = await response.text();
  const ip = text.trim();
  return {
    ip,
    isPrivate: isPrivateIp(ip)
  };
}

/**
 * 从ipinfo.io获取IP
 */
async function getIpFromIpinfo(): Promise<UserIpInfo> {
  const response = await fetch('https://ipinfo.io/json', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    timeout: 3000
  } as RequestInit);
  
  if (!response.ok) throw new Error('ipinfo服务失败');
  
  const data = await response.json();
  return {
    ip: data.ip,
    isPrivate: isPrivateIp(data.ip)
  };
}

/**
 * 备用获取IP方法
 * @returns UserIpInfo
 */
function getIpFallback(): UserIpInfo {
  // 尝试从RTCPeerConnection获取本地IP
  try {
    const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    const pc = new RTCPeerConnection({ iceServers });
    
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    
    pc.onicecandidate = (ice) => {
      if (!ice.candidate) return;
      
      // 尝试从ICE候选中提取IP地址
      const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate);
      if (ipMatch && ipMatch[1]) {
        const ip = ipMatch[1];
        
        ipInfoCache.ip = ip;
        ipInfoCache.isPrivate = isPrivateIp(ip);
        ipInfoCache.timestamp = Date.now();
        
        pc.close();
      }
    };
    
    setTimeout(() => pc.close(), 3000);
  } catch (e) {
    // 忽略RTCPeerConnection错误
  }
  
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

// 存储地理信息缓存
const geoInfoCache: Map<string, {data: GeoInfo, timestamp: number}> = new Map();

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
  if (!ip || ip === '0.0.0.0' || isPrivateIp(ip)) {
    return { 
      country: 'Local',
      region: 'Local',
      city: 'Local',
      isp: 'Local',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
  
  // 检查缓存
  const cachedInfo = geoInfoCache.get(ip);
  if (cachedInfo && Date.now() - cachedInfo.timestamp < 24 * 60 * 60 * 1000) {
    return cachedInfo.data;
  }
  
  try {
    let geoInfo: GeoInfo;
    
    switch (provider) {
      case GeoProvider.IPAPI:
        geoInfo = await getGeoFromIpApi(ip);
        break;
      case GeoProvider.IPINFO:
        geoInfo = await getGeoFromIpInfo(ip);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    // 更新缓存
    geoInfoCache.set(ip, {
      data: geoInfo,
      timestamp: Date.now()
    });
    
    // 尝试保存到localStorage
    try {
      const storedCache = JSON.parse(localStorage.getItem('dmhsq_monitor_geo_cache') || '{}');
      storedCache[ip] = {
        data: geoInfo,
        timestamp: Date.now()
      };
      localStorage.setItem('dmhsq_monitor_geo_cache', JSON.stringify(storedCache));
    } catch (e) {
      // 忽略存储错误
    }
    
    return geoInfo;
  } catch (e) {
    // 尝试从localStorage获取缓存
    try {
      const storedCache = JSON.parse(localStorage.getItem('dmhsq_monitor_geo_cache') || '{}');
      if (storedCache[ip] && Date.now() - storedCache[ip].timestamp < 7 * 24 * 60 * 60 * 1000) {
        return storedCache[ip].data;
      }
    } catch (e) {
      // 忽略解析错误
    }
    
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
  const response = await fetch(`https://ip-api.com/json/${ip}?fields=country,regionName,city,isp,timezone`, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    timeout: 3000
  } as RequestInit);
  
  if (!response.ok) throw new Error('ip-api.com服务失败');
  
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
  const response = await fetch(`https://ipinfo.io/${ip}/json`, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    timeout: 3000
  } as RequestInit);
  
  if (!response.ok) throw new Error('ipinfo.io服务失败');
  
  const data = await response.json();
  
  return {
    country: data.country,
    region: data.region,
    city: data.city,
    isp: data.org,
    timezone: data.timezone
  };
} 