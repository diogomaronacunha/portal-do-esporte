import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const ESPORTE_ICONES: Record<string, string> = {
  'futebol':           '⚽',
  'futsal':            '⚽',
  'volei':             '🏐',
  'beach-volei':       '🏐',
  'basquete':          '🏀',
  'handebol':          '🤾',
  'atletismo':         '🏃',
  'corrida-de-rua':    '🏃',
  'natacao':           '🏊',
  'ciclismo':          '🚴',
  'triathlon':         '🏊',
  'tenis':             '🎾',
  'tenis-de-mesa':     '🏓',
  'judo':              '🥋',
  'karate':            '🥋',
  'boxe':              '🥊',
  'jiu-jitsu':         '🥋',
  'rugby':             '🏉',
  'futebol-americano': '🏈',
  'padel':             '🎾',
  'squash':            '🎾',
  'ginastica':         '🤸',
  'fisiculturismo':    '💪',
  'xadrez':            '♟️',
  'e-sports':          '🎮',
  'outros':            '🏅',
}

export function getEsporteIcone(slug?: string | null): string {
  if (!slug) return '🏅'
  return ESPORTE_ICONES[slug] ?? '🏅'
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}
