# 📱 Guia Completo de Configuração do Facebook Pixel

## 🎯 O que é o Facebook Pixel?

O Facebook Pixel é um código JavaScript que rastreia ações dos visitantes no seu site, permitindo:
- Medir a eficácia dos seus anúncios
- Criar audiências personalizadas
- Otimizar campanhas automaticamente
- Fazer retargeting de visitantes

## 📋 Passo a Passo de Instalação

### 1. Criar o Pixel no Facebook Business Manager

1. Acesse: https://business.facebook.com
2. No menu lateral, clique em **"Eventos de Dados"**
3. Clique em **"Pixels"**
4. Clique em **"Adicionar"** > **"Criar um Pixel"**
5. Dê um nome ao seu Pixel (ex: "Pixel Landing Page Nexus")
6. Clique em **"Criar Pixel"**
7. **Copie o ID do Pixel** (são 15 dígitos)

### 2. Adicionar o Pixel ID ao Projeto

Abra o arquivo `index.html` na raiz do projeto e localize a linha 31:

**Antes:**
```javascript
// fbq('init', 'YOUR_PIXEL_ID');
```

**Depois:**
```javascript
fbq('init', '123456789012345'); // Substitua pelo seu ID
```

Faça o mesmo na linha 38 (tag noscript):

**Antes:**
```html
<!-- <img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1" /> -->
```

**Depois:**
```html
<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=123456789012345&ev=PageView&noscript=1" />
```

### 3. Verificar se está Funcionando

#### Método 1: Facebook Pixel Helper (Recomendado)

1. Instale a extensão [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Acesse sua landing page
3. Clique no ícone da extensão
4. Você deve ver:
   - ✅ Pixel ativo
   - ✅ Evento PageView disparado

#### Método 2: Teste de Eventos no Business Manager

1. No Facebook Business Manager, vá em **"Eventos de Dados"** > **"Gerenciador de Eventos"**
2. Selecione seu Pixel
3. Clique em **"Testar Eventos"**
4. Digite a URL da sua landing page
5. Navegue pela página e execute ações (gerar código, copiar, clicar no CTA)
6. Os eventos devem aparecer em tempo real

## 📊 Eventos Configurados na Landing Page

### 1. PageView (Automático)
- **Quando dispara:** Ao carregar a página
- **Uso:** Rastrear todas as visitas
- **No Ads Manager:** Use para medir impressões

### 2. GenerateCode (Evento Customizado)
- **Quando dispara:** Ao clicar em "GERAR CÓDIGO"
- **Parâmetros:**
  ```javascript
  {
    content_name: 'Código de Segurança',
    content_category: 'Geração',
    value: 1.00,
    currency: 'BRL'
  }
  ```
- **Uso:** Medir engajamento inicial

### 3. AddToCart (Micro-conversão)
- **Quando dispara:** Ao copiar o código
- **Parâmetros:**
  ```javascript
  {
    content_name: 'Código Copiado',
    content_category: 'Engajamento',
    value: 2.00,
    currency: 'BRL'
  }
  ```
- **Uso:** Identificar leads qualificados

### 4. InitiateCheckout (Conversão Principal)
- **Quando dispara:** Ao clicar em "ACESSAR PLATAFORMA"
- **Parâmetros:**
  ```javascript
  {
    content_name: 'Acesso Plataforma BetLion',
    content_category: 'Conversão',
    value: 10.00,
    currency: 'BRL'
  }
  ```
- **Uso:** Otimizar campanhas para conversões

### 5. Lead (Conversão Principal - Duplicado)
- **Quando dispara:** Junto com InitiateCheckout
- **Parâmetros:**
  ```javascript
  {
    content_name: 'Clique BetLion',
    content_category: 'Conversão Principal'
  }
  ```
- **Uso:** Criar audiências de leads

## 🎯 Configurar Conversões no Ads Manager

### 1. Definir Evento Principal

1. Ao criar uma campanha, escolha **"Conversões"**
2. Em **"Evento de conversão"**, selecione **"Lead"**
3. Configure o valor da conversão (opcional)

### 2. Otimização de Entrega

Configure para **"Maximizar número de eventos de conversão"**

### 3. Criação de Públicos Personalizados

#### Público de Visitantes (Warm Audience)
1. Vá em **"Públicos"** > **"Criar Público"** > **"Público Personalizado"**
2. Escolha **"Tráfego do site"**
3. Configure:
   - **Evento:** PageView
   - **Período:** Últimos 30 dias
4. Nome: "Visitantes Landing Page - 30 dias"

#### Público de Leads Qualificados
1. Crie outro público com:
   - **Evento:** AddToCart (copiaram o código)
   - **Período:** Últimos 30 dias
2. Nome: "Leads Qualificados - 30 dias"

#### Público de Quase-Conversão
1. Crie público com:
   - **Evento:** AddToCart
   - **Excluir:** InitiateCheckout
2. Nome: "Não clicaram no CTA - Retargeting"

### 4. Criar Lookalike Audiences

1. Baseie-se no público "Lead"
2. Escolha 1% de similaridade para começar
3. Teste 2% e 5% depois

## 📈 Métricas para Acompanhar

### No Facebook Ads Manager

1. **CTR (Click-Through Rate)**
   - Meta: > 2%
   - Fórmula: (Cliques / Impressões) × 100

2. **CPC (Custo por Clique)**
   - Meta: < R$ 1,50
   - Otimize criativos se estiver acima

3. **Taxa de Conversão (Lead)**
   - Meta: > 20%
   - Fórmula: (Leads / Cliques) × 100

4. **CPL (Custo por Lead)**
   - Meta: < R$ 10,00
   - Fórmula: Gasto Total / Total de Leads

5. **ROAS (Return on Ad Spend)**
   - Meta: > 3x
   - Fórmula: Receita / Gasto com Anúncios

### No Google Analytics (Opcional)

Se integrar com GA4:
- Taxa de rejeição
- Tempo médio na página
- Páginas por sessão
- Origem do tráfego

## 🚨 Solução de Problemas

### Pixel não aparece no Helper

✅ **Soluções:**
1. Verifique se descomentou a linha `fbq('init', 'SEU_ID')`
2. Limpe o cache do navegador
3. Abra em aba anônima
4. Verifique o console do navegador (F12) para erros

### Eventos não estão disparando

✅ **Soluções:**
1. Abra o console (F12) e procure por erros de JavaScript
2. Verifique se o `window.fbq` está definido
3. Teste manualmente no console:
   ```javascript
   window.fbq('track', 'Lead', {test: true})
   ```
4. Verifique se os eventos estão dentro das funções corretas

### Eventos aparecem duplicados

✅ **Soluções:**
1. Certifique-se de ter apenas um `fbq('init')` no código
2. Verifique se não tem o Pixel instalado duas vezes
3. Desabilite extensões do navegador que possam interferir

## 🔒 Conformidade e Privacidade

### LGPD e Cookies

⚠️ **Importante:** O Facebook Pixel usa cookies. Você DEVE:

1. Adicionar um banner de cookies
2. Obter consentimento antes de rastrear
3. Ter uma política de privacidade clara

**Código de exemplo para banner de cookies:**

```html
<!-- Adicione ao final do body -->
<div id="cookie-banner" style="position: fixed; bottom: 0; left: 0; right: 0; background: #000; color: #fff; padding: 20px; text-align: center; z-index: 9999;">
  <p>Usamos cookies para melhorar sua experiência. Ao continuar, você aceita nossa <a href="/politica-privacidade" style="color: #4a9eff;">Política de Privacidade</a>.</p>
  <button onclick="document.getElementById('cookie-banner').style.display='none'; localStorage.setItem('cookieConsent', 'true');" style="background: #4a9eff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
    Aceitar
  </button>
</div>

<script>
  if (localStorage.getItem('cookieConsent') === 'true') {
    document.getElementById('cookie-banner').style.display = 'none';
  }
</script>
```

## 📚 Recursos Adicionais

### Links Úteis

- [Documentação Oficial do Pixel](https://www.facebook.com/business/help/742478679120153)
- [Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- [Business Manager](https://business.facebook.com)
- [Eventos Padrão do Facebook](https://www.facebook.com/business/help/402791146561655)

### Comunidades e Suporte

- [Facebook Ads Support](https://www.facebook.com/business/help)
- Grupos de Facebook sobre Ads
- Fóruns de marketing digital

## ✅ Checklist de Implementação

Use esta lista para garantir que tudo está configurado:

- [ ] Pixel criado no Business Manager
- [ ] ID do Pixel copiado
- [ ] ID adicionado no `index.html` (linha 31)
- [ ] Tag noscript configurada (linha 38)
- [ ] Deploy realizado
- [ ] Facebook Pixel Helper instalado
- [ ] Pixel verificado e ativo
- [ ] Evento PageView funcionando
- [ ] Eventos customizados testados
- [ ] Conversão "Lead" configurada no Ads Manager
- [ ] Públicos personalizados criados
- [ ] Banner de cookies adicionado
- [ ] Política de privacidade criada

## 🎓 Dicas Avançadas

### 1. Valor de Conversão Dinâmico

Se quiser ajustar o valor baseado em variáveis:

```javascript
// No App.tsx
const conversionValue = localStorage.getItem('userEngagement') === 'high' ? 15.00 : 10.00;

window.fbq('track', 'Lead', {
  value: conversionValue,
  currency: 'BRL'
});
```

### 2. Parâmetros Customizados

Adicione mais contexto aos eventos:

```javascript
window.fbq('track', 'Lead', {
  content_name: 'Clique BetLion',
  content_category: 'Conversão Principal',
  source: 'landing_page',
  timestamp: new Date().toISOString(),
  user_agent: navigator.userAgent
});
```

### 3. Event Deduplication

Para evitar eventos duplicados, use `eventID`:

```javascript
const eventID = 'unique-' + Date.now() + '-' + Math.random();

window.fbq('track', 'Lead', {
  content_name: 'Clique BetLion'
}, {
  eventID: eventID
});
```

---

**✅ Pronto!** Seu Facebook Pixel está configurado e rastreando todas as conversões importantes da sua landing page.

