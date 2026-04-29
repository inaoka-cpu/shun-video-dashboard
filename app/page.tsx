import { GoalCard } from '@/components/GoalCard';
import { MetricCard } from '@/components/MetricCard';
import { TrendChart } from '@/components/TrendChart';
import { supabase, MetricRow } from '@/lib/supabase';

const GOAL_TARGET = 10000;
const GOAL_DATE = '2026-05-31';

export const revalidate = 300;

async function getMetrics(): Promise<MetricRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  const sinceStr = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('metrics_daily')
    .select('*')
    .gte('date', sinceStr)
    .order('date', { ascending: true });
  if (error) {
    console.error('Failed to fetch metrics:', error);
    return [];
  }
  return (data ?? []) as MetricRow[];
}

function sumOrNull(...values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => typeof v === 'number');
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0);
}

export default async function Home() {
  const rows = await getMetrics();
  const latest = rows[rows.length - 1];
  const updatedAt = latest?.date ?? '—';

  const total = latest
    ? sumOrNull(
        latest.yt_subscribers,
        latest.tt_followers,
        latest.ig_followers,
        latest.fb_followers,
      )
    : null;

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Shun Global Coaching
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            動画運用メトリクス・ダッシュボード
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-zinc-900 bg-zinc-900 p-6 text-white shadow-sm dark:border-zinc-700">
            <p className="text-sm font-medium text-zinc-300">合計フォロワー</p>
            <p className="mt-2 text-5xl font-bold tracking-tight">
              {total !== null ? total.toLocaleString() : 'N/A'}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              全プラットフォームの取得済み合計（更新: {updatedAt}）
            </p>
          </section>

          <GoalCard current={total} target={GOAL_TARGET} targetDate={GOAL_DATE} />
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            platform="YouTube"
            label="チャンネル登録者"
            value={latest?.yt_subscribers ?? null}
            accent="bg-red-500"
            updatedAt={updatedAt}
          />
          <MetricCard
            platform="TikTok"
            label="フォロワー"
            value={latest?.tt_followers ?? null}
            accent="bg-zinc-900 dark:bg-white"
            updatedAt={updatedAt}
          />
          <MetricCard
            platform="Instagram"
            label="フォロワー"
            value={latest?.ig_followers ?? null}
            accent="bg-pink-500"
            updatedAt={updatedAt}
          />
          <MetricCard
            platform="Facebook"
            label="フォロワー"
            value={latest?.fb_followers ?? null}
            accent="bg-blue-600"
            updatedAt={updatedAt}
          />
        </section>

        <TrendChart rows={rows} />
      </div>
    </main>
  );
}
