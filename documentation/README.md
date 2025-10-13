# Documentação do Projeto de Visualização de Stories

## Visão Geral

Este projeto implementa um sistema de visualização de stories semelhante ao Instagram, com um sistema de rastreamento de visualizações e um painel administrativo para análise de dados.

## Arquitetura

### Frontend

- **Framework:** React com Vite
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes Principais:**
  - `App.tsx`: Componente principal que renderiza o `StoriesViewer`.
  - `StoriesViewer.tsx`: Exibe os stories e registra as visualizações.
  - `AdminPanel.tsx`: Painel administrativo para visualização de estatísticas.
  - `supabase.ts`: Módulo de interação com o Supabase.

### Backend (Supabase)

- **Banco de Dados:** PostgreSQL
- **Tabelas:**
  - `story_views`: Armazena cada visualização de story, incluindo `story_id`, `viewer_id`, `viewer_ip`, `user_agent` e `viewed_at`.
- **Funções:**
  - `get_unique_views_24h`: Retorna o número de visualizadores únicos para um story nas últimas 24 horas.
  - `get_all_stories_stats`: Retorna estatísticas agregadas para todos os stories.
  - `get_story_viewers`: Retorna a lista de visualizadores para um story específico.

## Funcionalidades

### Rastreamento de Visualizações

- **Identificação Única:** Um `viewer_id` (UUID v4) é gerado e armazenado no `localStorage` do navegador para identificar unicamente cada usuário.
- **Registro de Visualização:** Quando um story é aberto, a função `recordStoryView` em `supabase.ts` é chamada, enviando `story_id` e `viewer_id` para o banco de dados.

### Painel Administrativo

- **Acesso:** Acessível através da rota `/admin-389184`.
- **Visualizações:**
  - **Grid de Stories:** Exibe uma grade com todos os stories e a contagem de visualizações únicas.
  - **Detalhes do Story:** Ao clicar em um story, exibe uma lista detalhada de todos os visualizadores, incluindo `viewer_id`, data/hora, IP e `user-agent`.
- **Atualização Automática:** Os dados do painel são atualizados automaticamente a cada 30 segundos.

## Correções Implementadas

### Problema de Contagem de Visualizações
**Identificado:** A função `recordStoryView` não estava evitando registros duplicados do mesmo viewer para o mesmo story.

**Soluções Aplicadas:**
1. ✅ **Verificação de Duplicatas**: Implementada verificação antes de inserir nova visualização
2. ✅ **Retorno de Status**: Função agora retorna `Promise<boolean>` para indicar sucesso/falha
3. ✅ **Logs Informativos**: Adicionados logs para rastreamento de visualizações
4. ✅ **Tratamento de Erros**: Melhor tratamento de erros com códigos específicos

### Código Atualizado - recordStoryView
```typescript
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
```

## Melhorias Implementadas

### Prevenção de Duplicatas
- ✅ Verificação automática antes de inserir visualizações
- ✅ Uso do código de erro `PGRST116` para identificar registros não encontrados
- ✅ Logs informativos para debugging

### Interface Administrativa
- ✅ Exibição de todos os stories (mesmo sem visualizações)
- ✅ Estatísticas detalhadas por story
- ✅ Interface responsiva e moderna
- ✅ Botão de atualização em tempo real

### Robustez do Sistema
- ✅ Tratamento adequado de erros
- ✅ Fallbacks para casos de falha
- ✅ Logs detalhados para monitoramento
- ✅ Validação de dados antes de inserção

## Como Executar

1. **Instalar Dependências:**
   ```bash
   npm install
   ```
2. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
3. **Acessar a Aplicação:**
   - **Visualizador de Stories:** `http://localhost:5174/`
   - **Painel Administrativo:** `http://localhost:5174/admin-389184`

## Status do Projeto
✅ **Concluído** - Sistema de contagem de visualizações corrigido e funcionando corretamente.