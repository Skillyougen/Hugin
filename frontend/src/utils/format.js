const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' })
const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(date) {
  return dateFormatter.format(date instanceof Date ? date : new Date(date))
}

export function formatTime(date) {
  return timeFormatter.format(date instanceof Date ? date : new Date(date))
}

export function formatDateTime(date) {
  return dateTimeFormatter.format(date instanceof Date ? date : new Date(date))
}

export function formatNumber(value, digits = 0) {
  return Number(value).toLocaleString('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}
