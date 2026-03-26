type Entry = {
  id: number
  learned: string
  challenges: string
  createdAt: string
}

import { formatKenyaDateTime } from "@/lib/date"

function difficultyFromText(text: string) {
  const len = text.trim().length
  if (len === 0) return { label: "Unknown", className: "bg-slate-100 text-slate-700 ring-slate-200" }
  if (len < 80) return { label: "Easy", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
  if (len < 160) return { label: "Medium", className: "bg-amber-50 text-amber-700 ring-amber-200" }
  return { label: "Hard", className: "bg-rose-50 text-rose-700 ring-rose-200" }
}

export function EntryCard({
  entry,
  tags,
  isEditing,
  editLearned,
  editChallenges,
  onEditLearnedChange,
  onEditChallengesChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: {
  entry: Entry
  tags?: string[]
  isEditing: boolean
  editLearned: string
  editChallenges: string
  onEditLearnedChange: (value: string) => void
  onEditChallengesChange: (value: string) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDelete: () => void
}) {
  const difficulty = difficultyFromText(entry.challenges)
  const safeTags = tags ?? []

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-slate-500">{formatKenyaDateTime(entry.createdAt)}</p>
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1",
              difficulty.className,
            ].join(" ")}
          >
            Difficulty: {difficulty.label}
          </span>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                onClick={onSaveEdit}
              >
                Save
              </button>
              <button
                type="button"
                className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                onClick={onCancelEdit}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                onClick={onStartEdit}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-xl bg-rose-600 px-3 py-1.5 text-sm font-medium text-white"
                onClick={onDelete}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {isEditing ? (
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Learned</label>
              <textarea
                value={editLearned}
                onChange={(event) => onEditLearnedChange(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Challenges</label>
              <textarea
                value={editChallenges}
                onChange={(event) => onEditChallengesChange(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium text-slate-500">Learned</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-900">{entry.learned}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Challenges</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-900">{entry.challenges}</p>
            </div>
          </>
        )}

        {safeTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {safeTags.map((tag) => (
              <span
                key={`${entry.id}-${tag}`}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

