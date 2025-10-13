# 📱 Compatibilidade de Vídeos para iOS

## ⚠️ Problema Identificado

O iPhone/iOS tem restrições específicas para reprodução de vídeos em navegadores web. Os vídeos precisam estar em um formato específico para funcionar corretamente.

## ✅ Solução: Conversão de Vídeos

### Requisitos para iOS:
- **Formato**: MP4
- **Codec de Vídeo**: H.264 (AVC)
- **Codec de Áudio**: AAC
- **Orientação**: 9:16 (vertical)
- **Resolução**: Recomendado 1080x1920 ou 720x1280

### Como Converter:

#### Opção 1: FFmpeg (Recomendado)
```bash
ffmpeg -i passo-1.mov -c:v libx264 -c:a aac -profile:v baseline -level 3.0 -pix_fmt yuv420p -vf "scale=720:1280" -movflags +faststart passo-1.mp4
```

#### Opção 2: HandBrake (Interface Gráfica)
1. Abra o HandBrake
2. Importe seu arquivo .MOV
3. Configurações:
   - **Preset**: Web > Gmail Medium 3 Minutes 720p30
   - **Vídeo**: H.264 (x264)
   - **Áudio**: AAC
   - **Dimensões**: 720x1280 (9:16)
   - **Filtros**: Sem redimensionamento

#### Opção 3: Online (CloudConvert)
1. Acesse cloudconvert.com
2. Selecione "MOV para MP4"
3. Configurações avançadas:
   - Codec: H.264
   - Qualidade: 720p
   - Formato: 9:16

### ⚡ Otimizações Adicionais:

1. **Fast Start**: Adicione `-movflags +faststart` no FFmpeg para carregamento mais rápido
2. **Compressão**: Use qualidade média (CRF 23-28) para balancear tamanho/qualidade
3. **Áudio**: Mantenha bitrate baixo (128kbps) para reduzir tamanho

### 📁 Arquivos Atuais:
- passo-1.mp4
- passo-2.mp4  
- passo-3.mp4
- passo-4.mp4
- passo-5.mp4

### 🔄 Após Conversão:
1. Substitua os arquivos na pasta `/public/stories/`
2. Mantenha os mesmos nomes
3. Teste no iPhone
4. Faça deploy no Netlify

## 🎯 Resultado Esperado:
- ✅ Reprodução automática no iOS
- ✅ Sem mensagens de erro
- ✅ Navegação fluida entre vídeos
- ✅ Compatibilidade com todos os navegadores

## 📞 Suporte:
Se ainda houver problemas após a conversão, verifique:
- Tamanho do arquivo (máximo 50MB recomendado)
- Duração (máximo 15 segundos por vídeo)
- Resolução (não exceder 1080x1920)
- Bitrate de vídeo (máximo 5Mbps)
