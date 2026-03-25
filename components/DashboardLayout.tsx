import { ReactNode } from "react"
import { Sidebar } from "@/components/Sidebar"

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-[260px_1fr] md:p-6">
        <div className="h-fit rounded-2xl bg-slate-100/60 ring-1 ring-slate-200 md:sticky md:top-6">
          <Sidebar />
        </div>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
