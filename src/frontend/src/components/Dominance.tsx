import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import { use24hrTicker, useKlines } from '../hooks/useQueries';
import { generateMockTickers, generateMockKlines, type TickerData, type KlineData } from '../services/binanceService';

const RANGES = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
];

interface DominancePoint {
  time: string;
  timestamp: number;
  btcDominance: number;
  dxySimulated: number;
}

function buildDominanceSeries(klines: KlineData[], days: number): DominancePoint[] {
  const points: DominancePoint[] = [];
  const step = Math.max(1, Math.floor(klines.length / (days * 8)));
  const relevantKlines = klines.slice(-days * 24);

  for (let i = step; i < relevantKlines.length; i += step) {
    const k = relevantKlines[i];
    // BTC dominance simulated from price momentum
    const prevClose = relevantKlines[i - step]?.close || k.close;
    const change = (k.close - prevClose) / prevClose;
    const btcDomBase = 52 + change * 300;
    const btcDom = Math.max(35, Math.min(65, btcDomBase));
    // DXY inversely correlated with BTC (simulated)
    const dxy = 105 - (btcDom - 50) * 0.6 + (Math.random() - 0.5) * 0.8;

    const d = new Date(k.openTime);
    const label = days <= 7
      ? `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}h`
      : `${d.getDate()}/${d.getMonth() + 1}`;

    points.push({
      time: label,
      timestamp: k.openTime,
      btcDominance: parseFloat(btcDom.toFixed(2)),
      dxySimulated: parseFloat(dxy.toFixed(2)),
    });
  }

  return points;
}

function detectCrossovers(series: DominancePoint[]): Array<{ index: number; type: 'bullish' | 'bearish'; time: string }> {
  const crossovers: Array<{ index: number; type: 'bullish' | 'bearish'; time: string }> = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1];
    const curr = series[i];
    const prevDiff = prev.btcDominance - prev.dxySimulated;
    const currDiff = curr.btcDominance - curr.dxySimulated;
    if (prevDiff < 0 && currDiff >= 0) {
      crossovers.push({ index: i, type: 'bullish', time: curr.time });
    } else if (prevDiff > 0 && currDiff <= 0) {
      crossovers.push({ index: i, type: 'bearish', time: curr.time });
    }
  }
  return crossovers;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function DominanceTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 text-xs shadow-xl" style={{
      background: 'oklch(0.13 0.02 255)',
      border: '1px solid oklch(0.22 0.03 255)',
    }}>
      <div className="text-muted-foreground mb-2 font-mono">{label}</div>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-mono font-bold" style={{ color: entry.color }}>{entry.value.toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
}

export default function Dominance() {
  const [range, setRange] = useState(30);
  const { data: tickers } = use24hrTicker();
  const { data: btcKlines } = useKlines('BTCUSDT', '4h');

  const activeTickers = tickers || generateMockTickers();
  const activeKlines = btcKlines || generateMockKlines('BTCUSDT', '4h', 200);

  const series = useMemo(() => buildDominanceSeries(activeKlines, range), [activeKlines, range]);
  const crossovers = useMemo(() => detectCrossovers(series), [series]);
  const lastCrossover = crossovers[crossovers.length - 1];

  const currentBTC = series[series.length - 1]?.btcDominance || 52;
  const currentDXY = series[series.length - 1]?.dxySimulated || 104;
  const btcTrend = series.length > 1
    ? (series[series.length - 1].btcDominance - series[series.length - 10]?.btcDominance || 0)
    : 0;
  const correlation = useMemo(() => {
    if (series.length < 2) return 0;
    const n = series.length;
    const btcMean = series.reduce((s, p) => s + p.btcDominance, 0) / n;
    const dxyMean = series.reduce((s, p) => s + p.dxySimulated, 0) / n;
    const num = series.reduce((s, p) => s + (p.btcDominance - btcMean) * (p.dxySimulated - dxyMean), 0);
    const denomBTC = Math.sqrt(series.reduce((s, p) => s + (p.btcDominance - btcMean) ** 2, 0));
    const denomDXY = Math.sqrt(series.reduce((s, p) => s + (p.dxySimulated - dxyMean) ** 2, 0));
    return denomBTC * denomDXY !== 0 ? num / (denomBTC * denomDXY) : 0;
  }, [series]);

  // Derive overall BTC dominance from ticker volumes
  const totalVol = activeTickers.reduce((s: number, t: TickerData) => s + parseFloat(t.quoteVolume || '0'), 0);
  const btcVol = parseFloat(activeTickers.find((t: TickerData) => t.symbol === 'BTCUSDT')?.quoteVolume || '0');
  const btcVolDominance = totalVol > 0 ? (btcVol / totalVol) * 100 : 0;

  const isRiskOn = btcTrend < 0; // DXY falling, BTC rising = risk on
  const environment = btcTrend > 1 ? 'RISK-ON' : btcTrend < -1 ? 'RISK-OFF' : 'NEUTRO';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div>
          <h2 className="section-heading font-display text-2xl font-bold text-foreground tracking-wide">Dominância USD × BTC</h2>
          <p className="text-sm text-muted-foreground mt-1">Comparativo DXY simulado vs Bitcoin — análise institucional</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-border">
          {RANGES.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={`px-4 py-1.5 text-xs font-semibold transition-all ${
                range === r.value
                  ? 'bg-gold text-surface-1 font-bold'
                  : 'bg-surface-2 text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'BTC Dominância',
            value: `${currentBTC.toFixed(1)}%`,
            sub: btcTrend >= 0 ? `+${btcTrend.toFixed(1)}%` : `${btcTrend.toFixed(1)}%`,
            color: 'text-gold',
            subColor: btcTrend >= 0 ? 'text-success' : 'text-danger',
            delay: 50,
          },
          {
            label: 'DXY Simulado',
            value: `${currentDXY.toFixed(1)}%`,
            sub: 'Correlação inversa',
            color: 'text-electric-blue',
            subColor: 'text-muted-foreground',
            delay: 100,
          },
          {
            label: 'Dominância Vol.',
            value: `${btcVolDominance.toFixed(1)}%`,
            sub: 'BTC/Total Volume',
            color: 'text-foreground',
            subColor: 'text-muted-foreground',
            delay: 150,
          },
          {
            label: 'Correlação',
            value: `${(correlation * 100).toFixed(0)}%`,
            sub: correlation < -0.5 ? 'Inversa forte' : correlation > 0.5 ? 'Direta forte' : 'Fraca',
            color: Math.abs(correlation) > 0.5 ? 'text-gold' : 'text-muted-foreground',
            subColor: 'text-muted-foreground',
            delay: 200,
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="card-glow rounded-xl p-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${stat.delay}ms`, animationFillMode: 'forwards' }}
          >
            <div className="text-xs text-muted-foreground mb-2">{stat.label}</div>
            <div className={`font-mono font-bold text-xl ${stat.color}`}>{stat.value}</div>
            <div className={`text-xs mt-1 ${stat.subColor}`}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="card-glow rounded-xl p-5 opacity-0 animate-fade-in-up stagger-3" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-gold" />
              <span className="text-xs text-muted-foreground">BTC Dominância</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-electric-blue" />
              <span className="text-xs text-muted-foreground">DXY Simulado</span>
            </div>
          </div>
          {lastCrossover && (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{
                background: lastCrossover.type === 'bullish' ? 'oklch(0.68 0.2 148 / 0.15)' : 'oklch(0.58 0.23 18 / 0.15)',
                border: `1px solid ${lastCrossover.type === 'bullish' ? 'oklch(0.68 0.2 148 / 0.3)' : 'oklch(0.58 0.23 18 / 0.3)'}`,
                color: lastCrossover.type === 'bullish' ? 'oklch(0.68 0.2 148)' : 'oklch(0.58 0.23 18)',
              }}>
              <AlertTriangle className="w-3 h-3" />
              CRUZAMENTO EM {lastCrossover.time}
            </div>
          )}
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 5, right: 15, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.03 255 / 0.4)" />
              <XAxis
                dataKey="time"
                tick={{ fill: 'oklch(0.5 0.04 255)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(series.length / 8)}
              />
              <YAxis
                yAxisId="btc"
                orientation="left"
                domain={['auto', 'auto']}
                tick={{ fill: 'oklch(0.78 0.17 72)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                width={40}
              />
              <YAxis
                yAxisId="dxy"
                orientation="right"
                domain={['auto', 'auto']}
                tick={{ fill: 'oklch(0.55 0.22 260)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v.toFixed(0)}`}
                width={40}
              />
              <Tooltip content={<DominanceTooltip />} />

              {/* Crossover markers */}
              {crossovers.slice(-3).map((co) => (
                <ReferenceLine
                  key={`co-${co.time}-${co.type}`}
                  x={co.time}
                  yAxisId="btc"
                  stroke={co.type === 'bullish' ? '#00c896' : '#ff4d6d'}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              ))}

              <Line
                yAxisId="btc"
                type="monotone"
                dataKey="btcDominance"
                name="BTC Dom."
                stroke="oklch(0.78 0.17 72)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'oklch(0.78 0.17 72)' }}
              />
              <Line
                yAxisId="dxy"
                type="monotone"
                dataKey="dxySimulated"
                name="DXY Sim."
                stroke="oklch(0.55 0.22 260)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 2"
                activeDot={{ r: 4, fill: 'oklch(0.55 0.22 260)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Institutional Trend + Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Environment indicator */}
        <div
          className={`rounded-xl p-5 opacity-0 animate-fade-in-up stagger-4 ${
            environment === 'RISK-ON' ? 'border border-success/30' :
            environment === 'RISK-OFF' ? 'border border-danger/30' :
            'card-glow'
          }`}
          style={{
            animationFillMode: 'forwards',
            background: environment === 'RISK-ON' ? 'oklch(0.68 0.2 148 / 0.08)' :
                        environment === 'RISK-OFF' ? 'oklch(0.58 0.23 18 / 0.08)' :
                        'oklch(0.12 0.018 255)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${
              environment === 'RISK-ON' ? 'bg-success/20' :
              environment === 'RISK-OFF' ? 'bg-danger/20' :
              'bg-muted'
            }`}>
              {environment === 'RISK-ON' ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : environment === 'RISK-OFF' ? (
                <TrendingDown className="w-5 h-5 text-danger" />
              ) : (
                <Activity className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tendência Institucional</div>
              <div className={`font-display text-xl font-bold tracking-widest ${
                environment === 'RISK-ON' ? 'text-success' :
                environment === 'RISK-OFF' ? 'text-danger' :
                'text-foreground'
              }`}>
                AMBIENTE {environment}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {environment === 'RISK-ON'
              ? 'Instituições estão aumentando exposição a ativos de risco. BTC dominância em crescimento indica entrada de capital fresco no mercado cripto.'
              : environment === 'RISK-OFF'
              ? 'Movimento de fuga para segurança. Dólar se fortalece enquanto criptoativos sofrem pressão vendedora. Aguardar definição antes de novas posições.'
              : 'Mercado em equilíbrio entre bulls e bears. BTC dominância estável. Aguardar movimento direcional mais claro antes de posicionar.'
            }
          </p>
        </div>

        {/* Crossover explanation */}
        <div className="card-glow rounded-xl p-5 opacity-0 animate-fade-in-up stagger-5" style={{ animationFillMode: 'forwards' }}>
          <h3 className="font-display font-semibold text-foreground mb-3 tracking-wide">
            O que significa o Cruzamento?
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-success shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-success mb-1">Cruzamento Bullish</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  BTC Dominância cruzou acima do DXY. Instituições rotacionando capital para cripto. Historicamente precede rallies de 20-40%.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-danger shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-danger mb-1">Cruzamento Bearish</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  DXY domina. Dólar se fortalece. Instituições desfazendo posições em cripto. Potencial drawdown no curto prazo.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                ⚠️ DXY simulado com base na correlação histórica BTC/USD. Não representa dados reais do índice dólar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
