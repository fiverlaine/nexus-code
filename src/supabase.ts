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

// Função para registrar uma visualização
export const recordStoryView = async (storyId: string): Promise<boolean> => {
  try {
    const viewerId = getViewerId();
    console.log(`[recordStoryView] Tentando registrar visualização - storyId: ${storyId}, viewerId: ${viewerId}`);
    
    // Verificar se já existe uma visualização deste viewer_id para esta story nas últimas 24 horas
    // Isso permite múltiplas visualizações do mesmo vídeo se passar muito tempo
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data: existingView, error: checkError } = await supabase
      .from('story_views')
      .select('id, viewed_at')
      .eq('story_id', storyId)
      .eq('viewer_id', viewerId)
      .gte('viewed_at', twentyFourHoursAgo.toISOString())
      .order('viewed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[recordStoryView] Erro ao verificar visualização existente:', checkError);
      // Continuar mesmo com erro na verificação
    }

    // Se já existe uma visualização recente (últimas 24h), não registrar novamente
    // Isso evita spam mas permite múltiplas visualizações depois de 24h
    if (existingView) {
      console.log(`[recordStoryView] Visualização já registrada recentemente para story ${storyId} pelo viewer ${viewerId}`);
      return true;
    }

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
    
    const userAgent = navigator.userAgent || 'Unknown';

    // Registrar nova visualização
    const { data: insertData, error: insertError } = await supabase
      .from('story_views')
      .insert([{
        story_id: storyId,
        viewer_id: viewerId,
        viewer_ip: viewerIp,
        user_agent: userAgent,
      }])
      .select();

    if (insertError) {
      console.error('[recordStoryView] Erro ao registrar visualização:', insertError);
      console.error('[recordStoryView] Detalhes do erro:', JSON.stringify(insertError, null, 2));
      return false;
    }

    console.log(`[recordStoryView] ✅ Nova visualização registrada com sucesso para story ${storyId}`, insertData);
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

// Função para obter estatísticas de todas as stories
export const getAllStoriesStats = async (): Promise<StoryStats[]> => {
  try {
    // Lista de todos os IDs únicos de vídeos existentes na aplicação
    // Formato: story_id-video_id (ex: 1-1, 1-2, 1-3, 1-4, 1-5)
    const allVideoIds = ['1-1', '1-2', '1-3', '1-4', '1-5'];

    // Primeiro, tentar usar a função RPC se existir
    const { data: statsData, error: rpcError } = await supabase.rpc('get_all_stories_stats');

    // Se a função RPC não existir ou houver erro, calcular diretamente da tabela
    if (rpcError) {
      console.warn('Função RPC não disponível, calculando estatísticas diretamente:', rpcError);
      
      // Buscar todas as visualizações das últimas 24 horas
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const { data: viewsData, error: viewsError } = await supabase
        .from('story_views')
        .select('story_id, viewer_id, viewed_at')
        .gte('viewed_at', twentyFourHoursAgo.toISOString());

      if (viewsError) {
        console.error('Erro ao buscar visualizações:', viewsError);
        // Retornar array vazio com estrutura correta
        return allVideoIds.map(id => ({
          story_id: id,
          unique_views_24h: 0,
          total_views_24h: 0,
          last_view: null,
        }));
      }

      // Calcular estatísticas manualmente
      const statsMap = new Map<string, { unique: Set<string>, total: number, lastView: Date | null }>();
      
      // Inicializar todos os story_ids
      allVideoIds.forEach(id => {
        statsMap.set(id, { unique: new Set(), total: 0, lastView: null });
      });

      // Processar visualizações
      if (viewsData) {
        viewsData.forEach((view: any) => {
          const storyId = view.story_id;
          if (statsMap.has(storyId)) {
            const stat = statsMap.get(storyId)!;
            stat.unique.add(view.viewer_id);
            stat.total += 1;
            const viewDate = new Date(view.viewed_at);
            if (!stat.lastView || viewDate > stat.lastView) {
              stat.lastView = viewDate;
            }
          }
        });
      }

      // Converter para formato StoryStats
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

// Função para obter os visualizadores de uma story
export const getStoryViewers = async (storyId: string): Promise<StoryViewer[]> => {
  try {
    // Primeiro tentar usar a função RPC se existir
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_story_viewers', { p_story_id: storyId });
    
    if (!rpcError && rpcData) {
      return rpcData;
    }

    // Se a função RPC não existir, buscar diretamente da tabela
    console.warn('Função RPC não disponível, buscando visualizadores diretamente:', rpcError);
    
    const { data, error } = await supabase
      .from('story_views')
      .select('viewer_id, viewed_at, viewer_ip, user_agent')
      .eq('story_id', storyId)
      .order('viewed_at', { ascending: false });

    if (error) {
      console.error('Erro ao obter visualizadores:', error);
      return [];
    }

    // Converter para formato StoryViewer
    return (data || []).map((view: any) => ({
      viewer_id: view.viewer_id,
      viewed_at: view.viewed_at,
      viewer_ip: view.viewer_ip || 'N/A',
      user_agent: view.user_agent || 'N/A',
    }));
  } catch (error) {
    console.error('Erro ao obter visualizadores:', error);
    return [];
  }
};

// Função para obter estatísticas gerais
export const getGeneralStats = async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data: viewsData, error } = await supabase
      .from('story_views')
      .select('viewed_at, story_id, viewer_id')
      .gte('viewed_at', twentyFourHoursAgo.toISOString());

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

    const views = viewsData || [];
    const uniqueViewers = new Set(views.map((v: any) => v.viewer_id)).size;
    
    // Agrupar por hora
    const viewsPerHour: { hour: string; count: number }[] = [];
    const hourMap = new Map<string, number>();
    
    views.forEach((view: any) => {
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
    views.forEach((view: any) => {
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