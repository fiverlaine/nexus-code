# Configuração do Supabase - Sistema de Visualizações

## Problema Identificado e Corrigido

O sistema de contabilização de visualizações estava falhando porque:
1. As funções RPC (`get_all_stories_stats` e `get_story_viewers`) podem não existir no Supabase
2. O código não tinha fallback para consultar diretamente a tabela

## Soluções Implementadas

✅ **Função `recordStoryView` aprimorada:**
- Logs detalhados para debug
- Verificação de duplicatas baseada em 24 horas (permite múltiplas visualizações após esse período)
- Melhor tratamento de erros
- Obtenção de IP com fallback

✅ **Função `getAllStoriesStats` com fallback:**
- Tenta usar função RPC se existir
- Se não existir, calcula estatísticas diretamente da tabela `story_views`
- Sempre retorna estrutura correta mesmo em caso de erro

✅ **Função `getStoryViewers` com fallback:**
- Tenta usar função RPC se existir
- Se não existir, busca diretamente da tabela
- Converte dados para formato esperado

✅ **AdminPanel melhorado:**
- Logs de debug detalhados
- Exibe total de visualizações únicas e totais
- Mostra última visualização em cada card
- Mensagem quando não há visualizações

## Estrutura da Tabela Necessária

A tabela `story_views` deve ter a seguinte estrutura no Supabase:

```sql
CREATE TABLE story_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id TEXT NOT NULL,
  viewer_id TEXT NOT NULL,
  viewer_ip TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_story_views_story_id ON story_views(story_id);
CREATE INDEX idx_story_views_viewer_id ON story_views(viewer_id);
CREATE INDEX idx_story_views_viewed_at ON story_views(viewed_at);
CREATE INDEX idx_story_views_story_viewer ON story_views(story_id, viewer_id);
```

## Funções RPC (Opcionais)

Se quiser criar as funções RPC para melhor performance, use:

### Função `get_all_stories_stats`

```sql
CREATE OR REPLACE FUNCTION get_all_stories_stats()
RETURNS TABLE (
  story_id TEXT,
  unique_views_24h BIGINT,
  total_views_24h BIGINT,
  last_view TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sv.story_id,
    COUNT(DISTINCT sv.viewer_id)::BIGINT AS unique_views_24h,
    COUNT(*)::BIGINT AS total_views_24h,
    MAX(sv.viewed_at) AS last_view
  FROM story_views sv
  WHERE sv.viewed_at >= NOW() - INTERVAL '24 hours'
  GROUP BY sv.story_id;
END;
$$ LANGUAGE plpgsql;
```

### Função `get_story_viewers`

```sql
CREATE OR REPLACE FUNCTION get_story_viewers(p_story_id TEXT)
RETURNS TABLE (
  viewer_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE,
  viewer_ip TEXT,
  user_agent TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sv.viewer_id,
    sv.viewed_at,
    sv.viewer_ip,
    sv.user_agent
  FROM story_views sv
  WHERE sv.story_id = p_story_id
  ORDER BY sv.viewed_at DESC;
END;
$$ LANGUAGE plpgsql;
```

## Permissões RLS (Row Level Security)

Configure as políticas RLS para permitir:
- **Inserção:** Qualquer um pode inserir visualizações (anon)
- **Leitura:** Apenas autenticados podem ler (ou configure conforme necessário)

```sql
-- Habilitar RLS
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Política para inserção (qualquer um pode inserir)
CREATE POLICY "Permitir inserção de visualizações"
ON story_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política para leitura (ajuste conforme necessário)
CREATE POLICY "Permitir leitura de visualizações"
ON story_views
FOR SELECT
TO authenticated
USING (true);
```

## Como Verificar se Está Funcionando

1. **Abrir o console do navegador** ao assistir um story
2. **Verificar os logs:**
   - `[recordStoryView] Tentando registrar visualização...`
   - `[recordStoryView] ✅ Nova visualização registrada com sucesso...`

3. **Acessar o painel admin** em `/admin-389184`
4. **Verificar os logs no console:**
   - `[AdminPanel] Carregando estatísticas...`
   - `[AdminPanel] Estatísticas carregadas: [...]`
   - `[AdminPanel] Total de visualizações únicas (24h): X`

5. **Verificar no Supabase:**
   - Acesse o Supabase Dashboard
   - Vá em Table Editor > `story_views`
   - Deve ver os registros de visualização

## Troubleshooting

### Problema: Visualizações não aparecem no painel

**Soluções:**
1. Verifique se a tabela `story_views` existe
2. Verifique se as políticas RLS estão configuradas corretamente
3. Abra o console do navegador e verifique se há erros
4. Verifique se os logs `[recordStoryView]` aparecem ao assistir um story

### Problema: Erro ao inserir visualização

**Possíveis causas:**
1. Tabela não existe
2. Políticas RLS bloqueando inserção
3. Estrutura da tabela incorreta
4. Erro de conexão com Supabase

**Solução:**
- Verifique os logs detalhados no console
- Verifique a estrutura da tabela no Supabase
- Teste a inserção manualmente no Supabase SQL Editor

### Problema: Estatísticas mostram 0

**Possíveis causas:**
1. Nenhuma visualização foi registrada ainda
2. Todas as visualizações são antigas (>24h)
3. Função RPC retornando erro (mas o fallback deve funcionar)

**Solução:**
- Verifique se há registros na tabela `story_views`
- Verifique a data/hora dos registros
- Teste assistindo um story e verificando se é registrado

## Teste Rápido

Para testar rapidamente:

1. Abra a aplicação em modo desenvolvimento
2. Abra o console do navegador (F12)
3. Assista a um story completo
4. Verifique os logs no console
5. Acesse `/admin-389184`
6. Verifique se as visualizações aparecem

Se tudo estiver funcionando, você verá:
- Logs de registro de visualização no console
- Cards de stories no painel admin com contadores > 0
- Lista de visualizadores ao clicar em um story

