export function InsightListCard({
  title,
  items,
  tone = "default",
  emptyText,
}: {
  title: string
  items: string[]
  tone?: "default" | "risk" | "action"
  emptyText: string
}) {
  const itemRing =
    tone === "risk"
      ? "ring-rose-200"
      : tone === "action"
        ? "ring-emerald-200"
        : "ring-slate-200"

  const toneClasses =
    tone === "risk"
      ? "border-rose-200 bg-rose-50"
      : tone === "action"
        ? "border-emerald-200 bg-emerald-50"
        : "border-slate-200 bg-white"

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClasses}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-slate-800">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className={`rounded-lg bg-white/70 px-3 py-2 ring-1 ${itemRing}`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

