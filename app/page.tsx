 "use client"

import { useEffect, useState } from "react"
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

  function extractTags(entry: Entry): string[] {
    const stopWords = new Set([
      "the",
      "and",
      "for",
      "with",
      "that",
      "this",
      "from",
      "have",
      "were",
      "what",
      "when",
      "your",
      "into",
      "about",
      "learned",
      "challenges",
      "faced",
    ])

    const words = `${entry.learned} ${entry.challenges}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !stopWords.has(word))

    const uniqueWords = Array.from(new Set(words))
    return uniqueWords.slice(0, 4)
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
            <button
              type="button"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Export Data"}
            </button>
          </div>
          {errorMessage ? <p className="mt-3 text-sm text-rose-600">{errorMessage}</p> : null}
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <StatsCard label="Total entries" value={`${totalEntries}`} helper="All time" />
          <StatsCard label="Entries this week" value={`${entriesThisWeek}`} helper="Last 7 days" />
          <StatsCard label="Streak" value={`${streakDays} day(s)`} helper="Consecutive days logged" />
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

          <div className="mt-6 space-y-3">
            {entries.length === 0 ? (
              <p className="text-sm text-slate-600">No entries yet. Go to “Add Entry” to create one.</p>
            ) : filteredEntries.length === 0 ? (
              <p className="text-sm text-slate-600">No entries match your current filters.</p>
            ) : (
              filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  tags={extractTags(entry)}
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