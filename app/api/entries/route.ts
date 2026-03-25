import { Entry, deleteEntryById, getEntries, saveEntry, updateEntryById } from "@/lib/entries-store"

export const runtime = "nodejs"

export async function GET() {
  const entries = await getEntries()
  return Response.json({ entries })
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    learned?: string
    challenges?: string
  }

  const learned = body.learned?.trim() ?? ""
  const challenges = body.challenges?.trim() ?? ""

  if (!learned || !challenges) {
    return Response.json(
      { error: "Both 'learned' and 'challenges' are required." },
      { status: 400 }
    )
  }

  const newEntry: Entry = {
    id: Date.now(),
    learned,
    challenges,
    createdAt: new Date().toISOString(),
  }

  await saveEntry(newEntry)

  return Response.json({ message: "Entry saved.", entry: newEntry }, { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const idParam = searchParams.get("id")
  const id = Number(idParam)

  if (!idParam || Number.isNaN(id)) {
    return Response.json({ error: "A valid numeric id is required." }, { status: 400 })
  }

  const deleted = await deleteEntryById(id)
  if (!deleted) {
    return Response.json({ error: "Entry not found." }, { status: 404 })
  }

  return Response.json({ message: "Entry deleted." })
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    id?: number
    learned?: string
    challenges?: string
  }

  const id = Number(body.id)
  const learned = body.learned?.trim() ?? ""
  const challenges = body.challenges?.trim() ?? ""

  if (Number.isNaN(id)) {
    return Response.json({ error: "A valid numeric id is required." }, { status: 400 })
  }

  if (!learned || !challenges) {
    return Response.json(
      { error: "Both 'learned' and 'challenges' are required." },
      { status: 400 }
    )
  }

  const updated = await updateEntryById(id, { learned, challenges })
  if (!updated) {
    return Response.json({ error: "Entry not found." }, { status: 404 })
  }

  return Response.json({ message: "Entry updated.", entry: updated })
}
