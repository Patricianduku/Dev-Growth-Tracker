"use client"

import { FormEvent, useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"

export default function AddEntryPage() {
  const [learned, setLearned] = useState("")
  const [challenges, setChallenges] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const isSubmitDisabled = isLoading || learned.trim().length === 0 || challenges.trim().length === 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ learned, challenges }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error ?? "Failed to save entry.")
      }

      setLearned("")
      setChallenges("")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error."
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">Add Entry</h1>
              <p className="mt-1 text-sm text-slate-600">
                Log what you learned today and the challenges you faced.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tip</p>
              <p className="mt-1 text-sm text-slate-700">
                Write in a way your &quot;future self&quot; can repeat tomorrow.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <div className="flex items-end justify-between gap-3">
                  <label htmlFor="learned" className="block text-sm font-medium text-slate-800">
                    What did you learn?
                  </label>
                  <p className="text-xs text-slate-500">{learned.trim().length} chars</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Be specific: what you built, what you understood, and what changed in your mental model.
                </p>
                <textarea
                  id="learned"
                  name="learned"
                  value={learned}
                  onChange={(event) => setLearned(event.target.value)}
                  rows={6}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  placeholder='Example: I learned the difference between Server Components and Client Components in Next.js App Router, and why client state needs "use client".'
                />
              </div>

              <div>
                <div className="flex items-end justify-between gap-3">
                  <label htmlFor="challenges" className="block text-sm font-medium text-slate-800">
                    Challenges faced
                  </label>
                  <p className="text-xs text-slate-500">{challenges.trim().length} chars</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Capture the blocker and what you tried. This is what powers better insights later.
                </p>
                <textarea
                  id="challenges"
                  name="challenges"
                  value={challenges}
                  onChange={(event) => setChallenges(event.target.value)}
                  rows={6}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  placeholder="Example: I hit a hydration mismatch when rendering dates; I fixed it by formatting dates consistently and avoiding locale-dependent rendering."
                />
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-medium text-rose-800">Could not save entry</p>
                  <p className="mt-1 text-sm text-rose-700">{errorMessage}</p>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                <p className="text-xs text-slate-500">
                  Required: both fields must be filled in.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  disabled={isSubmitDisabled}
                >
                  {isLoading ? "Saving..." : "Submit Entry"}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Quick template</p>
              <div className="mt-3 space-y-3 text-sm text-slate-800">
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <p className="text-xs font-medium text-slate-600">Learned</p>
                  <p className="mt-1 text-sm text-slate-800">
                    &quot;Today I built/understood ___, and I can now ___.&quot;
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <p className="text-xs font-medium text-slate-600">Challenges</p>
                  <p className="mt-1 text-sm text-slate-800">
                    &quot;I got blocked by ___, I tried ___, and the next experiment is ___.&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">What makes a great entry</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
                <li>One concrete outcome (feature, bugfix, endpoint, UI change)</li>
                <li>A named blocker (state, routing, types, hydration, API errors)</li>
                <li>A next action you can do in under 60 minutes</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}

