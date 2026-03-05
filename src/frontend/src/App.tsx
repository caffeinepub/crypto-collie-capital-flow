import { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  CandlestickChart,
  LineChart,
  BookOpen,
  Globe,
  Settings,
  Menu,
  Heart,
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import CapitalFlowMap from './components/CapitalFlowMap';
import Recommendations from './components/Recommendations';
import PriceAction from './components/PriceAction';
import Dominance from './components/Dominance';
import KnowledgeBase from './components/KnowledgeBase';
import RadarGlobal from './components/RadarGlobal';
import SettingsModal from './components/SettingsModal';

type TabId = 'capital-flow' | 'recommendations' | 'price-action' | 'dominance' | 'knowledge' | 'radar';

interface NavItem {
  id: TabId;
  label: string;
  labelShort: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'capital-flow',
    label: 'Mapa de Fluxo',
    labelShort: 'Fluxo',
    icon: <BarChart2 className="w-4.5 h-4.5" />,
  },
  {
    id: 'recommendations',
    label: 'Recomendações',
    labelShort: 'Sinais',
    icon: <TrendingUp className="w-4.5 h-4.5" />,
  },
  {
    id: 'price-action',
    label: 'Price Action',
    labelShort: 'PA',
    icon: <CandlestickChart className="w-4.5 h-4.5" />,
  },
  {
    id: 'dominance',
    label: 'Dominância',
    labelShort: 'Dom.',
    icon: <LineChart className="w-4.5 h-4.5" />,
  },
  {
    id: 'knowledge',
    label: 'Base de Conhecimento',
    labelShort: 'SMC',
    icon: <BookOpen className="w-4.5 h-4.5" />,
  },
  {
    id: 'radar',
    label: 'Radar Global',
    labelShort: 'Radar',
    icon: <Globe className="w-4.5 h-4.5" />,
  },
];

const TAB_COMPONENTS: Record<TabId, React.ReactNode> = {
  'capital-flow': <CapitalFlowMap />,
  'recommendations': <Recommendations />,
  'price-action': <PriceAction />,
  'dominance': <Dominance />,
  'knowledge': <KnowledgeBase />,
  'radar': <RadarGlobal />,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('capital-flow');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeNavItem = NAV_ITEMS.find(n => n.id === activeTab)!;

  return (
    <div className="flex h-screen bg-background overflow-hidden bg-noise">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: '220px',
          background: 'oklch(0.10 0.018 255)',
          borderRight: '1px solid oklch(0.18 0.025 255)',
        }}
      >
        {/* Logo + App Name */}
        <div
          className="flex items-center gap-3 px-5 py-5 border-b relative overflow-hidden"
          style={{ borderColor: 'oklch(0.18 0.025 255)' }}
        >
          {/* Subtle radial glow behind logo */}
          <div
            className="absolute -top-4 -left-4 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, oklch(0.78 0.17 72 / 0.08) 0%, transparent 70%)' }}
          />
          <img
            src="/assets/generated/crypto-collie-logo-transparent.dim_120x120.png"
            alt="Crypto Collie logo"
            className="w-9 h-9 shrink-0 relative z-10"
            style={{ filter: 'drop-shadow(0 0 6px oklch(0.78 0.17 72 / 0.4))' }}
          />
          <div className="min-w-0 relative z-10">
            <div className="font-display font-bold text-sm tracking-wide text-gold leading-tight">
              Crypto Collie
            </div>
            <div className="font-display text-[10px] font-semibold tracking-[0.2em] text-muted-foreground leading-tight uppercase">
              Capital Flow
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group overflow-hidden ${
                activeTab === item.id
                  ? 'text-gold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
              }`}
              style={activeTab === item.id ? {
                background: 'oklch(0.78 0.17 72 / 0.10)',
              } : {}}
            >
              {/* Active left-rail indicator */}
              {activeTab === item.id && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gold"
                  style={{ boxShadow: '0 0 8px oklch(0.78 0.17 72 / 0.8)' }}
                />
              )}
              <span className={`shrink-0 transition-colors duration-200 ${
                activeTab === item.id ? 'text-gold' : 'text-muted-foreground group-hover:text-foreground'
              }`}>
                {item.icon}
              </span>
              <span className={`text-sm truncate transition-colors duration-200 ${
                activeTab === item.id ? 'font-semibold' : 'font-medium'
              }`}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t" style={{ borderColor: 'oklch(0.18 0.025 255)' }}>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
            <span>© 2026. Built with</span>
            <Heart className="w-3 h-3 text-gold fill-current" />
            <span>using</span>
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="shrink-0 flex items-center justify-between px-5 py-3.5 z-10"
          style={{
            background: 'oklch(0.10 0.018 255 / 0.95)',
            borderBottom: '1px solid oklch(0.18 0.025 255)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="font-display font-bold text-base text-foreground tracking-wide">
                {activeNavItem.label}
              </h1>
              <div className="text-xs text-muted-foreground hidden sm:block">
                Crypto Collie Capital Flow
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'oklch(0.68 0.2 148 / 0.1)',
                border: '1px solid oklch(0.68 0.2 148 / 0.3)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-success">Binance Futures</span>
            </div>

            {/* Settings button */}
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all"
              style={{
                background: 'oklch(0.16 0.02 255)',
                border: '1px solid oklch(0.22 0.03 255)',
              }}
              aria-label="Configurações API"
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:block">API Keys</span>
            </button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
            {TAB_COMPONENTS[activeTab]}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Toaster */}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'oklch(0.13 0.02 255)',
            border: '1px solid oklch(0.22 0.03 255)',
            color: 'oklch(0.92 0.01 255)',
          },
        }}
      />
    </div>
  );
}
