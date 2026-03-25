"use client"

import { FormEvent, useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"

export default function AddEntryPage() {
  const [learned, setLearned] = useState("")
  const [challenges, setChallenges] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

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
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Add Entry</h1>
          <p className="mt-1 text-sm text-slate-600">
            Log what you learned today and the challenges you faced.
          </p>
        </header>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="learned" className="mb-2 block text-sm font-medium text-slate-700">
                What did you learn?
              </label>
              <textarea
                id="learned"
                name="learned"
                value={learned}
                onChange={(event) => setLearned(event.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400"
                placeholder="Example: I learned how Next.js file-based routing works."
              />
            </div>

            <div>
              <label htmlFor="challenges" className="mb-2 block text-sm font-medium text-slate-700">
                Challenges faced
              </label>
              <textarea
                id="challenges"
                name="challenges"
                value={challenges}
                onChange={(event) => setChallenges(event.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400"
                placeholder="Example: I struggled with understanding React state."
              />
            </div>

            {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Submit Entry"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

