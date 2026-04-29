import { getYouTubeSubscribers } from '@/lib/youtube';
import { getTikTokFollowers } from '@/lib/tiktok';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  // Vercel Cron からの呼び出しを認証
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const errors: Record<string, string> = {};

  let yt: number | null = null;
  try {
    yt = await getYouTubeSubscribers();
  } catch (e) {
    errors.youtube = e instanceof Error ? e.message : String(e);
  }

  let tt: number | null = null;
  try {
    tt = await getTikTokFollowers();
  } catch (e) {
    errors.tiktok = e instanceof Error ? e.message : String(e);
  }

  const supabase = getServiceClient();
  const { error: upsertError } = await supabase
    .from('metrics_daily')
    .upsert({
      date: today,
      yt_subscribers: yt,
      tt_followers: tt,
    });

  if (upsertError) {
    return Response.json(
      { ok: false, errors, upsertError: upsertError.message },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    date: today,
    yt_subscribers: yt,
    tt_followers: tt,
    errors: Object.keys(errors).length ? errors : undefined,
  });
}
