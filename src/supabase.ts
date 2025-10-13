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
    
    // Verificar se já existe uma visualização deste viewer_id para esta story
    const { data: existingView, error: checkError } = await supabase
      .from('story_views')
      .select('id')
      .eq('story_id', storyId)
      .eq('viewer_id', viewerId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar visualização existente:', checkError);
      return false;
    }

    // Se já existe uma visualização, não registrar novamente
    if (existingView) {
      console.log(`Visualização já registrada para story ${storyId} pelo viewer ${viewerId}`);
      return true;
    }

    // Registrar nova visualização
    const viewerIp = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => data.ip)
      .catch(() => '127.0.0.1');
    const userAgent = navigator.userAgent;

    const { error } = await supabase.from('story_views').insert([{
      story_id: storyId,
      viewer_id: viewerId,
      viewer_ip: viewerIp,
      user_agent: userAgent,
    }]);

    if (error) {
      console.error('Erro ao registrar visualização:', error);
      return false;
    }

    console.log(`Nova visualização registrada para story ${storyId}`);
    return true;
  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
    return false;
  }
};

// Função para obter estatísticas de todas as stories
export const getAllStoriesStats = async (): Promise<StoryStats[]> => {
  try {
    // Lista de todos os IDs únicos de vídeos existentes na aplicação
    // Formato: story_id-video_id (ex: 1-1, 1-2, 1-3, 1-4, 1-5)
    const allVideoIds = ['1-1', '1-2', '1-3', '1-4', '1-5'];

    const { data: statsData, error } = await supabase.rpc('get_all_stories_stats');

    if (error) {
      console.error('Erro ao obter estatísticas:', error);
      return [];
    }

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
    return [];
  }
};

// Função para obter os visualizadores de uma story
export const getStoryViewers = async (storyId: string): Promise<StoryViewer[]> => {
  try {
    const { data, error } = await supabase.rpc('get_story_viewers', { p_story_id: storyId });
    if (error) {
      console.error('Erro ao obter visualizadores:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Erro ao obter visualizadores:', error);
    return [];
  }
};