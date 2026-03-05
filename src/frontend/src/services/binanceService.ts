// Binance Service - All backend API calls and data processing

export interface TickerData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
  count: string;
}

export interface KlineData {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteAssetVolume: number;
  numberOfTrades: number;
}

export interface OpenInterestData {
  symbol: string;
  openInterest: string;
  time: number;
}

export interface LongShortRatioData {
  symbol: string;
  longShortRatio: string;
  longAccount: string;
  shortAccount: string;
  timestamp: string;
}

export interface ProcessedTicker {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  quoteVolume: number;
  high: number;
  low: number;
  open: number;
}

export interface PatternDetection {
  type: 'bullish_engulfing' | 'bearish_engulfing' | 'pin_bar_bullish' | 'pin_bar_bearish' | 'choch_bullish' | 'choch_bearish' | 'fvg_bullish' | 'fvg_bearish' | 'order_block_bullish' | 'order_block_bearish';
  index: number;
  price: number;
  label: string;
  description: string;
  color: string;
}

export interface LiquidityZone {
  type: 'daily_high' | 'daily_low' | 'daily_open';
  price: number;
  label: string;
  color: string;
}

// ============================================================
// Mock Data Generators
// ============================================================

export function generateMockTickers(): TickerData[] {
  const pairs = [
    { symbol: 'BTCUSDT', base: 67000, vol: 28000 },
    { symbol: 'ETHUSDT', base: 3500, vol: 12000 },
    { symbol: 'SOLUSDT', base: 185, vol: 3200 },
    { symbol: 'BNBUSDT', base: 608, vol: 1800 },
    { symbol: 'XRPUSDT', base: 0.52, vol: 2100 },
    { symbol: 'ADAUSDT', base: 0.45, vol: 980 },
    { symbol: 'DOGEUSDT', base: 0.15, vol: 1500 },
    { symbol: 'AVAXUSDT', base: 38, vol: 720 },
    { symbol: 'DOTUSDT', base: 7.8, vol: 420 },
    { symbol: 'LINKUSDT', base: 14.5, vol: 380 },
    { symbol: 'LTCUSDT', base: 85, vol: 520 },
    { symbol: 'MATICUSDT', base: 0.87, vol: 680 },
    { symbol: 'UNIUSDT', base: 8.4, vol: 280 },
    { symbol: 'ATOMUSDT', base: 9.2, vol: 320 },
    { symbol: 'NEARUSDT', base: 6.1, vol: 250 },
    { symbol: 'FTMUSDT', base: 0.58, vol: 190 },
    { symbol: 'AAVEUSDT', base: 112, vol: 160 },
    { symbol: 'MKRUSDT', base: 1680, vol: 85 },
    { symbol: 'COMPUSDT', base: 58, vol: 92 },
    { symbol: 'SUSHIUSDT', base: 1.2, vol: 75 },
  ];

  return pairs.map(p => {
    const change = (Math.random() - 0.45) * 8;
    const price = p.base * (1 + change / 100);
    return {
      symbol: p.symbol,
      lastPrice: price.toFixed(p.base < 1 ? 5 : p.base < 100 ? 4 : 2),
      priceChangePercent: change.toFixed(2),
      quoteVolume: (p.vol * 1_000_000 * (0.8 + Math.random() * 0.4)).toFixed(2),
      volume: (p.vol * 1000 * (0.8 + Math.random() * 0.4)).toFixed(2),
      highPrice: (price * 1.02).toFixed(2),
      lowPrice: (price * 0.98).toFixed(2),
      openPrice: p.base.toFixed(2),
      count: Math.floor(Math.random() * 500000 + 100000).toString(),
    };
  });
}

export function generateMockKlines(symbol: string, interval: string, count = 100): KlineData[] {
  const prices: Record<string, number> = {
    BTCUSDT: 67000, ETHUSDT: 3500, SOLUSDT: 185, BNBUSDT: 608, XRPUSDT: 0.52,
  };
  const basePrice = prices[symbol] || 100;
  const klines: KlineData[] = [];
  let now = Date.now();

  const intervalMs: Record<string, number> = {
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
  };
  const step = intervalMs[interval] || intervalMs['1h'];
  now -= count * step;

  let price = basePrice * (0.95 + Math.random() * 0.1);
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.48) * 0.02;
    const open = price;
    const close = price * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const vol = basePrice * 1000 * (0.5 + Math.random() * 1.5);
    klines.push({
      openTime: now + i * step,
      open,
      high,
      low,
      close,
      volume: vol,
      closeTime: now + i * step + step - 1,
      quoteAssetVolume: vol * close,
      numberOfTrades: Math.floor(Math.random() * 10000 + 1000),
    });
    price = close;
  }
  return klines;
}

// ============================================================
// Data Parsers
// ============================================================

export function parseTickers(jsonStr: string): TickerData[] {
  try {
    const data = JSON.parse(jsonStr);
    if (Array.isArray(data)) return data as TickerData[];
    return [];
  } catch {
    return generateMockTickers();
  }
}

export function parseKlines(jsonStr: string): KlineData[] {
  try {
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) return [];
    return data.map((k: unknown[]) => ({
      openTime: Number(k[0]),
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
      volume: parseFloat(k[5] as string),
      closeTime: Number(k[6]),
      quoteAssetVolume: parseFloat(k[7] as string),
      numberOfTrades: Number(k[8]),
    }));
  } catch {
    return [];
  }
}

export function parseOpenInterest(jsonStr: string): OpenInterestData | null {
  try {
    return JSON.parse(jsonStr) as OpenInterestData;
  } catch {
    return null;
  }
}

export function parseLongShortRatio(jsonStr: string): LongShortRatioData[] {
  try {
    const data = JSON.parse(jsonStr);
    if (Array.isArray(data)) return data as LongShortRatioData[];
    return [];
  } catch {
    return [];
  }
}

// ============================================================
// Derived Metrics
// ============================================================

export function calculateRSI(klines: KlineData[], period = 14): number {
  if (klines.length < period + 1) return 50;
  const changes = klines.slice(-period - 1).map((k, i, arr) => {
    if (i === 0) return 0;
    return arr[i].close - arr[i - 1].close;
  }).slice(1);

  const gains = changes.filter(c => c > 0);
  const losses = changes.filter(c => c < 0).map(Math.abs);
  const avgGain = gains.reduce((s, v) => s + v, 0) / period;
  const avgLoss = losses.reduce((s, v) => s + v, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round(100 - (100 / (1 + rs)));
}

export function calculateDominance(tickers: TickerData[]): {
  btcDominance: number;
  ethDominance: number;
  altsDominance: number;
  totalVolume: number;
} {
  const totalVolume = tickers.reduce((sum, t) => sum + parseFloat(t.quoteVolume || '0'), 0);
  if (totalVolume === 0) return { btcDominance: 0, ethDominance: 0, altsDominance: 0, totalVolume: 0 };

  const btcVol = parseFloat(tickers.find(t => t.symbol === 'BTCUSDT')?.quoteVolume || '0');
  const ethVol = parseFloat(tickers.find(t => t.symbol === 'ETHUSDT')?.quoteVolume || '0');
  const altsVol = totalVolume - btcVol - ethVol;

  return {
    btcDominance: (btcVol / totalVolume) * 100,
    ethDominance: (ethVol / totalVolume) * 100,
    altsDominance: (altsVol / totalVolume) * 100,
    totalVolume,
  };
}

export function getSignalStrength(rsi: number, priceChange: number, volumeRatio: number): {
  signal: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  color: string;
  score: number;
} {
  let score = 0;
  if (rsi < 30) score += 2;
  else if (rsi < 45) score += 1;
  else if (rsi > 70) score -= 2;
  else if (rsi > 55) score -= 1;

  if (priceChange > 3) score += 2;
  else if (priceChange > 1) score += 1;
  else if (priceChange < -3) score -= 2;
  else if (priceChange < -1) score -= 1;

  if (volumeRatio > 1.5) score += 1;

  if (score >= 3) return { signal: 'STRONG BUY', color: '#00e088', score };
  if (score >= 1) return { signal: 'BUY', color: '#00c896', score };
  if (score <= -3) return { signal: 'STRONG SELL', color: '#ff3355', score };
  if (score <= -1) return { signal: 'SELL', color: '#ff4d6d', score };
  return { signal: 'NEUTRAL', color: '#6b7a99', score };
}

// ============================================================
// Pattern Detection
// ============================================================

export function detectPatterns(klines: KlineData[]): PatternDetection[] {
  const patterns: PatternDetection[] = [];
  if (klines.length < 3) return patterns;

  for (let i = 2; i < klines.length; i++) {
    const prev2 = klines[i - 2];
    const prev = klines[i - 1];
    const curr = klines[i];

    // Bullish Engulfing
    if (
      prev.close < prev.open &&
      curr.close > curr.open &&
      curr.open <= prev.close &&
      curr.close >= prev.open
    ) {
      patterns.push({
        type: 'bullish_engulfing',
        index: i,
        price: curr.close,
        label: 'ENG↑',
        description: 'Engolfo de Alta: Vela bullish engole a vela bearish anterior. Sinal de reversão de alta.',
        color: '#00c896',
      });
    }

    // Bearish Engulfing
    if (
      prev.close > prev.open &&
      curr.close < curr.open &&
      curr.open >= prev.close &&
      curr.close <= prev.open
    ) {
      patterns.push({
        type: 'bearish_engulfing',
        index: i,
        price: curr.open,
        label: 'ENG↓',
        description: 'Engolfo de Baixa: Vela bearish engole a vela bullish anterior. Sinal de reversão de baixa.',
        color: '#ff4d6d',
      });
    }

    // Pin Bar Bullish (Hammer)
    const bodySize = Math.abs(curr.close - curr.open);
    const lowerWick = Math.min(curr.open, curr.close) - curr.low;
    const upperWick = curr.high - Math.max(curr.open, curr.close);
    const totalRange = curr.high - curr.low;

    if (totalRange > 0 && lowerWick > bodySize * 2 && upperWick < bodySize && lowerWick > totalRange * 0.6) {
      patterns.push({
        type: 'pin_bar_bullish',
        index: i,
        price: curr.low,
        label: 'PIN↑',
        description: 'Pin Bar de Alta (Hammer): Sombra inferior longa indica rejeição de preços baixos. Potencial reversão bullish.',
        color: '#00c896',
      });
    }

    // Pin Bar Bearish (Shooting Star)
    if (totalRange > 0 && upperWick > bodySize * 2 && lowerWick < bodySize && upperWick > totalRange * 0.6) {
      patterns.push({
        type: 'pin_bar_bearish',
        index: i,
        price: curr.high,
        label: 'PIN↓',
        description: 'Pin Bar de Baixa (Shooting Star): Sombra superior longa indica rejeição de preços altos. Potencial reversão bearish.',
        color: '#ff4d6d',
      });
    }

    // CHOCH - Change of Character (simplified)
    if (i >= 4) {
      const prevHigh = Math.max(klines[i-3].high, klines[i-2].high, klines[i-1].high);
      const prevLow = Math.min(klines[i-3].low, klines[i-2].low, klines[i-1].low);

      if (curr.close > prevHigh && klines[i-1].close < klines[i-2].close) {
        patterns.push({
          type: 'choch_bullish',
          index: i,
          price: prevHigh,
          label: 'CHOCH↑',
          description: 'Change of Character Bullish: Quebra da estrutura de baixa. Potencial mudança de tendência para alta.',
          color: '#f0b429',
        });
      }
      if (curr.close < prevLow && klines[i-1].close > klines[i-2].close) {
        patterns.push({
          type: 'choch_bearish',
          index: i,
          price: prevLow,
          label: 'CHOCH↓',
          description: 'Change of Character Bearish: Quebra da estrutura de alta. Potencial mudança de tendência para baixa.',
          color: '#f0b429',
        });
      }
    }

    // FVG - Fair Value Gap
    if (i >= 2) {
      const gap = klines[i].low - klines[i-2].high;
      if (gap > 0 && gap / klines[i-2].high > 0.001) {
        patterns.push({
          type: 'fvg_bullish',
          index: i - 1,
          price: klines[i-2].high + gap / 2,
          label: 'FVG↑',
          description: 'Fair Value Gap Bullish: Zona de desequilíbrio de preços. Preço tende a retornar para preencher o gap.',
          color: '#3d7fff',
        });
      }
      const gap2 = klines[i-2].low - klines[i].high;
      if (gap2 > 0 && gap2 / klines[i-2].low > 0.001) {
        patterns.push({
          type: 'fvg_bearish',
          index: i - 1,
          price: klines[i].high + gap2 / 2,
          label: 'FVG↓',
          description: 'Fair Value Gap Bearish: Zona de desequilíbrio de preços. Preço tende a retornar para preencher o gap.',
          color: '#3d7fff',
        });
      }
    }
  }

  // Order Blocks (last 5 for performance)
  for (let i = 5; i < klines.length - 1; i++) {
    const curr = klines[i];
    const next = klines[i + 1];
    const isBullishOB = curr.close < curr.open && next.close > next.open && next.close > curr.high;
    const isBearishOB = curr.close > curr.open && next.close < next.open && next.close < curr.low;

    if (isBullishOB && patterns.filter(p => p.type === 'order_block_bullish').length < 3) {
      patterns.push({
        type: 'order_block_bullish',
        index: i,
        price: (curr.open + curr.close) / 2,
        label: 'OB↑',
        description: 'Order Block Bullish: Última vela bearish antes de movimento bullish forte. Zona de demanda institucional.',
        color: '#00c896',
      });
    }
    if (isBearishOB && patterns.filter(p => p.type === 'order_block_bearish').length < 3) {
      patterns.push({
        type: 'order_block_bearish',
        index: i,
        price: (curr.open + curr.close) / 2,
        label: 'OB↓',
        description: 'Order Block Bearish: Última vela bullish antes de movimento bearish forte. Zona de oferta institucional.',
        color: '#ff4d6d',
      });
    }
  }

  return patterns;
}

export function getLiquidityZones(klines: KlineData[]): LiquidityZone[] {
  if (klines.length === 0) return [];
  const dayKlines = klines.slice(-24);
  const dailyHigh = Math.max(...dayKlines.map(k => k.high));
  const dailyLow = Math.min(...dayKlines.map(k => k.low));
  const dailyOpen = dayKlines[0]?.open || 0;

  return [
    { type: 'daily_high', price: dailyHigh, label: 'High Diário', color: '#ff4d6d' },
    { type: 'daily_low', price: dailyLow, label: 'Low Diário', color: '#00c896' },
    { type: 'daily_open', price: dailyOpen, label: 'Open Diário', color: '#f0b429' },
  ];
}

// ============================================================
// Capital Flow Analysis
// ============================================================

export function analyzeCapitalFlow(tickers: TickerData[]): {
  btcFlow: 'in' | 'out' | 'neutral';
  ethFlow: 'in' | 'out' | 'neutral';
  altsFlow: 'in' | 'out' | 'neutral';
  diagnosis: string[];
  environment: 'risk-on' | 'risk-off' | 'neutral';
} {
  const btc = tickers.find(t => t.symbol === 'BTCUSDT');
  const eth = tickers.find(t => t.symbol === 'ETHUSDT');
  const btcChange = parseFloat(btc?.priceChangePercent || '0');
  const ethChange = parseFloat(eth?.priceChangePercent || '0');

  const altTickers = tickers.filter(t => !['BTCUSDT', 'ETHUSDT'].includes(t.symbol));
  const avgAltChange = altTickers.reduce((s, t) => s + parseFloat(t.priceChangePercent || '0'), 0) / (altTickers.length || 1);

  const btcFlow: 'in' | 'out' | 'neutral' = btcChange > 1 ? 'in' : btcChange < -1 ? 'out' : 'neutral';
  const ethFlow: 'in' | 'out' | 'neutral' = ethChange > 1 ? 'in' : ethChange < -1 ? 'out' : 'neutral';
  const altsFlow: 'in' | 'out' | 'neutral' = avgAltChange > 1 ? 'in' : avgAltChange < -1 ? 'out' : 'neutral';

  const diagnosis: string[] = [];

  if (btcChange > 2 && avgAltChange < 0) {
    diagnosis.push('Capital concentrado em BTC — dominância em alta');
    diagnosis.push('Altcoins sofrem com rotação para BTC');
  } else if (avgAltChange > 2 && btcChange < 1) {
    diagnosis.push('Capital rotacionando de BTC para Altcoins (Altseason em desenvolvimento)');
    diagnosis.push('Ambiente de alta apetência ao risco');
  } else if (btcChange > 1 && ethChange > 1) {
    diagnosis.push('Movimento sincronizado BTC + ETH — participação institucional');
    diagnosis.push('Alta liquidez no mercado');
  } else if (btcChange < -2 && ethChange < -2) {
    diagnosis.push('Saída generalizada de capital — pressão vendedora dominante');
    diagnosis.push('Ambiente de aversão ao risco');
  } else {
    diagnosis.push('Mercado em consolidação — aguardando catalisador');
    diagnosis.push('Baixa volatilidade nos últimos movimentos');
  }

  if (btcChange > 1 && ethChange > 1 && avgAltChange > 0) {
    diagnosis.push('Ambiente Risk-On: Investidores assumindo riscos');
  } else if (btcChange < -1 || (btcChange < 0 && ethChange < 0)) {
    diagnosis.push('Ambiente Risk-Off: Fuga para ativos mais seguros');
  }

  const environment =
    btcChange > 1 && ethChange > 0 ? 'risk-on' :
    btcChange < -1 && ethChange < -1 ? 'risk-off' : 'neutral';

  return { btcFlow, ethFlow, altsFlow, diagnosis, environment };
}

export function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (price >= 100) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 });
  return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `$${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(2)}K`;
  return `$${vol.toFixed(2)}`;
}
