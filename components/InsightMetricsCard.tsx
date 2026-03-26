import { InsightsReport } from "@/lib/insights-types"

function meterColor(score: number) {
  if (score >= 75) return "bg-emerald-500"
  if (score >= 50) return "bg-amber-500"
  return "bg-rose-500"
}

function MetricRow({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${meterColor(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export function InsightMetricsCard({ report }: { report: InsightsReport }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Learning Signals</p>
      <div className="mt-3 space-y-3">
        <MetricRow label="Consistency" score={report.metrics.consistencyScore} />
        <MetricRow label="Depth" score={report.metrics.depthScore} />
        <MetricRow label="Focus" score={report.metrics.focusScore} />
      </div>
      <div className="mt-4 text-xs text-slate-500">
        Confidence: <span className="font-medium text-slate-700">{report.confidence}</span>
      </div>
    </div>
  )
}

