import { InsightsReport } from "@/lib/insights-types"
import { formatKenyaDateTime } from "@/lib/date"

function confidenceTone(confidence: InsightsReport["confidence"]) {
  if (confidence === "high") return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  if (confidence === "medium") return "bg-amber-50 text-amber-700 ring-amber-200"
  return "bg-slate-100 text-slate-700 ring-slate-200"
}

export function InsightsSummaryCard({ report }: { report: InsightsReport }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Latest report</p>
          <p className="mt-1 text-xs text-slate-500">
            Generated: {formatKenyaDateTime(report.generatedAt)}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${confidenceTone(
            report.confidence
          )}`}
        >
          Confidence: {report.confidence}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-800">{report.summary}</p>
      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-700">AI Suggestion</p>
        <p className="mt-1 text-sm text-blue-900">{report.aiSuggestion}</p>
      </div>
    </div>
  )
}

