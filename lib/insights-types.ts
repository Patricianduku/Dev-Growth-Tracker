export type ConfidenceLevel = "low" | "medium" | "high"

export type InsightsReport = {
  generatedAt: string
  summary: string
  patterns: string[]
  risks: string[]
  recommendations: string[]
  aiSuggestion: string
  metrics: {
    consistencyScore: number
    depthScore: number
    focusScore: number
  }
  confidence: ConfidenceLevel
}

export type InsightRecord = {
  id: number
  createdAt: string
  report: InsightsReport
  source?: "openai" | "fallback"
}

