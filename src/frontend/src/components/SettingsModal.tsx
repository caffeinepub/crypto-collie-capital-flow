import { useState, useEffect } from 'react';
import { Settings, Key, Shield, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSaveApiKeyConfig, useRetrieveApiKeyConfig } from '../hooks/useQueries';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const { data: existingConfig } = useRetrieveApiKeyConfig();
  const { mutate: saveConfig, isPending } = useSaveApiKeyConfig();

  useEffect(() => {
    if (existingConfig) {
      setApiKey(existingConfig.binanceApiKey || '');
      setApiSecret(existingConfig.binanceApiSecret || '');
    }
  }, [existingConfig]);

  const handleSave = () => {
    saveConfig(
      { binanceApiKey: apiKey, binanceApiSecret: apiSecret },
      {
        onSuccess: () => {
          toast.success('Chaves API salvas com sucesso!');
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Erro ao salvar chaves. Tente novamente.');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md border-border"
        style={{ background: 'oklch(0.12 0.018 255)', border: '1px solid oklch(0.22 0.03 255)' }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-gold" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-foreground tracking-wide">
                Configurações
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Binance API Keys</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-electric-blue/10 border border-electric-blue/25">
            <Shield className="w-4 h-4 text-electric-blue shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Suas chaves são armazenadas localmente no canister e usadas apenas para leitura de suas posições abertas na Binance.
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
              <Key className="w-3.5 h-3.5" />
              Binance API Key
            </Label>
            <Input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Insira sua API Key da Binance"
              className="font-mono text-sm bg-surface-3 border-border focus:border-gold/50 focus:ring-gold/30 text-foreground"
            />
          </div>

          {/* API Secret */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
              <Key className="w-3.5 h-3.5" />
              Binance API Secret
            </Label>
            <div className="relative">
              <Input
                type={showSecret ? 'text' : 'password'}
                value={apiSecret}
                onChange={e => setApiSecret(e.target.value)}
                placeholder="Insira sua API Secret"
                className="font-mono text-sm pr-10 bg-surface-3 border-border focus:border-gold/50 focus:ring-gold/30 text-foreground"
              />
              <button
                type="button"
                onClick={() => setShowSecret(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showSecret ? 'Ocultar secret' : 'Mostrar secret'}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-danger/10 border border-danger/25">
            <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <p className="text-xs text-danger leading-relaxed font-medium">
              ⚠️ Nunca compartilhe sua Secret Key com ninguém. Configure permissões apenas de leitura na Binance.
            </p>
          </div>

          {/* Permissions checklist */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Permissões recomendadas na Binance:</p>
            {[
              'Enable Reading (leitura de conta)',
              'Futures Trading — apenas leitura',
              'Desabilitar Withdrawals (saques)',
            ].map((perm) => (
              <div key={perm} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-success/20 border border-success/40 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                </div>
                <span className="text-xs text-muted-foreground">{perm}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-border text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 font-semibold"
              style={{ background: 'oklch(0.78 0.17 72)', color: 'oklch(0.09 0.015 255)' }}
              onClick={handleSave}
              disabled={isPending || (!apiKey && !apiSecret)}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : 'Salvar Chaves'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
