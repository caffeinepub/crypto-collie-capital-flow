import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserPreferences {
    selectedTab: Tab;
    favoritePairs: Array<string>;
    alertThresholds: Array<[string, number]>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface BinanceFuturesApiKeyConfig {
    binanceApiSecret: string;
    binanceApiKey: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum Tab {
    alerts = "alerts",
    openInterest = "openInterest",
    pairs = "pairs",
    statistics = "statistics"
}
export interface backendInterface {
    addFavoritePair(pair: string): Promise<void>;
    get24hrTicker(): Promise<string>;
    getAllApiKeyConfigs(): Promise<Array<[Principal, BinanceFuturesApiKeyConfig]>>;
    getAllUserPreferences(): Promise<Array<[Principal, UserPreferences]>>;
    getKlines(symbol: string, interval: string, limit: bigint): Promise<string>;
    getLongShortAccountRatio(symbol: string, period: string, limit: bigint): Promise<string>;
    getOpenInterest(symbol: string): Promise<string>;
    getUserFavoritePairs(): Promise<Array<string>>;
    getUserPreferences(): Promise<UserPreferences | null>;
    retrieveApiKeyConfig(): Promise<BinanceFuturesApiKeyConfig>;
    saveApiKeyConfig(config: BinanceFuturesApiKeyConfig): Promise<void>;
    saveUserPreferences(preferences: UserPreferences): Promise<void>;
    setSelectedTab(tab: Tab): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAlertThreshold(symbol: string, threshold: number): Promise<void>;
}
