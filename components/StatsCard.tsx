import { ReactNode } from "react"

export function StatsCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: string
  helper?: string
  icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
        </div>
        {icon ? <div className="text-slate-400">{icon}</div> : null}
      </div>
    </div>
  )
}
