import { getInsightsHistory, InsightRecord, saveInsightRecord } from "@/lib/insights-store"

type Entry = {
  id: number
  learned: string
  challenges: string
  createdAt: string
}

export const runtime = "nodejs"

async function generateInsightsWithOpenAI(entries: Entry[], apiKey: string): Promise<string> {
  const prompt = [
    "You are a supportive senior engineering mentor.",
    "Analyze the following developer growth journal entries.",
    "Return a concise response with:",
    "1) Patterns in what was learned",
    "2) Recurring challenges",
    "3) 3 practical next actions",
    "",
    JSON.stringify(entries, null, 2),
  ].join("\n")

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: "You provide clear, practical developer growth feedback.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
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
  if (!text) {
    throw new Error("OpenAI response did not include insight text.")
  }

  return text
}

function buildInsights(entries: Entry[]): string {
  if (entries.length === 0) {
    return "No entries yet. Add at least one entry to generate insights."
  }

  const totalEntries = entries.length
  const learnedTexts = entries.map((entry) => entry.learned)
  const challengeTexts = entries.map((entry) => entry.challenges)

  const commonKeywords = ["react", "next.js", "typescript", "api", "state", "routing"]

  const repeatedTopics = commonKeywords.filter((keyword) =>
    learnedTexts.some((text) => text.toLowerCase().includes(keyword))
  )

  const repeatedChallenges = commonKeywords.filter((keyword) =>
    challengeTexts.some((text) => text.toLowerCase().includes(keyword))
  )

  const topicsLine =
    repeatedTopics.length > 0
      ? `Top learning topics: ${repeatedTopics.join(", ")}.`
      : "Top learning topics: mixed topics (no repeated keyword detected)."

  const challengeLine =
    repeatedChallenges.length > 0
      ? `Frequent challenge themes: ${repeatedChallenges.join(", ")}.`
      : "Frequent challenge themes: mixed challenges (no repeated keyword detected)."

  return [
    `You logged ${totalEntries} entries.`,
    topicsLine,
    challengeLine,
    "Suggestion: focus your next 2 sessions on one repeated challenge and build one tiny practice feature.",
  ].join(" ")
}

export async function POST(request: Request) {
  const body = (await request.json()) as { entries?: Entry[] }
  const entries = body.entries ?? []
  const apiKey = process.env.OPENAI_API_KEY

  let insights = ""

  if (apiKey) {
    try {
      insights = await generateInsightsWithOpenAI(entries, apiKey)
    } catch {
      // Keep local fallback so learning flow still works even if external API fails.
      insights = buildInsights(entries)
    }
  } else {
    insights = buildInsights(entries)
  }

  const record: InsightRecord = {
    id: Date.now(),
    text: insights,
    createdAt: new Date().toISOString(),
  }

  await saveInsightRecord(record)

  return Response.json({ insights, record })
}

export async function GET() {
  const history = await getInsightsHistory()
  return Response.json({ history })
}
