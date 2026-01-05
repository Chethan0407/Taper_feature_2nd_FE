<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-lg border-b border-dark-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
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

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-300 hover:text-neon-blue transition-colors">Features</a>
            <a href="#how-it-works" class="text-gray-300 hover:text-neon-blue transition-colors">How It Works</a>
            <a href="#about" class="text-gray-300 hover:text-neon-blue transition-colors">About</a>
            <a href="/about" class="text-gray-300 hover:text-neon-blue transition-colors">About Page</a>
          </div>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <button
              @click="router.push('/login')"
              class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              @click="router.push('/login')"
              class="px-6 py-2 text-sm font-medium bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-neon-blue/50"
            >
              Get Started
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
            Streamline Your Semiconductor Tapeout Workflow
          </span>
        </div>
        
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span class="text-gradient">TapeOutOps</span>
          <br />
          <span class="text-white">Workflow Management</span>
        </h1>
        
        <p class="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
          Professional platform for managing specifications, checklists, and vendor communications
          throughout your semiconductor tapeout process.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            @click="router.push('/login')"
            class="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-xl hover:opacity-90 transition-opacity shadow-2xl shadow-neon-blue/50 flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
          <button
            @click="scrollToSection('features')"
            class="px-8 py-4 text-lg font-semibold bg-dark-800 text-gray-300 border border-dark-700 rounded-xl hover:bg-dark-700 transition-colors"
          >
            Learn More
          </button>
        </div>

        <!-- Hero Image/Preview -->
        <div class="relative max-w-6xl mx-auto">
          <div class="glass-effect rounded-3xl p-1 shadow-2xl border border-neon-blue/30 overflow-hidden">
            <!-- Glow border effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-blue/20 blur-xl opacity-50"></div>
            
            <!-- Mock Dashboard Preview -->
            <div class="bg-gradient-to-br from-dark-800 via-dark-800 to-dark-900 rounded-2xl overflow-hidden relative">
              <!-- Mock Header -->
              <div class="bg-dark-700/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between border-b border-dark-600/50">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="6" height="6" rx="1"/>
                      <rect x="15" y="3" width="6" height="6" rx="1"/>
                      <rect x="3" y="15" width="6" height="6" rx="1"/>
                      <rect x="15" y="15" width="6" height="6" rx="1"/>
                    </svg>
                  </div>
                  <div class="h-3 w-24 bg-dark-600/60 rounded animate-pulse"></div>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-7 h-7 bg-dark-600/60 rounded-full"></div>
                  <div class="w-7 h-7 bg-dark-600/60 rounded-full"></div>
                </div>
              </div>
              
              <!-- Mock Content -->
              <div class="p-6 space-y-6">
                <!-- Stats Cards -->
                <div class="grid grid-cols-4 gap-4">
                  <div class="glass-effect rounded-xl p-4 border border-dark-600/50 hover:border-neon-blue/50 transition-colors">
                    <div class="flex items-center justify-between mb-3">
                      <div class="h-2.5 w-20 bg-dark-600/40 rounded"></div>
                      <div class="w-3 h-3 bg-neon-blue/30 rounded"></div>
                    </div>
                    <div class="h-7 w-16 bg-neon-blue/20 rounded-lg mb-1"></div>
                    <div class="h-2 w-12 bg-dark-600/30 rounded"></div>
                  </div>
                  <div class="glass-effect rounded-xl p-4 border border-dark-600/50 hover:border-green-500/50 transition-colors">
                    <div class="flex items-center justify-between mb-3">
                      <div class="h-2.5 w-20 bg-dark-600/40 rounded"></div>
                      <div class="w-3 h-3 bg-green-500/30 rounded"></div>
                    </div>
                    <div class="h-7 w-16 bg-green-500/20 rounded-lg mb-1"></div>
                    <div class="h-2 w-12 bg-dark-600/30 rounded"></div>
                  </div>
                  <div class="glass-effect rounded-xl p-4 border border-dark-600/50 hover:border-yellow-500/50 transition-colors">
                    <div class="flex items-center justify-between mb-3">
                      <div class="h-2.5 w-20 bg-dark-600/40 rounded"></div>
                      <div class="w-3 h-3 bg-yellow-500/30 rounded"></div>
                    </div>
                    <div class="h-7 w-16 bg-yellow-500/20 rounded-lg mb-1"></div>
                    <div class="h-2 w-12 bg-dark-600/30 rounded"></div>
                  </div>
                  <div class="glass-effect rounded-xl p-4 border border-dark-600/50 hover:border-purple-500/50 transition-colors">
                    <div class="flex items-center justify-between mb-3">
                      <div class="h-2.5 w-20 bg-dark-600/40 rounded"></div>
                      <div class="w-3 h-3 bg-purple-500/30 rounded"></div>
                    </div>
                    <div class="h-7 w-16 bg-purple-500/20 rounded-lg mb-1"></div>
                    <div class="h-2 w-12 bg-dark-600/30 rounded"></div>
                  </div>
                </div>
                
                <!-- Main Content Area -->
                <div class="grid grid-cols-3 gap-4">
                  <div class="col-span-2 glass-effect rounded-xl p-5 border border-dark-600/50">
                    <div class="h-4 w-32 bg-dark-600/40 rounded mb-5"></div>
                    <div class="space-y-3">
                      <div class="flex items-center space-x-3 p-3 bg-dark-700/30 rounded-lg border border-dark-600/30">
                        <div class="w-10 h-10 bg-neon-blue/20 rounded-lg"></div>
                        <div class="flex-1 space-y-2">
                          <div class="h-3 w-3/4 bg-dark-600/40 rounded"></div>
                          <div class="h-2 w-1/2 bg-dark-600/30 rounded"></div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-3 p-3 bg-dark-700/30 rounded-lg border border-dark-600/30">
                        <div class="w-10 h-10 bg-green-500/20 rounded-lg"></div>
                        <div class="flex-1 space-y-2">
                          <div class="h-3 w-2/3 bg-dark-600/40 rounded"></div>
                          <div class="h-2 w-1/2 bg-dark-600/30 rounded"></div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-3 p-3 bg-dark-700/30 rounded-lg border border-dark-600/30">
                        <div class="w-10 h-10 bg-yellow-500/20 rounded-lg"></div>
                        <div class="flex-1 space-y-2">
                          <div class="h-3 w-4/5 bg-dark-600/40 rounded"></div>
                          <div class="h-2 w-1/2 bg-dark-600/30 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="glass-effect rounded-xl p-5 border border-dark-600/50">
                    <div class="h-4 w-24 bg-dark-600/40 rounded mb-5"></div>
                    <div class="space-y-3">
                      <div class="p-3 bg-dark-700/30 rounded-lg border border-dark-600/30">
                        <div class="h-2.5 w-full bg-dark-600/40 rounded mb-2"></div>
                        <div class="h-2 w-2/3 bg-dark-600/30 rounded"></div>
                      </div>
                      <div class="p-3 bg-dark-700/30 rounded-lg border border-dark-600/30">
                        <div class="h-2.5 w-full bg-dark-600/40 rounded mb-2"></div>
                        <div class="h-2 w-2/3 bg-dark-600/30 rounded"></div>
                      </div>
                      <div class="p-3 bg-dark-700/30 rounded-lg border border-dark-600/30">
                        <div class="h-2.5 w-full bg-dark-600/40 rounded mb-2"></div>
                        <div class="h-2 w-2/3 bg-dark-600/30 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">Powerful Features</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to manage your tapeout workflow efficiently
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1: Specifications -->
          <div class="glass-effect rounded-2xl p-6 hover:border-neon-blue/50 transition-all border border-dark-700">
            <div class="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Specifications Management</h3>
            <p class="text-gray-400">
              Upload, version, and track specifications with automated approval workflows and inline previews.
            </p>
          </div>

          <!-- Feature 2: Checklists -->
          <div class="glass-effect rounded-2xl p-6 hover:border-neon-blue/50 transition-all border border-dark-700">
            <div class="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Checklist Automation</h3>
            <p class="text-gray-400">
              Create reusable templates and automate multi-level approval workflows with due date tracking.
            </p>
          </div>

          <!-- Feature 3: SpecLint -->
          <div class="glass-effect rounded-2xl p-6 hover:border-neon-blue/50 transition-all border border-dark-700">
            <div class="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">SpecLint Engine</h3>
            <p class="text-gray-400">
              Automated quality validation with custom rules, keyword detection, and NDA clause verification.
            </p>
          </div>

          <!-- Feature 4: Vendor Management -->
          <div class="glass-effect rounded-2xl p-6 hover:border-neon-blue/50 transition-all border border-dark-700">
            <div class="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Vendor Management</h3>
            <p class="text-gray-400">
              Track vendor communications, NDA management, and response times with timeline visualization.
            </p>
          </div>

          <!-- Feature 5: Project Dashboard -->
          <div class="glass-effect rounded-2xl p-6 hover:border-neon-blue/50 transition-all border border-dark-700">
            <div class="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Project Dashboard</h3>
            <p class="text-gray-400">
              Real-time project overview with quality scores, approval rates, and completion tracking.
            </p>
          </div>

          <!-- Feature 6: Security -->
          <div class="glass-effect rounded-2xl p-6 hover:border-neon-blue/50 transition-all border border-dark-700">
            <div class="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
            <p class="text-gray-400">
              JWT authentication, role-based access control, API key management, and audit trails.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Simple workflow to streamline your tapeout process
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
              1
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Create Projects</h3>
            <p class="text-gray-400">
              Set up your tapeout projects and configure team members and workflows.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
              2
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Upload & Validate</h3>
            <p class="text-gray-400">
              Upload specifications, run automated linting, and link checklists to ensure quality.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
              3
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Track & Approve</h3>
            <p class="text-gray-400">
              Monitor approval workflows, track vendor communications, and maintain audit trails.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-blue/10">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Streamline Your Workflow?
        </h2>
        <p class="text-xl text-gray-400 mb-8">
          Join teams using TapeOutOps to manage their semiconductor tapeout processes efficiently.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            @click="router.push('/login')"
            class="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-xl hover:opacity-90 transition-opacity shadow-2xl shadow-neon-blue/50"
          >
            Get Started Free
          </button>
          <button
            @click="router.push('/login')"
            class="px-8 py-4 text-lg font-semibold bg-dark-800 text-gray-300 border border-dark-700 rounded-xl hover:bg-dark-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-20 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">About TapeOutOps</h2>
          <p class="text-xl text-gray-400 max-w-3xl mx-auto">
            Revolutionizing semiconductor tapeout workflows with cutting-edge technology
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <!-- Product Story -->
          <div class="glass-effect rounded-2xl p-8 border border-dark-700">
            <div class="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p class="text-gray-400 leading-relaxed mb-4">
              TapeOutOps was born from a simple observation: semiconductor tapeout workflows are complex, fragmented, and often inefficient. We set out to create a unified platform that brings together all aspects of the tapeout process—from specification management to quality checks and vendor collaboration.
            </p>
            <p class="text-gray-400 leading-relaxed">
              Our platform empowers engineering teams to streamline their workflows, reduce errors, and accelerate time-to-market. With intelligent automation, real-time collaboration, and comprehensive quality assurance, TapeOutOps transforms how semiconductor companies manage their tapeout processes.
            </p>
          </div>

          <!-- Founder Story -->
          <div class="glass-effect rounded-2xl p-8 border border-dark-700">
            <div class="flex items-center mb-6">
              <div class="w-20 h-20 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center text-2xl font-bold text-white mr-4">
                C
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">Chethan</h3>
                <p class="text-neon-blue">Founder</p>
              </div>
            </div>
            <p class="text-gray-400 leading-relaxed mb-4">
              As the founder of TapeOutOps, I've spent years working in semiconductor design and witnessed firsthand the challenges teams face during tapeout. The lack of integrated tools, manual processes, and communication gaps between teams inspired me to build a solution that addresses these pain points.
            </p>
            <p class="text-gray-400 leading-relaxed">
              TapeOutOps represents my vision of a modern, efficient tapeout workflow—one where engineers can focus on what they do best: designing exceptional chips. Every feature we build is driven by real-world needs and feedback from the semiconductor community.
            </p>
            <div class="mt-6 flex items-center space-x-4">
              <a href="mailto:support@tapeoutops.com" class="text-neon-blue hover:text-neon-purple transition-colors flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Get in Touch
              </a>
            </div>
          </div>
        </div>

        <!-- Key Values -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-effect rounded-xl p-6 border border-dark-700 text-center">
            <div class="w-12 h-12 bg-neon-blue/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2">Innovation First</h4>
            <p class="text-gray-400 text-sm">We continuously push the boundaries of what's possible in tapeout management.</p>
          </div>

          <div class="glass-effect rounded-xl p-6 border border-dark-700 text-center">
            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2">User-Centric</h4>
            <p class="text-gray-400 text-sm">Every feature is designed with engineers and their workflows in mind.</p>
          </div>

          <div class="glass-effect rounded-xl p-6 border border-dark-700 text-center">
            <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2">Reliable & Secure</h4>
            <p class="text-gray-400 text-sm">Enterprise-grade security and reliability for mission-critical workflows.</p>
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
              Streamlining semiconductor tapeout workflows with modern web technology.
            </p>
          </div>

          <div>
            <h4 class="text-white font-semibold mb-4">Product</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#features" class="hover:text-neon-blue transition-colors">Features</a></li>
              <li><a href="#how-it-works" class="hover:text-neon-blue transition-colors">How It Works</a></li>
              <li><a href="#" class="hover:text-neon-blue transition-colors">Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-white font-semibold mb-4">Company</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#about" class="hover:text-neon-blue transition-colors">About</a></li>
              <li><a href="/about" class="hover:text-neon-blue transition-colors">About Page</a></li>
              <li><a href="#" class="hover:text-neon-blue transition-colors">Contact</a></li>
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
import { useRouter } from 'vue-router'

const router = useRouter()

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

