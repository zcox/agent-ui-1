/**
 * Format a timestamp to a human-readable time string.
 * @param timestamp ISO 8601 datetime string
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a timestamp to a human-readable date and time string.
 * @param timestamp ISO 8601 datetime string
 * @returns Formatted datetime string (e.g., "Jan 15, 2:30 PM")
 */
export function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a timestamp to a relative time string.
 * @param timestamp ISO 8601 datetime string
 * @returns Relative time string (e.g., "2 minutes ago", "just now")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDateTime(timestamp);
  }
}

/**
 * Get the current ISO 8601 timestamp.
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
