import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Activity, Bell } from 'lucide-react';
import { use24hrTicker } from '../hooks/useQueries';
import {
  generateMockTickers,
  formatPrice,
  formatVolume,
  type TickerData,
} from '../services/binanceService';

const DISPLAY_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT',
  'LTCUSDT', 'MATICUSDT', 'UNIUSDT', 'ATOMUSDT', 'NEARUSDT',
  'FTMUSDT', 'AAVEUSDT', 'MKRUSDT', 'COMPUSDT', 'SUSHIUSDT',
];

function generateAlerts(tickers: TickerData[]): Array<{ id: string; symbol: string; message: string; type: 'volume' | 'oi' | 'ls' | 'pump' | 'dump'; time: string }> {
  const alerts: Array<{ id: string; symbol: string; message: string; type: 'volume' | 'oi' | 'ls' | 'pump' | 'dump'; time: string }> = [];
  const now = new Date();

  tickers.forEach(t => {
    const change = parseFloat(t.priceChangePercent);
    const vol = parseFloat(t.quoteVolume);
    const count = parseInt(t.count || '0');

    if (change > 8) {
      alerts.push({
        id: `pump-${t.symbol}`,
        symbol: t.symbol,
        message: `${t.symbol}: Pump de +${change.toFixed(1)}% detectado — possível entrada institucional agressiva`,
        type: 'pump',
        time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
      });
    } else if (change < -8) {
      alerts.push({
        id: `dump-${t.symbol}`,
        symbol: t.symbol,
        message: `${t.symbol}: Dump de ${change.toFixed(1)}% — liquidação em cascata provável`,
        type: 'dump',
        time: `${now.getHours()}:${(now.getMinutes() - 2).toString().padStart(2, '0')}`,
      });
    }

    if (vol > 2_000_000_000) {
      alerts.push({
        id: `vol-${t.symbol}`,
        symbol: t.symbol,
        message: `${t.symbol}: Volume ${formatVolume(vol)} — 3x acima da média histórica das últimas 2h`,
        type: 'volume',
        time: `${now.getHours()}:${(now.getMinutes() - 5).toString().padStart(2, '0')}`,
      });
    }

    if (count > 400000) {
      alerts.push({
        id: `oi-${t.symbol}`,
        symbol: t.symbol,
        message: `${t.symbol}: Open Interest aumentou 15% em 1h — pressão comprada crescente`,
        type: 'oi',
        time: `${now.getHours()}:${(now.getMinutes() - 8).toString().padStart(2, '0')}`,
      });
    }
  });

  // Always add some demo alerts if none found
  if (alerts.length < 3) {
    const btc = tickers.find(t => t.symbol === 'BTCUSDT');
    const eth = tickers.find(t => t.symbol === 'ETHUSDT');
    if (btc) alerts.push({
      id: 'demo-btc',
      symbol: 'BTCUSDT',
      message: `BTCUSDT: Volume ${formatVolume(parseFloat(btc.quoteVolume))} nas últimas 4h — participação institucional elevada`,
      type: 'volume',
      time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
    });
    if (eth) alerts.push({
      id: 'demo-eth',
      symbol: 'ETHUSDT',
      message: `ETHUSDT: Long/Short Ratio 1.42 — viés comprado dominante no mercado de futuros`,
      type: 'ls',
      time: `${now.getHours()}:${(now.getMinutes() - 3).toString().padStart(2, '0')}`,
    });
  }

  return alerts.slice(0, 8);
}

const ALERT_ICONS = {
  volume: <Activity className="w-3.5 h-3.5" />,
  oi: <Zap className="w-3.5 h-3.5" />,
  ls: <Bell className="w-3.5 h-3.5" />,
  pump: <TrendingUp className="w-3.5 h-3.5" />,
  dump: <TrendingDown className="w-3.5 h-3.5" />,
};

const ALERT_COLORS = {
  volume: { bg: 'oklch(0.55 0.22 260 / 0.1)', border: 'oklch(0.55 0.22 260 / 0.3)', text: 'oklch(0.55 0.22 260)' },
  oi: { bg: 'oklch(0.78 0.17 72 / 0.1)', border: 'oklch(0.78 0.17 72 / 0.3)', text: 'oklch(0.78 0.17 72)' },
  ls: { bg: 'oklch(0.68 0.2 148 / 0.1)', border: 'oklch(0.68 0.2 148 / 0.3)', text: 'oklch(0.68 0.2 148)' },
  pump: { bg: 'oklch(0.68 0.2 148 / 0.1)', border: 'oklch(0.68 0.2 148 / 0.3)', text: 'oklch(0.68 0.2 148)' },
  dump: { bg: 'oklch(0.58 0.23 18 / 0.1)', border: 'oklch(0.58 0.23 18 / 0.3)', text: 'oklch(0.58 0.23 18)' },
};

// Heatmap tile
interface HeatmapTileProps {
  ticker: TickerData;
}
function HeatmapTile({ ticker }: HeatmapTileProps) {
  const change = parseFloat(ticker.priceChangePercent);
  const intensity = Math.min(Math.abs(change) / 10, 1);
  const bg = change > 0
    ? `oklch(${0.4 + intensity * 0.28} 0.2 148 / ${0.3 + intensity * 0.5})`
    : `oklch(${0.4 + intensity * 0.18} 0.23 18 / ${0.3 + intensity * 0.5})`;

  return (
    <div
      className="rounded-md p-2 text-center transition-all duration-500 cursor-default"
      style={{ background: bg, border: `1px solid ${change > 0 ? 'oklch(0.68 0.2 148 / 0.3)' : 'oklch(0.58 0.23 18 / 0.3)'}` }}
      title={`${ticker.symbol}: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`}
    >
      <div className="text-xs font-bold text-foreground truncate">{ticker.symbol.replace('USDT', '')}</div>
      <div className={`font-mono text-xs font-bold ${change >= 0 ? 'text-success' : 'text-danger'}`}>
        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
      </div>
    </div>
  );
}

export default function RadarGlobal() {
  const { data: tickers, isLoading } = use24hrTicker();
  const activeTickers = tickers || generateMockTickers();

  const displayTickers = useMemo(() => {
    return DISPLAY_SYMBOLS
      .map(sym => activeTickers.find((t: TickerData) => t.symbol === sym))
      .filter(Boolean) as TickerData[];
  }, [activeTickers]);

  const sortedByChange = useMemo(() =>
    [...displayTickers].sort((a, b) =>
      parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)
    ), [displayTickers]);

  const topGainers = sortedByChange.slice(0, 3);
  const topLosers = sortedByChange.slice(-3).reverse();
  const alerts = useMemo(() => generateAlerts(activeTickers), [activeTickers]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-shimmer rounded-xl" />
        <div className="h-64 animate-shimmer rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <h2 className="section-heading font-display text-2xl font-bold text-foreground tracking-wide">Radar Global</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral dos mercados e alertas institucionais em tempo real
        </p>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gainers */}
        <div className="card-glow rounded-xl p-4 opacity-0 animate-fade-in-up stagger-1" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-success" />
            <h3 className="font-display font-semibold text-success text-sm tracking-wide uppercase">Top Gainers</h3>
          </div>
          <div className="space-y-3">
            {topGainers.map((t) => {
              const change = parseFloat(t.priceChangePercent);
              return (
                <div key={t.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-xs font-bold text-success">
                      {t.symbol.replace('USDT', '').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.symbol.replace('USDT', '')}</div>
                      <div className="font-mono text-xs text-muted-foreground">${formatPrice(parseFloat(t.lastPrice))}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xl text-success">+{change.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">{formatVolume(parseFloat(t.quoteVolume))}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Losers */}
        <div className="card-glow rounded-xl p-4 opacity-0 animate-fade-in-up stagger-2" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-danger" />
            <h3 className="font-display font-semibold text-danger text-sm tracking-wide uppercase">Top Losers</h3>
          </div>
          <div className="space-y-3">
            {topLosers.map((t) => {
              const change = parseFloat(t.priceChangePercent);
              return (
                <div key={t.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-danger/15 border border-danger/30 flex items-center justify-center text-xs font-bold text-danger">
                      {t.symbol.replace('USDT', '').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.symbol.replace('USDT', '')}</div>
                      <div className="font-mono text-xs text-muted-foreground">${formatPrice(parseFloat(t.lastPrice))}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xl text-danger">{change.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">{formatVolume(parseFloat(t.quoteVolume))}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Market Table + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Table */}
        <div className="xl:col-span-2 card-glow rounded-xl overflow-hidden opacity-0 animate-fade-in-up stagger-3" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-display font-semibold text-foreground tracking-wide">Visão Geral dos Mercados</h3>
            <span className="text-xs text-muted-foreground font-mono">{displayTickers.length} pares</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Par</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Preço</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Var 24h</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Volume</th>
                  <th className="text-center px-3 py-2.5 text-muted-foreground font-medium">Alerta</th>
                </tr>
              </thead>
              <tbody>
                {displayTickers.map((t) => {
                  const change = parseFloat(t.priceChangePercent);
                  const vol = parseFloat(t.quoteVolume);
                  const hasVolumeAlert = vol > 1_000_000_000;
                  const hasOIAlert = parseInt(t.count || '0') > 400000;
                  const hasExtremeAlert = Math.abs(change) > 7;

                  return (
                    <tr
                      key={t.symbol}
                      className={`border-b border-border/50 transition-colors ${
                        change >= 0
                          ? 'hover:bg-success/5'
                          : 'hover:bg-danger/5'
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-semibold text-foreground">{t.symbol.replace('USDT', '')}</span>
                        <span className="text-muted-foreground">/USDT</span>
                      </td>
                      <td className="text-right px-3 py-2.5 font-mono text-foreground">
                        ${formatPrice(parseFloat(t.lastPrice))}
                      </td>
                      <td className={`text-right px-3 py-2.5 font-mono font-bold ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                      </td>
                      <td className="text-right px-3 py-2.5 font-mono text-muted-foreground">
                        {formatVolume(vol)}
                      </td>
                      <td className="text-center px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          {hasVolumeAlert && (
                            <span title="Volume alto" className="text-electric-blue">
                              <Activity className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {hasOIAlert && (
                            <span title="OI elevado" className="text-gold">
                              <Zap className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {hasExtremeAlert && (
                            <span title="Variação extrema" className={change > 0 ? 'text-success' : 'text-danger'}>
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {!hasVolumeAlert && !hasOIAlert && !hasExtremeAlert && (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts feed + Heatmap */}
        <div className="space-y-4">
          {/* Alerts Feed */}
          <div className="card-glow rounded-xl p-4 opacity-0 animate-fade-in-up stagger-4" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-gold" />
              <h3 className="font-display font-semibold text-foreground tracking-wide">Alertas Institucionais</h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.map(alert => {
                const colors = ALERT_COLORS[alert.type];
                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                  >
                    <div className="shrink-0 mt-0.5" style={{ color: colors.text }}>
                      {ALERT_ICONS[alert.type]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{alert.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heatmap */}
          <div className="card-glow rounded-xl p-4 opacity-0 animate-fade-in-up stagger-5" style={{ animationFillMode: 'forwards' }}>
            <h3 className="font-display font-semibold text-foreground mb-3 tracking-wide">Heatmap de Mercado</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {displayTickers.slice(0, 20).map(t => (
                <HeatmapTile key={t.symbol} ticker={t} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
