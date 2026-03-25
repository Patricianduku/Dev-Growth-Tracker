type InsightRecord = {
  id: number
  text: string
  createdAt: string
}

function formatUtc(createdAt: string) {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return createdAt
  return `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`
}

export function InsightCard({ record }: { record: InsightRecord }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="whitespace-pre-line text-sm text-slate-900">{record.text}</p>
      <p className="mt-3 text-xs text-slate-500">Generated: {formatUtc(record.createdAt)}</p>
    </div>
  )
}

