import { InsightRecord } from "@/lib/insights-types"
import { formatKenyaDateTime } from "@/lib/date"

function confidenceTone(confidence: InsightRecord["report"]["confidence"]) {
  if (confidence === "high") return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  if (confidence === "medium") return "bg-amber-50 text-amber-700 ring-amber-200"
  return "bg-slate-100 text-slate-700 ring-slate-200"
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">None yet.</p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800">
          {items.map((item, idx) => (
            <li key={`${title}-${idx}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function InsightCard({ record }: { record: InsightRecord }) {
  return (
    <details className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">{record.report.summary}</p>
            <p className="mt-1 text-xs text-slate-500">
              Generated: {formatKenyaDateTime(record.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
              {record.source === "openai" ? "OpenAI" : "Fallback"}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${confidenceTone(
                record.report.confidence
              )}`}
            >
              {record.report.confidence}
            </span>
            <span className="text-xs text-slate-500 group-open:hidden">Expand</span>
            <span className="text-xs text-slate-500 hidden group-open:inline">Collapse</span>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-700">
          Next step: <span className="text-slate-900">{record.report.aiSuggestion}</span>
        </p>
      </summary>

      <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Signals</p>
            <p className="mt-2 text-sm text-slate-800">
              Consistency: <span className="font-medium">{record.report.metrics.consistencyScore}/100</span>
            </p>
            <p className="mt-1 text-sm text-slate-800">
              Depth: <span className="font-medium">{record.report.metrics.depthScore}/100</span>
            </p>
            <p className="mt-1 text-sm text-slate-800">
              Focus: <span className="font-medium">{record.report.metrics.focusScore}/100</span>
            </p>
          </div>

          <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
              <List title="Patterns" items={record.report.patterns} />
            </div>
            <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
              <List title="Risks" items={record.report.risks} />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <List title="Recommendations" items={record.report.recommendations} />
        </div>
      </div>
    </details>
  )
}

