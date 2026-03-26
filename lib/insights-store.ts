import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { InsightRecord, InsightsReport } from "@/lib/insights-types"

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string").slice(0, 10)
}

function normalizeScore(value: unknown, fallback: number) {
  const numberValue = typeof value === "number" ? value : fallback
  return Math.min(100, Math.max(0, Math.round(numberValue)))
}

function toReportFromLegacyText(text: string, createdAt: string): InsightsReport {
  return {
    generatedAt: createdAt,
    summary: text,
    patterns: [],
    risks: [],
    recommendations: [],
    aiSuggestion: "Use this legacy insight as reference and generate a fresh report for richer analysis.",
    metrics: {
      consistencyScore: 50,
      depthScore: 50,
      focusScore: 50,
    },
    confidence: "low",
  }
}

function normalizeInsightRecord(raw: unknown): InsightRecord | null {
  if (!isObject(raw)) return null

  const id = typeof raw.id === "number" ? raw.id : Date.now()
  const createdAt =
    typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString()
  const sourceValue = raw.source
  const source =
    sourceValue === "openai" || sourceValue === "fallback" ? sourceValue : undefined

  // Backward compatibility: old records looked like { id, text, createdAt }.
  if (typeof raw.text === "string") {
    return {
      id,
      createdAt,
      source: "fallback",
      report: toReportFromLegacyText(raw.text, createdAt),
    }
  }

  if (!isObject(raw.report)) return null
  const report = raw.report
  const metrics = isObject(report.metrics) ? report.metrics : {}
  const confidenceValue = report.confidence
  const confidence =
    confidenceValue === "low" || confidenceValue === "medium" || confidenceValue === "high"
      ? confidenceValue
      : "low"

  return {
    id,
    createdAt,
    source,
    report: {
      generatedAt:
        typeof report.generatedAt === "string" ? report.generatedAt : createdAt,
      summary: typeof report.summary === "string" ? report.summary : "No summary available.",
      patterns: asStringArray(report.patterns),
      risks: asStringArray(report.risks),
      recommendations: asStringArray(report.recommendations),
      aiSuggestion:
        typeof report.aiSuggestion === "string"
          ? report.aiSuggestion
          : "No suggestion available.",
      metrics: {
        consistencyScore: normalizeScore(metrics.consistencyScore, 50),
        depthScore: normalizeScore(metrics.depthScore, 50),
        focusScore: normalizeScore(metrics.focusScore, 50),
      },
      confidence,
    },
  }
}

const dataDir = path.join(process.cwd(), "data")
const dataFile = path.join(dataDir, "insights.json")

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true })

  try {
    await readFile(dataFile, "utf-8")
  } catch {
    await writeFile(dataFile, "[]", "utf-8")
  }
}

export async function getInsightsHistory(): Promise<InsightRecord[]> {
  await ensureDataFile()
  const fileContent = await readFile(dataFile, "utf-8")

  try {
    const parsed = JSON.parse(fileContent) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => normalizeInsightRecord(item))
      .filter((item): item is InsightRecord => item !== null)
  } catch {
    return []
  }
}

export async function saveInsightRecord(record: InsightRecord): Promise<void> {
  const history = await getInsightsHistory()
  history.unshift(record)
  await writeFile(dataFile, JSON.stringify(history, null, 2), "utf-8")
}
