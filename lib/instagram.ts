import { getServiceClient } from './supabase';

const GRAPH_BASE = 'https://graph.facebook.com/v25.0';

type InstagramToken = {
  access_token: string;
  expires_at: string;
};

async function loadToken(): Promise<InstagramToken> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('instagram_token')
    .select('access_token, expires_at')
    .eq('id', 1)
    .single();
  if (error || !data) throw new Error(`Instagram token not found in DB: ${error?.message}`);
  return data as InstagramToken;
}

async function saveToken(token: InstagramToken): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('instagram_token')
    .upsert({ id: 1, ...token, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Failed to save Instagram token: ${error.message}`);
}

async function refreshLongLivedToken(currentToken: string): Promise<InstagramToken> {
  const appId = process.env.INSTAGRAM_APP_ID!;
  const appSecret = process.env.INSTAGRAM_APP_SECRET!;

  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('client_secret', appSecret);
  url.searchParams.set('fb_exchange_token', currentToken);

  const resp = await fetch(url.toString());
  const json = await resp.json();
  if (!json.access_token) {
    throw new Error(`Instagram token refresh failed: ${JSON.stringify(json)}`);
  }
  const expiresAt = new Date(Date.now() + json.expires_in * 1000).toISOString();
  return { access_token: json.access_token, expires_at: expiresAt };
}

async function ensureValidToken(): Promise<string> {
  const token = await loadToken();
  const expiresAt = new Date(token.expires_at).getTime();
  // 残り7日切ったらリフレッシュ
  if (expiresAt - Date.now() < 7 * 24 * 60 * 60 * 1000) {
    const refreshed = await refreshLongLivedToken(token.access_token);
    await saveToken(refreshed);
    return refreshed.access_token;
  }
  return token.access_token;
}

export async function getInstagramFollowers(): Promise<number> {
  const igBusinessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!;
  const accessToken = await ensureValidToken();

  const url = new URL(`${GRAPH_BASE}/${igBusinessId}`);
  url.searchParams.set('fields', 'followers_count');
  url.searchParams.set('access_token', accessToken);

  const resp = await fetch(url.toString());
  const json = await resp.json();
  const count = json?.followers_count;
  if (typeof count !== 'number') {
    throw new Error(`Instagram followers fetch failed: ${JSON.stringify(json)}`);
  }
  return count;
}
