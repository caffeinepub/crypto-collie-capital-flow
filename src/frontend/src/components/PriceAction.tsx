import { useState, useMemo } from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useKlines } from '../hooks/useQueries';
import {
  detectPatterns,
  getLiquidityZones,
  formatPrice,
  generateMockKlines,
  type KlineData,
  type PatternDetection,
} from '../services/binanceService';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
const INTERVALS = [
  { value: '15m', label: '15m' },
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1d', label: '1D' },
];

// Custom candlestick rendered as SVG within Recharts
interface CandleBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: KlineData;
  yScale?: (v: number) => number;
}

function CandleBar(props: CandleBarProps) {
  const { x = 0, width = 8, payload, yScale } = props;
  if (!payload || !yScale) return null;

  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? '#00c896' : '#ff4d6d';
  const bodyTop = yScale(Math.max(open, close));
  const bodyBottom = yScale(Math.min(open, close));
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
  const wickTop = yScale(high);
  const wickBottom = yScale(low);
  const cx = x + width / 2;

  return (
    <g>
      {/* Wick */}
      <line x1={cx} x2={cx} y1={wickTop} y2={wickBottom} stroke={color} strokeWidth={1} opacity={0.8} />
      {/* Body */}
      <rect
        x={x + 1}
        y={bodyTop}
        width={Math.max(width - 2, 2)}
        height={bodyHeight}
        fill={isUp ? '#00c89630' : '#ff4d6d30'}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
}

// Custom tooltip for candlestick
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: KlineData }>;
}

function CandleTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null;
  const k = payload[0].payload;
  const isUp = k.close >= k.open;
  const changePercent = ((k.close - k.open) / k.open * 100).toFixed(2);

  return (
    <div className="rounded-lg p-3 text-xs shadow-xl" style={{
      background: 'oklch(0.13 0.02 255)',
      border: '1px solid oklch(0.22 0.03 255)',
    }}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-muted-foreground">Open</span>
        <span className="font-mono text-foreground">{formatPrice(k.open)}</span>
        <span className="text-muted-foreground">High</span>
        <span className="font-mono text-success">{formatPrice(k.high)}</span>
        <span className="text-muted-foreground">Low</span>
        <span className="font-mono text-danger">{formatPrice(k.low)}</span>
        <span className="text-muted-foreground">Close</span>
        <span className={`font-mono ${isUp ? 'text-success' : 'text-danger'}`}>{formatPrice(k.close)}</span>
        <span className="text-muted-foreground">Change</span>
        <span className={`font-mono font-bold ${isUp ? 'text-success' : 'text-danger'}`}>
          {isUp ? '+' : ''}{changePercent}%
        </span>
      </div>
    </div>
  );
}

const PATTERN_LABELS: Record<string, string> = {
  bullish_engulfing: 'Engolfo Alta',
  bearish_engulfing: 'Engolfo Baixa',
  pin_bar_bullish: 'Pin Bar Alta',
  pin_bar_bearish: 'Pin Bar Baixa',
  choch_bullish: 'CHOCH Alta',
  choch_bearish: 'CHOCH Baixa',
  fvg_bullish: 'FVG Alta',
  fvg_bearish: 'FVG Baixa',
  order_block_bullish: 'OB Alta',
  order_block_bearish: 'OB Baixa',
};

interface PatternTooltipProps {
  pattern: PatternDetection;
}

function PatternTooltipCard({ pattern }: PatternTooltipProps) {
  return (
    <div className="absolute z-10 -top-20 left-1/2 -translate-x-1/2 w-56 rounded-lg p-2.5 text-xs pointer-events-none"
      style={{ background: 'oklch(0.13 0.02 255)', border: '1px solid oklch(0.22 0.03 255)' }}>
      <div className="font-semibold mb-1" style={{ color: pattern.color }}>{PATTERN_LABELS[pattern.type]}</div>
      <div className="text-muted-foreground leading-relaxed">{pattern.description}</div>
    </div>
  );
}

export default function PriceAction() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);

  const { data: klines, isLoading } = useKlines(symbol, interval);
  const activeKlines = klines || generateMockKlines(symbol, interval, 100);

  const patterns = useMemo(() => detectPatterns(activeKlines), [activeKlines]);
  const liquidityZones = useMemo(() => getLiquidityZones(activeKlines), [activeKlines]);

  // Prepare display data (last 60 candles)
  const displayKlines = activeKlines.slice(-60);

  // Price domain
  const priceMin = Math.min(...displayKlines.map(k => k.low)) * 0.9985;
  const priceMax = Math.max(...displayKlines.map(k => k.high)) * 1.0015;

  const formatTime = (ts: number): string => {
    const d = new Date(ts);
    if (interval === '1d') return `${d.getMonth() + 1}/${d.getDate()}`;
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Group patterns by type for sidebar
  const patternGroups = useMemo(() => {
    const groups: Record<string, PatternDetection[]> = {};
    patterns.forEach(p => {
      if (!groups[p.type]) groups[p.type] = [];
      groups[p.type].push(p);
    });
    return groups;
  }, [patterns]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div>
          <h2 className="section-heading font-display text-2xl font-bold text-foreground tracking-wide">Price Action</h2>
          <p className="text-sm text-muted-foreground mt-1">Detecção automática de padrões institucionais</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Symbol selector */}
          <div className="flex rounded-lg overflow-hidden border border-border">
            {SYMBOLS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSymbol(s)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                  symbol === s
                    ? 'bg-gold text-surface-1 font-bold'
                    : 'bg-surface-2 text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.replace('USDT', '')}
              </button>
            ))}
          </div>

          {/* Interval selector */}
          <div className="flex rounded-lg overflow-hidden border border-border">
            {INTERVALS.map(iv => (
              <button
                key={iv.value}
                type="button"
                onClick={() => setInterval(iv.value)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                  interval === iv.value
                    ? 'bg-electric-blue text-white font-bold'
                    : 'bg-surface-2 text-muted-foreground hover:text-foreground'
                }`}
              >
                {iv.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Chart */}
        <div className="xl:col-span-3 card-glow rounded-xl p-4 opacity-0 animate-fade-in-up stagger-1" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-display font-bold text-foreground tracking-wide">
              {symbol} • {INTERVALS.find(i => i.value === interval)?.label}
            </span>
            <span className="font-mono text-sm text-gold font-bold">
              ${formatPrice(displayKlines[displayKlines.length - 1]?.close || 0)}
            </span>
          </div>

          {isLoading ? (
            <div className="h-80 animate-shimmer rounded-lg" />
          ) : (
            <div className="h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={displayKlines} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.03 255 / 0.4)" />
                  <XAxis
                    dataKey="openTime"
                    tickFormatter={formatTime}
                    tick={{ fill: 'oklch(0.5 0.04 255)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.floor(displayKlines.length / 8)}
                  />
                  <YAxis
                    domain={[priceMin, priceMax]}
                    tickFormatter={(v: number) => `$${formatPrice(v)}`}
                    tick={{ fill: 'oklch(0.5 0.04 255)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    width={65}
                    orientation="right"
                  />
                  <Tooltip content={<CandleTooltip />} />

                  {/* Liquidity zones */}
                  {liquidityZones.map(zone => (
                    <ReferenceLine
                      key={zone.type}
                      y={zone.price}
                      stroke={zone.color}
                      strokeDasharray="6 3"
                      strokeWidth={1.5}
                      label={{
                        value: zone.label,
                        position: 'insideLeft',
                        fill: zone.color,
                        fontSize: 9,
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                  ))}

                  {/* Pattern reference lines */}
                  {patterns.slice(-8).map((p) => (
                    <ReferenceLine
                      key={`pattern-${p.type}-${p.index}`}
                      y={p.price}
                      stroke={p.color}
                      strokeDasharray="3 6"
                      strokeWidth={1}
                      strokeOpacity={0.5}
                    />
                  ))}

                  {/* Candles - rendered via custom bar */}
                  {displayKlines.map((k, i) => (
                    <CandleBar
                      key={k.openTime}
                      payload={k}
                      x={i * (100 / displayKlines.length) + 5}
                      width={Math.max((100 / displayKlines.length) - 1, 3)}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Liquidity Zone Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            {liquidityZones.map(z => (
              <div key={z.type} className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 border-t border-dashed" style={{ borderColor: z.color }} />
                <span className="text-xs text-muted-foreground">{z.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern Sidebar */}
        <div className="card-glow rounded-xl p-4 opacity-0 animate-fade-in-up stagger-2" style={{ animationFillMode: 'forwards' }}>
          <h3 className="font-display font-semibold text-foreground mb-3 tracking-wide">Padrões Detectados</h3>
          {Object.keys(patternGroups).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              Nenhum padrão detectado<br />neste período
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-96">
              {Object.entries(patternGroups).map(([type, pList]) => (
                <button
                  key={type}
                  type="button"
                  className="relative w-full text-left"
                  onMouseEnter={() => setHoveredPattern(type)}
                  onMouseLeave={() => setHoveredPattern(null)}
                  onFocus={() => setHoveredPattern(type)}
                  onBlur={() => setHoveredPattern(null)}
                  title={pList[0].description}
                >
                  <div
                    className="flex items-center justify-between p-2.5 rounded-lg cursor-help transition-all"
                    style={{
                      background: `${pList[0].color}12`,
                      border: `1px solid ${pList[0].color}30`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: pList[0].color }} />
                      <span className="text-xs font-semibold" style={{ color: pList[0].color }}>
                        {pList[0].label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">×{pList.length}</span>
                  </div>
                  {hoveredPattern === type && (
                    <PatternTooltipCard pattern={pList[0]} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Pattern descriptions */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Passe o cursor sobre um padrão para ver a descrição completa e seu significado institucional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
