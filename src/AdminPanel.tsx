import { useState, useEffect } from 'react';
import { getAllStoriesStats, getStoryViewers, StoryStats, StoryViewer } from './supabase';
import { Eye, Clock, User, ArrowLeft, RefreshCw, Server, Globe } from 'lucide-react';

const AdminPanel = () => {
  const [stats, setStats] = useState<StoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<StoryStats | null>(null);
  const [viewers, setViewers] = useState<StoryViewer[]>([]);
  const [loadingViewers, setLoadingViewers] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getAllStoriesStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSelectStory = async (story: StoryStats) => {
    setSelectedStory(story);
    setLoadingViewers(true);
    try {
      const viewersData = await getStoryViewers(story.story_id);
      setViewers(viewersData);
    } catch (error) {
      console.error('Erro ao buscar visualizadores:', error);
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleBack = () => {
    setSelectedStory(null);
  };

  if (selectedStory) {
    return <StoryDetailView story={selectedStory} onBack={handleBack} viewers={viewers} loading={loadingViewers} />;
  }

  return <StoriesGridView stories={stats} onSelectStory={handleSelectStory} loading={loading} onRefresh={loadStats} />;
};

const StoriesGridView = ({ stories, onSelectStory, loading, onRefresh }) => (
  <div className="min-h-screen bg-gray-900 text-white p-8">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Visualizações de Stories</h1>
      <button onClick={onRefresh} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
    </div>
    {loading ? (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => <StoryCardSkeleton key={i} />)}
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stories.map(story => (
          <StoryCard key={story.story_id} story={story} onSelect={() => onSelectStory(story)} />
        ))}
      </div>
    )}
  </div>
);

const StoryCard = ({ story, onSelect }) => (
  <div onClick={onSelect} className="cursor-pointer group relative aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
    <div className="absolute bottom-0 left-0 p-3">
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5" />
        <span className="text-lg font-bold">{story.unique_views_24h}</span>
      </div>
      <p className="text-xs text-gray-400 font-mono">{story.story_id}</p>
    </div>
  </div>
);

const StoryCardSkeleton = () => (
  <div className="aspect-[9/16] bg-gray-800 rounded-lg animate-pulse" />
);

const StoryDetailView = ({ story, onBack, viewers, loading }) => {
  // Agrupar visualizadores por viewer_id e contar visualizações
  const groupedViewers = viewers.reduce((acc, viewer) => {
    const key = viewer.viewer_id;
    if (!acc[key]) {
      acc[key] = {
        viewer_id: viewer.viewer_id,
        viewer_ip: viewer.viewer_ip,
        user_agent: viewer.user_agent,
        view_count: 1,
        first_view: viewer.viewed_at,
        last_view: viewer.viewed_at
      };
    } else {
      acc[key].view_count += 1;
      // Atualizar primeira e última visualização
      if (new Date(viewer.viewed_at) < new Date(acc[key].first_view)) {
        acc[key].first_view = viewer.viewed_at;
      }
      if (new Date(viewer.viewed_at) > new Date(acc[key].last_view)) {
        acc[key].last_view = viewer.viewed_at;
      }
    }
    return acc;
  }, {});

  const uniqueViewers = Object.values(groupedViewers);
  const totalViews = viewers.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Visualizadores</h1>
          <p className="text-gray-400 font-mono">{story.story_id}</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Lista de Visualizadores ({uniqueViewers.length} únicos, {totalViews} visualizações)
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
            <p className="mt-2 text-gray-400">Carregando visualizadores...</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {uniqueViewers.map((viewer, index) => (
              <li key={index} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                      {viewer.viewer_id.substring(0, 2).toUpperCase()}
                    </div>
                    {viewer.view_count > 1 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {viewer.view_count}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{viewer.viewer_id}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {new Date(viewer.first_view).toLocaleString('pt-BR')}
                        {viewer.view_count > 1 && (
                          <span className="text-blue-400"> - {new Date(viewer.last_view).toLocaleString('pt-BR')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {viewer.viewer_ip}
                      </div>
                    </div>
                    {viewer.view_count > 1 && (
                      <div className="text-xs text-blue-400 mt-1">
                        {viewer.view_count} visualizações
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Server className="w-3 h-3" />
                  <span>{viewer.user_agent}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;