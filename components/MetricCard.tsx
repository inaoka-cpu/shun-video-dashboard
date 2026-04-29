type Props = {
  platform: string;
  label: string;
  value: number | null;
  accent: string;
  updatedAt?: string;
};

export function MetricCard({ platform, label, value, accent, updatedAt }: Props) {
  const display = value !== null ? value.toLocaleString() : 'N/A';
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${accent}`} aria-hidden />
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{platform}</h3>
      </div>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {display}
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      {updatedAt && (
        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
          更新: {updatedAt}
        </p>
      )}
    </div>
  );
}
