'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MetricRow } from '@/lib/supabase';

type Props = {
  rows: MetricRow[];
};

const SERIES = [
  { key: 'yt_subscribers', label: 'YouTube', color: '#ef4444' },
  { key: 'tt_followers', label: 'TikTok', color: '#18181b' },
  { key: 'ig_followers', label: 'Instagram', color: '#ec4899' },
  { key: 'fb_followers', label: 'Facebook', color: '#2563eb' },
] as const;

export function TrendChart({ rows }: Props) {
  const data = rows.map((r) => ({
    date: r.date.slice(5), // MM-DD
    yt_subscribers: r.yt_subscribers,
    tt_followers: r.tt_followers,
    ig_followers: r.ig_followers,
    fb_followers: r.fb_followers,
  }));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        過去30日間のフォロワー推移
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#71717a' }} />
            <YAxis tick={{ fontSize: 12, fill: '#71717a' }} />
            <Tooltip
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
