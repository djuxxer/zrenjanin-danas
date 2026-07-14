import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { sr } from 'date-fns/locale'
import slugify from 'slugify'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'd. MMMM yyyy.', { locale: sr })
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'd. MMMM yyyy. HH:mm', { locale: sr })
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: sr })
}

export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'sr',
    replacement: '-',
  })
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function readingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(words / 200)
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zrenjaninsdanas.rs'
export const SITE_NAME = 'Zrenjanin Danas'
export const SITE_DESCRIPTION =
  'Najnovije vesti iz Zrenjanina, Vojvodine i Srbije — politika, ekonomija, sport, kultura i hronika.'
