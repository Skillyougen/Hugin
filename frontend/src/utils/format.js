const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' })
const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

const toDate = (d) => (d instanceof Date ? d : new Date(d))

export const formatDate = (date) => dateFormatter.format(toDate(date))
export const formatTime = (date) => timeFormatter.format(toDate(date))
export const formatDateTime = (date) => dateTimeFormatter.format(toDate(date))

export function formatNumber(value, digits = 0) {
  return Number(value).toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
