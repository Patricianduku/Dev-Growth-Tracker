import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

export type InsightRecord = {
  id: number
  text: string
  createdAt: string
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
    const parsed = JSON.parse(fileContent) as InsightRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function saveInsightRecord(record: InsightRecord): Promise<void> {
  const history = await getInsightsHistory()
  history.unshift(record)
  await writeFile(dataFile, JSON.stringify(history, null, 2), "utf-8")
}
