// Date formatting utilities
export const formatDate = (date) => new Date(date).toLocaleDateString()

// Time formatting (hours & minutes)
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

// Calculate completion percentage
export const calcProgress = (completed, total) => {
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

// Format number with commas
export const formatNumber = (num) => num.toLocaleString()
