import { useState, useEffect, useRef } from 'react';
import { Copy, Loader2, ExternalLink, CheckCircle, ChevronLeft, ChevronRight, X, Play, Pause, VolumeX, Volume2 } from 'lucide-react';
import { recordStoryView, getUniqueViews24h } from './supabase';

// (Notificações removidas)

// Tipo para os Stories
type Story = {
  id: number;
  username: string;
  avatar: string;
  videos: StoryVideo[];
  viewed: boolean;
};

type StoryVideo = {
  id: number;
  url: string;
  duration: number;
  thumbnail?: string;
};

// Dados dos Stories (estrutura original - 1 story com múltiplos vídeos)
const storiesData: Story[] = [
  {
    id: 1,
    username: 'pedroomonteiiroo_',
    avatar: 'https://i.postimg.cc/gJMwwddZ/pedroomonteiiroo-avatar-SHORTCODE-20251013-015644-562861281.jpg',
    viewed: false,
    videos: [
      { id: 1, url: '/stories/passo-1.mp4', duration: 0 },
      { id: 2, url: '/stories/passo-2.mp4', duration: 0 },
      { id: 3, url: '/stories/passo-3.mp4', duration: 0 },
      { id: 4, url: '/stories/passo-4.mp4', duration: 0 },
      { id: 5, url: '/stories/passo-5.mp4', duration: 0 }
    ]
  }
];

// Componente Story Circle
const StoryCircle = ({ story, onClick }: { story: Story; onClick: () => void }) => {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      <div className={`relative p-0.5 rounded-full ${story.viewed ? 'bg-gray-500' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'} group-hover:scale-105 transition-transform duration-200`}>
        <div className="bg-slate-900 p-0.5 rounded-full">
          <img 
            src={story.avatar} 
            alt={story.username}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
          />
        </div>
        {!story.viewed && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Play className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <span className="text-xs text-gray-300 mt-2 max-w-[70px] truncate">
        {story.username}
      </span>
    </div>
  );
};

// Componente Stories Viewer
const StoriesViewer = ({ 
  stories, 
  currentStoryIndex, 
  onClose, 
  onNext, 
  onPrevious 
}: {
  stories: Story[];
  currentStoryIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // autoplay com som exige interação
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [useUppercaseExt, setUseUppercaseExt] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [viewRecorded, setViewRecorded] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const currentStory = stories[currentStoryIndex];
  const currentVideo = currentStory?.videos[currentVideoIndex];

  // Detectar iOS
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
  }, []);

  // Registrar visualização quando o vídeo é visualizado
  useEffect(() => {
    if (currentStory && currentVideo && !viewRecorded) {
      // Criar ID único combinando story_id + video_id
      const uniqueVideoId = `${currentStory.id}-${currentVideo.id}`;
      recordStoryView(uniqueVideoId).then((success) => {
        if (success) {
          setViewRecorded(true);
          console.log(`Visualização registrada para vídeo ${uniqueVideoId} (Story ${currentStory.id}, Vídeo ${currentVideo.id})`);
        }
      });
    }
  }, [currentStory, currentVideo, viewRecorded]);

  // Reset viewRecorded quando muda de story ou vídeo
  useEffect(() => {
    setViewRecorded(false);
  }, [currentStoryIndex, currentVideoIndex]);

  // Progresso baseado no tempo do vídeo
  useEffect(() => {
    setProgress(0);
    setUseUppercaseExt(false); // tentar primeiro com extensão minúscula
    setVideoError(false);
    if (videoRef.current) {
      // Reiniciar reprodução ao trocar de vídeo
      if (!isPaused) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentVideoIndex, currentStoryIndex, isPaused]);

  // Reset quando muda de story
  useEffect(() => {
    setCurrentVideoIndex(0);
    setProgress(0);
  }, [currentStoryIndex]);

  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
      setProgress(0);
    } else {
      onPrevious();
    }
  };

  const handleNext = () => {
    if (currentVideoIndex < currentStory.videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onNext();
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) {
      setIsPaused(prev => !prev);
      return;
    }
    if (isPaused) {
      videoRef.current.play().catch(() => {});
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) {
      setIsMuted(prev => !prev);
      return;
    }
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
    if (!next) {
      // garantir reprodução com som após interação
      videoRef.current.play().catch(() => {});
      setIsPaused(false);
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-full bg-black overflow-hidden">
        {/* Progress bars */}
        <div className="absolute top-2 left-4 right-4 z-20 flex gap-1">
          {currentStory.videos.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: index === currentVideoIndex ? `${progress}%` : 
                         index < currentVideoIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <img 
              src={currentStory.avatar} 
              alt={currentStory.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-white font-semibold text-sm">
              {currentStory.username}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMute}
              className="text-white hover:text-gray-300 transition-colors"
              title={isMuted ? 'Ativar som' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button 
              onClick={togglePlayPause}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Video real */}
        <div className="w-full h-full bg-black relative">
          <video
            ref={videoRef}
            src={resolveSrc(currentVideo?.url, useUppercaseExt)}
            className="w-full h-full object-cover"
            playsInline
            webkit-playsinline="true"
            muted={isMuted}
            autoPlay
            preload="metadata"
            controls={false}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration && !isNaN(v.duration)) {
                setProgress((v.currentTime / v.duration) * 100);
              }
            }}
            onError={(e) => {
              console.error('Erro no vídeo:', e);
              // Primeiro tenta com extensão em maiúsculas (.MP4 ou .MOV); se falhar, exibe aviso
              if (!useUppercaseExt) {
                setUseUppercaseExt(true);
              } else {
                setVideoError(true);
              }
            }}
            onLoadStart={() => {
              console.log('Vídeo começou a carregar');
            }}
            onCanPlay={() => {
              console.log('Vídeo pode ser reproduzido');
            }}
            onEnded={() => {
              // Avançar para próximo vídeo ou story
              if (currentVideoIndex < currentStory.videos.length - 1) {
                setCurrentVideoIndex(prev => prev + 1);
                setProgress(0);
              } else {
                if (currentStoryIndex < stories.length - 1) {
                  onNext();
                  setCurrentVideoIndex(0);
                  setProgress(0);
                } else {
                  onClose();
                }
              }
            }}
          />

          {videoError && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 text-center">
              <div className="text-white max-w-sm">
                <h4 className="font-semibold mb-2">Vídeo não suportado</h4>
                <p className="text-sm text-gray-300 mb-3">
                  {isIOS 
                    ? "iOS requer vídeos MP4 com codec H.264 e áudio AAC. O arquivo pode não estar no formato correto."
                    : "Este arquivo não pôde ser reproduzido no navegador. Verifique se é MP4 (H.264 + AAC) mantendo 9:16."
                  }
                </p>
                <p className="text-xs text-gray-400 mb-2">Arquivo: {currentVideo?.url}</p>
                {isIOS && (
                  <div className="text-xs text-blue-400 bg-blue-900/20 p-2 rounded">
                    💡 Dica: Para iOS, use vídeos MP4 com H.264 e resolução 9:16
                  </div>
                )}
              </div>
            </div>
          )}

          {isPaused && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Pause className="w-8 h-8 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation areas */}
        <button 
          onClick={handlePrevious}
          className="absolute left-0 top-0 w-1/3 h-full z-10 flex items-center justify-start pl-4 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-0 top-0 w-1/3 h-full z-10 flex items-center justify-end pr-4 text-white/50 hover:text-white transition-colors"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Center tap area for play/pause */}
        <button 
          onClick={togglePlayPause}
          className="absolute inset-0 w-1/3 left-1/3 top-0 h-full z-10"
        />
      </div>
    </div>
  );
};

// Componente Stories Container
const StoriesContainer = ({ stories }: { stories: Story[] }) => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [storiesState, setStoriesState] = useState(stories);

  const openStory = (index: number) => {
    setSelectedStoryIndex(index);
    // Marcar como visualizada
    setStoriesState(prev => prev.map((story, i) => 
      i === index ? { ...story, viewed: true } : story
    ));
  };

  const closeStory = () => {
    setSelectedStoryIndex(null);
  };

  const nextStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < storiesState.length - 1) {
      const newIndex = selectedStoryIndex + 1;
      setSelectedStoryIndex(newIndex);
      setStoriesState(prev => prev.map((story, i) => 
        i === newIndex ? { ...story, viewed: true } : story
      ));
    } else {
      closeStory();
    }
  };

  const previousStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      const newIndex = selectedStoryIndex - 1;
      setSelectedStoryIndex(newIndex);
    }
  };

  return (
    <>
      {/* Stories Row */}
      <div className="w-full mb-8 flex justify-center">
        <div className="glass rounded-xl p-4 max-w-md">
          <div className="text-center mb-3">
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">TUTORIAL</h3>
          </div>
          <div className="flex justify-center">
            {storiesState.map((story, index) => (
              <StoryCircle 
                key={story.id} 
                story={story} 
                onClick={() => openStory(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stories Viewer */}
      {selectedStoryIndex !== null && (
        <StoriesViewer 
          stories={storiesState}
          currentStoryIndex={selectedStoryIndex}
          onClose={closeStory}
          onNext={nextStory}
          onPrevious={previousStory}
        />
      )}
    </>
  );
};

// (Componente de notificações removido)

// Componente para o fundo animado moderno
const AnimatedBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById('animated-bg') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Partículas flutuantes
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const particleCount = 30;

    // Inicializar partículas
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Desenhar partículas
      particles.forEach(particle => {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        context.fill();

        // Atualizar posição
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Borda da tela
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      id="animated-bg"
      className="fixed inset-0 w-full h-full opacity-30"
      style={{ zIndex: -1 }}
    />
  );
};

function App() {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(true);
  const [displayedCode, setDisplayedCode] = useState<string>("");
  const [codeTypingEffect, setCodeTypingEffect] = useState<boolean>(false);
  const [codeShufflingEffect, setCodeShufflingEffect] = useState<boolean>(false);
  const [shuffleColor, setShuffleColor] = useState<string>("text-blue-400");
  const [codeGenerated, setCodeGenerated] = useState<boolean>(false);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [codeGeneratedTime, setCodeGeneratedTime] = useState<number | null>(null);
  const [canGenerateNewCode, setCanGenerateNewCode] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Função para criar um caractere aleatório
  const getRandomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*!?+=';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  // Função para gerar código aleatório no padrão: LNNNL (Letra + 3 Números + Letra)
  // Exemplos: A123B, K789Z, X456Y, M234N
  const generateRandomCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    const firstLetter = letters.charAt(Math.floor(Math.random() * letters.length));
    const secondLetter = letters.charAt(Math.floor(Math.random() * letters.length));
    const threeNumbers = Array.from({ length: 3 }, () => 
      numbers.charAt(Math.floor(Math.random() * numbers.length))
    ).join('');
    
    return `${firstLetter}${threeNumbers}${secondLetter}`;
  };

  // Função para obter uma cor aleatória para os caracteres durante o embaralhamento
  const getRandomColor = () => {
    const colors = ['text-blue-400', 'text-purple-400', 'text-pink-400', 'text-cyan-400', 'text-white'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Função para simular efeito de embaralhamento para o código de segurança
  const simulateCodeShuffling = () => {
    setCodeShufflingEffect(true);
    setCodeGenerated(false);
    let iterations = 0;
    const maxIterations = 25;
    const shuffleInterval = setInterval(() => {
      const shuffledText = Array.from({ length: 5 }, () => {
        return getRandomChar();
      }).join('');

      setShuffleColor(getRandomColor());
      setDisplayedCode(shuffledText);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(shuffleInterval);
        setCodeShufflingEffect(false);
        const randomCode = generateRandomCode();
        simulateCodeTyping(randomCode);
      }
    }, 50);
  };

  // Função para simular efeito de digitação para o código de segurança
  const simulateCodeTyping = (finalCode: string) => {
    setCodeTypingEffect(true);
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < finalCode.length) {
        setDisplayedCode(finalCode.substring(0, i + 1));
        i++;
      } else {
        setTimeout(() => {
          clearInterval(typeInterval);
          setCodeTypingEffect(false);
          setCodeGenerated(true);
          setShowButton(true);

          const currentTime = new Date().getTime();
          const expiryTime = currentTime + 30000; // 30 segundos

          const codeData = {
            code: finalCode,
            generatedTime: currentTime,
            expiryTime: expiryTime
          };

          localStorage.setItem('nexusCodeData', JSON.stringify(codeData));
          setCodeGeneratedTime(currentTime);
          setCanGenerateNewCode(false);
          updateTimeRemaining(expiryTime);

        }, 500);
        clearInterval(typeInterval);
      }
    }, 200);
  };

  // Função para lidar com o clique no botão gerar
  const handleGenerateClick = () => {
    if (!canGenerateNewCode) {
      return;
    }

    setIsGenerating(true);
    setDisplayedCode("");
    setShowButton(false);
    setCodeGenerated(false);
    setCodeCopied(false);

    simulateCodeShuffling();
    setIsGenerating(false);
  };

  // Função para copiar o código para a área de transferência
  const handleCopyClick = () => {
    if (!displayedCode) return;

    setCodeCopied(false);

    setTimeout(() => {
      setCodeCopied(true);

      navigator.clipboard.writeText(displayedCode)
        .then(() => {
          console.log("Código copiado com sucesso!");
        })
        .catch(err => {
          console.error('Erro ao copiar: ', err);

          const tempTextArea = document.createElement('textarea');
          tempTextArea.value = displayedCode;
          document.body.appendChild(tempTextArea);
          tempTextArea.select();
          document.execCommand('copy');
          document.body.removeChild(tempTextArea);
        });

      setTimeout(() => {
        setCodeCopied(false);
      }, 3000);
    }, 100);
  };

  // Função para lidar com o clique no botão do broker
  const handleBrokerClick = () => {
    window.open('https://betlionpro.com?aff=156168&utm=code&src=code', '_blank');
  };

  // Função para tocar som de clique
  const playClickSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // (Sistema de notificações removido)

  // Verificar se há um código salvo no localStorage ao carregar a página
  useEffect(() => {
    const savedData = localStorage.getItem('nexusCodeData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const currentTime = new Date().getTime();

      if (parsedData.expiryTime > currentTime) {
        setDisplayedCode(parsedData.code);
        setCodeGenerated(true);
        setCodeGeneratedTime(parsedData.generatedTime);
        setCanGenerateNewCode(false);
        updateTimeRemaining(parsedData.expiryTime);
      } else {
        localStorage.removeItem('nexusCodeData');
        setCanGenerateNewCode(true);
      }
    }
  }, []);

  // Atualizar o tempo restante a cada segundo
  useEffect(() => {
    if (!canGenerateNewCode && codeGeneratedTime) {
      const interval = setInterval(() => {
        const expiryTime = codeGeneratedTime + 30000; // 30 segundos
        const currentTime = new Date().getTime();

        if (currentTime >= expiryTime) {
          setCanGenerateNewCode(true);
          setTimeRemaining("");
          clearInterval(interval);
          localStorage.removeItem('nexusCodeData');
        } else {
          updateTimeRemaining(expiryTime);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canGenerateNewCode, codeGeneratedTime]);

  // Função para atualizar o tempo restante
  const updateTimeRemaining = (expiryTime: number) => {
    const currentTime = new Date().getTime();
    const remainingMs = expiryTime - currentTime;

    if (remainingMs <= 0) {
      setTimeRemaining("");
      setCanGenerateNewCode(true);
      return;
    }

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 font-sans flex flex-col items-center justify-center relative overflow-hidden pt-safe pb-safe pl-safe pr-safe">
      <AnimatedBackground />
      {/* Notificações removidas */}

      <div className="w-full px-4 py-8 relative z-10 max-w-[95%] lg:max-w-[90%] xl:max-w-[85%] 2xl:max-w-[80%] mx-auto">
        {/* Stories Container */}
        <StoriesContainer stories={storiesData} />

        <header className="text-center mb-12 mt-16">
          <div className="relative inline-block">
            {/* Efeito de brilho ao redor do título */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur opacity-30"></div>

            <h1 className="relative text-5xl md:text-6xl font-bold mb-2 gradient-text tracking-tight">
              NEXUS
            </h1>

            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          <p className="text-gray-400 text-sm font-light tracking-wider mb-6">
            Gerador de Código Seguro
          </p>

          {/* Separador com efeito de gradiente */}
          <div className="relative w-40 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/50 to-pink-500/30 mx-auto rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </header>

        {/* Layout com elementos um abaixo do outro */}
        <div className="flex flex-col items-center w-full mx-auto">
          {/* Gerador de código */}
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              {showButton && (
                <div className="relative mx-auto w-64">
                  <button
                    onClick={() => {
                      handleGenerateClick();
                      playClickSound();
                    }}
                    disabled={isGenerating || codeTypingEffect || codeShufflingEffect}
                    className={`relative w-full overflow-hidden px-8 ${!canGenerateNewCode && timeRemaining ? 'py-3' : 'py-4'} rounded-xl font-semibold ${!canGenerateNewCode && timeRemaining ? 'text-lg' : 'text-xl'} uppercase tracking-wider text-center transition-all duration-300 glass hover:neon-glow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 group mx-auto block shadow-lg`}
                  >
                    {/* Efeito de brilho nos cantos do botão */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-pink-500 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500 rounded-br-xl"></div>

                    <span className="relative z-10">
                      {isGenerating ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          <span>PROCESSANDO</span>
                        </div>
                      ) : canGenerateNewCode ? (
                        "GERAR CÓDIGO"
                      ) : (
                        <div className="flex flex-col items-center text-xs">
                          <span>GERE NOVAMENTE EM</span>
                          <span className="font-bold">{timeRemaining}</span>
                        </div>
                      )}
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  </button>
                </div>
              )}
            </div>

            {displayedCode && (
              <div className="glass-dark rounded-xl overflow-hidden transition-all duration-500 animate-fade-in shadow-xl relative">
                {/* Efeito de brilho nos cantos */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-blue-500 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-purple-500 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-pink-500 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-blue-500 rounded-br-xl"></div>

                {/* Efeito de brilho no topo */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

                <div className="p-3 glass border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  </div>
                  <span className="text-xs text-gray-400 font-semibold tracking-wider">NEXUS GENERATOR</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">ATIVO</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </div>

                <div className="p-6 flex flex-col items-center">
                  <div className="relative glass px-6 py-5 rounded-xl border border-white/10 mb-6 w-full">
                    {/* Efeito de brilho no topo */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

                    <div className={`text-2xl font-bold tracking-widest text-center font-mono ${codeShufflingEffect ? shuffleColor : codeGenerated ? 'gradient-text' : 'text-gray-300'} ${codeTypingEffect ? 'border-r-2 border-blue-500 animate-pulse' : ''}`}>
                      {displayedCode}
                    </div>

                    {codeGenerated && (
                      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 text-green-500 animate-pulse">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Botões só aparecem quando o código estiver completamente gerado */}
                  {codeGenerated && !codeTypingEffect && !codeShufflingEffect && (
                    <div className="w-full space-y-3 animate-fade-in">
                      {/* Mensagem de confirmação de cópia */}
                      {codeCopied && (
                        <div className="glass text-white text-sm md:text-base py-2 px-4 rounded-lg shadow-md mb-2 border border-green-500/30 animate-fade-in">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Código copiado com sucesso!</span>
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          handleCopyClick();
                          playClickSound();
                        }}
                        className="px-4 py-3 rounded-lg glass hover:neon-glow transition-all flex items-center gap-2 w-full justify-center shadow-md border border-white/10"
                        title="Copiar código"
                      >
                        <Copy size={20} className="text-white" />
                        <span className="text-white font-semibold">Copiar código</span>
                      </button>

                      <button
                        onClick={handleBrokerClick}
                        className="px-4 py-3 rounded-lg glass hover:neon-glow transition-all flex items-center gap-2 w-full justify-center shadow-md border border-white/10"
                      >
                        <ExternalLink size={20} className="text-white" />
                        <span className="text-white font-semibold">ACESSAR BETLION</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 text-center">
          <p className="text-gray-400 text-xs font-light tracking-wider">
            <span className="">&lt;</span>
            <span className="text-blue-500">/</span>
            <span className="">&gt;</span>
            <span className="mx-2">com tecnologia avançada</span>
            <span className="text-gray-500">|</span>
            <span className="ml-2">{new Date().getFullYear()}</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

// Resolve a URL do vídeo aplicando fallback para extensão em maiúsculas
const resolveSrc = (url: string | undefined, uppercase: boolean) => {
  if (!url) return '';
  if (!uppercase) return url;
  return url.replace(/\.(mp4|mov)$/i, (ext) => ext.toUpperCase());
};

// Função para detectar iOS
const isIOSDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

export default App;
