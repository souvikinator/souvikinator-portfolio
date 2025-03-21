import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const isClient = typeof window !== 'undefined'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function readingTimeMinutes(html: string): number {
  const textOnly = html.replace(/<[^>]+>/g, '')
  const wordCount = textOnly.split(/\s+/).length
  const readingTimeMinutes = wordCount / 200 + 1
  return readingTimeMinutes
}

export function readingTime(html: string) {
  const minutes = readingTimeMinutes(html).toFixed()
  return `${minutes} min read`
}

export function isLongArticle(html: string): boolean {
  const minutes = readingTimeMinutes(html)
  return minutes > 4
}
