"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { InsightCard } from "@/components/InsightCard"
import { InsightsSummaryCard } from "@/components/InsightsSummaryCard"
import { InsightListCard } from "@/components/InsightListCard"
import { InsightMetricsCard } from "@/components/InsightMetricsCard"
import { InsightRecord, InsightsReport } from "@/lib/insights-types"

type Entry = {
  id: number
  learned: string
  challenges: string
  createdAt: string
}

export default function AIInsightsPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [debugMessage, setDebugMessage] = useState("")
  const [openAiQuotaMessage, setOpenAiQuotaMessage] = useState("")
  const [currentReport, setCurrentReport] = useState<InsightsReport | null>(null)
  const [insightHistory, setInsightHistory] = useState<InsightRecord[]>([])

  const totalEntries = entries.length

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
    setDebugMessage("")
    setOpenAiQuotaMessage("")
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

      const data = (await response.json()) as {
        report: InsightsReport
        record: InsightRecord
        debug?: { source: "openai" | "fallback"; openAiError: string | null; hasApiKey: boolean }
      }
      setCurrentReport(data.report)
      setInsightHistory((previous) => [data.record, ...previous])
      if (data.debug?.source === "fallback") {
        const reason = data.debug.openAiError ? `Reason: ${data.debug.openAiError}` : "Reason: unknown."
        setDebugMessage(`Using fallback. ${reason}`)

        if (data.debug.openAiError?.includes("insufficient_quota")) {
          setOpenAiQuotaMessage(
            "OpenAI is currently unavailable (insufficient quota / billing). The app will use local fallback insights until quota is available."
          )
        }
      }
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
              disabled={isGeneratingInsights || totalEntries === 0}
            >
              {isGeneratingInsights ? "Generating..." : "Generate Insights"}
            </button>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-slate-200">
                {totalEntries} entries
              </span>
              <span>Uses OpenAI if configured; otherwise uses local fallback.</span>
              {totalEntries === 0 ? (
                <span className="text-rose-600">Add an entry first.</span>
              ) : null}
            </div>
          </div>

          {errorMessage ? <p className="mt-3 text-sm text-rose-600">{errorMessage}</p> : null}
          {openAiQuotaMessage ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <p className="text-sm font-medium">OpenAI not available</p>
              <p className="mt-1 text-sm text-amber-800">{openAiQuotaMessage}</p>
              <p className="mt-2 text-xs text-amber-700">
                Fix: enable billing/credits for your OpenAI project, then regenerate insights.
              </p>
            </div>
          ) : null}
          {debugMessage ? (
            <p className="mt-3 text-sm text-amber-700">
              {debugMessage}
            </p>
          ) : null}

          {currentReport ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Latest report source
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                    {insightHistory[0]?.source === "openai" ? "OpenAI" : "Fallback"}
                  </span>
                </div>
                <InsightsSummaryCard report={currentReport} />
              </div>
              <InsightMetricsCard report={currentReport} />
              <InsightListCard
                title="Patterns"
                items={currentReport.patterns}
                emptyText="No clear repeated patterns yet."
              />
              <InsightListCard
                title="Risks"
                items={currentReport.risks}
                tone="risk"
                emptyText="No major risks detected."
              />
              <div className="lg:col-span-2">
                <InsightListCard
                  title="Recommendations"
                  items={currentReport.recommendations}
                  tone="action"
                  emptyText="No recommendations yet."
                />
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-600">
              No insights generated yet. Click &quot;Generate Insights&quot; to create your first report.
            </p>
          )}
        </div>

        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Insight history</h2>
              <p className="mt-1 text-xs text-slate-500">
                Past reports saved each time you click Generate Insights.
              </p>
            </div>
            <p className="text-xs text-slate-500">{insightHistory.length} total</p>
          </div>

          {insightHistory.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-600">No insight history yet.</p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
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

