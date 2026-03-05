# Crypto Collie Capital Flow

## Current State
Novo projeto. Nenhuma estrutura existente.

## Requested Changes (Diff)

### Add
- **App completo** de análise de fluxo de capital cripto institucional com 6 abas principais
- **Aba 1 - Mapa de Fluxo de Capital**: Visualização em tempo real do fluxo entre BTC, ETH e Altcoins; diagnóstico automático das últimas 24h; valores em USD; dados de ticker/24hr da Binance Futures
- **Aba 2 - Recomendações**: Sinais institucionais com confluência de RSI, OI, volume e price action; checklist visual de 8 critérios do Setup Institucional Completo (Liquidez, Manipulação, CHOCH, OB, FVG, Mitigação, Deslocamento, Alvo); selo visual quando todos os critérios são atendidos
- **Aba 3 - Price Action**: Gráfico de candlestick com detecção automática de padrões (engolfo, pin bar, CHOCH, FVG, Order Block); zonas de liquidez diária sobrepostas; tooltips explicativos para cada padrão
- **Aba 4 - Dominância USD × BTC**: Gráfico comparativo do índice do dólar vs dominância do Bitcoin; alertas de cruzamento; indicador de tendência institucional
- **Aba 5 - Base de Conhecimento**: 12 capítulos do livro técnico institucional (conteúdo placeholder substituível); navegação por capítulo; busca por texto; sem restrição de acesso (sem autenticação)
- **Aba 6 - Radar Global**: Visão geral de múltiplos mercados cripto; alertas institucionais em tempo real; indicadores de força relativa

### Modify
Nenhum (projeto novo)

### Remove
Nenhum (projeto novo)

## Implementation Plan

### Backend
- Nenhum backend necessário: todos os dados vêm de APIs públicas da Binance Futures diretamente do frontend
- Chaves API do usuário armazenadas em localStorage (leitura de posições abertas pessoais)

### Frontend
1. **Layout base**: sidebar de navegação com 6 abas, header com nome do app e logo, tema dark profissional
2. **Serviço de dados Binance**: módulo centralizado para fetch de `/fapi/v1/ticker/24hr`, `/fapi/v1/klines`, `/fapi/v1/openInterest`, `/futures/data/globalLongShortAccountRatio` com auto-refresh a cada 30s
3. **Configuração de API Keys**: modal/painel para o usuário inserir suas chaves Binance (API Key + Secret), salvas no localStorage; usado para endpoint de posições abertas
4. **Aba Capital Flow**: cards com BTC, ETH, Altcoins mostrando variação 24h, volume, dominância relativa; setas animadas de fluxo; diagnóstico textual automático
5. **Aba Recomendações**: lista de sinais por par (BTCUSDT, ETHUSDT, top altcoins); checklist interativo dos 8 critérios; badge "Setup Completo" quando todos atendidos
6. **Aba Price Action**: gráfico candlestick com Recharts/lightweight-charts; overlay de padrões detectados; tooltips por padrão
7. **Aba Dominância**: gráfico de linha dupla (DXY simulado vs BTC dominância); alertas visuais de cruzamento
8. **Aba Base de Conhecimento**: acordeão/lista dos 12 capítulos com conteúdo placeholder; campo de busca
9. **Aba Radar Global**: tabela/grid de múltiplos pares com variação, volume, OI; alertas coloridos por threshold

## UX Notes
- Tema dark com cores institucionais (fundo #0a0e1a, destaques em amarelo/gold e azul)
- Logo "Crypto Collie" com ícone de cão/collie estilizado
- Sem autenticação em nenhuma aba
- Dados reais da Binance Futures (APIs públicas); fallback para dados simulados se CORS bloquear
- Responsivo para desktop principalmente
- Animações suaves nas transições de aba
