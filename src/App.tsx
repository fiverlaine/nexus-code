import { useState, useEffect, useCallback } from 'react';
import { Copy, Loader2, ExternalLink, Zap, Shield, Clock, CheckCircle } from 'lucide-react';

// Tipo para as notificações de saque
type WithdrawalNotification = {
  id: number;
  name: string;
  amount: string;
  visible: boolean;
};

// Componente de notificação de saque com design moderno
const WithdrawalNotificationItem = ({ name, amount }: { name: string; amount: string }) => {
  return (
    <div className="flex items-center gap-3 glass rounded-xl p-4 text-sm shadow-lg animate-slide-up border border-blue-500/20">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <span className="text-blue-400 font-semibold">{name}</span>
        <span className="text-gray-300"> sacou </span>
        <span className="text-green-400 font-bold">{amount}</span>
      </div>
    </div>
  );
};

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
  const [notifications, setNotifications] = useState<WithdrawalNotification[]>([]);

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

  // Função para gerar notificação aleatória
  const generateRandomNotification = useCallback(() => {
    const names = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Lima'];
    const fixedAmount = 'R$ 1.333,33';

    const newNotification: WithdrawalNotification = {
      id: Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      amount: fixedAmount,
      visible: true
    };

    setNotifications(prev => [...prev, newNotification]);

    // Remover notificação após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  // Efeito para gerar notificações aleatórias
  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      generateRandomNotification();
    }, Math.random() * 5000 + 3000);

    const interval = setInterval(() => {
      generateRandomNotification();
    }, Math.random() * 7000 + 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [generateRandomNotification]);

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

      {/* Container de notificações */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 max-w-[280px]">
        {notifications.map(notification => (
          <WithdrawalNotificationItem
            key={notification.id}
            name={notification.name}
            amount={notification.amount}
          />
        ))}
      </div>

      <div className="w-full px-4 py-8 relative z-10 max-w-[95%] lg:max-w-[90%] xl:max-w-[85%] 2xl:max-w-[80%] mx-auto">
        <header className="text-center mb-12">
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

export default App; 
