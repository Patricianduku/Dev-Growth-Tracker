"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/add-entry", label: "Add Entry" },
  { href: "/ai-insights", label: "AI Insights" },
]

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-full flex-col gap-6 p-4">
      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-900">Dev Growth Tracker</p>
        <p className="text-xs text-slate-500">AI-assisted learning journal</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block rounded-xl px-3 py-2 text-sm font-medium transition",
                active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200/60",
              ].join(" ")}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-white p-4 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200">
        Tip: Log small wins daily. Consistency beats intensity.
      </div>
    </aside>
  )
}
