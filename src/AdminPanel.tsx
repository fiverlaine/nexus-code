import { useState, useEffect } from 'react';
import { getAllStoriesStats, getStoryViewers, getStoryViewersFullData, getGeneralStats, StoryStats, StoryViewer, UserTrackingData } from './supabase';
import { Eye, Clock, ArrowLeft, RefreshCw, TrendingUp, BarChart3, Users, Activity, Zap, Filter, ArrowUpDown, Monitor, Smartphone, Tablet, MapPin, MonitorSpeaker, Info, ExternalLink, Fingerprint } from 'lucide-react';

const AdminPanel = () => {
  const [stats, setStats] = useState<StoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<StoryStats | null>(null);
  const [viewers, setViewers] = useState<StoryViewer[]>([]);
  const [viewersFullData, setViewersFullData] = useState<UserTrackingData[]>([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'views' | 'unique' | 'recent'>('views');
  const [filterBy, setFilterBy] = useState<'all' | 'with-views'>('all');
  const [selectedViewer, setSelectedViewer] = useState<UserTrackingData | null>(null);

  const loadStats = async () => {
    setLoading(true);
    try {
      console.log('[AdminPanel] Carregando estatísticas...');
      const [statsData, generalData] = await Promise.all([
        getAllStoriesStats(),
        getGeneralStats(),
      ]);
      
      console.log('[AdminPanel] Estatísticas carregadas:', statsData);
      setStats(statsData);
      setGeneralStats(generalData);
      
      // Log detalhado para debug
      const totalViews = statsData.reduce((sum, stat) => sum + stat.unique_views_24h, 0);
      console.log(`[AdminPanel] Total de visualizações únicas (24h): ${totalViews}`);
      console.log(`[AdminPanel] Total de stories: ${statsData.length}`);
    } catch (error) {
      console.error('[AdminPanel] Erro ao carregar estatísticas:', error);
      if (error instanceof Error) {
        console.error('[AdminPanel] Mensagem:', error.message);
        console.error('[AdminPanel] Stack:', error.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectStory = async (story: StoryStats) => {
    setSelectedStory(story);
    setLoadingViewers(true);
    try {
      const [viewersData, fullData] = await Promise.all([
        getStoryViewers(story.story_id),
        getStoryViewersFullData(story.story_id)
      ]);
      setViewers(viewersData);
      setViewersFullData(fullData);
    } catch (error) {
      console.error('Erro ao buscar visualizadores:', error);
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleBack = () => {
    setSelectedStory(null);
  };

  // Filtrar e ordenar stories
  const filteredAndSortedStories = [...stats]
    .filter(story => {
      if (filterBy === 'with-views') {
        return story.unique_views_24h > 0;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.total_views_24h - a.total_views_24h;
        case 'unique':
          return b.unique_views_24h - a.unique_views_24h;
        case 'recent':
          if (!a.last_view && !b.last_view) return 0;
          if (!a.last_view) return 1;
          if (!b.last_view) return -1;
          return new Date(b.last_view).getTime() - new Date(a.last_view).getTime();
        default:
          return 0;
      }
    });

  if (selectedViewer) {
    return <ViewerDetailView viewer={selectedViewer} onBack={() => setSelectedViewer(null)} />;
  }

  if (selectedStory) {
    return <StoryDetailView 
      story={selectedStory} 
      onBack={handleBack} 
      viewers={viewers} 
      viewersFullData={viewersFullData}
      loading={loadingViewers}
      onSelectViewer={setSelectedViewer}
    />;
  }

  return <StoriesGridView 
    stories={filteredAndSortedStories} 
    allStories={stats}
    onSelectStory={handleSelectStory} 
    loading={loading} 
    onRefresh={loadStats}
    generalStats={generalStats}
    sortBy={sortBy}
    onSortChange={setSortBy}
    filterBy={filterBy}
    onFilterChange={setFilterBy}
  />;
};

const StoriesGridView = ({ 
  stories, 
  allStories,
  onSelectStory, 
  loading, 
  onRefresh,
  generalStats,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
}: {
  stories: StoryStats[];
  allStories: StoryStats[];
  onSelectStory: (story: StoryStats) => void;
  loading: boolean;
  onRefresh: () => void;
  generalStats: any;
  sortBy: 'views' | 'unique' | 'recent';
  onSortChange: (sort: 'views' | 'unique' | 'recent') => void;
  filterBy: 'all' | 'with-views';
  onFilterChange: (filter: 'all' | 'with-views') => void;
}) => {
  const totalUniqueViews = allStories.reduce((sum: number, s: StoryStats) => sum + s.unique_views_24h, 0);
  const totalViews = allStories.reduce((sum: number, s: StoryStats) => sum + s.total_views_24h, 0);
  const completionRate = allStories.length > 0 
    ? Math.round((allStories.filter((s: StoryStats) => s.unique_views_24h > 0).length / allStories.length) * 100)
    : 0;
  
  // Calcular taxa de progressão entre vídeos
  // Conta quantos pares consecutivos de vídeos foram visualizados
  // Exemplo: se vídeo 1 e 2 foram vistos = 1 par, se 1, 2 e 3 foram vistos = 2 pares
  const progressionRate = allStories.length > 1
    ? (() => {
        let consecutivePairs = 0;
        const totalPairs = allStories.length - 1; // Total de pares possíveis (4 para 5 vídeos)
        
        // Contar pares consecutivos visualizados (começando do índice 1, não 0)
        for (let i = 1; i < allStories.length; i++) {
          // Um par é considerado se ambos os vídeos (anterior e atual) foram visualizados
          if (allStories[i - 1].unique_views_24h > 0 && allStories[i].unique_views_24h > 0) {
            consecutivePairs++;
          }
        }
        
        // Calcular porcentagem: pares consecutivos / total de pares possíveis
        return totalPairs > 0 ? Math.round((consecutivePairs / totalPairs) * 100) : 0;
      })()
    : 0;

  const maxHourViews = generalStats?.viewsPerHour 
    ? Math.max(...generalStats.viewsPerHour.map((h: any) => h.count), 1)
    : 1;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      {/* Header com métricas gerais */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Painel de Administração
            </h1>
            <p className="text-gray-400">Estatísticas de visualizações em tempo real</p>
          </div>
          <button 
            onClick={onRefresh} 
            disabled={loading} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Cards de métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={<Eye className="w-6 h-6" />}
            title="Visualizações Únicas"
            value={totalUniqueViews}
            subtitle="últimas 24 horas"
            color="blue"
          />
          <MetricCard
            icon={<Activity className="w-6 h-6" />}
            title="Total de Visualizações"
            value={totalViews}
            subtitle="últimas 24 horas"
            color="purple"
          />
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            title="Taxa de Retenção"
            value={generalStats?.retentionRate || 0}
            subtitle="% usuários múltiplos vídeos"
            color="green"
            suffix="%"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Média por Usuário"
            value={generalStats?.avgViewsPerUser || 0}
            subtitle="visualizações/usuário"
            color="orange"
          />
        </div>

        {/* Métricas secundárias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Taxa de Conclusão</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{completionRate}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {allStories.filter(s => s.unique_views_24h > 0).length} de {allStories.length} vídeos visualizados
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Taxa de Progressão</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{progressionRate}%</div>
            <div className="text-xs text-gray-500 mt-1">usuários seguindo sequência</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Última Atualização</span>
            </div>
            <div className="text-lg font-bold text-blue-400">
              {new Date().toLocaleTimeString('pt-BR')}
            </div>
            <div className="text-xs text-gray-500 mt-1">atualização automática a cada 30s</div>
          </div>
        </div>

        {/* Gráfico de visualizações por hora */}
        {generalStats?.viewsPerHour && generalStats.viewsPerHour.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Visualizações por Hora (24h)
            </h3>
            <div className="flex items-end gap-1 h-32">
              {generalStats.viewsPerHour.map((hour: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-300 hover:opacity-80"
                    style={{ 
                      height: `${(hour.count / maxHourViews) * 100}%`,
                      minHeight: hour.count > 0 ? '4px' : '0px'
                    }}
                    title={`${hour.hour}: ${hour.count} visualizações`}
                  />
                  {index % 4 === 0 && (
                    <span className="text-xs text-gray-500 mt-1">{hour.hour.split(':')[0]}h</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filtros e ordenação */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterBy}
            onChange={(e) => onFilterChange(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Vídeos</option>
            <option value="with-views">Apenas com Visualizações</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="views">Mais Visualizações</option>
            <option value="unique">Mais Únicos</option>
            <option value="recent">Mais Recentes</option>
          </select>
        </div>
      </div>

      {/* Grid de stories */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(5)].map((_, i) => <StoryCardSkeleton key={i} />)}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
          <p className="text-gray-400 mb-4">Nenhuma visualização encontrada</p>
          <p className="text-sm text-gray-500">As visualizações aparecerão aqui quando os usuários assistirem aos stories</p>
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
};

const MetricCard = ({ icon, title, value, subtitle, color, suffix = '' }: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
  suffix?: string;
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-20`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}{suffix}</div>
      <div className="text-sm font-semibold text-gray-300 mb-1">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
};

const StoryCard = ({ story, onSelect }: { story: StoryStats; onSelect: () => void }) => {
  const videoNumber = story.story_id.split('-')[1];
  const completionPercentage = story.total_views_24h > 0 
    ? Math.min(100, (story.unique_views_24h / story.total_views_24h) * 100)
    : 0;

  return (
    <div 
      onClick={onSelect} 
      className="cursor-pointer group relative aspect-[9/16] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* Badge do número do vídeo */}
      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
        Vídeo {videoNumber}
      </div>

      {/* Conteúdo principal */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-5 h-5 text-blue-400" />
          <span className="text-xl font-bold text-white">{story.unique_views_24h}</span>
          <span className="text-xs text-gray-400">únicos</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-gray-300">{story.total_views_24h}</span>
          <span className="text-xs text-gray-400">total</span>
        </div>
        
        {/* Barra de progresso */}
        {story.total_views_24h > 0 && (
          <div className="mb-2">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(completionPercentage)}% taxa de unicidade
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 font-mono mb-1">{story.story_id}</p>
        {story.last_view && (
          <p className="text-xs text-gray-500">
            <Clock className="w-3 h-3 inline mr-1" />
            {new Date(story.last_view).toLocaleString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        )}
      </div>
    </div>
  );
};

const StoryCardSkeleton = () => (
  <div className="aspect-[9/16] bg-gray-800 rounded-lg animate-pulse border border-gray-700" />
);

const StoryDetailView = ({ story, onBack, viewers, viewersFullData, loading, onSelectViewer }: {
  story: StoryStats;
  onBack: () => void;
  viewers: StoryViewer[];
  viewersFullData: UserTrackingData[];
  loading: boolean;
  onSelectViewer: (viewer: UserTrackingData) => void;
}) => {
  // Criar mapa de dados completos por viewer_id
  const fullDataMap = new Map<string, UserTrackingData>();
  viewersFullData.forEach((data: UserTrackingData) => {
    fullDataMap.set(data.viewer_id, data);
  });

  // Agrupar visualizadores por viewer_id e contar visualizações
  const groupedViewers = viewers.reduce((acc: any, viewer: StoryViewer) => {
    const key = viewer.viewer_id;
    const fullData = fullDataMap.get(key);
    
    if (!acc[key]) {
      acc[key] = {
        viewer_id: viewer.viewer_id,
        viewer_ip: viewer.viewer_ip,
        user_agent: viewer.user_agent,
        view_count: 1,
        first_view: viewer.viewed_at,
        last_view: viewer.viewed_at,
        full_data: fullData || null
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
  const avgViewsPerViewer = uniqueViewers.length > 0 
    ? Math.round((totalViews / uniqueViewers.length) * 10) / 10
    : 0;

  // Detectar dispositivo do user agent ou usar dados coletados
  const detectDevice = (viewer: any) => {
    if (viewer.full_data?.device_type) {
      return viewer.full_data.device_type;
    }
    const userAgent = viewer.user_agent || '';
    if (/mobile|android|iphone|ipad/i.test(userAgent)) return 'Mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
  };

  const deviceStats = uniqueViewers.reduce((acc: any, viewer: any) => {
    const device = detectDevice(viewer);
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack} 
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Detalhes do Vídeo
          </h1>
          <p className="text-gray-400 font-mono">{story.story_id}</p>
        </div>
      </div>

      {/* Cards de métricas do vídeo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          title="Visualizadores Únicos"
          value={uniqueViewers.length}
          subtitle="usuários diferentes"
          color="blue"
        />
        <MetricCard
          icon={<Eye className="w-5 h-5" />}
          title="Total de Visualizações"
          value={totalViews}
          subtitle="visualizações totais"
          color="purple"
        />
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          title="Média por Usuário"
          value={avgViewsPerViewer}
          subtitle="visualizações/usuário"
          color="green"
        />
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          title="Última Visualização"
          value={story.last_view ? new Date(story.last_view).toLocaleTimeString('pt-BR') : 'N/A'}
          subtitle={story.last_view ? new Date(story.last_view).toLocaleDateString('pt-BR') : ''}
          color="orange"
        />
      </div>

      {/* Estatísticas de dispositivos */}
      {Object.keys(deviceStats as Record<string, number>).length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Dispositivo</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(deviceStats as Record<string, number>).map(([device, count]: [string, number]) => (
              <div key={device} className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-300">{device}:</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de visualizadores */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">
          Lista de Visualizadores ({uniqueViewers.length} únicos, {totalViews} visualizações)
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
            <p className="mt-2 text-gray-400">Carregando visualizadores...</p>
          </div>
        ) : uniqueViewers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhum visualizador encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Usuário</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">IP</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Dispositivo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Visualizações</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Primeira</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Última</th>
                </tr>
              </thead>
              <tbody>
                {uniqueViewers.map((viewer: any, index: number) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => viewer.full_data && onSelectViewer(viewer.full_data)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs">
                          {viewer.viewer_id.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-mono text-sm">{viewer.viewer_id.substring(0, 8)}...</span>
                        {viewer.full_data && (
                          <span className="text-xs text-blue-400 ml-2">(Ver detalhes)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      <div className="flex flex-col">
                        <span>{viewer.viewer_ip}</span>
                        {viewer.full_data?.country && (
                          <span className="text-xs text-gray-500">
                            {viewer.full_data.city ? `${viewer.full_data.city}, ` : ''}{viewer.full_data.country}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      <div className="flex flex-col">
                        <span>{detectDevice(viewer)}</span>
                        {viewer.full_data?.browser && (
                          <span className="text-xs text-gray-500">
                            {viewer.full_data.browser} {viewer.full_data.browser_version || ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {viewer.view_count > 1 ? (
                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">
                          {viewer.view_count}x
                        </span>
                      ) : (
                        <span className="text-gray-400">1x</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(viewer.first_view).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {viewer.view_count > 1 
                        ? new Date(viewer.last_view).toLocaleString('pt-BR')
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para visualizar detalhes completos de um usuário
const ViewerDetailView = ({ viewer, onBack }: { viewer: UserTrackingData; onBack: () => void }) => {
  const getDeviceIcon = () => {
    if (viewer.is_mobile) return <Smartphone className="w-5 h-5" />;
    if (viewer.is_tablet) return <Tablet className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const getDeviceColor = () => {
    if (viewer.is_mobile) return 'text-blue-400';
    if (viewer.is_tablet) return 'text-purple-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack} 
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Detalhes do Usuário
          </h1>
          <p className="text-gray-400 font-mono text-sm">{viewer.viewer_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Informações Básicas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identificação */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-400" />
              Identificação
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">ID do Usuário</p>
                <p className="font-mono text-sm">{viewer.viewer_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">IP Address</p>
                <p className="font-mono text-sm">{viewer.viewer_ip}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Primeira Visita</p>
                <p className="text-sm">{new Date(viewer.first_view_at).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Última Visita</p>
                <p className="text-sm">{new Date(viewer.last_view_at).toLocaleString('pt-BR')}</p>
              </div>
              {viewer.pages_viewed && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Páginas Visualizadas</p>
                  <p className="text-sm font-bold text-blue-400">{viewer.pages_viewed}</p>
                </div>
              )}
            </div>
          </div>

          {/* Localização */}
          {(viewer.country || viewer.city) && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-400" />
                Localização
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {viewer.country && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">País</p>
                    <p className="text-sm font-semibold">{viewer.country}</p>
                  </div>
                )}
                {viewer.city && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Cidade</p>
                    <p className="text-sm font-semibold">{viewer.city}</p>
                  </div>
                )}
                {viewer.timezone && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Fuso Horário</p>
                    <p className="text-sm">{viewer.timezone}</p>
                  </div>
                )}
                {viewer.language && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Idioma</p>
                    <p className="text-sm">{viewer.language}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dispositivo e Navegador */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MonitorSpeaker className="w-5 h-5 text-green-400" />
              Dispositivo e Navegador
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Tipo de Dispositivo</p>
                <div className="flex items-center gap-2">
                  <span className={getDeviceColor()}>{getDeviceIcon()}</span>
                  <p className="text-sm font-semibold">{viewer.device_type || 'Unknown'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Plataforma</p>
                <p className="text-sm">{viewer.platform || 'Unknown'}</p>
              </div>
              {viewer.browser && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Navegador</p>
                  <p className="text-sm font-semibold">
                    {viewer.browser} {viewer.browser_version ? `v${viewer.browser_version}` : ''}
                  </p>
                </div>
              )}
              {viewer.operating_system && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Sistema Operacional</p>
                  <p className="text-sm font-semibold">
                    {viewer.operating_system} {viewer.os_version ? `v${viewer.os_version}` : ''}
                  </p>
                </div>
              )}
              {viewer.screen_resolution && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Resolução da Tela</p>
                  <p className="text-sm">{viewer.screen_resolution}</p>
                  {viewer.screen_width && viewer.screen_height && (
                    <p className="text-xs text-gray-500">
                      {viewer.screen_width} × {viewer.screen_height}px
                    </p>
                  )}
                </div>
              )}
              {viewer.vendor && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Fabricante</p>
                  <p className="text-sm">{viewer.vendor}</p>
                </div>
              )}
            </div>
          </div>

          {/* Origem e Referência */}
          {(viewer.referrer || viewer.landing_page || viewer.utm_source) && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-yellow-400" />
                Origem e Referência
              </h2>
              <div className="space-y-4">
                {viewer.landing_page && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Página de Entrada</p>
                    <a 
                      href={viewer.landing_page} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 break-all"
                    >
                      {viewer.landing_page}
                    </a>
                  </div>
                )}
                {viewer.referrer && viewer.referrer !== 'Direct' && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Referrer</p>
                    <a 
                      href={viewer.referrer} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 break-all"
                    >
                      {viewer.referrer}
                    </a>
                  </div>
                )}
                {(viewer.utm_source || viewer.utm_medium || viewer.utm_campaign) && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Parâmetros UTM</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {viewer.utm_source && (
                        <div>
                          <span className="text-gray-500">Source:</span> <span className="font-semibold">{viewer.utm_source}</span>
                        </div>
                      )}
                      {viewer.utm_medium && (
                        <div>
                          <span className="text-gray-500">Medium:</span> <span className="font-semibold">{viewer.utm_medium}</span>
                        </div>
                      )}
                      {viewer.utm_campaign && (
                        <div>
                          <span className="text-gray-500">Campaign:</span> <span className="font-semibold">{viewer.utm_campaign}</span>
                        </div>
                      )}
                      {viewer.utm_term && (
                        <div>
                          <span className="text-gray-500">Term:</span> <span className="font-semibold">{viewer.utm_term}</span>
                        </div>
                      )}
                      {viewer.utm_content && (
                        <div>
                          <span className="text-gray-500">Content:</span> <span className="font-semibold">{viewer.utm_content}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Agent */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-400" />
              User Agent
            </h2>
            <p className="text-xs font-mono text-gray-300 break-all bg-gray-900/50 p-3 rounded">
              {viewer.user_agent}
            </p>
          </div>
        </div>

        {/* Coluna Lateral - Informações Adicionais */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Mobile</span>
                <span className={`text-sm font-semibold ${viewer.is_mobile ? 'text-green-400' : 'text-gray-500'}`}>
                  {viewer.is_mobile ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Tablet</span>
                <span className={`text-sm font-semibold ${viewer.is_tablet ? 'text-green-400' : 'text-gray-500'}`}>
                  {viewer.is_tablet ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Desktop</span>
                <span className={`text-sm font-semibold ${viewer.is_desktop ? 'text-green-400' : 'text-gray-500'}`}>
                  {viewer.is_desktop ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Bot</span>
                <span className={`text-sm font-semibold ${viewer.is_bot ? 'text-red-400' : 'text-green-400'}`}>
                  {viewer.is_bot ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </div>

          {/* Dados Adicionais */}
          {viewer.tracking_data && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Dados Adicionais</h2>
              <div className="space-y-2 text-sm">
                {viewer.tracking_data.connection_type && (
                  <div>
                    <span className="text-gray-400">Conexão:</span>{' '}
                    <span className="font-semibold">{viewer.tracking_data.connection_type}</span>
                  </div>
                )}
                {viewer.tracking_data.session_start && (
                  <div>
                    <span className="text-gray-400">Sessão iniciada:</span>{' '}
                    <span className="font-semibold">
                      {new Date(viewer.tracking_data.session_start).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
