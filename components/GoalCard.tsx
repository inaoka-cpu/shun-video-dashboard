type Props = {
  current: number | null;
  target: number;
  targetDate: string; // YYYY-MM-DD
};

export function GoalCard({ current, target, targetDate }: Props) {
  const progress = current !== null ? Math.min((current / target) * 100, 100) : 0;
  const remaining = current !== null ? Math.max(target - current, 0) : null;

  const today = new Date();
  const goal = new Date(targetDate);
  const daysLeft = Math.max(
    Math.ceil((goal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    0,
  );

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm dark:border-emerald-900 dark:from-emerald-950 dark:to-zinc-900">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          🎯 5/31 目標 {target.toLocaleString()} フォロワー
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          残り {daysLeft} 日
        </p>
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {current !== null ? current.toLocaleString() : 'N/A'}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          / {target.toLocaleString()}
        </p>
      </div>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <span>{progress.toFixed(1)}% 達成</span>
        {remaining !== null && (
          <span>あと {remaining.toLocaleString()} 人</span>
        )}
      </div>
    </div>
  );
}
