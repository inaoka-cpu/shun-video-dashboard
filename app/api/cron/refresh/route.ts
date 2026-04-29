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

  // JST 基準で日付を決定。
  // 0:00 JST 実行は「前日の24:00 値」として前日の行に保存（その日付を確定させる）。
  // 1:00 〜 23:00 JST 実行は「当日のリアルタイム値」として当日行に upsert。
  const nowUtc = new Date();
  const jst = new Date(nowUtc.getTime() + 9 * 60 * 60 * 1000);
  const jstHour = jst.getUTCHours();
  const target = new Date(jst);
  if (jstHour === 0) {
    target.setUTCDate(target.getUTCDate() - 1);
  }
  const today = target.toISOString().slice(0, 10);
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
