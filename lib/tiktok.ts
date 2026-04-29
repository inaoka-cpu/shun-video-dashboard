import { getServiceClient } from './supabase';

const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/';

type TikTokToken = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  refresh_expires_at: string;
};

async function loadToken(): Promise<TikTokToken> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('tiktok_token')
    .select('*')
    .eq('id', 1)
    .single();
  if (error || !data) throw new Error(`TikTok token not found in DB: ${error?.message}`);
  return data as TikTokToken;
}

async function saveToken(token: TikTokToken): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('tiktok_token')
    .upsert({ id: 1, ...token });
  if (error) throw new Error(`Failed to save TikTok token: ${error.message}`);
}

async function refreshAccessToken(refreshToken: string): Promise<TikTokToken> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body,
  });

  const json = await resp.json();
  if (!json.access_token) {
    throw new Error(`TikTok refresh failed: ${JSON.stringify(json)}`);
  }

  const now = Date.now();
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: new Date(now + json.expires_in * 1000).toISOString(),
    refresh_expires_at: new Date(now + json.refresh_expires_in * 1000).toISOString(),
  };
}

async function ensureValidToken(): Promise<string> {
  const token = await loadToken();
  const expiresAt = new Date(token.expires_at).getTime();
  // 5分のマージンで早めに refresh
  if (expiresAt - Date.now() < 5 * 60 * 1000) {
    const newToken = await refreshAccessToken(token.refresh_token);
    await saveToken(newToken);
    return newToken.access_token;
  }
  return token.access_token;
}

export async function getTikTokFollowers(): Promise<number> {
  const accessToken = await ensureValidToken();
  const url = new URL(USER_INFO_URL);
  url.searchParams.set('fields', 'follower_count');

  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await resp.json();
  const count = json?.data?.user?.follower_count;
  if (typeof count !== 'number') {
    throw new Error(`TikTok user info fetch failed: ${JSON.stringify(json)}`);
  }
  return count;
}
