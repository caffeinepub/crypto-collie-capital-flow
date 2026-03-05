import { useMemo, useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle } from 'lucide-react';
import { use24hrTicker } from '../hooks/useQueries';
import {
  calculateDominance,
  analyzeCapitalFlow,
  formatPrice,
  formatVolume,
  generateMockTickers,
  type TickerData,
} from '../services/binanceService';

interface MetricCardProps {
  name: string;
  symbol: string;
  price: number;
  change: number;
  volume: number;
  dominance: number;
  flow: 'in' | 'out' | 'neutral';
  delay?: number;
}

function MetricCard({ name, symbol, price, change, volume, dominance, flow, delay = 0 }: MetricCardProps & { price: number }) {
  const isPositive = change >= 0;
  const isNegative = change < 0;
  const accentColor = symbol === 'BTCUSDT' ? 'text-gold' : symbol === 'ETHUSDT' ? 'text-electric-blue' : 'text-success';
  const barColor = symbol === 'BTCUSDT' ? 'bg-gold' : symbol === 'ETHUSDT' ? 'bg-electric-blue' : 'bg-success';

  return (
    <div
      className="card-glow rounded-xl p-5 opacity-0 animate-fade-in-up flex flex-col gap-4"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold shrink-0 ${accentColor}`}
            style={{ background: 'oklch(0.16 0.02 255)', border: '1px solid oklch(0.22 0.03 255)' }}
          >
            {symbol === 'BTCUSDT' ? '₿' : symbol === 'ETHUSDT' ? 'Ξ' : '∑'}
          </div>
          <div>
            <div className="font-display text-sm font-bold text-foreground tracking-wider leading-none">{name}</div>
            <div className="font-mono text-[10px] text-muted-foreground mt-0.5 leading-none">{symbol}</div>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${
          flow === 'in' ? 'bg-success/15 text-success border border-success/30' :
          flow === 'out' ? 'bg-danger/15 text-danger border border-danger/30' :
          'bg-muted/50 text-muted-foreground border border-border'
        }`}>
          {flow === 'in' ? <TrendingUp className="w-2.5 h-2.5" /> : flow === 'out' ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
          {flow === 'in' ? 'Entrada' : flow === 'out' ? 'Saída' : 'Neutro'}
        </div>
      </div>

      {/* Hero price */}
      {price > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Preço</div>
          <div className={`font-mono font-bold text-2xl leading-none ${accentColor}`}>
            ${formatPrice(price)}
          </div>
        </div>
      )}

      {/* Change — prominent */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Var. 24h</span>
        <span className={`font-mono font-bold text-xl leading-none ${
          isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-foreground'
        }`}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Secondary stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Volume</span>
          <span className="font-mono text-xs text-foreground">{formatVolume(volume)}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest shrink-0">Dom.</span>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                style={{ width: `${Math.min(dominance, 100)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground w-9 text-right">{dominance.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Animated SVG Flow Diagram
function FlowDiagram({ btcFlow, ethFlow, altsFlow }: {
  btcFlow: 'in' | 'out' | 'neutral';
  ethFlow: 'in' | 'out' | 'neutral';
  altsFlow: 'in' | 'out' | 'neutral';
}) {
  const flowColor = (flow: 'in' | 'out' | 'neutral') =>
    flow === 'in' ? '#00c896' : flow === 'out' ? '#ff4d6d' : '#6b7a99';

  // Arrow direction based on flows
  const btcToEth = btcFlow === 'out' && ethFlow === 'in';
  const ethToBtc = ethFlow === 'out' && btcFlow === 'in';
  const btcToAlts = btcFlow === 'out' && altsFlow === 'in';
  const altsToBtc = altsFlow === 'out' && btcFlow === 'in';
  const ethToAlts = ethFlow === 'out' && altsFlow === 'in';
  const altsToEth = altsFlow === 'out' && ethFlow === 'in';

  return (
    <div className="relative">
      <svg viewBox="0 0 400 220" className="w-full max-h-48" style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }} aria-label="Diagrama de fluxo de capital entre BTC, ETH e Altcoins">
        {/* BTC Node */}
        <circle cx="200" cy="40" r="30" fill="oklch(0.12 0.018 255)" stroke="#f0b429" strokeWidth="1.5" />
        <text x="200" y="35" textAnchor="middle" fill="#f0b429" fontSize="11" fontWeight="700" fontFamily="Rajdhani">BTC</text>
        <text x="200" y="50" textAnchor="middle" fill="#f0b429" fontSize="9" fontFamily="JetBrains Mono">₿</text>

        {/* ETH Node */}
        <circle cx="100" cy="170" r="28" fill="oklch(0.12 0.018 255)" stroke="#3d7fff" strokeWidth="1.5" />
        <text x="100" y="165" textAnchor="middle" fill="#3d7fff" fontSize="11" fontWeight="700" fontFamily="Rajdhani">ETH</text>
        <text x="100" y="179" textAnchor="middle" fill="#3d7fff" fontSize="9" fontFamily="JetBrains Mono">Ξ</text>

        {/* ALTS Node */}
        <circle cx="300" cy="170" r="28" fill="oklch(0.12 0.018 255)" stroke="#00c896" strokeWidth="1.5" />
        <text x="300" y="165" textAnchor="middle" fill="#00c896" fontSize="10" fontWeight="700" fontFamily="Rajdhani">ALTS</text>
        <text x="300" y="179" textAnchor="middle" fill="#00c896" fontSize="9" fontFamily="JetBrains Mono">∑</text>

        {/* BTC ↔ ETH */}
        {(btcToEth || (!btcToEth && !ethToBtc)) && (
          <path d="M175 65 L125 150" fill="none" stroke={btcToEth ? '#00c896' : '#2a3460'} strokeWidth={btcToEth ? 2 : 1}
            strokeDasharray={btcToEth ? "8 4" : "4 4"}
            className={btcToEth ? "animate-flow" : ""}
          />
        )}
        {ethToBtc && (
          <path d="M125 150 L175 65" fill="none" stroke={flowColor(ethFlow)} strokeWidth="2"
            strokeDasharray="8 4" className="animate-flow" />
        )}

        {/* BTC ↔ ALTS */}
        {(btcToAlts || (!btcToAlts && !altsToBtc)) && (
          <path d="M225 65 L275 150" fill="none" stroke={btcToAlts ? '#00c896' : '#2a3460'} strokeWidth={btcToAlts ? 2 : 1}
            strokeDasharray={btcToAlts ? "8 4" : "4 4"}
            className={btcToAlts ? "animate-flow" : ""}
          />
        )}
        {altsToBtc && (
          <path d="M275 150 L225 65" fill="none" stroke={flowColor(altsFlow)} strokeWidth="2"
            strokeDasharray="8 4" className="animate-flow" />
        )}

        {/* ETH ↔ ALTS */}
        {(ethToAlts || (!ethToAlts && !altsToEth)) && (
          <path d="M128 170 L272 170" fill="none" stroke={ethToAlts ? '#00c896' : '#2a3460'} strokeWidth={ethToAlts ? 2 : 1}
            strokeDasharray={ethToAlts ? "8 4" : "4 4"}
            className={ethToAlts ? "animate-flow" : ""}
          />
        )}
        {altsToEth && (
          <path d="M272 170 L128 170" fill="none" stroke={flowColor(altsFlow)} strokeWidth="2"
            strokeDasharray="8 4" className="animate-flow" />
        )}

        {/* Glow circles */}
        <circle cx="200" cy="40" r="34" fill="none" stroke={btcFlow === 'in' ? '#f0b429' : '#f0b429'} strokeWidth="0.5" opacity="0.3" />
        <circle cx="100" cy="170" r="32" fill="none" stroke="#3d7fff" strokeWidth="0.5" opacity="0.3" />
        <circle cx="300" cy="170" r="32" fill="none" stroke="#00c896" strokeWidth="0.5" opacity="0.3" />
      </svg>
    </div>
  );
}

export default function CapitalFlowMap() {
  const { data: tickers, isLoading, isError, dataUpdatedAt } = use24hrTicker();
  const [countdown, setCountdown] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isDemoMode = isError || !tickers;
  const activeTickers = tickers || generateMockTickers();

  const btc = activeTickers.find((t: TickerData) => t.symbol === 'BTCUSDT');
  const eth = activeTickers.find((t: TickerData) => t.symbol === 'ETHUSDT');
  const btcChange = parseFloat(btc?.priceChangePercent || '0');
  const ethChange = parseFloat(eth?.priceChangePercent || '0');
  const btcVol = parseFloat(btc?.quoteVolume || '0');
  const ethVol = parseFloat(eth?.quoteVolume || '0');

  const altsVolume = activeTickers
    .filter((t: TickerData) => !['BTCUSDT', 'ETHUSDT'].includes(t.symbol))
    .reduce((s: number, t: TickerData) => s + parseFloat(t.quoteVolume || '0'), 0);

  const altTickers = activeTickers.filter((t: TickerData) => !['BTCUSDT', 'ETHUSDT'].includes(t.symbol));
  const avgAltChange = altTickers.reduce((s: number, t: TickerData) => s + parseFloat(t.priceChangePercent || '0'), 0) / (altTickers.length || 1);

  const dominance = useMemo(() => calculateDominance(activeTickers), [activeTickers]);
  const flowAnalysis = useMemo(() => analyzeCapitalFlow(activeTickers), [activeTickers]);

  useEffect(() => {
    setCountdown(30);
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
        <div>
          <h2 className="section-heading font-display text-2xl font-bold text-foreground tracking-wide">Mapa de Fluxo de Capital</h2>
          <p className="text-sm text-muted-foreground mt-1">Fluxo em tempo real entre BTC, ETH e Altcoins</p>
        </div>
        <div className="flex items-center gap-3">
          {isDemoMode && (
            <span className="px-2.5 py-1 bg-gold/15 border border-gold/30 text-gold text-xs font-semibold rounded-full">
              DEMO MODE
            </span>
          )}
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="font-mono">Atualiza em {countdown}s</span>
          </div>
          <div className="live-indicator text-xs text-success font-medium">AO VIVO</div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          name="Bitcoin"
          symbol="BTCUSDT"
          price={parseFloat(btc?.lastPrice || '0')}
          change={btcChange}
          volume={btcVol}
          dominance={dominance.btcDominance}
          flow={flowAnalysis.btcFlow}
          delay={50}
        />
        <MetricCard
          name="Ethereum"
          symbol="ETHUSDT"
          price={parseFloat(eth?.lastPrice || '0')}
          change={ethChange}
          volume={ethVol}
          dominance={dominance.ethDominance}
          flow={flowAnalysis.ethFlow}
          delay={100}
        />
        <MetricCard
          name="Altcoins"
          symbol="OTHERS"
          price={0}
          change={avgAltChange}
          volume={altsVolume}
          dominance={dominance.altsDominance}
          flow={flowAnalysis.altsFlow}
          delay={150}
        />
      </div>

      {/* Flow Diagram + Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flow Diagram */}
        <div
          className="card-glow rounded-xl p-5 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
        >
          <h3 className="font-display font-semibold text-foreground mb-4 tracking-wide">Diagrama de Fluxo</h3>
          <FlowDiagram
            btcFlow={flowAnalysis.btcFlow}
            ethFlow={flowAnalysis.ethFlow}
            altsFlow={flowAnalysis.altsFlow}
          />
          <div className="flex items-center justify-center gap-6 mt-2">
            {[
              { label: 'Entrada', color: 'bg-success' },
              { label: 'Saída', color: 'bg-danger' },
              { label: 'Neutro', color: 'bg-muted-foreground' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-0.5 ${item.color}`} style={{ borderTop: '1px dashed' }} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnosis */}
        <div
          className="card-glow rounded-xl p-5 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
        >
          <h3 className="font-display font-semibold text-foreground mb-4 tracking-wide">
            Diagnóstico Automático • 24h
          </h3>

          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-4 ${
            flowAnalysis.environment === 'risk-on'
              ? 'bg-success/15 text-success border border-success/30'
              : flowAnalysis.environment === 'risk-off'
              ? 'bg-danger/15 text-danger border border-danger/30'
              : 'bg-muted/50 text-muted-foreground border border-border'
          }`}>
            {flowAnalysis.environment === 'risk-on' ? (
              <><TrendingUp className="w-4 h-4" /> AMBIENTE RISK-ON</>
            ) : flowAnalysis.environment === 'risk-off' ? (
              <><TrendingDown className="w-4 h-4" /> AMBIENTE RISK-OFF</>
            ) : (
              <><Minus className="w-4 h-4" /> MERCADO NEUTRO</>
            )}
          </div>

          <div className="space-y-3">
            {flowAnalysis.diagnosis.map((line, i) => (
              <div
                key={`diagnosis-${i}-${line.slice(0, 10)}`}
                className="flex items-start gap-2.5 opacity-0 animate-fade-in"
                style={{ animationDelay: `${300 + i * 80}ms`, animationFillMode: 'forwards' }}
              >
                <AlertCircle className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                <span className="text-sm text-foreground leading-relaxed">{line}</span>
              </div>
            ))}
          </div>

          {/* Key Stats */}
          <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3">
            {[
              { label: 'BTC Change', value: btcChange, isPercent: true, symbol: 'BTCUSDT' },
              { label: 'ETH Change', value: ethChange, isPercent: true, symbol: 'ETHUSDT' },
              { label: 'Alts Médio', value: avgAltChange, isPercent: true, symbol: 'OTHERS' },
              { label: 'BTC Preço', value: parseFloat(btc?.lastPrice || '0'), isPercent: false, symbol: 'BTCUSDT' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                <div className={`font-mono font-bold text-sm ${
                  stat.isPercent
                    ? stat.value >= 0 ? 'text-success' : 'text-danger'
                    : 'text-gold'
                }`}>
                  {stat.isPercent
                    ? `${stat.value >= 0 ? '+' : ''}${stat.value.toFixed(2)}%`
                    : `$${formatPrice(stat.value)}`
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
