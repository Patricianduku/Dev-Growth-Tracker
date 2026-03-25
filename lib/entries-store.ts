import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

export type Entry = {
  id: number
  learned: string
  challenges: string
  createdAt: string
}

const dataDir = path.join(process.cwd(), "data")
const dataFile = path.join(dataDir, "entries.json")

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true })

  try {
    await readFile(dataFile, "utf-8")
  } catch {
    await writeFile(dataFile, "[]", "utf-8")
  }
}

export async function getEntries(): Promise<Entry[]> {
  await ensureDataFile()
  const fileContent = await readFile(dataFile, "utf-8")

  try {
    const parsed = JSON.parse(fileContent) as Entry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function saveEntry(entry: Entry): Promise<void> {
  const entries = await getEntries()
  entries.unshift(entry)
  await writeFile(dataFile, JSON.stringify(entries, null, 2), "utf-8")
}

export async function deleteEntryById(id: number): Promise<boolean> {
  const entries = await getEntries()
  const nextEntries = entries.filter((entry) => entry.id !== id)

  if (nextEntries.length === entries.length) {
    return false
  }

  await writeFile(dataFile, JSON.stringify(nextEntries, null, 2), "utf-8")
  return true
}

export async function updateEntryById(
  id: number,
  updates: { learned: string; challenges: string }
): Promise<Entry | null> {
  const entries = await getEntries()
  const entryIndex = entries.findIndex((entry) => entry.id === id)

  if (entryIndex === -1) {
    return null
  }

  const updatedEntry: Entry = {
    ...entries[entryIndex],
    learned: updates.learned,
    challenges: updates.challenges,
  }

  entries[entryIndex] = updatedEntry
  await writeFile(dataFile, JSON.stringify(entries, null, 2), "utf-8")
  return updatedEntry
}
