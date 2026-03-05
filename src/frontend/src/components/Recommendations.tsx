import { useState, useMemo } from 'react';
import { CheckCircle2, Circle, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { use24hrTicker, useKlines, useOpenInterest } from '../hooks/useQueries';
import {
  calculateRSI,
  getSignalStrength,
  formatPrice,
  formatVolume,
  generateMockTickers,
  generateMockKlines,
  type TickerData,
  type KlineData,
} from '../services/binanceService';

const TRACKED_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];

interface SetupCriterion {
  id: string;
  label: string;
  description: string;
  check: (klines: KlineData[], change: number, volume: number) => boolean;
}

const SETUP_CRITERIA: SetupCriterion[] = [
  {
    id: 'liquidez',
    label: 'Liquidez',
    description: 'Volume acima da média',
    check: (_, __, volume) => volume > 1_000_000,
  },
  {
    id: 'manipulacao',
    label: 'Manipulação',
    description: 'Sombra de manipulação detectada',
    check: (klines) => {
      if (klines.length < 3) return false;
      const last = klines[klines.length - 1];
      const wick = Math.abs(last.high - last.low);
      const body = Math.abs(last.close - last.open);
      return wick > body * 2;
    },
  },
  {
    id: 'choch',
    label: 'CHOCH',
    description: 'Change of Character confirmado',
    check: (klines) => {
      if (klines.length < 5) return false;
      const recent = klines.slice(-5);
      const highs = recent.map(k => k.high);
      return highs[4] > highs[2] && highs[2] < highs[0];
    },
  },
  {
    id: 'ob',
    label: 'Order Block',
    description: 'OB institucional identificado',
    check: (klines) => {
      if (klines.length < 3) return false;
      const k = klines[klines.length - 3];
      const next = klines[klines.length - 1];
      return k.close < k.open && next.close > k.high;
    },
  },
  {
    id: 'fvg',
    label: 'FVG',
    description: 'Fair Value Gap presente',
    check: (klines) => {
      if (klines.length < 3) return false;
      const k1 = klines[klines.length - 3];
      const k3 = klines[klines.length - 1];
      return k3.low > k1.high || k1.low > k3.high;
    },
  },
  {
    id: 'mitigacao',
    label: 'Mitigação',
    description: 'Retorno ao OB confirmado',
    check: (klines) => {
      if (klines.length < 10) return false;
      const rsi = calculateRSI(klines);
      return rsi > 40 && rsi < 65;
    },
  },
  {
    id: 'deslocamento',
    label: 'Deslocamento',
    description: 'Momentum direcional forte',
    check: (_, change) => Math.abs(change) > 2,
  },
  {
    id: 'alvo',
    label: 'Alvo',
    description: 'Nível de alvo identificado',
    check: (klines) => {
      if (klines.length < 20) return false;
      const last20High = Math.max(...klines.slice(-20).map(k => k.high));
      const last20Low = Math.min(...klines.slice(-20).map(k => k.low));
      const last = klines[klines.length - 1];
      return last.close > (last20Low + (last20High - last20Low) * 0.382);
    },
  },
];

interface PairRowProps {
  symbol: string;
  ticker: TickerData | undefined;
  delay: number;
}

function PairRow({ symbol, ticker, delay }: PairRowProps) {
  const { data: klines } = useKlines(symbol, '1h');
  const { data: oi } = useOpenInterest(symbol);

  const activeTicker = ticker;
  const price = parseFloat(activeTicker?.lastPrice || '0');
  const change = parseFloat(activeTicker?.priceChangePercent || '0');
  const volume = parseFloat(activeTicker?.quoteVolume || '0');

  const activeKlines = useMemo(() => klines || generateMockKlines(symbol, '1h', 50), [klines, symbol]);
  const rsi = useMemo(() => calculateRSI(activeKlines), [activeKlines]);
  const signalInfo = useMemo(() => getSignalStrength(rsi, change, volume / 1_000_000), [rsi, change, volume]);
  const oiValue = oi ? parseFloat(oi.openInterest) : null;

  const setupScore = useMemo(() => {
    return SETUP_CRITERIA.filter(c => c.check(activeKlines, change, volume)).length;
  }, [activeKlines, change, volume]);

  return (
    <div
      className="card-glow rounded-xl p-4 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background: 'oklch(0.16 0.02 255)', border: '1px solid oklch(0.22 0.03 255)' }}>
            {symbol === 'BTCUSDT' ? '₿' : symbol === 'ETHUSDT' ? 'Ξ' :
             symbol === 'SOLUSDT' ? '◎' : symbol === 'BNBUSDT' ? '⬡' : '◈'}
          </div>
          <div>
            <div className="font-display font-bold text-base tracking-wide text-foreground">{symbol.replace('USDT', '')}</div>
            <div className="font-mono text-xs text-gold">${formatPrice(price)}</div>
          </div>
        </div>

        <div
          className="px-3 py-1.5 rounded-full text-xs font-bold tracking-widest"
          style={{ background: `${signalInfo.color}20`, color: signalInfo.color, border: `1px solid ${signalInfo.color}40` }}
        >
          {signalInfo.signal}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Var 24h</div>
          <div className={`font-mono text-sm font-bold ${change >= 0 ? 'text-success' : 'text-danger'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">RSI</div>
          <div className={`font-mono text-sm font-bold ${
            rsi < 30 ? 'text-success' : rsi > 70 ? 'text-danger' : 'text-foreground'
          }`}>{rsi}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Volume</div>
          <div className="font-mono text-xs text-foreground">{formatVolume(volume)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Setup</div>
          <div className={`font-mono text-sm font-bold ${
            setupScore >= 6 ? 'text-gold' : setupScore >= 4 ? 'text-success' : 'text-muted-foreground'
          }`}>{setupScore}/8</div>
        </div>
      </div>

      {/* Confluence bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(setupScore / 8) * 100}%`,
              background: setupScore >= 6 ? 'oklch(0.78 0.17 72)' : setupScore >= 4 ? 'oklch(0.68 0.2 148)' : 'oklch(0.5 0.04 255)',
            }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {oiValue && (
            <span className="text-xs text-muted-foreground font-mono">
              OI: {(oiValue / 1000).toFixed(0)}K
            </span>
          )}
          {change >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-danger" />
          )}
        </div>
      </div>
    </div>
  );
}

function InstitutionalChecklist() {
  const { data: tickers } = use24hrTicker();
  const { data: btcKlines } = useKlines('BTCUSDT', '1h');

  const activeTickers = tickers || generateMockTickers();
  const activeKlines = btcKlines || generateMockKlines('BTCUSDT', '1h', 50);
  const btc = activeTickers.find((t: TickerData) => t.symbol === 'BTCUSDT');
  const change = parseFloat(btc?.priceChangePercent || '0');
  const volume = parseFloat(btc?.quoteVolume || '0');

  const checkedItems = SETUP_CRITERIA.map(c => ({
    ...c,
    checked: c.check(activeKlines, change, volume),
  }));
  const allChecked = checkedItems.every(c => c.checked);
  const checkedCount = checkedItems.filter(c => c.checked).length;

  return (
    <div
      className={`rounded-xl p-5 opacity-0 animate-fade-in-up ${allChecked ? 'setup-complete-glow' : 'card-glow'}`}
      style={{
        animationDelay: '400ms',
        animationFillMode: 'forwards',
        ...(allChecked ? { border: '1px solid oklch(0.78 0.17 72 / 0.6)', background: 'oklch(0.12 0.025 72)' } : {}),
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg tracking-wide text-foreground">Setup Institucional Completo</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Checklist de 8 critérios de confluência</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-gold">{checkedCount}/8</span>
          <Activity className="w-5 h-5 text-gold" />
        </div>
      </div>

      {allChecked && (
        <div className="mb-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-gold/20 border border-gold/50">
          <Zap className="w-5 h-5 text-gold" />
          <span className="font-display text-lg font-bold text-gold tracking-widest">SETUP COMPLETO ✓</span>
          <Zap className="w-5 h-5 text-gold" />
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(checkedCount / 8) * 100}%`,
              background: allChecked
                ? 'linear-gradient(90deg, oklch(0.78 0.17 72), oklch(0.88 0.14 88))'
                : checkedCount >= 5
                ? 'oklch(0.68 0.2 148)'
                : 'oklch(0.5 0.04 255)',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {checkedItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
              item.checked
                ? 'bg-success/10 border border-success/25'
                : 'bg-muted/30 border border-border'
            }`}
          >
            {item.checked ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0">
              <div className={`text-xs font-semibold ${item.checked ? 'text-success' : 'text-muted-foreground'}`}>
                {item.label}
              </div>
              <div className="text-xs text-muted-foreground truncate">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Recommendations() {
  const { data: tickers, isLoading } = use24hrTicker();
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  const activeTickers = tickers || generateMockTickers();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 rounded-xl animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
        <h2 className="section-heading font-display text-2xl font-bold text-foreground tracking-wide">Recomendações</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sinais institucionais com critérios de confluência — RSI, OI, Volume, Price Action
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pair Signals */}
        <div className="xl:col-span-2 space-y-3">
          <h3 className="font-display font-semibold text-muted-foreground text-sm uppercase tracking-widest">
            Pares Monitorados
          </h3>
          {TRACKED_PAIRS.map((pair, i) => (
            <button
              key={pair}
              type="button"
              onClick={() => setSelectedPair(selectedPair === pair ? null : pair)}
              className="w-full text-left cursor-pointer"
            >
              <PairRow
                symbol={pair}
                ticker={activeTickers.find((t: TickerData) => t.symbol === pair)}
                delay={i * 60}
              />
            </button>
          ))}
        </div>

        {/* Setup Checklist */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-muted-foreground text-sm uppercase tracking-widest">
            Setup Institucional
          </h3>
          <InstitutionalChecklist />
        </div>
      </div>
    </div>
  );
}
