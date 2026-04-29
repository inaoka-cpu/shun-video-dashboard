import { google } from 'googleapis';

const CHANNEL_ID = 'UCAlUrXrLbBvPexwWz-e81PA';

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN!;

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

export async function getYouTubeSubscribers(): Promise<number> {
  const auth = getOAuthClient();
  const youtube = google.youtube({ version: 'v3', auth });
  const resp = await youtube.channels.list({
    part: ['statistics'],
    id: [CHANNEL_ID],
  });
  const count = resp.data.items?.[0]?.statistics?.subscriberCount;
  if (!count) throw new Error('Failed to fetch subscriber count');
  return parseInt(count, 10);
}
