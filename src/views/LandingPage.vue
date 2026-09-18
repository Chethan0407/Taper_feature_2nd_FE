<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-lg border-b border-dark-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="6" height="6" rx="1"/>
                <rect x="15" y="3" width="6" height="6" rx="1"/>
                <rect x="3" y="15" width="6" height="6" rx="1"/>
                <rect x="15" y="15" width="6" height="6" rx="1"/>
              </svg>
            </div>
            <span class="text-xl font-bold text-gradient">TapeOutOps</span>
          </div>

          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-300 hover:text-neon-blue transition-colors">Features</a>
            <a href="#product" class="text-gray-300 hover:text-neon-blue transition-colors">Product</a>
            <a href="#security" class="text-gray-300 hover:text-neon-blue transition-colors">Security</a>
            <a href="#integrations" class="text-gray-300 hover:text-neon-blue transition-colors">Integrations</a>
            <a href="#about" class="text-gray-300 hover:text-neon-blue transition-colors">About</a>
          </div>

          <div class="flex items-center space-x-4">
            <button
              @click="router.push('/login')"
              class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              @click="scrollToSection('demo')"
              class="px-6 py-2 text-sm font-medium bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-neon-blue/50"
            >
              Request Enterprise Pilot
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto text-center">
        <div class="mb-8">
          <span class="inline-block px-4 py-2 bg-neon-blue/10 text-neon-blue rounded-full text-sm font-medium mb-6">
            Enterprise tapeout operations for semiconductor &amp; ASIC teams
          </span>
        </div>

        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span class="text-gradient">TapeOutOps</span>
          <br />
          <span class="text-white">Workflow Infrastructure</span>
        </h1>

        <p class="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
          Gated tapeout operations for ASIC and semiconductor teams—sign-off matrices, SpecLint, and
          foundry handovers without exposing classified layout IP to a self-serve free portal.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            @click="scrollToSection('demo')"
            class="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-xl hover:opacity-90 transition-opacity shadow-2xl shadow-neon-blue/50 flex items-center space-x-2"
          >
            <span>Request an Enterprise Pilot</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
          <button
            @click="scrollToSection('demo')"
            class="px-8 py-4 text-lg font-semibold bg-dark-800 text-gray-300 border border-dark-700 rounded-xl hover:bg-dark-700 transition-colors"
          >
            Join the Private Beta
          </button>
        </div>

        <!-- Hero preview: sign-off matrix -->
        <div class="relative max-w-6xl mx-auto">
          <div class="glass-effect rounded-3xl p-1 shadow-2xl border border-neon-blue/30 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-blue/20 blur-xl opacity-50"></div>
            <div class="bg-gradient-to-br from-dark-800 via-dark-800 to-dark-900 rounded-2xl overflow-hidden relative text-left">
              <div class="bg-dark-700/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between border-b border-dark-600/50">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg"></div>
                  <span class="text-sm text-gray-300 font-medium">Tapeout Gate — Sign-off Matrix</span>
                </div>
                <span class="text-xs text-neon-blue bg-neon-blue/10 px-2 py-1 rounded">LIVE PREVIEW</span>
              </div>
              <div class="p-6 overflow-x-auto">
                <table class="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr class="text-left text-gray-500 border-b border-dark-600">
                      <th class="pb-3 font-medium">Gate</th>
                      <th class="pb-3 font-medium">Owner</th>
                      <th class="pb-3 font-medium">Status</th>
                      <th class="pb-3 font-medium">Approved by</th>
                      <th class="pb-3 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-300">
                    <tr class="border-b border-dark-700/80">
                      <td class="py-3">DRC closure</td>
                      <td class="py-3 text-gray-400">Physical Design</td>
                      <td class="py-3"><span class="text-green-400">Signed off</span></td>
                      <td class="py-3">a.chen@acme.semi</td>
                      <td class="py-3 text-gray-500">2h ago</td>
                    </tr>
                    <tr class="border-b border-dark-700/80">
                      <td class="py-3">LVS closure</td>
                      <td class="py-3 text-gray-400">Physical Design</td>
                      <td class="py-3"><span class="text-yellow-400">In review</span></td>
                      <td class="py-3 text-gray-500">—</td>
                      <td class="py-3 text-gray-500">—</td>
                    </tr>
                    <tr class="border-b border-dark-700/80">
                      <td class="py-3">Packaging handover</td>
                      <td class="py-3 text-gray-400">OSAT / Package</td>
                      <td class="py-3"><span class="text-gray-400">Pending</span></td>
                      <td class="py-3 text-gray-500">—</td>
                      <td class="py-3 text-gray-500">—</td>
                    </tr>
                    <tr>
                      <td class="py-3">Foundry tapeout package</td>
                      <td class="py-3 text-gray-400">Program Mgmt</td>
                      <td class="py-3"><span class="text-gray-400">Blocked</span></td>
                      <td class="py-3 text-gray-500">—</td>
                      <td class="py-3 text-gray-500">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">Built for tapeout operations</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Sign-off matrices, SpecLint, and foundry/OSAT handovers in one gated operational layer
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="glass-effect rounded-2xl p-6 border border-dark-700 hover:border-neon-blue/50 transition-all">
            <h3 class="text-xl font-semibold text-white mb-2">Engineering Parameter Sheets</h3>
            <p class="text-gray-400">Versioned specs and config sheets with approval workflows—not raw layout databases.</p>
          </div>
          <div class="glass-effect rounded-2xl p-6 border border-dark-700 hover:border-neon-blue/50 transition-all">
            <h3 class="text-xl font-semibold text-white mb-2">Sign-Off Matrices &amp; DRC/LVS Tracking Gates</h3>
            <p class="text-gray-400">Reusable templates for design-rule closure, ERC clean, and packaging handovers.</p>
          </div>
          <div class="glass-effect rounded-2xl p-6 border border-dark-700 hover:border-neon-blue/50 transition-all">
            <h3 class="text-xl font-semibold text-white mb-2">SpecLint Engine</h3>
            <p class="text-gray-400">Automated quality rules on project configs—keyword, PDK bound, and NDA clause checks.</p>
          </div>
          <div class="glass-effect rounded-2xl p-6 border border-dark-700 hover:border-neon-blue/50 transition-all">
            <h3 class="text-xl font-semibold text-white mb-2">Secure Foundry &amp; OSAT Handovers</h3>
            <p class="text-gray-400">Siloed staging for foundry / OSAT partners under NDA-scoped API access.</p>
          </div>
          <div class="glass-effect rounded-2xl p-6 border border-dark-700 hover:border-neon-blue/50 transition-all">
            <h3 class="text-xl font-semibold text-white mb-2">Immutable Gate Audit Trails</h3>
            <p class="text-gray-400">Who signed which tapeout gate, when—compliance-ready activity history.</p>
          </div>
          <div class="glass-effect rounded-2xl p-6 border border-dark-700 hover:border-neon-blue/50 transition-all">
            <h3 class="text-xl font-semibold text-white mb-2">Enterprise Access Control</h3>
            <p class="text-gray-400">JWT auth, RBAC, API keys—provisioned pilots only; no open free signup.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Product previews -->
    <section id="product" class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">See the workflow</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Live product clips of SpecLint, gate approvals, and vendor handoff—not vaporware mockups
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Preview 1: SpecLint GIF -->
          <div class="glass-effect rounded-2xl border border-dark-700 overflow-hidden">
            <div class="px-5 py-3 border-b border-dark-600 bg-dark-800/80">
              <h3 class="text-white font-semibold">SpecLint on upload</h3>
              <p class="text-xs text-gray-500 mt-1">Out-of-bounds parameter flagged automatically</p>
            </div>
            <div class="relative aspect-video bg-dark-950">
              <img
                v-show="gifReady.speclint"
                :src="productGifs.speclint"
                alt="Spec upload triggering SpecLint error flag"
                class="h-full w-full object-cover"
                @load="gifReady.speclint = true"
                @error="gifReady.speclint = false"
              />
              <div
                v-show="!gifReady.speclint"
                class="absolute inset-0 flex flex-col justify-center gap-3 p-5 text-sm"
              >
                <div class="rounded-lg border border-dark-600 bg-dark-800/60 p-3">
                  <p class="text-gray-300">spec_v3.xlsx uploaded</p>
                  <p class="mt-1 text-xs font-bold text-red-400">[ERROR] Block B_CLK: Frequency 3.2GHz exceeds 7nm PDK max. Tapeout blocked.</p>
                </div>
              </div>
              <!-- Hidden probe so @load/@error fire even while fallback is visible -->
              <img
                v-if="!gifReady.speclint"
                :src="productGifs.speclint"
                alt=""
                class="pointer-events-none absolute h-0 w-0 opacity-0"
                @load="gifReady.speclint = true"
                @error="gifReady.speclint = false"
              />
            </div>
          </div>

          <!-- Preview 2: Checklist approve GIF -->
          <div class="glass-effect rounded-2xl border border-dark-700 overflow-hidden">
            <div class="px-5 py-3 border-b border-dark-600 bg-dark-800/80">
              <h3 class="text-white font-semibold">DRC/LVS gate approve</h3>
              <p class="text-xs text-gray-500 mt-1">Manager approve → audit trail updates live</p>
            </div>
            <div class="relative aspect-video bg-dark-950">
              <img
                v-show="gifReady.checklist"
                :src="productGifs.checklist"
                alt="Approving DRC LVS checklist with live audit history"
                class="h-full w-full object-cover"
                @load="gifReady.checklist = true"
                @error="gifReady.checklist = false"
              />
              <div
                v-show="!gifReady.checklist"
                class="absolute inset-0 flex flex-col justify-center gap-3 p-5 text-sm"
              >
                <div class="flex justify-between rounded-lg border border-dark-600 bg-dark-800/60 p-3">
                  <span class="text-gray-300">DRC / LVS closure</span>
                  <span class="text-xs font-medium text-green-400">APPROVED</span>
                </div>
                <div class="border-l-2 border-neon-blue pl-3 text-xs text-gray-500">
                  Audit · eng.manager@acme.semi · just now
                </div>
              </div>
              <img
                v-if="!gifReady.checklist"
                :src="productGifs.checklist"
                alt=""
                class="pointer-events-none absolute h-0 w-0 opacity-0"
                @load="gifReady.checklist = true"
                @error="gifReady.checklist = false"
              />
            </div>
          </div>

          <!-- Preview 3: Vendor handoff GIF -->
          <div class="glass-effect rounded-2xl border border-dark-700 overflow-hidden">
            <div class="px-5 py-3 border-b border-dark-600 bg-dark-800/80">
              <h3 class="text-white font-semibold">Vendor performance view</h3>
              <p class="text-xs text-gray-500 mt-1">Siloed staging for foundry / OSAT handoff</p>
            </div>
            <div class="relative aspect-video bg-dark-950">
              <img
                v-show="gifReady.vendor"
                :src="productGifs.vendor"
                alt="Vendor performance view with secure file staging"
                class="h-full w-full object-cover"
                @load="gifReady.vendor = true"
                @error="gifReady.vendor = false"
              />
              <div
                v-show="!gifReady.vendor"
                class="absolute inset-0 flex flex-col justify-center gap-3 p-5 text-sm"
              >
                <div class="rounded-lg border border-dark-600 bg-dark-800/60 p-3">
                  <p class="text-gray-300">Foundry package · siloed staging</p>
                  <p class="mt-1 text-xs text-gray-500">NDA scope · response SLA 18h</p>
                </div>
              </div>
              <img
                v-if="!gifReady.vendor"
                :src="productGifs.vendor"
                alt=""
                class="pointer-events-none absolute h-0 w-0 opacity-0"
                @load="gifReady.vendor = true"
                @error="gifReady.vendor = false"
              />
            </div>
          </div>
        </div>

        <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mx-auto mb-4 text-lg font-bold text-white">1</div>
            <h3 class="text-lg font-semibold text-white mb-2">Configure Tapeout Programs</h3>
            <p class="text-gray-400 text-sm">Teams, design-rule gates, and multi-level approval chains per block.</p>
          </div>
          <div>
            <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mx-auto mb-4 text-lg font-bold text-white">2</div>
            <h3 class="text-lg font-semibold text-white mb-2">Upload &amp; Validate</h3>
            <p class="text-gray-400 text-sm">
              Upload and version engineering parameter sheets, checklist logs, and sign-off matrices.
              Execute automated linting on project configuration files—completely isolated from your raw physical layout files.
            </p>
          </div>
          <div>
            <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mx-auto mb-4 text-lg font-bold text-white">3</div>
            <h3 class="text-lg font-semibold text-white mb-2">Gate Sign-Off &amp; Foundry Handover</h3>
            <p class="text-gray-400 text-sm">DRC/LVS tracking gates with audit trails foundry PMs and OSATs can trust.</p>
          </div>
        </div>

        <!-- Security pillars — immediately under the 3-step story -->
        <div class="mt-16" data-testid="security-pillars">
          <div class="text-center mb-8">
            <h3 class="text-2xl md:text-3xl font-bold text-white mb-2">Security pillars</h3>
            <p class="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Built for foundry NDAs—isolation and encryption before any pilot starts
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-effect rounded-xl p-6 border border-dark-700 text-left">
              <p class="text-neon-blue text-xs font-semibold uppercase tracking-wide mb-2">Data protection</p>
              <h4 class="text-white font-semibold mb-2">End-to-End TLS 1.3 &amp; AES-256</h4>
              <p class="text-gray-400 text-sm">Transit encryption plus AES-256 storage encryption for operational metadata at rest.</p>
            </div>
            <div class="glass-effect rounded-xl p-6 border border-dark-700 text-left">
              <p class="text-neon-blue text-xs font-semibold uppercase tracking-wide mb-2">Deployment options</p>
              <h4 class="text-white font-semibold mb-2">Isolated cloud VPC <span class="text-xs font-medium text-sky-300">(ops)</span></h4>
              <p class="text-gray-400 text-sm">
                TLS 1.3, AES-256, VPC segmentation, backups, firewalls, Datadog monitoring.
                On-prem / dedicated VPC and GovCloud are roadmap.
              </p>
            </div>
            <div class="glass-effect rounded-xl p-6 border border-dark-700 text-left">
              <p class="text-neon-blue text-xs font-semibold uppercase tracking-wide mb-2">Compliance roadmap</p>
              <h4 class="text-white font-semibold mb-2">SOC 2 Type II <span class="text-xs font-medium text-violet-300">(roadmap)</span></h4>
              <p class="text-gray-400 text-sm">Controls aligned toward SOC 2 Type II — not certified. Questionnaires available for pilots.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Security Architecture -->
    <section id="security" class="py-20 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">Security Architecture</h2>
          <p class="text-xl text-gray-400 max-w-3xl mx-auto">
            Designed for foundry-customer NDA paranoia—encryption, isolation, and a clear compliance roadmap
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div class="glass-effect rounded-xl p-6 border border-dark-700">
            <p class="text-neon-blue text-xs font-semibold uppercase tracking-wide mb-2">In transit</p>
            <h3 class="text-white font-semibold mb-2">TLS 1.3</h3>
            <p class="text-gray-400 text-sm">All browser ↔ API traffic encrypted end to end.</p>
          </div>
          <div class="glass-effect rounded-xl p-6 border border-dark-700">
            <p class="text-neon-blue text-xs font-semibold uppercase tracking-wide mb-2">At rest</p>
            <h3 class="text-white font-semibold mb-2">AES-256</h3>
            <p class="text-gray-400 text-sm">Stored artifacts and databases encrypted at rest.</p>
          </div>
          <div class="glass-effect rounded-xl p-6 border border-dark-700">
            <p class="text-neon-blue text-xs font-semibold uppercase tracking-wide mb-2">Deployment</p>
            <h3 class="text-white font-semibold mb-2">Private VPC</h3>
            <p class="text-gray-400 text-sm">Cloud VPC deploy today; on-prem / dedicated VPC roadmap for IP-sensitive customers.</p>
          </div>
          <div class="glass-effect rounded-xl p-6 border border-dark-700">
            <p class="text-neon-blue text-xs font-semibold uppercase tracking-wide mb-2">Compliance</p>
            <h3 class="text-white font-semibold mb-2">SOC 2 Type II (roadmap)</h3>
            <p class="text-gray-400 text-sm">Not certified. Controls aligned toward SOC 2 Type II; security reviews available for pilots.</p>
          </div>
        </div>

        <div class="text-center">
          <router-link
            to="/security"
            class="inline-flex items-center text-neon-blue hover:text-neon-purple transition-colors font-medium"
          >
            Full security overview
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Integrations -->
    <section id="integrations" class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">Fits how teams already work</h2>
          <p class="text-xl text-gray-400 max-w-3xl mx-auto">
            Operational connectors for sign-off automation—plus a clear boundary with EDA and foundry layout tools
          </p>
        </div>

        <!-- Tier 1: Live / operational connectors -->
        <div class="mb-12">
          <h3 class="text-xl font-semibold text-white mb-2">Live connectors — operational data</h3>
          <p class="text-gray-400 text-sm mb-6 max-w-3xl">
            Automate sign-off updates natively via your existing CI/CD pipelines and ticketing systems.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass-effect rounded-2xl p-8 border border-dark-700">
              <h4 class="text-lg font-semibold text-white mb-4">Version control &amp; ticketing</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="name in ['Jira', 'GitLab', 'GitHub']" :key="name" class="px-3 py-1.5 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-300">{{ name }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-4">Roadmap: sync gates ↔ issues and MR/PR status</p>
            </div>
            <div class="glass-effect rounded-2xl p-8 border border-dark-700">
              <h4 class="text-lg font-semibold text-white mb-4">CI/CD &amp; EDA scripting hooks</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="name in ['Python', 'TCL', 'Jenkins']" :key="name" class="px-3 py-1.5 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-300">{{ name }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-4">Roadmap: webhook / CLI hooks from regression farms</p>
            </div>
          </div>
          <div class="mt-6 glass-effect rounded-2xl p-6 border border-dark-700">
            <h4 class="text-sm font-semibold text-white mb-3">Cloud &amp; on-prem artifact refs</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="name in ['Perforce', 'AWS', 'Azure']" :key="'store-' + name" class="px-3 py-1.5 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-300">{{ name }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-3">Depot-aware references without forcing layout data out of your VPC</p>
          </div>
        </div>

        <!-- Tier 2: EDA & Foundry firewall -->
        <div class="glass-effect rounded-2xl p-8 md:p-10 border border-neon-blue/30 bg-neon-blue/5">
          <p class="text-neon-blue text-xs font-semibold uppercase tracking-wide mb-3">The EDA &amp; Foundry firewall</p>
          <h3 class="text-2xl font-bold text-white mb-4">We orchestrate metadata and sign-offs—not raw GDSII</h3>
          <p class="text-gray-300 leading-relaxed mb-4 max-w-4xl">
            TapeOutOps manages checklists, SpecLint results, approval status, and vendor collaboration metadata.
            We do <span class="text-white font-medium">not</span> ingest or rewrite multi-gigabyte GDSII/OASIS layout databases.
            Layout stays inside your existing EDA vault and foundry NDA perimeter.
          </p>
          <p class="text-gray-400 text-sm mb-4">Planned compatibility with tool <span class="text-gray-300">states and reports</span> (roadmaps—not layout mutation):</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="name in ['Siemens Calibre', 'Synopsys IC Compiler II', 'Cadence Pegasus']"
              :key="name"
              class="px-3 py-1.5 text-sm bg-dark-900/80 border border-dark-600 rounded-lg text-gray-300"
            >{{ name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo / Enterprise Pilot CTA -->
    <section id="demo" class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-blue/10">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-10">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
            Request an Enterprise Pilot
          </h2>
          <p class="text-xl text-gray-400">
            Join the private beta—gated access for teams handling proprietary IP under foundry NDAs.
          </p>
        </div>

        <form
          class="glass-effect rounded-2xl p-8 border border-dark-700 space-y-5"
          @submit.prevent="submitDemoRequest"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm text-gray-400 mb-1.5">Name</label>
              <input
                v-model="demoForm.name"
                required
                maxlength="120"
                class="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white focus:border-neon-blue outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1.5">Work email</label>
              <input
                v-model="demoForm.email"
                type="email"
                required
                class="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white focus:border-neon-blue outline-none"
                placeholder="you@company.com"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm text-gray-400 mb-1.5">Company</label>
              <input
                v-model="demoForm.company"
                required
                maxlength="200"
                class="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white focus:border-neon-blue outline-none"
                placeholder="Company / design house"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1.5">Role</label>
              <input
                v-model="demoForm.role"
                maxlength="120"
                class="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white focus:border-neon-blue outline-none"
                placeholder="e.g. PD lead, VP Eng"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1.5">Interest</label>
            <select
              v-model="demoForm.interest"
              class="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white focus:border-neon-blue outline-none"
            >
              <option value="request_demo">Request an Enterprise Pilot</option>
              <option value="enterprise_pilot">Join the Private Beta</option>
              <option value="security_review">Security / architecture review</option>
              <option value="investor_data_room">Investor / Data Room Access</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1.5">Message (optional)</label>
            <textarea
              v-model="demoForm.message"
              rows="3"
              maxlength="2000"
              class="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-white focus:border-neon-blue outline-none resize-y"
              placeholder="Process node, team size, VPC / on-prem needs…"
            />
          </div>

          <p v-if="demoError" class="text-sm text-red-400">{{ demoError }}</p>
          <p v-if="demoSuccess" class="text-sm text-green-400">{{ demoSuccess }}</p>

          <button
            type="submit"
            :disabled="demoSubmitting"
            class="w-full sm:w-auto px-8 py-3 font-semibold bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {{ demoSubmitting ? 'Sending…' : 'Submit request' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Already provisioned?
          <button @click="router.push('/login')" class="text-neon-blue hover:underline ml-1">Sign in</button>
        </p>
      </div>
    </section>

    <!-- About / Founder -->
    <section id="about" class="py-20 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">About TapeOutOps</h2>
          <p class="text-xl text-gray-400 max-w-3xl mx-auto">
            Operational infrastructure for semiconductor tapeout—built by someone who lived the workflow pain
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-16">
          <div class="glass-effect rounded-2xl p-8 border border-dark-700 h-full flex flex-col">
            <h3 class="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p class="text-gray-400 leading-relaxed mb-4">
              Semiconductor tapeout workflows are fragmented across email and spreadsheets—while foundry NDAs
              demand isolation. TapeOutOps is gated workflow infrastructure for sign-off matrices, SpecLint,
              and secure foundry/OSAT handovers with an immutable audit trail.
            </p>
            <p class="text-gray-400 leading-relaxed grow">
              We never ask you to park GDSII or PDK crown jewels behind a free self-serve signup. Pilots are
              provisioned with tenant isolation, encryption, and a SOC 2–aligned control roadmap.
            </p>
          </div>

          <div class="glass-effect rounded-2xl p-8 border border-dark-700 h-full flex flex-col">
            <div class="flex items-center mb-6">
              <img
                src="/founder-photo.jpg"
                alt="Chethan Gopal, Founder of TapeOutOps"
                class="w-20 h-20 rounded-full object-cover border-2 border-neon-blue/50 shadow-lg mr-4"
                style="object-position: center 10%;"
              />
              <div>
                <h3 class="text-2xl font-bold text-white">Chethan Gopal</h3>
                <p class="text-neon-blue">Founder · VLSI / Semiconductor</p>
              </div>
            </div>
            <p class="text-gray-400 leading-relaxed mb-4">
              Chethan brings deep domain background in VLSI and semiconductor operations. After extensive
              conversations with ASIC and design-ops leads, he built TapeOutOps to replace fragmented EDA/fab
              handoffs with a single operational system of record.
            </p>
            <p class="text-gray-400 leading-relaxed grow">
              As a solo founder, domain credibility is the product’s foundation—every gate, checklist, and
              audit trail is shaped by real tapeout constraints, not generic project-management defaults.
            </p>
            <div class="mt-auto pt-6 flex flex-wrap items-center gap-4">
              <a
                href="https://www.linkedin.com/in/chethan-gopal"
                target="_blank"
                rel="noopener noreferrer"
                class="text-neon-blue hover:text-neon-purple transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              <a href="mailto:support@tapeoutops.com" class="text-gray-400 hover:text-neon-blue transition-colors flex items-center">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-4 sm:px-6 lg:px-8 border-t border-dark-700">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="6" height="6" rx="1"/>
                  <rect x="15" y="3" width="6" height="6" rx="1"/>
                  <rect x="3" y="15" width="6" height="6" rx="1"/>
                  <rect x="15" y="15" width="6" height="6" rx="1"/>
                </svg>
              </div>
              <span class="text-xl font-bold text-gradient">TapeOutOps</span>
            </div>
            <p class="text-gray-400 text-sm">
              Enterprise tapeout workflow infrastructure for semiconductor teams.
            </p>
          </div>

          <div>
            <h4 class="text-white font-bold mb-4">Product</h4>
            <ul class="space-y-2 text-sm text-gray-300">
              <li><a href="#features" class="hover:text-neon-blue transition-colors">Features</a></li>
              <li><a href="#product" class="hover:text-neon-blue transition-colors">Product</a></li>
              <li><a href="#integrations" class="hover:text-neon-blue transition-colors">Integrations</a></li>
              <li><router-link to="/documentation" class="hover:text-neon-blue transition-colors">Documentation</router-link></li>
            </ul>
          </div>

          <div>
            <h4 class="text-white font-semibold mb-4">Company</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#about" class="hover:text-neon-blue transition-colors">About</a></li>
              <li><a href="#demo" class="hover:text-neon-blue transition-colors">Request Enterprise Pilot</a></li>
              <li>
                <a href="mailto:support@tapeoutops.com" class="hover:text-neon-blue transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-white font-semibold mb-4">Legal</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><router-link to="/privacy" class="hover:text-neon-blue transition-colors">Privacy</router-link></li>
              <li><router-link to="/terms" class="hover:text-neon-blue transition-colors">Terms</router-link></li>
              <li><router-link to="/security" class="hover:text-neon-blue transition-colors">Security</router-link></li>
            </ul>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-dark-700 text-center text-sm text-gray-400">
          <p>&copy; 2026 TapeOutOps. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { reportLandingVisit } from '@/utils/clientTelemetry'
import { resolveApiUrl } from '@/config/api'

const router = useRouter()
const authStore = useAuthStore()

const demoForm = reactive({
  name: '',
  email: '',
  company: '',
  role: '',
  message: '',
  interest: 'enterprise_pilot',
})
const demoSubmitting = ref(false)
const demoError = ref('')
const demoSuccess = ref('')
const gifReady = reactive({
  speclint: false,
  checklist: false,
  vendor: false,
})
/** Public folder URLs — not Vite module imports */
const productGifs = {
  speclint: '/product/speclint-upload.gif',
  checklist: '/product/checklist-approve.gif',
  vendor: '/product/vendor-handoff.gif',
}

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    try {
      await authStore.checkAuth()
    } catch {
      /* ignore */
    }
  }
  const user = authStore.user as { email?: string; full_name?: string; name?: string; id?: string | number } | null
  reportLandingVisit(
    user
      ? {
          email: user.email,
          name: user.full_name || user.name,
          userId: user.id,
        }
      : undefined,
  )
})

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

async function submitDemoRequest() {
  demoError.value = ''
  demoSuccess.value = ''
  demoSubmitting.value = true
  try {
    const res = await fetch(resolveApiUrl('/api/v1/public/demo-request'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: demoForm.name.trim(),
        email: demoForm.email.trim(),
        company: demoForm.company.trim(),
        role: demoForm.role.trim() || null,
        message: demoForm.message.trim() || null,
        interest: demoForm.interest,
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const detail = body.detail
      const msg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(', ')
            : body.message
      throw new Error(msg || `Request failed (${res.status})`)
    }
    const payload = await res.json().catch(() => ({}))
    demoSuccess.value =
      payload.message ||
      (demoForm.interest === 'investor_data_room'
        ? 'Thanks — check your inbox for Data Room access (or we will follow up shortly).'
        : "Thanks — we'll follow up shortly about the enterprise pilot.")
    demoForm.name = ''
    demoForm.email = ''
    demoForm.company = ''
    demoForm.role = ''
    demoForm.message = ''
    demoForm.interest = 'enterprise_pilot'
  } catch (e: unknown) {
    demoError.value = e instanceof Error ? e.message : 'Something went wrong. Email support@tapeoutops.com.'
  } finally {
    demoSubmitting.value = false
  }
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass-effect {
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
