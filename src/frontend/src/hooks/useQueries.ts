import { useQuery, useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  parseTickers,
  parseKlines,
  parseOpenInterest,
  parseLongShortRatio,
  generateMockTickers,
  generateMockKlines,
  type TickerData,
  type KlineData,
  type OpenInterestData,
  type LongShortRatioData,
} from '../services/binanceService';
import type { BinanceFuturesApiKeyConfig } from '../backend.d';

// ============================================================
// 24h Ticker
// ============================================================

export function use24hrTicker(enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<TickerData[]>({
    queryKey: ['24hrTicker'],
    queryFn: async () => {
      if (!actor) return generateMockTickers();
      try {
        const json = await actor.get24hrTicker();
        const data = parseTickers(json);
        if (!data || data.length === 0) return generateMockTickers();
        return data;
      } catch {
        return generateMockTickers();
      }
    },
    enabled: enabled && !isFetching,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// ============================================================
// Klines
// ============================================================

export function useKlines(symbol: string, interval: string, enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<KlineData[]>({
    queryKey: ['klines', symbol, interval],
    queryFn: async () => {
      if (!actor) return generateMockKlines(symbol, interval, 100);
      try {
        const json = await actor.getKlines(symbol, interval, BigInt(100));
        const data = parseKlines(json);
        if (!data || data.length === 0) return generateMockKlines(symbol, interval, 100);
        return data;
      } catch {
        return generateMockKlines(symbol, interval, 100);
      }
    },
    enabled: enabled && !isFetching,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

// ============================================================
// Open Interest
// ============================================================

export function useOpenInterest(symbol: string, enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<OpenInterestData | null>({
    queryKey: ['openInterest', symbol],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const json = await actor.getOpenInterest(symbol);
        return parseOpenInterest(json);
      } catch {
        return null;
      }
    },
    enabled: enabled && !isFetching,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// ============================================================
// Long/Short Ratio
// ============================================================

export function useLongShortRatio(symbol: string, period = '1h', enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<LongShortRatioData[]>({
    queryKey: ['longShortRatio', symbol, period],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const json = await actor.getLongShortAccountRatio(symbol, period, BigInt(10));
        return parseLongShortRatio(json);
      } catch {
        return [];
      }
    },
    enabled: enabled && !isFetching,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// ============================================================
// API Key Config
// ============================================================

export function useSaveApiKeyConfig() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (config: BinanceFuturesApiKeyConfig) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.saveApiKeyConfig(config);
    },
  });
}

export function useRetrieveApiKeyConfig() {
  const { actor, isFetching } = useActor();
  return useQuery<BinanceFuturesApiKeyConfig | null>({
    queryKey: ['apiKeyConfig'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const config = await actor.retrieveApiKeyConfig();
        return config;
      } catch {
        return null;
      }
    },
    enabled: !isFetching,
    staleTime: Infinity,
  });
}
