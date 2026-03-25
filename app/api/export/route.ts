import { getEntries } from "@/lib/entries-store"
import { getInsightsHistory } from "@/lib/insights-store"

export const runtime = "nodejs"

export async function GET() {
  const entries = await getEntries()
  const insightsHistory = await getInsightsHistory()

  const payload = {
    exportedAt: new Date().toISOString(),
    entries,
    insightsHistory,
  }

  return Response.json(payload)
}
