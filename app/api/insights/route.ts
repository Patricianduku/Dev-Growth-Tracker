import { getInsightsHistory, saveInsightRecord } from "@/lib/insights-store"
import { InsightRecord, InsightsReport } from "@/lib/insights-types"

type Entry = {
  id: number
  learned: string
  challenges: string
  createdAt: string
}

export const runtime = "nodejs"

function safeSnippet(text: string, max = 160) {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (!cleaned) return ""
  return cleaned.length <= max ? cleaned : `${cleaned.slice(0, max).trim()}...`
}

function getDayKeyUtc(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10)
  return date.toISOString().slice(0, 10)
}

function buildEntryDigest(entries: Entry[]) {
  const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const latest = sorted.slice(0, 5)

  const byDay = new Map<string, number>()
  for (const entry of sorted) {
    const day = getDayKeyUtc(entry.createdAt)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }

  return {
    totalEntries: entries.length,
    activeDays: byDay.size,
    latestEntries: latest.map((e) => ({
      createdAt: e.createdAt,
      learnedSnippet: safeSnippet(e.learned),
      challengesSnippet: safeSnippet(e.challenges),
    })),
  }
}

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "i",
  "im",
  "i'm",
  "my",
  "we",
  "our",
  "you",
  "your",
  "it",
  "this",
  "that",
  "these",
  "those",
  "as",
  "at",
  "by",
  "from",
  "but",
  "so",
  "if",
  "then",
  "than",
  "too",
  "very",
  "just",
  "about",
  "into",
  "over",
  "under",
  "up",
  "down",
  "out",
  "again",
  "today",
  "yesterday",
  "tomorrow",
  "learned",
  "learning",
  "challenge",
  "challenges",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "done",
  "can",
  "cant",
  "can't",
  "could",
  "should",
  "would",
  "will",
  "wont",
  "won't",
  "may",
  "might",
  "must",
  "because",
  "since",
  "while",
  "when",
  "where",
  "what",
  "why",
  "how",
  "also",
  "still",
  "yet",
  "maybe",
  "really",
  "more",
  "most",
  "less",
  "some",
  "many",
  "much",
  "few",
  "first",
  "second",
  "third",
  "next",
  "new",
  "old",
  "bit",
  "kind",
  "sort",
  "thing",
  "things",
  "stuff",
  "concept",
  "concepts",
  "topic",
  "topics",
  "challenging",
  "hard",
  "easy",
  "problem",
  "problems",
  "issue",
  "issues",
  "error",
  "errors",
  "fix",
  "fixed",
  "debug",
  "debugging",
  "understand",
  "understanding",
  "confusing",
  "confused",
  "trying",
  "tried",
  "try",
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && t.length <= 24 && !STOPWORDS.has(t))
}

function topTerms(texts: string[], limit = 6): string[] {
  const counts = new Map<string, number>()
  for (const t of texts) {
    for (const token of tokenize(t)) {
      counts.set(token, (counts.get(token) ?? 0) + 1)
    }
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])

  const atLeastTwice = ranked.filter(([, count]) => count >= 2)
  const picked = (atLeastTwice.length >= 3 ? atLeastTwice : ranked).slice(0, limit)

  return picked.map(([term]) => term)
}

async function generateInsightsWithOpenAI(entries: Entry[], apiKey: string): Promise<string> {
  const digest = buildEntryDigest(entries)
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            [
              "You are a supportive senior engineering mentor.",
              "You must be specific, not generic.",
              "Return ONLY valid JSON for an InsightsReport object (no markdown, no prose).",
            ].join(" "),
        },
        {
          role: "user",
          content: [
            "Analyze this developer journal data and return strict JSON with this exact shape:",
            "{ generatedAt, summary, patterns, risks, recommendations, aiSuggestion, metrics: { consistencyScore, depthScore, focusScore }, confidence }.",
            "Rules:",
            "- summary: 1-2 sentences.",
            "- patterns: 2-4 short strings. Each must reference a concrete theme present in the data.",
            "- risks: 2-4 short strings. Each must be plausible based on the challenges data.",
            "- recommendations: 3-4 short strings. Each must be concrete, testable in 1-3 sessions, and include a small deliverable.",
            "- aiSuggestion: exactly one practical next action for the next session (single sentence).",
            "- metrics scores: integers 0-100.",
            '- confidence: one of "low", "medium", "high".',
            "- Do NOT say generic advice like 'practice more' without a deliverable.",
            "- Use the provided snippets to ground your recommendations.",
            "",
            "DIGEST:",
            JSON.stringify(digest, null, 2),
            "",
            "FULL_ENTRIES:",
            JSON.stringify(entries, null, 2),
          ].join("\n"),
        },
      ],
      response_format: { type: "json_object" },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error: ${errorText}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error("OpenAI response did not include insight payload.")
  return text
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function normalizeReport(raw: Partial<InsightsReport>, fallbackTime: string): InsightsReport {
  const metrics = raw.metrics ?? { consistencyScore: 50, depthScore: 50, focusScore: 50 }
  const confidence = raw.confidence
  return {
    generatedAt: raw.generatedAt || fallbackTime,
    summary: raw.summary || "No summary available.",
    patterns: Array.isArray(raw.patterns) ? raw.patterns.slice(0, 4) : [],
    risks: Array.isArray(raw.risks) ? raw.risks.slice(0, 4) : [],
    recommendations: Array.isArray(raw.recommendations) ? raw.recommendations.slice(0, 4) : [],
    aiSuggestion: raw.aiSuggestion || "No suggestion available.",
    metrics: {
      consistencyScore: clampScore(metrics.consistencyScore ?? 50),
      depthScore: clampScore(metrics.depthScore ?? 50),
      focusScore: clampScore(metrics.focusScore ?? 50),
    },
    confidence:
      confidence === "low" || confidence === "medium" || confidence === "high"
        ? confidence
        : "low",
  }
}

function buildFallbackReport(entries: Entry[]): InsightsReport {
  const generatedAt = new Date().toISOString()
  if (entries.length === 0) {
    return {
      generatedAt,
      summary: "No entries yet. Add at least one entry to generate insights.",
      patterns: [],
      risks: ["No journal data captured yet."],
      recommendations: [
        "Write one learning entry today with specific outcomes and blockers.",
      ],
      aiSuggestion: "Add your first entry, then generate insights again.",
      metrics: { consistencyScore: 0, depthScore: 0, focusScore: 0 },
      confidence: "low",
    }
  }

  const totalEntries = entries.length
  const learnedTexts = entries.map((entry) => entry.learned)
  const challengeTexts = entries.map((entry) => entry.challenges)

  const learnedTop = topTerms(learnedTexts, 6)
  const challengeTop = topTerms(challengeTexts, 6)

  const digest = buildEntryDigest(entries)

  const topicsLine =
    learnedTop.length > 0
      ? `Top learning themes: ${learnedTop.join(", ")}.`
      : "Top learning themes: not enough signal yet."

  const challengeLine =
    challengeTop.length > 0
      ? `Top blockers: ${challengeTop.join(", ")}.`
      : "Top blockers: not enough signal yet."

  return {
    generatedAt,
    summary: `You logged ${totalEntries} entries across ${digest.activeDays} active days. ${topicsLine}`,
    patterns: [
      topicsLine,
      challengeLine,
      "Your notes include both what you learned and what slowed you down (good signal for iteration).",
    ],
    risks: [
      challengeTop.length > 0
        ? `Repeated blockers may be slowing momentum (e.g. ${challengeTop.slice(0, 2).join(", ")}).`
        : "Blockers are unclear, which makes it harder to pick a focused next step.",
      "If sessions lack a small deliverable, the journal can feel repetitive.",
    ],
    recommendations: [
      `Pick one blocker (${challengeTop[0] ?? "your most painful blocker"}) and build a tiny reproduction in this project (one page + one API call).`,
      `Turn one learning theme (${learnedTop[0] ?? "your top theme"}) into a checklist and complete 1 item end-to-end (build, run, verify).`,
      "For the next entry, include: goal, what you tried, what failed, and the next experiment you will run.",
    ],
    aiSuggestion:
      `In your next session, build one tiny deliverable that targets "${challengeTop[0] ?? "your top blocker"}" and write down the exact steps that fixed it.`,
    metrics: {
      consistencyScore: clampScore(Math.min(100, totalEntries * 15)),
      depthScore: clampScore(Math.min(100, 40 + Math.min(30, challengeTop.length * 8))),
      focusScore: clampScore(Math.min(100, 35 + Math.min(40, learnedTop.length * 7))),
    },
    confidence: totalEntries >= 5 ? "high" : totalEntries >= 2 ? "medium" : "low",
  }
}

function parseOpenAIReport(content: string): InsightsReport {
  const now = new Date().toISOString()
  const parsed = JSON.parse(content) as Partial<InsightsReport>
  return normalizeReport(parsed, now)
}

export async function POST(request: Request) {
  const body = (await request.json()) as { entries?: Entry[] }
  const entries = body.entries ?? []
  const apiKey = process.env.OPENAI_API_KEY

  let report: InsightsReport
  let source: "openai" | "fallback" = "fallback"
  let openAiError: string | null = null

  if (apiKey) {
    try {
      const raw = await generateInsightsWithOpenAI(entries, apiKey)
      report = parseOpenAIReport(raw)
      source = "openai"
    } catch (error) {
      // Keep local fallback so learning flow still works even if external API fails.
      const message = error instanceof Error ? error.message : "Unknown OpenAI error."
      openAiError = message
      console.error("[/api/insights] OpenAI call failed, using fallback:", message)
      report = buildFallbackReport(entries)
    }
  } else {
    report = buildFallbackReport(entries)
  }

  const record: InsightRecord = {
    id: Date.now(),
    report,
    createdAt: new Date().toISOString(),
    source,
  }

  await saveInsightRecord(record)

  const isDev = process.env.NODE_ENV !== "production"
  return Response.json({
    report,
    record,
    debug: isDev
      ? {
          source,
          openAiError,
          hasApiKey: Boolean(apiKey),
        }
      : undefined,
  })
}

export async function GET() {
  const history = await getInsightsHistory()
  return Response.json({ history })
}
