#!/usr/bin/env node
/**
 * Pull Cloudflare zone traffic into public/site-traffic.json for System Usage.
 * Reads CLOUDFLARE_API_TOKEN + CLOUDFLARE_ZONE_ID from env / .env.local / ~/.config/tapeoutops/cloudflare.env
 * Never expose the token to Vite (no VITE_ prefix).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  const text = readFileSync(path, 'utf8')
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvFile(join(root, '.env.local'))
loadEnvFile(join(process.env.HOME || '', '.config/tapeoutops/cloudflare.env'))

const TOKEN = process.env.CLOUDFLARE_API_TOKEN?.trim()
const ZONE = process.env.CLOUDFLARE_ZONE_ID?.trim()
const ZONE_NAME = process.env.CLOUDFLARE_ZONE_NAME?.trim() || 'tapeoutops.com'
const days = Math.min(30, Math.max(1, Number(process.env.CLOUDFLARE_TRAFFIC_DAYS || 7)))

if (!TOKEN || !ZONE) {
  console.error('Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID')
  process.exit(1)
}

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

const until = new Date()
const since = new Date(until)
since.setUTCDate(since.getUTCDate() - days)

const query = `
query ($zoneTag: string, $since: Date!, $until: Date!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequests1dGroups(
        orderBy: [date_ASC]
        limit: 40
        filter: { date_geq: $since, date_leq: $until }
      ) {
        dimensions { date }
        sum { requests cachedRequests pageViews }
        uniq { uniques }
      }
    }
  }
}
`

const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables: {
      zoneTag: ZONE,
      since: isoDate(since),
      until: isoDate(until),
    },
  }),
})

const body = await res.json()
if (body.errors?.length) {
  console.error('Cloudflare GraphQL errors:', JSON.stringify(body.errors, null, 2))
  process.exit(1)
}

const groups =
  body?.data?.viewer?.zones?.[0]?.httpRequests1dGroups || []

const series = groups.map((g) => ({
  date: g.dimensions?.date,
  requests: g.sum?.requests ?? 0,
  pageViews: g.sum?.pageViews ?? 0,
  cachedRequests: g.sum?.cachedRequests ?? 0,
  uniques: g.uniq?.uniques ?? 0,
}))

const totals = series.reduce(
  (acc, row) => {
    acc.requests += row.requests
    acc.pageViews += row.pageViews
    acc.cachedRequests += row.cachedRequests
    acc.uniques += row.uniques
    return acc
  },
  { requests: 0, pageViews: 0, cachedRequests: 0, uniques: 0 },
)

const payload = {
  source: 'cloudflare',
  zone: ZONE_NAME,
  zoneId: ZONE,
  rangeDays: days,
  since: isoDate(since),
  until: isoDate(until),
  fetchedAt: new Date().toISOString(),
  totals,
  note:
    'Uniques are summed per-day (not de-duplicated across days). Name/email are not available from Cloudflare for anonymous visitors.',
  series,
}

const outDir = join(root, 'public')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, 'site-traffic.json')
writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n')
console.log(`Wrote ${outPath}`)
console.log(
  `totals requests=${totals.requests} pageViews=${totals.pageViews} uniques(sum/day)=${totals.uniques}`,
)
