const KENYA_TIMEZONE = "Africa/Nairobi"

function toDate(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatKenyaDateTime(iso: string) {
  const date = toDate(iso)
  if (!date) return iso

  const formatted = new Intl.DateTimeFormat("en-KE", {
    timeZone: KENYA_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)

  return `${formatted} EAT`
}

export function formatKenyaMonthYear(iso: string) {
  const date = toDate(iso)
  if (!date) return iso

  return new Intl.DateTimeFormat("en-KE", {
    timeZone: KENYA_TIMEZONE,
    month: "long",
    year: "numeric",
  }).format(date)
}

