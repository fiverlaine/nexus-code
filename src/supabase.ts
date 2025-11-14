import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = 'https://ouhakstrmozhbdpsdzma.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aGFrc3RybW96aGJkcHNkem1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMjQ2NTcsImV4cCI6MjA3NTkwMDY1N30.kvq8ryt2ixjP3zpOrWebC6uTM4TH81sh3ZeN4jp9vQE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para obter ou gerar o ID do visualizador
const getViewerId = () => {
  let viewerId = localStorage.getItem('viewerId');
  if (!viewerId) {
    viewerId = uuidv4();
    localStorage.setItem('viewerId', viewerId);
  }
  return viewerId;
};

// Função para detectar informações do dispositivo e navegador
const collectDeviceInfo = () => {
  const nav = navigator;
  const screen = window.screen;
  
  // Detectar dispositivo
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(nav.userAgent);
  const isTablet = /iPad|Android/i.test(nav.userAgent) && !/Mobile/i.test(nav.userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  // Detectar bot
  const isBot = /bot|crawler|spider|crawling/i.test(nav.userAgent);
  
  // Detectar browser
  const ua = nav.userAgent;
  let browser = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('OPR')) {
    browser = 'Opera';
    const match = ua.match(/OPR\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  
  // Detectar OS
  let os = 'Unknown';
  let osVersion = 'Unknown';
  
  if (ua.includes('Windows')) {
    os = 'Windows';
    if (ua.includes('Windows NT 10.0')) osVersion = '10';
    else if (ua.includes('Windows NT 6.3')) osVersion = '8.1';
    else if (ua.includes('Windows NT 6.2')) osVersion = '8';
    else if (ua.includes('Windows NT 6.1')) osVersion = '7';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    osVersion = match ? match[1].replace('_', '.') : 'Unknown';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
    const match = ua.match(/Android (\d+\.?\d*)/);
    osVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    const match = ua.match(/OS (\d+[._]\d+)/);
    osVersion = match ? match[1].replace('_', '.') : 'Unknown';
  }
  
  // Detectar device type
  let deviceType = 'Desktop';
  if (isMobile) deviceType = 'Mobile';
  else if (isTablet) deviceType = 'Tablet';
  
  // Detectar orientação
  let orientation = 'Unknown';
  if (screen.orientation) {
    orientation = screen.orientation.type || screen.orientation.angle?.toString() || 'Unknown';
  } else if ((screen as any).mozOrientation) {
    orientation = (screen as any).mozOrientation;
  } else if ((screen as any).msOrientation) {
    orientation = (screen as any).msOrientation;
  }
  
  // Detectar touch support
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Plugins
  const plugins: string[] = [];
  if (nav.plugins) {
    for (let i = 0; i < nav.plugins.length; i++) {
      plugins.push(nav.plugins[i].name);
    }
  }
  
  // UTM parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    // Device info
    device_type: deviceType,
    is_mobile: isMobile,
    is_tablet: isTablet,
    is_desktop: isDesktop,
    is_bot: isBot,
    
    // Browser info
    browser: browser,
    browser_version: browserVersion,
    
    // OS info
    operating_system: os,
    os_version: osVersion,
    platform: nav.platform || 'Unknown',
    vendor: nav.vendor || 'Unknown',
    
    // Screen info
    screen_width: screen.width,
    screen_height: screen.height,
    screen_resolution: `${screen.width}x${screen.height}`,
    color_depth: screen.colorDepth || null,
    pixel_ratio: window.devicePixelRatio || 1,
    
    // Other info
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    language: nav.language || 'Unknown',
    landing_page: window.location.href,
    referrer: document.referrer || 'Direct',
    do_not_track: nav.doNotTrack === '1' || nav.doNotTrack === 'yes',
    cookie_enabled: nav.cookieEnabled,
    java_enabled: typeof (window as any).navigator.javaEnabled === 'function' 
      ? (window as any).navigator.javaEnabled() 
      : false,
    plugins: plugins.join(', '),
    hardware_concurrency: nav.hardwareConcurrency || null,
    device_memory: (nav as any).deviceMemory || null,
    touch_support: touchSupport,
    orientation: orientation,
    
    // UTM parameters
    utm_source: urlParams.get('utm_source') || null,
    utm_medium: urlParams.get('utm_medium') || null,
    utm_campaign: urlParams.get('utm_campaign') || null,
    utm_term: urlParams.get('utm_term') || null,
    utm_content: urlParams.get('utm_content') || null,
  };
};

// Função para obter informações de geolocalização por IP
const getGeoLocationByIP = async (ip: string): Promise<{ country: string | null; city: string | null }> => {
  try {
    // Tentar primeiro com ipapi.co (gratuito)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country_name || data.country_code || null,
        city: data.city || null,
      };
    }
  } catch (error) {
    console.warn('[getGeoLocationByIP] Erro ao obter geolocalização via ipapi.co:', error);
  }
  
  try {
    // Fallback para ip-api.com (gratuito)
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country || null,
        city: data.city || null,
      };
    }
  } catch (error) {
    console.warn('[getGeoLocationByIP] Erro ao obter geolocalização via ip-api.com:', error);
  }
  
  return { country: null, city: null };
};

// Tipos
export interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewer_ip: string;
  user_agent?: string;
  viewed_at: string;
}

export interface StoryStats {
  story_id: string;
  unique_views_24h: number;
  total_views_24h: number;
  last_view: string | null;
}

export interface StoryViewer {
  viewer_id: string;
  viewed_at: string;
  viewer_ip: string;
  user_agent: string;
}

export interface UserTrackingData {
  viewer_id: string;
  viewer_ip: string;
  user_agent: string;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  browser_version: string | null;
  operating_system: string | null;
  os_version: string | null;
  screen_resolution: string | null;
  screen_width: number | null;
  screen_height: number | null;
  timezone: string | null;
  language: string | null;
  referrer: string | null;
  landing_page: string | null;
  is_mobile: boolean | null;
  is_tablet: boolean | null;
  is_desktop: boolean | null;
  is_bot: boolean | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  pages_viewed: number | null;
  first_view_at: string;
  last_view_at: string;
  tracking_data: any;
  platform: string | null;
  vendor: string | null;
}

// Função para registrar uma visualização (usando nova estrutura otimizada com rastreamento completo)
export const recordStoryView = async (storyId: string): Promise<boolean> => {
  try {
    const viewerId = getViewerId();
    console.log(`[recordStoryView] Tentando registrar visualização - storyId: ${storyId}, viewerId: ${viewerId}`);
    
    // Obter IP do visualizador
    let viewerIp = '127.0.0.1';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        viewerIp = ipData.ip || '127.0.0.1';
      }
    } catch (ipError) {
      console.warn('[recordStoryView] Erro ao obter IP, usando fallback:', ipError);
    }
    
    // Coletar informações de geolocalização por IP
    const geoLocation = await getGeoLocationByIP(viewerIp);
    
    // Coletar todas as informações do dispositivo e navegador
    const deviceInfo = collectDeviceInfo();
    
    // Verificar se é primeira visita (para definir session_start)
    const sessionStart = localStorage.getItem(`session_start_${viewerId}`);
    const isFirstVisit = !sessionStart;
    if (isFirstVisit) {
      localStorage.setItem(`session_start_${viewerId}`, new Date().toISOString());
    }
    
    // Incrementar contador de páginas visualizadas
    const pagesViewed = parseInt(localStorage.getItem(`pages_viewed_${viewerId}`) || '0') + 1;
    localStorage.setItem(`pages_viewed_${viewerId}`, pagesViewed.toString());

    // Usar função RPC para adicionar visualização com todas as informações coletadas
    const { data, error } = await supabase.rpc('add_story_view', {
      p_viewer_id: viewerId,
      p_story_id: storyId,
      p_viewer_ip: viewerIp,
      p_user_agent: navigator.userAgent || 'Unknown',
      p_country: geoLocation.country,
      p_city: geoLocation.city,
      p_device_type: deviceInfo.device_type,
      p_browser: deviceInfo.browser,
      p_referrer: deviceInfo.referrer,
      p_operating_system: deviceInfo.operating_system,
      p_screen_resolution: deviceInfo.screen_resolution,
      p_screen_width: deviceInfo.screen_width,
      p_screen_height: deviceInfo.screen_height,
      p_color_depth: deviceInfo.color_depth,
      p_timezone: deviceInfo.timezone,
      p_language: deviceInfo.language,
      p_landing_page: deviceInfo.landing_page,
      p_cookie_enabled: deviceInfo.cookie_enabled,
      p_java_enabled: deviceInfo.java_enabled,
      p_plugins: deviceInfo.plugins || null,
      p_hardware_concurrency: deviceInfo.hardware_concurrency,
      p_device_memory: deviceInfo.device_memory,
      p_pixel_ratio: deviceInfo.pixel_ratio,
      p_touch_support: deviceInfo.touch_support,
      p_orientation: deviceInfo.orientation,
      p_platform: deviceInfo.platform,
      p_vendor: deviceInfo.vendor,
      p_browser_version: deviceInfo.browser_version,
      p_os_version: deviceInfo.os_version,
      p_is_mobile: deviceInfo.is_mobile,
      p_is_tablet: deviceInfo.is_tablet,
      p_is_desktop: deviceInfo.is_desktop,
      p_is_bot: deviceInfo.is_bot,
      p_utm_source: deviceInfo.utm_source,
      p_utm_medium: deviceInfo.utm_medium,
      p_utm_campaign: deviceInfo.utm_campaign,
      p_utm_term: deviceInfo.utm_term,
      p_utm_content: deviceInfo.utm_content,
      p_tracking_data: {
        connection_type: (navigator as any).connection?.effectiveType || null,
        session_start: isFirstVisit ? new Date().toISOString() : sessionStart,
        pages_viewed: pagesViewed,
        collected_at: new Date().toISOString(),
      } as any,
    });

    if (error) {
      console.error('[recordStoryView] Erro ao registrar visualização:', error);
      console.error('[recordStoryView] Detalhes do erro:', JSON.stringify(error, null, 2));
      return false;
    }

    // A função retorna false se já existe visualização recente (últimas 24h)
    if (data === false) {
      console.log(`[recordStoryView] Visualização já registrada recentemente para story ${storyId} pelo viewer ${viewerId}`);
      return true; // Retorna true porque não é um erro, apenas já estava registrado
    }

    console.log(`[recordStoryView] ✅ Nova visualização registrada com sucesso para story ${storyId}`);
    console.log(`[recordStoryView] 📊 Informações coletadas:`, {
      device: deviceInfo.device_type,
      browser: `${deviceInfo.browser} ${deviceInfo.browser_version}`,
      os: `${deviceInfo.operating_system} ${deviceInfo.os_version}`,
      location: `${geoLocation.city || 'Unknown'}, ${geoLocation.country || 'Unknown'}`,
      screen: deviceInfo.screen_resolution,
    });
    return true;
  } catch (error) {
    console.error('[recordStoryView] Erro ao registrar visualização:', error);
    if (error instanceof Error) {
      console.error('[recordStoryView] Mensagem de erro:', error.message);
      console.error('[recordStoryView] Stack:', error.stack);
    }
    return false;
  }
};

// Função para obter estatísticas de todas as stories (usando nova estrutura otimizada)
export const getAllStoriesStats = async (): Promise<StoryStats[]> => {
  try {
    // Lista de todos os IDs únicos de vídeos existentes na aplicação
    // Formato: story_id-video_id (ex: 1-1, 1-2, 1-3, 1-4, 1-5)
    const allVideoIds = ['1-1', '1-2', '1-3', '1-4', '1-5'];

    // Usar função RPC que trabalha com a nova tabela otimizada
    const { data: statsData, error: rpcError } = await supabase.rpc('get_all_stories_stats');

    if (rpcError) {
      console.warn('Erro ao obter estatísticas via RPC, usando fallback:', rpcError);
      
      // Fallback: calcular diretamente da nova tabela user_story_views
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const { data: usersData, error: usersError } = await supabase
        .from('user_story_views')
        .select('viewer_id, stories_viewed, last_view_at');

      if (usersError) {
        console.error('Erro ao buscar dados da tabela otimizada:', usersError);
        return allVideoIds.map(id => ({
          story_id: id,
          unique_views_24h: 0,
          total_views_24h: 0,
          last_view: null,
        }));
      }

      // Processar dados da nova estrutura (JSONB)
      const statsMap = new Map<string, { unique: Set<string>, total: number, lastView: Date | null }>();
      allVideoIds.forEach(id => {
        statsMap.set(id, { unique: new Set(), total: 0, lastView: null });
      });

      if (usersData) {
        usersData.forEach((user: any) => {
          if (user.stories_viewed && Array.isArray(user.stories_viewed)) {
            user.stories_viewed.forEach((story: any) => {
              const storyId = story.story_id;
              const viewedAt = new Date(story.viewed_at);
              
              if (viewedAt >= twentyFourHoursAgo && statsMap.has(storyId)) {
                const stat = statsMap.get(storyId)!;
                stat.unique.add(user.viewer_id);
                stat.total += 1;
                if (!stat.lastView || viewedAt > stat.lastView) {
                  stat.lastView = viewedAt;
                }
              }
            });
          }
        });
      }

      return allVideoIds.map(id => {
        const stat = statsMap.get(id)!;
        return {
          story_id: id,
          unique_views_24h: stat.unique.size,
          total_views_24h: stat.total,
          last_view: stat.lastView ? stat.lastView.toISOString() : null,
        };
      });
    }

    // Se a função RPC funcionou, usar os dados retornados
    const statsMap = new Map<string, StoryStats>();
    if (statsData) {
      statsData.forEach((stat: StoryStats) => statsMap.set(stat.story_id, stat));
    }

    const allStats = allVideoIds.map(id => {
      if (statsMap.has(id)) {
        return statsMap.get(id)!;
      } else {
        return {
          story_id: id,
          unique_views_24h: 0,
          total_views_24h: 0,
          last_view: null,
        };
      }
    });

    return allStats;

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    // Retornar estrutura vazia mesmo em caso de erro
    return ['1-1', '1-2', '1-3', '1-4', '1-5'].map(id => ({
      story_id: id,
      unique_views_24h: 0,
      total_views_24h: 0,
      last_view: null,
    }));
  }
};

// Função para obter dados completos dos usuários que visualizaram um story
export const getStoryViewersFullData = async (storyId: string): Promise<UserTrackingData[]> => {
  try {
    // Buscar todos os usuários que têm visualizações deste story
    const { data: usersData, error } = await supabase
      .from('user_story_views')
      .select('*');

    if (error) {
      console.error('[getStoryViewersFullData] Erro ao buscar dados:', error);
      return [];
    }

    // Filtrar usuários que têm este story no array JSONB
    const usersWithStory: UserTrackingData[] = [];
    
    if (usersData) {
      usersData.forEach((user: any) => {
        if (user.stories_viewed && Array.isArray(user.stories_viewed)) {
          const hasStory = user.stories_viewed.some((story: any) => 
            String(story.story_id) === String(storyId)
          );
          
          if (hasStory) {
            usersWithStory.push({
              viewer_id: user.viewer_id,
              viewer_ip: user.viewer_ip || 'N/A',
              user_agent: user.user_agent || 'N/A',
              country: user.country,
              city: user.city,
              device_type: user.device_type,
              browser: user.browser,
              browser_version: user.browser_version,
              operating_system: user.operating_system,
              os_version: user.os_version,
              screen_resolution: user.screen_resolution,
              screen_width: user.screen_width,
              screen_height: user.screen_height,
              timezone: user.timezone,
              language: user.language,
              referrer: user.referrer,
              landing_page: user.landing_page,
              is_mobile: user.is_mobile,
              is_tablet: user.is_tablet,
              is_desktop: user.is_desktop,
              is_bot: user.is_bot,
              utm_source: user.utm_source,
              utm_medium: user.utm_medium,
              utm_campaign: user.utm_campaign,
              utm_term: user.utm_term,
              utm_content: user.utm_content,
              pages_viewed: user.pages_viewed,
              first_view_at: user.first_view_at,
              last_view_at: user.last_view_at,
              tracking_data: user.tracking_data,
              platform: user.platform,
              vendor: user.vendor,
            });
          }
        }
      });
    }

    return usersWithStory;
  } catch (error) {
    console.error('[getStoryViewersFullData] Erro:', error);
    return [];
  }
};

// Função para obter os visualizadores de uma story (usando nova estrutura otimizada)
export const getStoryViewers = async (storyId: string): Promise<StoryViewer[]> => {
  try {
    console.log(`[getStoryViewers] Buscando visualizadores para story: ${storyId}`);
    
    // Primeiro tentar usar a função RPC se existir (mais eficiente)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_story_viewers', { 
      p_story_id: storyId 
    });
    
    if (!rpcError && rpcData) {
      console.log(`[getStoryViewers] RPC retornou ${rpcData.length} visualizações`);
      // Converter para formato StoryViewer
      return (rpcData || []).map((view: any) => ({
        viewer_id: view.viewer_id,
        viewed_at: view.viewed_at,
        viewer_ip: view.viewer_ip || 'N/A',
        user_agent: view.user_agent || 'N/A',
      }));
    }

    // Fallback: buscar diretamente da tabela e expandir JSONB
    console.warn('[getStoryViewers] RPC não disponível, usando fallback:', rpcError);
    
    const { data: usersData, error } = await supabase
      .from('user_story_views')
      .select('viewer_id, viewer_ip, user_agent, stories_viewed, last_view_at');

    if (error) {
      console.error('[getStoryViewers] Erro ao buscar dados:', error);
      return [];
    }

    console.log(`[getStoryViewers] Total de usuários encontrados: ${usersData?.length || 0}`);

    // Expandir o array JSONB e filtrar pelo story_id específico
    const viewers: StoryViewer[] = [];
    
    if (usersData && usersData.length > 0) {
      usersData.forEach((user: any) => {
        if (user.stories_viewed && Array.isArray(user.stories_viewed)) {
          // Encontrar todas as visualizações deste story por este usuário
          user.stories_viewed.forEach((story: any) => {
            // Verificar se o story_id corresponde
            const storyIdStr = String(story.story_id || '');
            const targetStoryId = String(storyId);
            
            if (storyIdStr === targetStoryId) {
              viewers.push({
                viewer_id: user.viewer_id,
                viewed_at: story.viewed_at,
                viewer_ip: user.viewer_ip || 'N/A',
                user_agent: user.user_agent || 'N/A',
              });
            }
          });
        }
      });
    }

    console.log(`[getStoryViewers] Total de visualizações encontradas para story ${storyId}: ${viewers.length}`);

    // Ordenar por data (mais recente primeiro)
    viewers.sort((a, b) => {
      const dateA = new Date(a.viewed_at).getTime();
      const dateB = new Date(b.viewed_at).getTime();
      return dateB - dateA;
    });

    return viewers;
  } catch (error) {
    console.error('[getStoryViewers] Erro ao obter visualizadores:', error);
    if (error instanceof Error) {
      console.error('[getStoryViewers] Mensagem:', error.message);
      console.error('[getStoryViewers] Stack:', error.stack);
    }
    return [];
  }
};

// Função para obter estatísticas gerais (usando nova estrutura otimizada)
export const getGeneralStats = async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Buscar da nova tabela user_story_views
    const { data: usersData, error } = await supabase
      .from('user_story_views')
      .select('viewer_id, stories_viewed, last_view_at')
      .gte('last_view_at', twentyFourHoursAgo.toISOString());

    if (error) {
      console.error('Erro ao buscar estatísticas gerais:', error);
      return {
        totalViews: 0,
        uniqueViewers: 0,
        viewsPerHour: [],
        retentionRate: 0,
        avgViewsPerUser: 0,
      };
    }

    // Expandir visualizações do array JSONB e filtrar por data
    const views: Array<{ viewer_id: string; story_id: string; viewed_at: string }> = [];
    const uniqueViewersSet = new Set<string>();
    
    if (usersData) {
      usersData.forEach((user: any) => {
        uniqueViewersSet.add(user.viewer_id);
        
        if (user.stories_viewed && Array.isArray(user.stories_viewed)) {
          user.stories_viewed.forEach((story: any) => {
            const viewedAt = new Date(story.viewed_at);
            if (viewedAt >= twentyFourHoursAgo) {
              views.push({
                viewer_id: user.viewer_id,
                story_id: story.story_id,
                viewed_at: story.viewed_at,
              });
            }
          });
        }
      });
    }

    const uniqueViewers = uniqueViewersSet.size;
    
    // Agrupar por hora
    const viewsPerHour: { hour: string; count: number }[] = [];
    const hourMap = new Map<string, number>();
    
    views.forEach((view) => {
      const date = new Date(view.viewed_at);
      const hour = `${date.getHours().toString().padStart(2, '0')}:00`;
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });
    
    // Criar array de 24 horas
    for (let i = 0; i < 24; i++) {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      viewsPerHour.push({
        hour,
        count: hourMap.get(hour) || 0,
      });
    }

    // Calcular taxa de retenção (usuários que viram múltiplos vídeos)
    const viewerStoryMap = new Map<string, Set<string>>();
    views.forEach((view) => {
      if (!viewerStoryMap.has(view.viewer_id)) {
        viewerStoryMap.set(view.viewer_id, new Set());
      }
      viewerStoryMap.get(view.viewer_id)!.add(view.story_id);
    });
    
    const viewersWithMultipleStories = Array.from(viewerStoryMap.values()).filter(
      stories => stories.size > 1
    ).length;
    const retentionRate = uniqueViewers > 0 
      ? (viewersWithMultipleStories / uniqueViewers) * 100 
      : 0;

    return {
      totalViews: views.length,
      uniqueViewers,
      viewsPerHour,
      retentionRate: Math.round(retentionRate * 10) / 10,
      avgViewsPerUser: uniqueViewers > 0 ? Math.round((views.length / uniqueViewers) * 10) / 10 : 0,
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas gerais:', error);
    return {
      totalViews: 0,
      uniqueViewers: 0,
      viewsPerHour: [],
      retentionRate: 0,
      avgViewsPerUser: 0,
    };
  }
};