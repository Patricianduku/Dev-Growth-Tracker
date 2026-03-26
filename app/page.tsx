 "use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/DashboardLayout"
import { EntryCard } from "@/components/EntryCard"
import { StatsCard } from "@/components/StatsCard"

type Entry = {
  id: number
  learned: string
  challenges: string
  createdAt: string
}

type SortOrder = "newest" | "oldest"
type DateRange = "all" | "7d" | "30d"

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M6 4.5h10.5A2.5 2.5 0 0 1 19 7v12.5H6A2.5 2.5 0 0 1 3.5 17V7A2.5 2.5 0 0 1 6 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M6 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M7 3.5v3M17 3.5v3M4.5 9h15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.5 6.5h11A3 3 0 0 1 20.5 9.5v9A3 3 0 0 1 17.5 21.5h-11A3 3 0 0 1 3.5 18.5v-9A3 3 0 0 1 6.5 6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function IconFlame() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M12 21.5c4.2 0 7.5-3.3 7.5-7.5 0-3.2-2.1-5.7-4.6-8.4-.3 1.8-1.2 3.3-2.7 4.6.2-2.5-.7-4.7-2.7-6.7C6 6 4.5 8.4 4.5 11.7c0 5.2 3.3 9.8 7.5 9.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [dateRange, setDateRange] = useState<DateRange>("all")
  const [isExporting, setIsExporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLearned, setEditLearned] = useState("")
  const [editChallenges, setEditChallenges] = useState("")

  function getStartOfDayUtc(date: Date) {
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  }

  function getStreakDays(entries: Entry[]) {
    const daysWithEntries = new Set<number>()

    for (const entry of entries) {
      const t = new Date(entry.createdAt)
      if (Number.isNaN(t.getTime())) continue
      daysWithEntries.add(getStartOfDayUtc(t))
    }

    let streak = 0
    const todayStart = getStartOfDayUtc(new Date())

    for (;;) {
      const day = todayStart - streak * 24 * 60 * 60 * 1000
      if (!daysWithEntries.has(day)) break
      streak += 1
    }

    return streak
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredEntries = entries
    .filter((entry) => {
      if (dateRange === "all") {
        return true
      }

      const now = Date.now()
      const entryTime = new Date(entry.createdAt).getTime()
      if (Number.isNaN(entryTime)) {
        return false
      }

      const days = dateRange === "7d" ? 7 : 30
      const cutoff = now - days * 24 * 60 * 60 * 1000
      return entryTime >= cutoff
    })
    .filter((entry) => {
      if (!normalizedSearch) {
        return true
      }

      return `${entry.learned} ${entry.challenges}`.toLowerCase().includes(normalizedSearch)
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      const safeA = Number.isNaN(timeA) ? 0 : timeA
      const safeB = Number.isNaN(timeB) ? 0 : timeB
      return sortOrder === "newest" ? safeB - safeA : safeA - safeB
    })

  async function fetchEntries() {
    const response = await fetch("/api/entries")
    const data = (await response.json()) as { entries: Entry[] }
    setEntries(data.entries)
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  async function handleDeleteEntry(id: number) {
    setErrorMessage("")

    try {
      const response = await fetch(`/api/entries?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error ?? "Failed to delete entry.")
      }

      await fetchEntries()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error."
      setErrorMessage(message)
    }
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id)
    setEditLearned(entry.learned)
    setEditChallenges(entry.challenges)
    setErrorMessage("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditLearned("")
    setEditChallenges("")
  }

  async function handleUpdateEntry() {
    if (editingId === null) {
      return
    }

    setErrorMessage("")

    try {
      const response = await fetch("/api/entries", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          learned: editLearned,
          challenges: editChallenges,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error ?? "Failed to update entry.")
      }

      cancelEdit()
      await fetchEntries()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error."
      setErrorMessage(message)
    }
  }

  async function handleExportData() {
    setErrorMessage("")
    setIsExporting(true)

    try {
      const response = await fetch("/api/export")
      if (!response.ok) {
        throw new Error("Failed to export data.")
      }

      const payload = (await response.json()) as unknown
      const json = JSON.stringify(payload, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `growth-tracker-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error."
      setErrorMessage(message)
    } finally {
      setIsExporting(false)
    }
  }

  const totalEntries = entries.length
  const entriesThisWeek = entries.filter((entry) => {
    const t = new Date(entry.createdAt)
    if (Number.isNaN(t.getTime())) return false
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    return t.getTime() >= cutoff
  }).length
  const streakDays = getStreakDays(entries)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">
                Welcome back. Here’s your learning momentum at a glance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/add-entry"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Add Entry
              </Link>
              <Link
                href="/ai-insights"
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
              >
                AI Insights
              </Link>
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Export Data"}
              </button>
            </div>
          </div>
          {errorMessage ? <p className="mt-3 text-sm text-rose-600">{errorMessage}</p> : null}
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <StatsCard label="Total entries" value={`${totalEntries}`} helper="All time" icon={<IconBook />} />
          <StatsCard
            label="Entries this week"
            value={`${entriesThisWeek}`}
            helper="Last 7 days"
            icon={<IconCalendar />}
          />
          <StatsCard
            label="Streak"
            value={`${streakDays} day(s)`}
            helper="Consecutive days logged"
            icon={<IconFlame />}
          />
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Entries</h2>
              <p className="text-sm text-slate-600">Search, filter, and manage your logs.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <label htmlFor="search" className="mb-1 block text-xs font-medium text-slate-500">
                Search
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search entries..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="sortOrder" className="mb-1 block text-xs font-medium text-slate-500">
                Sort
              </label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="dateRange" className="mb-1 block text-xs font-medium text-slate-500">
                Date range
              </label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value as DateRange)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400"
              >
                <option value="all">All time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6 space-y-3">
            {entries.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-900">No entries yet</p>
                <p className="mt-1 text-sm text-slate-600">
                  Create your first log entry to start tracking your growth.
                </p>
                <Link
                  href="/add-entry"
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Add your first entry
                </Link>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-900">No matches</p>
                <p className="mt-1 text-sm text-slate-600">
                  Try clearing search terms or widening the date range.
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  isEditing={editingId === entry.id}
                  editLearned={editLearned}
                  editChallenges={editChallenges}
                  onEditLearnedChange={setEditLearned}
                  onEditChallengesChange={setEditChallenges}
                  onStartEdit={() => startEdit(entry)}
                  onCancelEdit={cancelEdit}
                  onSaveEdit={handleUpdateEntry}
                  onDelete={() => handleDeleteEntry(entry.id)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}