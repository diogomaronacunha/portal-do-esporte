#!/usr/bin/env node
/**
 * Script de verificação pós-migração do Supabase
 * Uso: node scripts/verify-supabase.js <SUPABASE_URL> <ANON_KEY> [SERVICE_ROLE_KEY]
 *
 * Exemplo:
 *   node scripts/verify-supabase.js https://abc.supabase.co eyJhb... eyJhb...
 */

const [, , supabaseUrl, anonKey, serviceKey] = process.argv

if (!supabaseUrl || !anonKey) {
  console.error('Uso: node scripts/verify-supabase.js <URL> <ANON_KEY> [SERVICE_ROLE_KEY]')
  process.exit(1)
}

const BASE = `${supabaseUrl}/rest/v1`
const headers = (key) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
})

async function check(label, fn) {
  try {
    const result = await fn()
    console.log(`  ✅  ${label}: ${result}`)
    return true
  } catch (e) {
    console.log(`  ❌  ${label}: ${e.message}`)
    return false
  }
}

async function query(table, key, select = 'id') {
  const res = await fetch(`${BASE}/${table}?select=${select}&limit=1`, { headers: headers(key) })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return `OK (${Array.isArray(data) ? data.length : 0} rows)`
}

async function count(table, key) {
  const res = await fetch(`${BASE}/${table}?select=id`, {
    headers: { ...headers(key), Prefer: 'count=exact', 'Range-Unit': 'items', Range: '0-0' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const total = res.headers.get('content-range')?.split('/')?.[1] ?? '?'
  return `${total} registros`
}

;(async () => {
  console.log('\n🔍 Verificando projeto Supabase...\n')
  console.log(`📡 URL: ${supabaseUrl}\n`)

  const keyToUse = serviceKey || anonKey
  const keyLabel = serviceKey ? 'service_role' : 'anon'
  console.log(`🔑 Usando chave: ${keyLabel}\n`)

  const tables = ['profiles', 'esportes', 'fontes_rss', 'noticias', 'eventos', 'atletas', 'clubes', 'config_sistema']

  console.log('📋 Tabelas:')
  let allOk = true
  for (const table of tables) {
    const ok = await check(`${table}`, () => query(table, keyToUse))
    if (!ok) allOk = false
  }

  console.log('\n📊 Seed data:')
  await check('esportes (seed)', () => count('esportes', keyToUse))
  await check('fontes_rss (seed)', () => count('fontes_rss', keyToUse))
  await check('config_sistema', () => count('config_sistema', keyToUse))

  if (serviceKey) {
    console.log('\n🔐 RLS (via service_role — bypass):')
    await check('noticias (service_role bypass)', () => query('noticias', serviceKey))
  }

  console.log('\n' + (allOk ? '✅ Tudo OK! Projeto pronto para uso.' : '⚠️  Alguns checks falharam — verifique as migrations.'))
  console.log()
})()
