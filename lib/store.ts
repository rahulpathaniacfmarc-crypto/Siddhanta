import { Redis } from "@upstash/redis";

// Keys used in Redis storage
const SUGGESTIONS_KEY = "siddhanta:suggestions";
const CONFIG_KEY = "siddhanta:config";

export interface SiddhanthaConfig {
  geminiApiKey?: string;
  sheetWebhookUrl?: string;
}

export function kvIsConfigured(): boolean {
  // Redis.fromEnv() looks for either of these pairs. The Vercel Marketplace
  // Upstash Redis integration sets KV_REST_API_URL / KV_REST_API_TOKEN.
  return Boolean(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
      (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}

function getClient(): Redis {
  return Redis.fromEnv();
}

export async function getSuggestions(): Promise<any[]> {
  const redis = getClient();
  const list = await redis.get<any[]>(SUGGESTIONS_KEY);
  return list || [];
}

export async function addSuggestion(entry: any): Promise<any[]> {
  const redis = getClient();
  const list = await getSuggestions();
  list.unshift(entry);
  await redis.set(SUGGESTIONS_KEY, list);
  return list;
}

export async function getConfig(): Promise<SiddhanthaConfig> {
  const redis = getClient();
  const config = await redis.get<SiddhanthaConfig>(CONFIG_KEY);
  return config || {};
}

export async function updateConfig(partial: SiddhanthaConfig): Promise<SiddhanthaConfig> {
  const redis = getClient();
  const current = await getConfig();
  const merged = { ...current, ...partial };
  await redis.set(CONFIG_KEY, merged);
  return merged;
}
