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

async function cfGraphQL(query, variables) {
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
  const body = await res.json()
  if (body.errors?.length) {
    throw new Error(JSON.stringify(body.errors))
  }
  return body.data
}

const until = new Date()
const since = new Date(until)
since.setUTCDate(since.getUTCDate() - days)

const dailyQuery = `
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

const dailyData = await cfGraphQL(dailyQuery, {
  zoneTag: ZONE,
  since: isoDate(since),
  until: isoDate(until),
})

const groups = dailyData?.viewer?.zones?.[0]?.httpRequests1dGroups || []

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

/** Adaptive groups are limited to ~1 day — use UTC today for breakdowns. */
const dayStart = new Date()
dayStart.setUTCHours(0, 0, 0, 0)
const dayEnd = new Date()
dayEnd.setUTCHours(23, 59, 59, 999)

const detailQuery = `
query ($zoneTag: string, $since: Time!, $until: Time!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      byCountry: httpRequestsAdaptiveGroups(
        limit: 15
        orderBy: [count_DESC]
        filter: { datetime_geq: $since, datetime_lt: $until }
      ) {
        count
        sum { visits }
        dimensions { clientCountryName }
      }
      byPath: httpRequestsAdaptiveGroups(
        limit: 30
        orderBy: [count_DESC]
        filter: { datetime_geq: $since, datetime_lt: $until }
      ) {
        count
        dimensions { clientRequestPath }
      }
      byDevice: httpRequestsAdaptiveGroups(
        limit: 10
        orderBy: [count_DESC]
        filter: { datetime_geq: $since, datetime_lt: $until }
      ) {
        count
        dimensions { clientDeviceType }
      }
      byBrowser: httpRequestsAdaptiveGroups(
        limit: 15
        orderBy: [count_DESC]
        filter: { datetime_geq: $since, datetime_lt: $until }
      ) {
        count
        dimensions { userAgentBrowser }
      }
    }
  }
}
`

let today = null
try {
  const detail = await cfGraphQL(detailQuery, {
    zoneTag: ZONE,
    since: dayStart.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    until: dayEnd.toISOString().replace(/\.\d{3}Z$/, 'Z'),
  })
  const z = detail?.viewer?.zones?.[0] || {}
  const countries = (z.byCountry || []).map((g) => ({
    country: g.dimensions?.clientCountryName || 'Unknown',
    requests: g.count || 0,
    visits: g.sum?.visits ?? 0,
  }))
  const allPaths = (z.byPath || []).map((g) => ({
    path: g.dimensions?.clientRequestPath || '/',
    requests: g.count || 0,
  }))
  const pages = allPaths
    .filter((p) => {
      const path = p.path || '/'
      if (path.startsWith('/api/')) return false
      if (path.startsWith('/cdn-cgi/')) return false
      if (path.includes('.')) {
        // skip hashed assets / files
        if (/\.(js|css|map|png|jpg|jpeg|svg|ico|woff2?|ttf|webp)(\?|$)/i.test(path)) return false
      }
      return true
    })
    .slice(0, 15)
  const apis = allPaths.filter((p) => (p.path || '').startsWith('/api/')).slice(0, 15)
  const devices = (z.byDevice || []).map((g) => ({
    device: g.dimensions?.clientDeviceType || 'Unknown',
    requests: g.count || 0,
  }))
  const browsers = (z.byBrowser || []).map((g) => ({
    browser: g.dimensions?.userAgentBrowser || 'Unknown',
    requests: g.count || 0,
  }))

  today = {
    date: isoDate(dayStart),
    countries,
    pages,
    apis,
    devices,
    browsers,
  }
} catch (err) {
  console.warn('Today breakdown failed (continuing with daily totals):', String(err).slice(0, 300))
}

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
    'People visited = sum of Cloudflare unique visitors per day (not de-duplicated across days). Includes bots/scanners. No name/email for anonymous visitors. "Today" tables are UTC day breakdowns.',
  series,
  today,
}

const outDir = join(root, 'public')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, 'site-traffic.json')
writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n')
console.log(`Wrote ${outPath}`)
console.log(
  `totals requests=${totals.requests} pageViews=${totals.pageViews} uniques(sum/day)=${totals.uniques}`,
)
if (today) {
  console.log(
    `today pages=${today.pages.length} countries=${today.countries.length} topCountry=${today.countries[0]?.country || '-'}`,
  )
}
