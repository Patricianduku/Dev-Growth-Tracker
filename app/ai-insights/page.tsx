"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { InsightCard } from "@/components/InsightCard"

type Entry = {
  id: number
  learned: string
  challenges: string
  createdAt: string
}

type InsightRecord = {
  id: number
  text: string
  createdAt: string
}

export default function AIInsightsPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentInsights, setCurrentInsights] = useState("")
  const [insightHistory, setInsightHistory] = useState<InsightRecord[]>([])

  async function fetchEntries() {
    const response = await fetch("/api/entries")
    const data = (await response.json()) as { entries: Entry[] }
    setEntries(data.entries)
  }

  async function fetchInsightsHistory() {
    const response = await fetch("/api/insights")
    const data = (await response.json()) as { history: InsightRecord[] }
    setInsightHistory(data.history)
  }

  useEffect(() => {
    fetchEntries()
    fetchInsightsHistory()
  }, [])

  async function handleGenerateInsights() {
    setErrorMessage("")
    setIsGeneratingInsights(true)

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entries }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate insights.")
      }

      const data = (await response.json()) as { insights: string; record: InsightRecord }
      setCurrentInsights(data.insights)
      setInsightHistory((previous) => [data.record, ...previous])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error."
      setErrorMessage(message)
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">AI Insights</h1>
          <p className="mt-1 text-sm text-slate-600">
            Generate mentor-style feedback from your saved entries.
          </p>
        </header>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights}
            >
              {isGeneratingInsights ? "Generating..." : "Generate Insights"}
            </button>
            <p className="text-xs text-slate-500">
              Uses OpenAI if configured; otherwise uses local fallback.
            </p>
          </div>

          {errorMessage ? <p className="mt-3 text-sm text-rose-600">{errorMessage}</p> : null}

          {currentInsights ? (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-slate-900">
              <p className="whitespace-pre-line text-sm">{currentInsights}</p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-600">No insights generated yet.</p>
          )}
        </div>

        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Insight history</h2>
            <p className="text-xs text-slate-500">{insightHistory.length} total</p>
          </div>

          {insightHistory.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-600">No insight history yet.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {insightHistory.map((record) => (
                <InsightCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

