import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { UAParser } from 'ua-parser-js';

/**
 * Interface para dados de geolocalização
 */
export interface GeoLocation {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  regionCode: string;
  latitude: number;
  longitude: number;
  isp: string;
  timezone: string;
}

/**
 * Interface para informações de dispositivo
 */
export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  deviceModel: string;
  deviceVendor: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  userAgent: string;
}

/**
 * Interface para informações de idioma
 */
export interface LanguageInfo {
  language: string;
  languages: string[];
  timezone: string;
}

/**
 * Interface completa de fingerprint do visitante
 */
export interface VisitorFingerprint {
  // Fingerprint único principal
  fingerprint: string;
  
  // Geolocalização
  geoLocation: GeoLocation | null;
  
  // Dispositivo
  deviceInfo: DeviceInfo;
  
  // Idioma
  languageInfo: LanguageInfo;
  
  // Timestamp
  timestamp: Date;
}

/**
 * Serviço de Fingerprinting para coleta de parâmetros do Meta Pixel
 */
export class FingerprintService {
  private static fpInstance: any = null;
  private static geoLocationCache: GeoLocation | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hora

  /**
   * Inicializa o FingerprintJS
   */
  private static async initFingerprint(): Promise<any> {
    if (!this.fpInstance) {
      this.fpInstance = await FingerprintJS.load();
    }
    return this.fpInstance;
  }

  /**
   * Obtém geolocalização via IP usando múltiplas APIs gratuitas
   */
  private static async getGeoLocation(): Promise<GeoLocation | null> {
    // Verificar cache
    const now = Date.now();
    if (this.geoLocationCache && (now - this.cacheTimestamp < this.CACHE_DURATION)) {
      console.log('✅ Usando geolocalização do cache');
      return this.geoLocationCache;
    }

    try {
      // Tentar API 1: ipapi.co (100 requisições/dia grátis)
      try {
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          const geoData: GeoLocation = {
            ip: data.ip || '',
            country: data.country_name || '',
            countryCode: data.country_code || '',
            city: data.city || '',
            region: data.region || '',
            regionCode: data.region_code || '',
            latitude: parseFloat(data.latitude) || 0,
            longitude: parseFloat(data.longitude) || 0,
            isp: data.org || '',
            timezone: data.timezone || ''
          };
          
          // Salvar no cache
          this.geoLocationCache = geoData;
          this.cacheTimestamp = now;
          
          console.log('✅ Geolocalização obtida via ipapi.co');
          return geoData;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao obter geolocalização via ipapi.co:', error);
      }

      // Tentar API 2: ip-api.com (45 requisições/minuto grátis)
      try {
        const response = await fetch('http://ip-api.com/json/', {
          method: 'GET'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            const geoData: GeoLocation = {
              ip: data.query || '',
              country: data.country || '',
              countryCode: data.countryCode || '',
              city: data.city || '',
              region: data.regionName || '',
              regionCode: data.region || '',
              latitude: data.lat || 0,
              longitude: data.lon || 0,
              isp: data.isp || '',
              timezone: data.timezone || ''
            };
            
            // Salvar no cache
            this.geoLocationCache = geoData;
            this.cacheTimestamp = now;
            
            console.log('✅ Geolocalização obtida via ip-api.com');
            return geoData;
          }
        }
      } catch (error) {
        console.warn('⚠️ Erro ao obter geolocalização via ip-api.com:', error);
      }

      // Tentar API 3: ipify.org (apenas IP) + ipinfo.io
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;

        const geoResponse = await fetch(`https://ipinfo.io/${ip}/json`);
        const geoData = await geoResponse.json();

        const [lat, lon] = (geoData.loc || '0,0').split(',').map(parseFloat);

        const result: GeoLocation = {
          ip: ip || '',
          country: geoData.country || '',
          countryCode: geoData.country || '',
          city: geoData.city || '',
          region: geoData.region || '',
          regionCode: geoData.region || '',
          latitude: lat || 0,
          longitude: lon || 0,
          isp: geoData.org || '',
          timezone: geoData.timezone || ''
        };

        // Salvar no cache
        this.geoLocationCache = result;
        this.cacheTimestamp = now;

        console.log('✅ Geolocalização obtida via ipinfo.io');
        return result;
      } catch (error) {
        console.warn('⚠️ Erro ao obter geolocalização via ipinfo.io:', error);
      }

      console.error('❌ Não foi possível obter geolocalização de nenhuma API');
      return null;
    } catch (error) {
      console.error('❌ Erro geral ao obter geolocalização:', error);
      return null;
    }
  }

  /**
   * Obtém informações detalhadas do dispositivo via User Agent
   */
  private static getDeviceInfo(): DeviceInfo {
    const parser = new UAParser(navigator.userAgent);
    const result = parser.getResult();

    let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
    
    if (result.device.type === 'mobile') {
      deviceType = 'mobile';
    } else if (result.device.type === 'tablet') {
      deviceType = 'tablet';
    } else if (result.device.type === undefined) {
      // Se não detectou tipo, provavelmente é desktop
      deviceType = 'desktop';
    }

    // Detecção adicional via screen size
    if (deviceType === 'unknown' || deviceType === 'desktop') {
      const width = window.screen.width;
      if (width < 768) {
        deviceType = 'mobile';
      } else if (width >= 768 && width < 1024) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }
    }

    return {
      deviceType,
      deviceModel: result.device.model || 'Unknown',
      deviceVendor: result.device.vendor || 'Unknown',
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || 'Unknown',
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || 'Unknown',
      userAgent: navigator.userAgent
    };
  }

  /**
   * Obtém informações de idioma
   */
  private static getLanguageInfo(): LanguageInfo {
    return {
      language: navigator.language,
      languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  /**
   * Gera fingerprint completo do visitante
   */
  public static async generateFingerprint(): Promise<VisitorFingerprint> {
    console.log('🔍 Gerando fingerprint completo...');

    // Inicializar FingerprintJS
    const fp = await this.initFingerprint();
    const fpResult = await fp.get();

    // Obter geolocalização
    const geoLocation = await this.getGeoLocation();

    const deviceInfo = this.getDeviceInfo();
    const languageInfo = this.getLanguageInfo();

    const result: VisitorFingerprint = {
      fingerprint: fpResult.visitorId,
      geoLocation,
      deviceInfo,
      languageInfo,
      timestamp: new Date()
    };

    console.log('✅ Fingerprint completo gerado:', {
      fingerprint: result.fingerprint,
      country: result.geoLocation?.country,
      city: result.geoLocation?.city,
      device: result.deviceInfo.deviceType,
      os: result.deviceInfo.os,
      browser: result.deviceInfo.browser
    });

    return result;
  }

  /**
   * Limpa o cache de geolocalização
   */
  public static clearCache(): void {
    this.geoLocationCache = null;
    this.cacheTimestamp = 0;
    console.log('✅ Cache de geolocalização limpo');
  }
}

