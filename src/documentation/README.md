# Nexus Code Generator - Documentação

## 📋 Visão Geral

O **Nexus Code Generator** é uma aplicação moderna e elegante para geração de códigos seguros, desenvolvida com React, TypeScript e Tailwind CSS. O projeto apresenta um design contemporâneo com efeitos visuais avançados e uma experiência de usuário fluida.

## 🎨 Design e Características

### Design Moderno
- **Tema Escuro Elegante**: Gradientes suaves e cores modernas
- **Glassmorphism**: Efeitos de vidro translúcido com blur
- **Animações Suaves**: Transições fluidas e efeitos visuais
- **Responsividade**: Interface adaptável para todos os dispositivos

### Paleta de Cores
- **Primária**: Azul (#3b82f6) - Elementos principais
- **Secundária**: Roxo (#8b5cf6) - Elementos de destaque
- **Acentuada**: Rosa (#ec4899) - Elementos especiais
- **Fundo**: Gradiente escuro (slate-900 → slate-800 → slate-900)

### Tipografia
- **Fonte Principal**: Inter (Google Fonts)
- **Fonte Monospace**: JetBrains Mono (para códigos)
- **Pesos**: 300, 400, 500, 600, 700, 800, 900

## ⚡ Funcionalidades

### 1. Geração de Códigos
- **Efeito de Embaralhamento**: Animação de caracteres aleatórios
- **Efeito de Digitação**: Simulação de digitação em tempo real
- **Código Final**: Padrão LNNNL (Letra + 3 Números + Letra) - Ex: "A123B", "K789Z"
- **Tempo de Expiração**: 30 segundos por código gerado

### 2. Sistema de Notificações
- **Notificações de Saque**: Simulação de saques com valor fixo de R$ 1.333,33
- **Design Moderno**: Cards com glassmorphism
- **Auto-remoção**: Desaparecem após 5 segundos
- **Posicionamento**: Canto inferior direito

### 3. Efeitos Visuais
- **Fundo Animado**: Partículas flutuantes em canvas
- **Gradientes Animados**: Texto com gradiente móvel
- **Neon Glow**: Efeito de brilho nos botões
- **Pulse Effects**: Indicadores animados

### 4. Interatividade
- **Som de Clique**: Feedback auditivo
- **Cópia de Código**: Integração com clipboard
- **Link Externo**: Redirecionamento para BetLion
- **Estado Persistente**: localStorage para códigos

### 5. Sistema de Rastreamento (Facebook Pixel)
- **Meta Pixel**: Integração completa com Facebook Pixel
- **Advanced Matching**: Parâmetros de correspondência avançada (localização, external_id)
- **Custom Parameters**: fbp, fbc, IP, User Agent
- **Eventos Personalizados**: "Acessou betlion" no clique do botão
- **Detecção de Iframe**: Evita duplicação de eventos entre iframe e parent
- **PageView Automático**: Rastreado quando o componente carrega

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1**: Biblioteca principal
- **TypeScript 5.5.3**: Tipagem estática
- **Tailwind CSS 3.4.1**: Framework de estilos
- **Lucide React 0.344.0**: Ícones modernos

### Rastreamento e Analytics
- **Meta Pixel**: Facebook Pixel (ID: 25009624982012198)
- **@fingerprintjs/fingerprintjs 5.0.1**: Fingerprinting de visitantes
- **ua-parser-js 2.0.6**: Parsing de User Agent

### Build Tools
- **Vite 5.4.2**: Build tool e dev server
- **PostCSS 8.4.35**: Processamento de CSS
- **ESLint 9.9.1**: Linting de código

### Fontes
- **Inter**: Fonte principal (Google Fonts)
- **JetBrains Mono**: Fonte para códigos

## 📁 Estrutura do Projeto

```
nexus-code-94ee90206ac6a24473581cf805321349bab4e322/
├── src/
│   ├── App.tsx                    # Componente principal
│   ├── main.tsx                   # Ponto de entrada
│   ├── index.css                  # Estilos globais
│   ├── vite-env.d.ts              # Tipos do Vite
│   ├── utils/                     # Utilitários
│   │   ├── facebookPixel.ts       # Facebook Pixel helper
│   │   ├── dataNormalization.ts   # Normalização e hash de dados
│   │   └── visitor.ts             # Gerenciamento de Visitor ID
│   ├── services/                  # Serviços
│   │   └── fingerprintService.ts  # Fingerprinting de visitantes
│   └── documentation/             # Documentação
├── package.json                   # Dependências
├── vite.config.ts                 # Configuração do Vite
├── tailwind.config.js             # Configuração do Tailwind
├── tsconfig.json                  # Configuração do TypeScript
└── index.html                     # HTML principal (com Meta Pixel)
```

## 🎯 Componentes Principais

### 1. App.tsx
- **Estado Principal**: Gerenciamento de todos os estados
- **Lógica de Negócio**: Geração, cópia e persistência
- **Efeitos Visuais**: Animações e transições
- **Integração**: Notificações e sons

### 2. AnimatedBackground
- **Canvas Animation**: Partículas flutuantes
- **Performance**: Otimizado com requestAnimationFrame
- **Responsivo**: Adapta-se ao redimensionamento

### 3. WithdrawalNotificationItem
- **Design Glassmorphism**: Efeito de vidro
- **Animações**: Slide-up e fade-in
- **Responsivo**: Adaptável a diferentes tamanhos

### 4. Facebook Pixel (Meta Pixel)
- **Integração Completa**: Sistema completo de rastreamento
- **Advanced Matching**: Parâmetros para melhor correspondência (external_id, ct, st, country)
- **Custom Parameters**: fbp, fbc, IP, User Agent
- **Detecção de Iframe**: Evita duplicação de eventos
- **Eventos**: PageView automático e evento customizado "Acessou betlion"

## 🎨 Classes CSS Personalizadas

### Animações
```css
.animate-fade-in      /* Fade in suave */
.animate-slide-up     /* Slide up */
.animate-pulse-glow   /* Pulse com glow */
.animate-float        /* Flutuação */
```

### Efeitos Visuais
```css
.glass               /* Glassmorphism claro */
.glass-dark          /* Glassmorphism escuro */
.gradient-text       /* Texto com gradiente */
.neon-glow           /* Efeito neon */
```

### Safe Areas (iOS)
```css
.pt-safe             /* Padding top seguro */
.pb-safe             /* Padding bottom seguro */
.pl-safe             /* Padding left seguro */
.pr-safe             /* Padding right seguro */
```

## 🚀 Como Executar

### Instalação
```bash
cd "Novo projeto"
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptações
- **Texto**: Tamanhos responsivos
- **Layout**: Flexbox adaptativo
- **Espaçamento**: Padding/margin responsivos
- **Animações**: Performance otimizada

## 🔧 Configurações

### Tailwind CSS
- **Cores Personalizadas**: Paleta moderna
- **Animações**: Keyframes customizados
- **Fontes**: Google Fonts integradas
- **Plugins**: Configuração limpa

### TypeScript
- **Strict Mode**: Ativado
- **ESLint**: Configuração rigorosa
- **Vite**: Integração otimizada

## 🎯 Melhorias Implementadas

### Design
- ✅ **Glassmorphism**: Efeitos de vidro modernos
- ✅ **Gradientes Animados**: Texto com gradiente móvel
- ✅ **Partículas Flutuantes**: Fundo animado
- ✅ **Neon Glow**: Efeitos de brilho
- ✅ **Tipografia Moderna**: Inter + JetBrains Mono

### UX/UI
- ✅ **Animações Suaves**: Transições fluidas
- ✅ **Feedback Visual**: Estados claros
- ✅ **Responsividade**: Adaptável
- ✅ **Acessibilidade**: Contraste adequado

### Performance
- ✅ **Canvas Otimizado**: requestAnimationFrame
- ✅ **Lazy Loading**: Componentes eficientes
- ✅ **Bundle Size**: Vite otimizado
- ✅ **Memory Management**: Cleanup adequado

## 📊 Comparação com Projeto Original

| Aspecto | Original | Novo Projeto |
|---------|----------|--------------|
| **Design** | Matrix/Cyberpunk | Moderno/Elegante |
| **Cores** | Verde (#17cf1f) | Azul/Roxo/Rosa |
| **Fonte** | Space Mono | Inter + JetBrains Mono |
| **Efeitos** | Grid binário | Partículas flutuantes |
| **Glassmorphism** | ❌ | ✅ |
| **Gradientes Animados** | ❌ | ✅ |
| **Responsividade** | Básica | Avançada |

## 🎨 Paleta de Cores Detalhada

### Cores Primárias
```css
--blue-50: #f0f9ff
--blue-500: #3b82f6
--blue-600: #2563eb
--blue-900: #1e3a8a
```

### Cores Secundárias
```css
--purple-500: #8b5cf6
--purple-600: #7c3aed
--pink-500: #ec4899
--pink-600: #db2777
```

### Cores de Fundo
```css
--slate-800: #1e293b
--slate-900: #0f172a
--slate-950: #020617
```

## 📊 Facebook Pixel - Detalhes Técnicos

### Configuração
- **Pixel ID**: 25009624982012198 (mesmo do projeto insta1)
- **Objetivo**: Garantir match entre eventos e evitar duplicação

### Eventos Rastreados
1. **PageView**: Automático quando o componente carrega (apenas se não estiver em iframe)
2. **Acessou betlion**: Evento customizado disparado no clique do botão "ACESSAR BETLION"

### Parâmetros Coletados

#### Advanced Matching Parameters
- `external_id`: ID único do visitante (hasheado SHA256)
- `ct`: Cidade (hasheado SHA256)
- `st`: Estado (hasheado SHA256)
- `country`: País (hasheado SHA256)

#### Custom Parameters
- `fbp`: Facebook Browser ID (cookie _fbp)
- `fbc`: Facebook Click ID (cookie _fbc)
- `client_ip_address`: IP do visitante (via APIs gratuitas)
- `client_user_agent`: User Agent do navegador

### Fluxo de Rastreamento

1. **Carregamento da Página**:
   - Script do pixel é carregado no `index.html`
   - Se o pixel já estiver carregado (iframe), usa o existente
   - Cookie `_fbp` é criado se não existir
   - PageView é rastreado apenas se não estiver em iframe

2. **Clique no Botão "ACESSAR BETLION"**:
   - Coleta parâmetros em paralelo (timeout de 2s)
   - Rastreia evento customizado "Acessou betlion"
   - Inclui todos os parâmetros de Advanced Matching e Custom Parameters

### Detecção de Iframe
- O sistema detecta se está rodando em iframe
- Se estiver em iframe:
  - PageView não é duplicado (já foi rastreado pelo parent)
  - Cookies `_fbp` e `_fbc` são tentados do parent se disponíveis
- Se não estiver em iframe:
  - PageView é rastreado normalmente
  - Cookies são criados no próprio domínio

### APIs de Geolocalização
O sistema usa múltiplas APIs gratuitas com fallback:
1. **ipapi.co**: 100 requisições/dia grátis
2. **ip-api.com**: 45 requisições/minuto grátis
3. **ipify.org + ipinfo.io**: Fallback final

Cache de 1 hora para evitar múltiplas requisições.

## 🔮 Próximas Melhorias

### Funcionalidades
- [ ] **PWA**: Progressive Web App
- [ ] **Notificações Push**: Sistema completo
- [ ] **Temas**: Múltiplos temas
- [ ] **Animações**: Mais efeitos visuais

### Performance
- [ ] **Lazy Loading**: Componentes sob demanda
- [ ] **Code Splitting**: Divisão de bundles
- [ ] **Caching**: Estratégias de cache
- [ ] **Optimization**: Otimizações avançadas

### UX/UI
- [ ] **Dark/Light Mode**: Alternância de temas
- [ ] **Micro-interactions**: Animações detalhadas
- [ ] **Accessibility**: Melhorias de acessibilidade
- [ ] **Internationalization**: Suporte a idiomas

---

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Desenvolvedor**: Cursor AI Assistant 