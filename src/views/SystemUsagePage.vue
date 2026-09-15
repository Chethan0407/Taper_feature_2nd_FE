<template>
  <div class="min-h-screen app-page">
    <Sidebar />
    <div class="ml-64">
      <Header />
      <main class="p-8">
        <div class="relative z-[60] mb-8 flex flex-wrap items-start justify-between gap-4 page-enter">
          <div class="min-w-0">
            <h1 class="page-title-gradient mb-1">System Usage</h1>
            <p class="page-subtitle">Internal dashboard for usage and activity (superuser only).</p>
          </div>
        </div>

        <!-- Overview KPIs -->
        <section class="mb-10 page-enter">
          <h2 class="module-section-title mb-4">Overview</h2>
          <div v-if="overviewLoading" class="text-gray-400">Loading overview...</div>
          <div v-else-if="overviewError" class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{{ overviewError }}</div>
          <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <div class="stat-tile !text-left !p-4 border-sky-500/30 bg-sky-500/5 transition hover:border-sky-400/50">
              <p class="text-xs font-medium uppercase tracking-wide text-sky-400">Total Users</p>
              <p class="mt-1 font-display text-3xl font-bold text-sky-300">{{ overview?.users?.total ?? '—' }}</p>
            </div>
            <div class="stat-tile !text-left !p-4 border-emerald-500/30 bg-emerald-500/5 transition hover:border-emerald-400/50">
              <p class="text-xs font-medium uppercase tracking-wide text-emerald-400">Active Users</p>
              <p class="mt-1 font-display text-3xl font-bold text-emerald-300">{{ overview?.users?.active ?? '—' }}</p>
            </div>
            <div class="stat-tile !text-left !p-4 border-amber-500/30 bg-amber-500/5 transition hover:border-amber-400/50">
              <p class="text-xs font-medium uppercase tracking-wide text-amber-400">Signups (7d)</p>
              <p class="mt-1 font-display text-3xl font-bold text-amber-300">{{ overview?.users?.signups_7d ?? '—' }}</p>
            </div>
            <div class="stat-tile !text-left !p-4 border-violet-500/30 bg-violet-500/5 transition hover:border-violet-400/50">
              <p class="text-xs font-medium uppercase tracking-wide text-violet-400">Companies</p>
              <p class="mt-1 font-display text-3xl font-bold text-violet-300">{{ overview?.resources?.companies ?? '—' }}</p>
            </div>
            <div class="stat-tile !text-left !p-4 border-cyan-500/30 bg-cyan-500/5 transition hover:border-cyan-400/50">
              <p class="text-xs font-medium uppercase tracking-wide text-cyan-400">Projects</p>
              <p class="mt-1 font-display text-3xl font-bold text-cyan-300">{{ overview?.resources?.projects ?? '—' }}</p>
            </div>
            <div class="stat-tile !text-left !p-4 border-fuchsia-500/30 bg-fuchsia-500/5 transition hover:border-fuchsia-400/50">
              <p class="text-xs font-medium uppercase tracking-wide text-fuchsia-400">Specifications</p>
              <p class="mt-1 font-display text-3xl font-bold text-fuchsia-300">{{ overview?.resources?.specifications ?? '—' }}</p>
            </div>
          </div>
        </section>

        <!-- Site traffic (Cloudflare + local landing beacons) -->
        <section class="mb-10 page-enter" data-testid="site-traffic">
          <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 class="module-section-title">Site traffic</h2>
              <p class="mt-1 max-w-3xl text-sm text-slate-400">
                <strong class="text-slate-200">Everyone</strong> who hit tapeoutops.com comes from Cloudflare
                (no emails). <strong class="text-slate-200">Your visits</strong>
                (e.g. {{ myVisitEmail || 'you@…' }}) are listed separately when you open the homepage while logged in.
              </p>
            </div>
            <button
              type="button"
              class="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20"
              @click="refreshSiteTraffic"
            >
              Refresh
            </button>
          </div>

          <div v-if="siteTrafficLoading" class="text-gray-400">Loading site traffic…</div>
          <div v-else-if="siteTrafficError" class="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-sm">
            {{ siteTrafficError }}
          </div>
          <template v-else>
            <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Everyone on tapeoutops.com</h3>
            <div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div class="stat-tile !text-left !p-4 border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-400/20">
                <p class="text-xs font-medium uppercase tracking-wide text-violet-300">People visited ({{ siteTraffic?.rangeDays ?? 7 }}d)</p>
                <p class="mt-1 font-display text-3xl font-bold text-violet-200">{{ siteTraffic?.totals?.uniques ?? '—' }}</p>
                <p class="mt-1 text-[11px] text-violet-300/70">Cloudflare unique visitors (sum of each day)</p>
              </div>
              <div class="stat-tile !text-left !p-4 border-emerald-500/30 bg-emerald-500/5">
                <p class="text-xs font-medium uppercase tracking-wide text-emerald-400">Page views</p>
                <p class="mt-1 font-display text-3xl font-bold text-emerald-300">{{ siteTraffic?.totals?.pageViews ?? '—' }}</p>
              </div>
              <div class="stat-tile !text-left !p-4 border-sky-500/30 bg-sky-500/5">
                <p class="text-xs font-medium uppercase tracking-wide text-sky-400">Total requests</p>
                <p class="mt-1 font-display text-3xl font-bold text-sky-300">{{ siteTraffic?.totals?.requests ?? '—' }}</p>
              </div>
              <div class="stat-tile !text-left !p-4 border-amber-500/30 bg-amber-500/5">
                <p class="text-xs font-medium uppercase tracking-wide text-amber-400">People today</p>
                <p class="mt-1 font-display text-3xl font-bold text-amber-200">{{ latestDayUniques }}</p>
                <p class="mt-1 text-[11px] text-amber-300/70">{{ latestDayLabel }}</p>
              </div>
            </div>
          </template>

          <div v-if="siteTraffic?.series?.length" class="mb-8 overflow-x-auto rounded-xl border border-sky-500/20 bg-white shadow-lg dark:border-sky-500/20 dark:bg-dark-900/90">
            <table class="min-w-full text-left text-sm">
              <thead class="border-b border-sky-500/15 bg-sky-500/5">
                <tr>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Date</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">People</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Page views</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Requests</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in siteTraffic.series"
                  :key="row.date"
                  class="border-b border-gray-200 dark:border-dark-800"
                >
                  <td class="px-4 py-2 text-gray-800 dark:text-gray-200">{{ row.date }}</td>
                  <td class="px-4 py-2 font-medium text-violet-300">{{ row.uniques }}</td>
                  <td class="px-4 py-2 text-gray-800 dark:text-gray-200">{{ row.pageViews }}</td>
                  <td class="px-4 py-2 text-gray-800 dark:text-gray-200">{{ row.requests }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cloudflare today breakdown — explains the big numbers -->
          <div v-if="siteTraffic?.today" class="mb-8" data-testid="site-traffic-breakdown">
            <h3 class="mb-2 text-lg font-semibold text-sky-200">
              What’s behind today’s traffic
              <span class="ml-2 text-sm font-normal text-slate-400">(UTC {{ siteTraffic.today.date }})</span>
            </h3>
            <p class="mb-4 max-w-3xl text-sm text-slate-400">
              The big “people” number includes bots and API clients. Below: countries, real pages (not /api), devices, and browsers — still no emails from Cloudflare.
            </p>
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div class="overflow-x-auto rounded-xl border border-violet-500/20 bg-white dark:bg-dark-900/90">
                <table class="min-w-full text-left text-sm">
                  <thead class="border-b border-violet-500/15 bg-violet-500/5">
                    <tr>
                      <th class="px-3 py-2 text-violet-200">Country</th>
                      <th class="px-3 py-2 text-violet-200">Requests</th>
                      <th class="px-3 py-2 text-violet-200">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in (siteTraffic.today.countries || []).slice(0, 10)" :key="c.country" class="border-b border-dark-800">
                      <td class="px-3 py-1.5 text-gray-200">{{ c.country }}</td>
                      <td class="px-3 py-1.5 text-gray-300">{{ c.requests }}</td>
                      <td class="px-3 py-1.5 text-gray-300">{{ c.visits }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="overflow-x-auto rounded-xl border border-emerald-500/20 bg-white dark:bg-dark-900/90">
                <table class="min-w-full text-left text-sm">
                  <thead class="border-b border-emerald-500/15 bg-emerald-500/5">
                    <tr>
                      <th class="px-3 py-2 text-emerald-200">Page path (human UI)</th>
                      <th class="px-3 py-2 text-emerald-200">Hits</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!(siteTraffic.today.pages || []).length">
                      <td colspan="2" class="px-3 py-3 text-gray-400">No UI page paths in sample</td>
                    </tr>
                    <tr v-for="p in (siteTraffic.today.pages || []).slice(0, 10)" :key="p.path" class="border-b border-dark-800">
                      <td class="px-3 py-1.5 font-mono text-xs text-gray-200">{{ p.path }}</td>
                      <td class="px-3 py-1.5 text-gray-300">{{ p.requests }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="overflow-x-auto rounded-xl border border-sky-500/20 bg-white dark:bg-dark-900/90">
                <table class="min-w-full text-left text-sm">
                  <thead class="border-b border-sky-500/15 bg-sky-500/5">
                    <tr>
                      <th class="px-3 py-2 text-sky-200">Device</th>
                      <th class="px-3 py-2 text-sky-200">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="d in (siteTraffic.today.devices || [])" :key="d.device" class="border-b border-dark-800">
                      <td class="px-3 py-1.5 text-gray-200">{{ d.device }}</td>
                      <td class="px-3 py-1.5 text-gray-300">{{ d.requests }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="overflow-x-auto rounded-xl border border-amber-500/20 bg-white dark:bg-dark-900/90">
                <table class="min-w-full text-left text-sm">
                  <thead class="border-b border-amber-500/15 bg-amber-500/5">
                    <tr>
                      <th class="px-3 py-2 text-amber-200">Browser / bot</th>
                      <th class="px-3 py-2 text-amber-200">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="b in (siteTraffic.today.browsers || []).slice(0, 10)" :key="b.browser" class="border-b border-dark-800">
                      <td class="px-3 py-1.5 text-gray-200">{{ b.browser }}</td>
                      <td class="px-3 py-1.5 text-gray-300">{{ b.requests }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-if="(siteTraffic.today.apis || []).length" class="mt-4 overflow-x-auto rounded-xl border border-slate-500/20 bg-white dark:bg-dark-900/90">
              <p class="px-3 pt-3 text-xs font-medium uppercase tracking-wide text-slate-400">Top API paths today (inflates request count)</p>
              <table class="min-w-full text-left text-sm">
                <thead class="border-b border-slate-500/15">
                  <tr>
                    <th class="px-3 py-2 text-slate-300">API path</th>
                    <th class="px-3 py-2 text-slate-300">Hits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="a in siteTraffic.today.apis.slice(0, 8)" :key="a.path" class="border-b border-dark-800">
                    <td class="px-3 py-1.5 font-mono text-xs text-gray-300">{{ a.path }}</td>
                    <td class="px-3 py-1.5 text-gray-400">{{ a.requests }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3 class="mb-3 text-lg font-semibold text-sky-200">Your visits vs everyone else</h3>
          <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="stat-tile !text-left !p-4 border-fuchsia-500/40 bg-fuchsia-500/10">
              <p class="text-xs font-medium uppercase tracking-wide text-fuchsia-300">My visits</p>
              <p class="mt-1 font-display text-2xl font-bold text-fuchsia-200">{{ myLandingVisitCount }}</p>
              <p class="mt-1 truncate text-[11px] text-fuchsia-300/80">{{ myVisitEmail || 'Log in to tag your email' }}</p>
            </div>
            <div class="stat-tile !text-left !p-4 border-slate-500/30 bg-slate-500/5">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Anonymous / other</p>
              <p class="mt-1 font-display text-2xl font-bold text-slate-200">{{ otherLandingVisitCount }}</p>
              <p class="mt-1 text-[11px] text-slate-400">Not tagged as you</p>
            </div>
            <div class="stat-tile !text-left !p-4 border-sky-500/30 bg-sky-500/5">
              <p class="text-xs font-medium uppercase tracking-wide text-sky-400">This browser total</p>
              <p class="mt-1 font-display text-2xl font-bold text-sky-300">{{ localLandingVisits.length }}</p>
              <p class="mt-1 text-[11px] text-sky-400/80">Homepage opens logged here</p>
            </div>
          </div>

          <div class="mb-3 flex flex-wrap items-center gap-3">
            <select v-model="landingVisitFilter" class="input-field rounded-lg px-3 py-2 text-sm">
              <option value="all">All rows</option>
              <option value="mine">Only mine ({{ myVisitEmail || 'me' }})</option>
              <option value="others">Everyone else / anonymous</option>
            </select>
            <input
              v-model="myVisitEmailOverride"
              type="email"
              placeholder="chethan@shurutech.com"
              class="input-field w-64 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-300"
              @click="clearLocalLandingVisits"
            >
              Clear log
            </button>
          </div>
          <div class="overflow-x-auto rounded-xl border border-sky-500/20 bg-white shadow-lg dark:border-sky-500/20 dark:bg-dark-900/90">
            <table class="min-w-full text-left text-sm">
              <thead class="border-b border-sky-500/15 bg-sky-500/5">
                <tr>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">When</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Who</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Name</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Email</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Path</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Referrer</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredLandingVisits.length === 0">
                  <td colspan="6" class="px-4 py-6 text-center text-gray-400">
                    No matching homepage visits. Open <strong class="text-slate-300">tapeoutops.com/</strong> while logged in as
                    {{ myVisitEmail || 'yourself' }}, then refresh.
                  </td>
                </tr>
                <tr
                  v-for="(row, idx) in filteredLandingVisits.slice(0, 50)"
                  :key="String(row.ts) + String(idx)"
                  class="border-b border-gray-200 dark:border-dark-800"
                  :class="isMyLandingVisit(row) ? 'bg-fuchsia-500/5' : ''"
                >
                  <td class="px-4 py-2 text-gray-800 dark:text-gray-200">{{ formatSiteTrafficTime(row.ts) }}</td>
                  <td class="px-4 py-2">
                    <span
                      class="rounded px-2 py-0.5 text-xs font-medium"
                      :class="isMyLandingVisit(row)
                        ? 'bg-fuchsia-500/20 text-fuchsia-200'
                        : 'bg-slate-500/20 text-slate-300'"
                    >
                      {{ isMyLandingVisit(row) ? 'You' : (row.email ? 'Other' : 'Anonymous') }}
                    </span>
                  </td>
                  <td class="px-4 py-2 text-gray-800 dark:text-gray-200">{{ row.name || '—' }}</td>
                  <td class="px-4 py-2 text-gray-800 dark:text-gray-200">{{ row.email || '—' }}</td>
                  <td class="px-4 py-2 text-gray-800 dark:text-gray-200">{{ row.path || '/' }}</td>
                  <td class="px-4 py-2 text-gray-400 truncate max-w-xs">{{ row.referrer || '(direct)' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Signup leads — same layout pattern as Users (filters + table) -->
        <section class="mb-10 page-enter" data-testid="signup-leads">
          <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 class="module-section-title">Signup leads</h2>
              <p class="mt-1 max-w-3xl text-sm text-slate-400">
                Incomplete sign-ups captured on <strong class="text-slate-200">this browser</strong> (local log). Server list
                uses <code class="text-xs text-sky-300">GET /api/v1/admin/usage/signup-leads</code> when available.
              </p>
            </div>
            <span class="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200">
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Lead capture
            </span>
          </div>

          <h3 class="mb-3 text-lg font-semibold text-sky-200">This browser</h3>
          <div class="flex flex-wrap gap-4 mb-4">
            <select
              v-model="leadsLocalSourceFilter"
              class="input-field rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All sources</option>
              <option value="blur">blur (email field)</option>
              <option value="idle">idle (email field)</option>
              <option value="modal_close">modal_close (email)</option>
              <option value="page_left">page_left (email)</option>
              <option value="name_blur">name_blur</option>
              <option value="name_idle">name_idle</option>
              <option value="name_modal_close">name_modal_close</option>
              <option value="name_page_left">name_page_left</option>
            </select>
            <input
              v-model="leadsLocalEmailFilter"
              type="text"
              placeholder="Filter by email or domain"
              class="input-field w-56 rounded-lg px-3 py-2 text-sm md:w-64"
            />
            <button
              type="button"
              class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-dark-700 dark:hover:bg-dark-600"
              @click="applyLocalSignupLeadsFilters"
            >
              Apply
            </button>
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-300 dark:hover:text-white"
              @click="clearLocalSignupLeads"
            >
              Clear log
            </button>
          </div>
          <div class="overflow-x-auto rounded-xl border border-sky-500/20 bg-white shadow-lg shadow-sky-950/20 dark:border-sky-500/20 dark:bg-dark-900/90" data-testid="local-signup-leads-table">
            <table class="min-w-full text-left">
              <thead class="border-b border-sky-500/15 bg-sky-500/5 dark:bg-sky-500/10">
                <tr>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Email</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Domain</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Source</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Partial</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Path</th>
                  <th class="px-4 py-3 font-semibold text-sky-700 dark:text-sky-200">Captured</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in pagedLocalSignupLeads"
                  :key="String(row?.ts) + String(row?.email) + String(idx)"
                  class="border-b border-gray-200 hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800/50"
                >
                  <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ row?.email ?? '—' }}</td>
                  <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ leadEmailDomain(row?.email) }}</td>
                  <td class="py-3 px-4 text-gray-400 text-sm">{{ row?.source ?? '—' }}</td>
                  <td class="py-3 px-4">
                    <span
                      class="inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold"
                      :class="row?.partial
                        ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                        : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'"
                    >
                      {{ row?.partial ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-gray-500 text-sm">{{ row?.path ?? '—' }}</td>
                  <td class="py-3 px-4 text-gray-400 text-sm">{{ formatDate(row?.ts) }}</td>
                </tr>
                <tr v-if="!pagedLocalSignupLeads.length">
                  <td colspan="6" class="py-8 px-4 text-gray-500 text-sm text-center">
                    No signup leads match your filters. Open Sign up on this browser, type enough of an email (e.g.
                    <code class="text-xs text-gray-400">you@co</code>), pause or blur — then click Apply.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-if="localLeadsTotal > 0"
            class="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400"
            data-testid="local-leads-pagination"
          >
            <div>{{ localLeadsRangeLabel }}</div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="rounded-lg bg-gray-900 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-700"
                :disabled="!localLeadsCanPrev"
                @click="goLocalLeadsPage(localLeadsPage - 1)"
              >
                Previous
              </button>
              <button
                v-for="n in localLeadsPageNumbers"
                :key="'local-' + n"
                type="button"
                class="min-w-[2.25rem] rounded-lg px-2.5 py-1.5"
                :class="n === localLeadsPage
                  ? 'bg-neon-blue/20 font-semibold text-neon-blue ring-1 ring-neon-blue/40'
                  : 'bg-gray-900 text-white dark:bg-dark-700'"
                @click="goLocalLeadsPage(n)"
              >
                {{ n }}
              </button>
              <button
                type="button"
                class="rounded-lg bg-gray-900 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-700"
                data-testid="local-leads-next"
                :disabled="!localLeadsCanNext"
                @click="goLocalLeadsPage(localLeadsPage + 1)"
              >
                Next
              </button>
            </div>
            <label class="flex items-center gap-2">
              <span>Rows</span>
              <select
                v-model.number="localLeadsLimit"
                class="input-field max-w-[5.5rem] rounded-lg px-2 py-1.5 text-sm"
                @change="changeLocalLeadsPageSize"
              >
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </label>
          </div>

          <h3 class="mb-3 mt-10 text-lg font-semibold text-violet-200">From server</h3>
          <div class="flex flex-wrap gap-4 mb-4">
            <button
              type="button"
              class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-dark-700 dark:hover:bg-dark-600"
              :disabled="signupLeadsLoading"
              @click="fetchSignupLeads"
            >
              {{ signupLeadsLoading ? 'Loading…' : 'Refresh' }}
            </button>
          </div>
          <div v-if="signupLeadsLoading" class="text-gray-400 mb-4">Loading signup leads…</div>
          <div v-if="signupLeadsError" class="text-red-400 mb-4">{{ signupLeadsError }}</div>
          <p
            v-if="signupLeadsInfo && !signupLeadsError"
            :class="signupLeadsEndpointMissing ? 'text-gray-400 text-sm mb-4' : 'text-amber-400/90 text-sm mb-4 whitespace-pre-line'"
          >
            {{ signupLeadsInfo }}
          </p>
          <div
            class="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900"
            data-testid="server-signup-leads-table"
          >
            <table class="min-w-full text-left">
              <thead class="bg-gray-100 border-b border-gray-200 dark:bg-dark-800 dark:border-dark-700">
                <tr>
                  <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Email</th>
                  <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Domain</th>
                  <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Last source</th>
                  <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Last seen</th>
                  <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Converted</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in pagedServerSignupLeads"
                  :key="String(row?.email) + String(idx)"
                  class="border-b border-gray-200 hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800/50"
                >
                  <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ row?.email ?? '—' }}</td>
                  <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ leadEmailDomain(row?.email) }}</td>
                  <td class="py-3 px-4 text-gray-400 text-sm">{{ row.last_source ?? row.source ?? '—' }}</td>
                  <td class="py-3 px-4 text-gray-400 text-sm">{{ formatDateTime(row.last_seen || row.last_seen_at || row.updated_at || row.created_at) }}</td>
                  <td class="py-3 px-4">
                    <span
                      :class="row.converted === true || row.user_id ? 'text-green-400' : 'text-gray-500'"
                    >
                      {{ row.converted === true || row.user_id ? 'Yes' : 'No' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!signupLeadsLoading && !pagedServerSignupLeads.length">
                  <td colspan="5" class="py-8 px-4 text-gray-500 text-sm text-center">
                    {{
                      signupLeadsEndpointMissing
                        ? 'No server endpoint yet (404). Table is ready — rows appear when GET /api/v1/admin/usage/signup-leads is available.'
                        : 'No server rows for this query.'
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-if="serverLeadsTotal > 0"
            class="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400"
            data-testid="server-leads-pagination"
          >
            <div>{{ serverLeadsRangeLabel }}</div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="rounded-lg bg-gray-900 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-700"
                :disabled="!serverLeadsCanPrev"
                @click="goServerLeadsPage(serverLeadsPage - 1)"
              >
                Previous
              </button>
              <button
                v-for="n in serverLeadsPageNumbers"
                :key="'server-' + n"
                type="button"
                class="min-w-[2.25rem] rounded-lg px-2.5 py-1.5"
                :class="n === serverLeadsPage
                  ? 'bg-neon-blue/20 font-semibold text-neon-blue ring-1 ring-neon-blue/40'
                  : 'bg-gray-900 text-white dark:bg-dark-700'"
                @click="goServerLeadsPage(n)"
              >
                {{ n }}
              </button>
              <button
                type="button"
                class="rounded-lg bg-gray-900 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-700"
                data-testid="server-leads-next"
                :disabled="!serverLeadsCanNext"
                @click="goServerLeadsPage(serverLeadsPage + 1)"
              >
                Next
              </button>
            </div>
            <label class="flex items-center gap-2">
              <span>Rows</span>
              <select
                v-model.number="serverLeadsLimit"
                class="input-field max-w-[5.5rem] rounded-lg px-2 py-1.5 text-sm"
                @change="changeServerLeadsPageSize"
              >
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </label>
          </div>
        </section>

        <!-- Trends (charts) -->
        <section class="mb-10 page-enter">
          <h2 class="module-section-title mb-4">Usage trends</h2>
          <div class="mb-4 flex gap-4">
            <select v-model="trendsDays" class="input-field rounded-lg px-3 py-2 text-sm">
              <option :value="7">7 days</option>
              <option :value="30">30 days</option>
              <option :value="90">90 days</option>
            </select>
          </div>
          <div v-if="trendsLoading" class="text-gray-400">Loading trends...</div>
          <div v-else-if="trendsError" class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{{ trendsError }}</div>
          <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 dark:bg-dark-900/90" data-testid="signups-trend-chart">
              <h3 class="mb-3 font-medium text-amber-200">Signups per day</h3>
              <div v-if="signupTrendSeries.length" class="flex h-48 items-end gap-[2px]">
                <div
                  v-for="d in signupTrendSeries"
                  :key="d.date"
                  class="min-w-0 flex-1 rounded-t transition-all"
                  :class="d.count > 0 ? 'bg-gradient-to-t from-amber-600 to-amber-300 hover:from-amber-500 hover:to-amber-200' : 'bg-transparent'"
                  :title="`${d.date}: ${d.count}`"
                  :data-date="d.date"
                  :data-count="d.count"
                  :style="{ height: trendBarHeight(d.count, 'signups') + '%' }"
                />
              </div>
              <div
                v-else
                class="flex h-48 items-center justify-center rounded-lg border border-dashed border-amber-500/30 px-4 text-center text-sm text-slate-400"
              >
                No signup data for this window. The API returned an empty series or there were no signups in range.
              </div>
              <div v-if="signupTrendSeries.length" class="mt-2 flex justify-between text-xs text-slate-500">
                <span data-testid="signups-trend-start">{{ signupTrendStart }}</span>
                <span data-testid="signups-trend-end">{{ signupTrendEnd }}</span>
              </div>
            </div>
            <div class="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-5 dark:bg-dark-900/90" data-testid="projects-trend-chart">
              <h3 class="mb-3 font-medium text-violet-200">Projects per day</h3>
              <div v-if="projectTrendSeries.some((d) => d.count > 0)" class="flex h-48 items-end gap-[2px]">
                <div
                  v-for="d in projectTrendSeries"
                  :key="d.date"
                  class="min-w-0 flex-1 rounded-t transition-all"
                  :class="d.count > 0 ? 'bg-gradient-to-t from-violet-700 to-fuchsia-300 hover:from-violet-600 hover:to-fuchsia-200' : 'bg-transparent'"
                  :title="`${d.date}: ${d.count}`"
                  :data-date="d.date"
                  :data-count="d.count"
                  :style="{ height: trendBarHeight(d.count, 'projects') + '%' }"
                />
              </div>
              <div
                v-else
                class="flex h-48 items-center justify-center rounded-lg border border-dashed border-violet-500/30 px-4 text-center text-sm text-slate-400"
              >
                No project-creation data for this window. Empty charts here are normal if no new projects were recorded per day.
              </div>
              <div v-if="projectTrendSeries.some((d) => d.count > 0)" class="mt-2 flex justify-between text-xs text-slate-500">
                <span data-testid="projects-trend-start">{{ projectTrendStart }}</span>
                <span data-testid="projects-trend-end">{{ projectTrendEnd }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Users table -->
        <section class="mb-10">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Users</h2>
          </div>
          <div class="flex flex-wrap gap-4 mb-4">
            <select v-model="usersFilterActive" class="input-field rounded-lg px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="true">Active only</option>
              <option value="false">Inactive only</option>
            </select>
            <input
              v-model="usersFilterDomain"
              type="text"
              placeholder="Filter by domain"
              class="input-field w-48 rounded-lg px-3 py-2 text-sm"
            />
            <button
              class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-dark-700 dark:hover:bg-dark-600"
              @click="applyUsersFilters"
            >
              Apply
            </button>
          </div>
          <div v-if="usersLoading" class="text-gray-400">Loading users...</div>
          <div v-else-if="usersError" class="text-red-400">{{ usersError }}</div>
          <template v-else>
            <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900">
              <table class="min-w-full text-left">
                <thead class="bg-gray-100 border-b border-gray-200 dark:bg-dark-800 dark:border-dark-700">
                  <tr>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Email</th>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Name</th>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Role</th>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Domain</th>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Active</th>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Activity</th>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Created</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="u in usersList"
                    :key="u.id"
                    class="border-b border-gray-200 hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800/50"
                  >
                    <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ u.email }}</td>
                    <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ u.full_name || '—' }}</td>
                    <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ u.role || '—' }}</td>
                    <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ u.email_domain || '—' }}</td>
                    <td class="py-3 px-4">
                      <span :class="u.is_active ? 'text-green-400' : 'text-gray-500'">{{ u.is_active ? 'Yes' : 'No' }}</span>
                    </td>
                    <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ u.activity_count ?? '—' }}</td>
                    <td class="py-3 px-4 text-gray-400 text-sm">{{ formatDate(u.created_at) }}</td>
                  </tr>
                  <tr v-if="!usersList.length">
                    <td colspan="7" class="py-6 px-4 text-center text-gray-500">No users found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div>
                {{ usersRangeLabel }}
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg bg-gray-900 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-700"
                  :disabled="!usersCanPrev || usersLoading"
                  @click="goUsersPage(usersPage - 1)"
                >
                  Previous
                </button>
                <button
                  v-for="n in usersPageNumbers"
                  :key="n"
                  type="button"
                  class="min-w-[2.25rem] rounded-lg px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                  :class="n === usersPage
                    ? 'bg-neon-blue/20 font-semibold text-neon-blue ring-1 ring-neon-blue/40'
                    : 'bg-gray-900 text-white dark:bg-dark-700'"
                  :disabled="usersLoading"
                  @click="goUsersPage(n)"
                >
                  {{ n }}
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-gray-900 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-700"
                  :disabled="!usersCanNext || usersLoading"
                  @click="goUsersPage(usersPage + 1)"
                >
                  Next
                </button>
              </div>
              <label class="flex items-center gap-2">
                <span>Rows</span>
                <select
                  v-model.number="usersLimit"
                  class="input-field max-w-[5.5rem] rounded-lg px-2 py-1.5 text-sm"
                  @change="changeUsersPageSize"
                >
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </label>
            </div>
          </template>
        </section>

        <!-- Recent activity -->
        <section class="mb-10">
          <h2 class="module-section-title mb-4">Recent activity</h2>
          <div class="flex gap-4 mb-4">
            <select v-model="activityHours" class="input-field rounded-lg px-3 py-2 text-sm">
              <option :value="24">Last 24 hours</option>
              <option :value="48">Last 48 hours</option>
              <option :value="168">Last 7 days</option>
            </select>
          </div>
          <div v-if="activityLoading" class="text-gray-400">Loading activity...</div>
          <div v-else-if="activityError" class="text-red-400">{{ activityError }}</div>
          <div v-else class="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-700 dark:bg-dark-900">
            <div
              v-for="a in (activity?.activities || [])"
              :key="a.id"
              class="flex items-start gap-3 border-b border-gray-200 py-2 last:border-0 dark:border-dark-800"
            >
              <span class="shrink-0 text-sm text-gray-500">{{ formatDateTime(a.created_at) }}</span>
              <span class="text-gray-600 dark:text-gray-300">{{ a.user }}</span>
              <span class="text-gray-900 dark:text-white">{{ a.action }}</span>
              <span v-if="a.entity" class="text-gray-500 text-sm">{{ a.entity }} {{ a.entity_id }}</span>
            </div>
            <div v-if="!(activity?.activities?.length)" class="text-gray-500">No activity in this period.</div>
          </div>
        </section>

        <!-- Domains (optional) -->
        <section class="mb-10" data-testid="usage-by-domain">
          <h2 class="module-section-title mb-4">Usage by domain</h2>
          <div v-if="domainsLoading" class="text-gray-400">Loading domains...</div>
          <div v-else-if="domainsError" class="text-red-400">{{ domainsError }}</div>
          <template v-else>
            <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900">
              <table class="min-w-full text-left">
                <thead class="bg-gray-100 border-b border-gray-200 dark:bg-dark-800 dark:border-dark-700">
                  <tr>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Domain</th>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Users</th>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Companies</th>
                    <th class="py-3 px-4 text-gray-700 font-semibold dark:text-gray-300">Projects</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="d in pagedDomains"
                    :key="d.domain"
                    class="border-b border-gray-200 hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800/50"
                  >
                    <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ d.domain }}</td>
                    <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ d.users }}</td>
                    <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ d.companies }}</td>
                    <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ d.projects }}</td>
                  </tr>
                  <tr v-if="!pagedDomains.length">
                    <td colspan="4" class="py-6 px-4 text-center text-gray-500">No domains found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              v-if="domainsTotal > 0"
              class="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400"
              data-testid="domains-pagination"
            >
              <div>{{ domainsRangeLabel }}</div>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg bg-gray-900 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-700"
                  :disabled="!domainsCanPrev"
                  @click="goDomainsPage(domainsPage - 1)"
                >
                  Previous
                </button>
                <button
                  v-for="n in domainsPageNumbers"
                  :key="n"
                  type="button"
                  class="min-w-[2.25rem] rounded-lg px-2.5 py-1.5"
                  :class="n === domainsPage
                    ? 'bg-neon-blue/20 font-semibold text-neon-blue ring-1 ring-neon-blue/40'
                    : 'bg-gray-900 text-white dark:bg-dark-700'"
                  @click="goDomainsPage(n)"
                >
                  {{ n }}
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-gray-900 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-700"
                  :disabled="!domainsCanNext"
                  data-testid="domains-next"
                  @click="goDomainsPage(domainsPage + 1)"
                >
                  Next
                </button>
              </div>
              <label class="flex items-center gap-2">
                <span>Rows</span>
                <select
                  v-model.number="domainsLimit"
                  class="input-field max-w-[5.5rem] rounded-lg px-2 py-1.5 text-sm"
                  data-testid="domains-page-size"
                  @change="changeDomainsPageSize"
                >
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                </select>
              </label>
            </div>
          </template>
        </section>

        <!-- Most active users (optional) -->
        <section>
          <h2 class="module-section-title mb-4">Most active users (30 days)</h2>
          <div v-if="activeUsersLoading" class="text-gray-400">Loading...</div>
          <div v-else-if="activeUsersError" class="text-red-400">{{ activeUsersError }}</div>
          <div v-else class="max-w-xl rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-700 dark:bg-dark-900">
            <ul class="space-y-2">
              <li
                v-for="(u, i) in (activeUsersData?.active_users || [])"
                :key="u.email"
                class="flex items-center justify-between py-1"
              >
                <span class="text-gray-800 dark:text-gray-200">{{ i + 1 }}. {{ u.email }}</span>
                <span class="text-gray-400 text-sm">{{ u.activity_count }} actions · {{ formatDateTime(u.last_activity) }}</span>
              </li>
            </ul>
            <p v-if="!(activeUsersData?.active_users?.length)" class="text-gray-500">No data.</p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { authenticatedFetch } from '@/utils/auth-requests'
import { useAuthStore } from '@/stores/auth'
import {
  fillDailySeries,
  trendBarPercent,
  trendSeriesMax,
} from '@/utils/usage-trends'
import { pageSlice, totalPages, rangeLabel, pageNumberWindow } from '@/utils/client-pager'
import {
  readLocalSignupLeadsLog,
  clearLocalSignupLeadsLog,
  readLocalLandingVisitsLog,
  clearLocalLandingVisitsLog,
  type LocalSignupLeadEntry,
  type LocalLandingVisitEntry,
} from '@/utils/clientTelemetry'

const authStore = useAuthStore()
const API = '/api/v1/admin/usage'

type SiteTrafficDay = {
  date: string
  requests: number
  pageViews: number
  cachedRequests?: number
  uniques: number
}

type SiteTrafficPayload = {
  source?: string
  zone?: string
  rangeDays?: number
  since?: string
  until?: string
  fetchedAt?: string
  totals?: {
    requests?: number
    pageViews?: number
    cachedRequests?: number
    uniques?: number
  }
  series?: SiteTrafficDay[]
  note?: string
  today?: {
    date?: string
    countries?: { country: string; requests: number; visits: number }[]
    pages?: { path: string; requests: number }[]
    apis?: { path: string; requests: number }[]
    devices?: { device: string; requests: number }[]
    browsers?: { browser: string; requests: number }[]
  }
}

const siteTraffic = ref<SiteTrafficPayload | null>(null)
const siteTrafficLoading = ref(false)
const siteTrafficError = ref('')
const localLandingVisits = ref<LocalLandingVisitEntry[]>([])
const landingVisitFilter = ref<'all' | 'mine' | 'others'>('all')
/** Override so you can set chethan@shurutech.com even if viewing as another account */
const myVisitEmailOverride = ref('')

const myVisitEmail = computed(() => {
  const override = myVisitEmailOverride.value.trim().toLowerCase()
  if (override) return override
  const fromAuth = String((authStore.user as any)?.email || '').trim().toLowerCase()
  return fromAuth || 'chethan@shurutech.com'
})

const latestDay = computed(() => {
  const series = siteTraffic.value?.series
  if (!series?.length) return null
  return series[series.length - 1]
})
const latestDayUniques = computed(() => latestDay.value?.uniques ?? '—')
const latestDayLabel = computed(() => latestDay.value?.date || '—')

function isMyLandingVisit(row: LocalLandingVisitEntry) {
  const email = String(row.email || '').trim().toLowerCase()
  return Boolean(email && email === myVisitEmail.value)
}

const myLandingVisitCount = computed(
  () => localLandingVisits.value.filter((r) => isMyLandingVisit(r)).length,
)
const otherLandingVisitCount = computed(
  () => localLandingVisits.value.length - myLandingVisitCount.value,
)

const filteredLandingVisits = computed(() => {
  const rows = localLandingVisits.value
  if (landingVisitFilter.value === 'mine') return rows.filter((r) => isMyLandingVisit(r))
  if (landingVisitFilter.value === 'others') return rows.filter((r) => !isMyLandingVisit(r))
  return rows
})

function formatSiteTrafficTime(value?: string | number) {
  if (value == null || value === '') return '—'
  const d = typeof value === 'number' ? new Date(value) : new Date(String(value))
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

async function refreshSiteTraffic() {
  siteTrafficLoading.value = true
  siteTrafficError.value = ''
  localLandingVisits.value = readLocalLandingVisitsLog()
  try {
    const res = await fetch(`/site-traffic.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(
        res.status === 404
          ? 'site-traffic.json missing — run: node scripts/fetch-cloudflare-traffic.mjs (then redeploy).'
          : `Failed to load site traffic (${res.status})`,
      )
    }
    siteTraffic.value = await res.json()
  } catch (e: any) {
    siteTrafficError.value = e?.message || 'Failed to load Cloudflare traffic snapshot'
    siteTraffic.value = null
  } finally {
    siteTrafficLoading.value = false
  }
}

function clearLocalLandingVisits() {
  clearLocalLandingVisitsLog()
  localLandingVisits.value = []
}

// Overview
const overview = ref<{
  users?: { total?: number; active?: number; inactive?: number; signups_7d?: number; signups_30d?: number }
  resources?: { companies?: number; projects?: number; specifications?: number; vendors?: number; lint_rules?: number }
  top_domains?: { domain: string; users: number }[]
  timestamp?: string
} | null>(null)
const overviewLoading = ref(true)
const overviewError = ref('')

// Trends
const trends = ref<{
  signups?: { date: string; count: number }[]
  projects?: { date: string; count: number }[]
  period_days?: number
  timestamp?: string
} | null>(null)
const trendsDays = ref(30)
const trendsLoading = ref(false)
const trendsError = ref('')

/** Sparse API series → full day window so charts don't collapse to one block. */
const signupTrendSeries = computed(() => fillDailySeries(trends.value?.signups, trendsDays.value))
const projectTrendSeries = computed(() => fillDailySeries(trends.value?.projects, trendsDays.value))

const maxSignups = computed(() => trendSeriesMax(signupTrendSeries.value))
const maxProjects = computed(() => trendSeriesMax(projectTrendSeries.value))

function trendBarHeight(count: number, type: 'signups' | 'projects') {
  const max = type === 'signups' ? maxSignups.value : maxProjects.value
  return trendBarPercent(count, max)
}

const signupTrendStart = computed(() => signupTrendSeries.value[0]?.date || '')
const signupTrendEnd = computed(() => signupTrendSeries.value[signupTrendSeries.value.length - 1]?.date || '')
const projectTrendStart = computed(() => projectTrendSeries.value[0]?.date || '')
const projectTrendEnd = computed(() => projectTrendSeries.value[projectTrendSeries.value.length - 1]?.date || '')

// Users
const usersList = ref<any[]>([])
const usersTotal = ref(0)
const usersSkip = ref(0)
const usersLimit = ref(10)
const usersPage = computed(() => Math.floor(usersSkip.value / usersLimit.value) + 1)
const usersTotalPages = computed(() => Math.max(1, Math.ceil(usersTotal.value / usersLimit.value) || 1))
const usersCanPrev = computed(() => usersPage.value > 1)
const usersCanNext = computed(() => usersPage.value < usersTotalPages.value)
const usersRangeLabel = computed(() => {
  if (!usersTotal.value) return 'Showing 0 of 0 users'
  const from = usersSkip.value + 1
  const to = Math.min(usersSkip.value + usersList.value.length, usersTotal.value)
  return `Showing ${from}–${to} of ${usersTotal.value} users · Page ${usersPage.value} of ${usersTotalPages.value}`
})
const usersPageNumbers = computed(() => {
  const total = usersTotalPages.value
  const current = usersPage.value
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  let end = Math.min(total, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const usersFilterActive = ref('')
const usersFilterDomain = ref('')
const usersLoading = ref(false)
const usersError = ref('')

function applyUsersFilters() {
  usersSkip.value = 0
  fetchUsers()
}

function goUsersPage(page: number) {
  const next = Math.min(Math.max(1, page), usersTotalPages.value)
  usersSkip.value = (next - 1) * usersLimit.value
  fetchUsers()
}

function changeUsersPageSize() {
  usersSkip.value = 0
  fetchUsers()
}

// Activity
const activity = ref<{
  activities?: { id: number; user: string; action: string; entity?: string; entity_id?: number; details?: any; created_at: string }[]
  security_events?: any[]
  time_range_hours?: number
  total_activities?: number
} | null>(null)
const activityHours = ref(24)
const activityLoading = ref(false)
const activityError = ref('')

// Domains
const domainsData = ref<{ domains?: { domain: string; users: number; companies: number; projects: number }[]; total_domains?: number } | null>(null)
const domainsLoading = ref(false)
const domainsError = ref('')
const domainsPage = ref(1)
const domainsLimit = ref(10)

type DomainRow = { domain: string; users: number; companies: number; projects: number }

const allDomains = computed<DomainRow[]>(() => domainsData.value?.domains || [])
const domainsTotal = computed(() => allDomains.value.length)
const domainsTotalPages = computed(() => Math.max(1, Math.ceil(domainsTotal.value / domainsLimit.value) || 1))
const domainsCanPrev = computed(() => domainsPage.value > 1)
const domainsCanNext = computed(() => domainsPage.value < domainsTotalPages.value)
const pagedDomains = computed(() => {
  const start = (domainsPage.value - 1) * domainsLimit.value
  return allDomains.value.slice(start, start + domainsLimit.value)
})
const domainsRangeLabel = computed(() => {
  if (!domainsTotal.value) return 'Showing 0 of 0 domains'
  const from = (domainsPage.value - 1) * domainsLimit.value + 1
  const to = Math.min(from + pagedDomains.value.length - 1, domainsTotal.value)
  return `Showing ${from}–${to} of ${domainsTotal.value} domains · Page ${domainsPage.value} of ${domainsTotalPages.value}`
})
const domainsPageNumbers = computed(() => {
  const total = domainsTotalPages.value
  const current = domainsPage.value
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  let end = Math.min(total, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function goDomainsPage(page: number) {
  domainsPage.value = Math.min(Math.max(1, page), domainsTotalPages.value)
}

function changeDomainsPageSize() {
  domainsPage.value = 1
}
// Active users
const activeUsersData = ref<{ active_users?: { email: string; activity_count: number; last_activity: string }[]; period_days?: number; total_active?: number } | null>(null)
const activeUsersLoading = ref(false)
const activeUsersError = ref('')

type SignupLeadRow = {
  email: string
  last_source?: string
  source?: string
  last_seen?: string
  last_seen_at?: string
  updated_at?: string
  created_at?: string
  converted?: boolean
  user_id?: string | number | null
}

const signupLeads = ref<SignupLeadRow[]>([])
const signupLeadsLoading = ref(false)
const signupLeadsError = ref('')
/** Shown when API is missing (404) — not a hard error */
const signupLeadsInfo = ref('')
/** True when signup-leads GET returns 404 (expected until backend adds route) */
const signupLeadsEndpointMissing = ref(false)
const localSignupLeads = ref<LocalSignupLeadEntry[]>([])
const leadsLocalSourceFilter = ref('')
const leadsLocalEmailFilter = ref('')
const localLeadsPage = ref(1)
const localLeadsLimit = ref(10)
const serverLeadsPage = ref(1)
const serverLeadsLimit = ref(10)

function leadEmailDomain(email: string | null | undefined): string {
  if (email == null || typeof email !== 'string') return '—'
  const i = email.lastIndexOf('@')
  if (i === -1 || i === email.length - 1) return '—'
  const d = email.slice(i + 1).trim()
  return d || '—'
}

const filteredLocalSignupLeads = computed(() => {
  const raw = localSignupLeads.value
  let rows = Array.isArray(raw) ? raw : []
  if (leadsLocalSourceFilter.value) {
    rows = rows.filter((r) => r?.source === leadsLocalSourceFilter.value)
  }
  const q = leadsLocalEmailFilter.value.trim().toLowerCase()
  if (q) {
    rows = rows.filter((r) => {
      const em = String(r?.email ?? '').toLowerCase()
      return em.includes(q) || leadEmailDomain(r?.email).toLowerCase().includes(q)
    })
  }
  return rows
})

const localLeadsTotal = computed(() => filteredLocalSignupLeads.value.length)
const localLeadsTotalPages = computed(() => totalPages(localLeadsTotal.value, localLeadsLimit.value))
const localLeadsCanPrev = computed(() => localLeadsPage.value > 1)
const localLeadsCanNext = computed(() => localLeadsPage.value < localLeadsTotalPages.value)
const pagedLocalSignupLeads = computed(() =>
  pageSlice(filteredLocalSignupLeads.value, localLeadsPage.value, localLeadsLimit.value),
)
const localLeadsRangeLabel = computed(() =>
  rangeLabel(
    localLeadsTotal.value,
    localLeadsPage.value,
    localLeadsLimit.value,
    pagedLocalSignupLeads.value.length,
    'leads',
  ),
)
const localLeadsPageNumbers = computed(() =>
  pageNumberWindow(localLeadsPage.value, localLeadsTotalPages.value),
)

const serverLeadsTotal = computed(() => signupLeads.value.length)
const serverLeadsTotalPages = computed(() => totalPages(serverLeadsTotal.value, serverLeadsLimit.value))
const serverLeadsCanPrev = computed(() => serverLeadsPage.value > 1)
const serverLeadsCanNext = computed(() => serverLeadsPage.value < serverLeadsTotalPages.value)
const pagedServerSignupLeads = computed(() =>
  pageSlice(signupLeads.value, serverLeadsPage.value, serverLeadsLimit.value),
)
const serverLeadsRangeLabel = computed(() =>
  rangeLabel(
    serverLeadsTotal.value,
    serverLeadsPage.value,
    serverLeadsLimit.value,
    pagedServerSignupLeads.value.length,
    'leads',
  ),
)
const serverLeadsPageNumbers = computed(() =>
  pageNumberWindow(serverLeadsPage.value, serverLeadsTotalPages.value),
)

function goLocalLeadsPage(page: number) {
  localLeadsPage.value = Math.min(Math.max(1, page), localLeadsTotalPages.value)
}
function changeLocalLeadsPageSize() {
  localLeadsPage.value = 1
}
function goServerLeadsPage(page: number) {
  serverLeadsPage.value = Math.min(Math.max(1, page), serverLeadsTotalPages.value)
}
function changeServerLeadsPageSize() {
  serverLeadsPage.value = 1
}

function refreshLocalSignupLeads() {
  localSignupLeads.value = readLocalSignupLeadsLog()
}

function applyLocalSignupLeadsFilters() {
  localLeadsPage.value = 1
  refreshLocalSignupLeads()
}

function clearLocalSignupLeads() {
  clearLocalSignupLeadsLog()
  localSignupLeads.value = []
  localLeadsPage.value = 1
}

function formatDate(s: string | number | undefined) {
  if (s === '' || s === null || s === undefined) return '—'
  try {
    return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return String(s)
  }
}
function formatDateTime(s: string) {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return s
  }
}

async function fetchOverview() {
  overviewLoading.value = true
  overviewError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/overview`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load overview'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    overview.value = await res.json()
  } catch (e: any) {
    overviewError.value = e.message || 'Failed to load overview'
  } finally {
    overviewLoading.value = false
  }
}

async function fetchTrends() {
  trendsLoading.value = true
  trendsError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/trends?days=${trendsDays.value}`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load trends'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    trends.value = await res.json()
  } catch (e: any) {
    trendsError.value = e.message || 'Failed to load trends'
  } finally {
    trendsLoading.value = false
  }
}

async function fetchUsers() {
  usersLoading.value = true
  usersError.value = ''
  try {
    const params = new URLSearchParams()
    params.set('skip', String(usersSkip.value))
    params.set('limit', String(usersLimit.value))
    if (usersFilterActive.value !== '') params.set('is_active', usersFilterActive.value)
    if (usersFilterDomain.value.trim()) params.set('domain', usersFilterDomain.value.trim())
    const res = await authenticatedFetch(`${API}/users?${params.toString()}`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load users'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    const data = await res.json()
    usersList.value = data.users || []
    usersTotal.value = data.total ?? usersList.value.length
    // Keep client-driven page size; only sync skip if API returns it
    if (typeof data.skip === 'number') usersSkip.value = data.skip
  } catch (e: any) {
    usersError.value = e.message || 'Failed to load users'
  } finally {
    usersLoading.value = false
  }
}

async function fetchActivity() {
  activityLoading.value = true
  activityError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/activity?hours=${activityHours.value}&limit=100`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load activity'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    activity.value = await res.json()
  } catch (e: any) {
    activityError.value = e.message || 'Failed to load activity'
  } finally {
    activityLoading.value = false
  }
}

async function fetchDomains() {
  domainsLoading.value = true
  domainsError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/domains`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load domains'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    domainsData.value = await res.json()
    domainsPage.value = 1
  } catch (e: any) {
    domainsError.value = e.message || 'Failed to load domains'
  } finally {
    domainsLoading.value = false
  }
}

async function fetchSignupLeads() {
  signupLeadsLoading.value = true
  signupLeadsError.value = ''
  signupLeadsInfo.value = ''
  signupLeadsEndpointMissing.value = false
  try {
    const res = await authenticatedFetch(`${API}/signup-leads?limit=100`)
    if (res.status === 404) {
      signupLeads.value = []
      signupLeadsEndpointMissing.value = true
      signupLeadsInfo.value =
        'Server list is optional: signup-leads is not deployed yet (404). Use the “This browser” table above for local captures, or add GET /api/v1/admin/usage/signup-leads when ready.'
      return
    }
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load signup leads'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    const data = (await res.json()) as Record<string, unknown>
    const raw = data.items ?? data.leads ?? data.signup_leads
    const items = Array.isArray(raw) ? raw : []
    signupLeads.value = items.map((x: unknown) => {
      const o = x as Record<string, unknown>
      const email = String(o.email ?? o.address ?? '')
      return {
        email,
        last_source: o.last_source != null ? String(o.last_source) : o.source != null ? String(o.source) : undefined,
        source: o.source != null ? String(o.source) : undefined,
        last_seen: o.last_seen != null ? String(o.last_seen) : undefined,
        last_seen_at: o.last_seen_at != null ? String(o.last_seen_at) : undefined,
        updated_at: o.updated_at != null ? String(o.updated_at) : undefined,
        created_at: o.created_at != null ? String(o.created_at) : undefined,
        converted: typeof o.converted === 'boolean' ? o.converted : undefined,
        user_id: o.user_id as string | number | null | undefined,
      } as SignupLeadRow
    }).filter((r) => r.email.includes('@'))
    serverLeadsPage.value = 1
  } catch (e: any) {
    signupLeadsError.value = e.message || 'Failed to load signup leads'
    signupLeads.value = []
  } finally {
    signupLeadsLoading.value = false
    refreshLocalSignupLeads()
  }
}

async function fetchActiveUsers() {
  activeUsersLoading.value = true
  activeUsersError.value = ''
  try {
    const res = await authenticatedFetch(`${API}/active-users?days=30`)
    if (!res.ok) {
      const text = await res.text()
      let msg = 'Failed to load active users'
      try {
        const j = JSON.parse(text)
        msg = j.detail || j.message || text
      } catch {
        msg = text || msg
      }
      throw new Error(msg)
    }
    activeUsersData.value = await res.json()
  } catch (e: any) {
    activeUsersError.value = e.message || 'Failed to load active users'
  } finally {
    activeUsersLoading.value = false
  }
}

watch(trendsDays, () => fetchTrends())
watch(activityHours, () => fetchActivity())

onMounted(async () => {
  refreshLocalSignupLeads()
  await Promise.all([
    refreshSiteTraffic(),
    fetchOverview(),
    fetchSignupLeads(),
    fetchTrends(),
    fetchUsers(),
    fetchActivity(),
    fetchDomains(),
    fetchActiveUsers(),
  ])
})
</script>
