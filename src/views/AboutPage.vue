<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-lg border-b border-dark-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center cursor-pointer" @click="router.push('/')">
              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="6" height="6" rx="1"/>
                <rect x="15" y="3" width="6" height="6" rx="1"/>
                <rect x="3" y="15" width="6" height="6" rx="1"/>
                <rect x="15" y="15" width="6" height="6" rx="1"/>
              </svg>
            </div>
            <span class="text-xl font-bold text-gradient cursor-pointer" @click="router.push('/')">TapeOutOps</span>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="/#features" class="text-gray-300 hover:text-neon-blue transition-colors">Features</a>
            <a href="/#how-it-works" class="text-gray-300 hover:text-neon-blue transition-colors">How It Works</a>
            <a href="/#about" class="text-gray-300 hover:text-neon-blue transition-colors">About</a>
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
    <section class="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
          About <span class="text-gradient">TapeOutOps</span>
        </h1>
        <p class="text-xl text-gray-400 max-w-2xl mx-auto">
          Empowering semiconductor teams with intelligent tapeout workflow management
        </p>
      </div>
    </section>

    <!-- Our Story Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="glass-effect rounded-3xl p-8 md:p-12 border border-dark-700 mb-12">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-white mb-4">Our Story</h2>
            <div class="w-24 h-1 bg-gradient-to-r from-neon-blue to-neon-purple mx-auto rounded"></div>
          </div>
          
          <div class="prose prose-invert max-w-none">
            <p class="text-lg text-gray-300 leading-relaxed mb-6">
              TapeOutOps was founded with a clear vision: to revolutionize how semiconductor companies manage their tapeout processes. The journey began when our founder, Chethan, recognized the significant challenges engineering teams face during the critical tapeout phase.
            </p>
            
            <p class="text-lg text-gray-300 leading-relaxed mb-6">
              After extensive research and conversations with engineering teams, we recognized the significant challenges they face with fragmented tools, manual processes, and communication gaps during tapeout. This inspired us to build a unified platform that brings everything together. TapeOutOps is the result of that vision—a comprehensive solution designed by engineers, for engineers.
            </p>
            
            <p class="text-lg text-gray-300 leading-relaxed">
              Today, TapeOutOps helps teams streamline their workflows, reduce errors, accelerate time-to-market, and collaborate more effectively. We're committed to continuous innovation, always listening to our community and evolving to meet the ever-changing needs of the semiconductor industry.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Founder Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-white mb-4">Meet the Founder</h2>
          <p class="text-xl text-gray-400">The vision behind TapeOutOps</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <div class="glass-effect rounded-3xl p-8 md:p-12 border border-dark-700">
            <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
              <!-- Founder Avatar -->
              <div class="flex-shrink-0">
                <div class="w-32 h-32 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-neon-blue/50">
                  C
                </div>
              </div>

              <!-- Founder Info -->
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-3xl font-bold text-white mb-2">Chethan</h3>
                <p class="text-neon-blue text-lg mb-6">Founder</p>
                
                <div class="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    As the founder of TapeOutOps, I've dedicated myself to understanding and solving the complex challenges in semiconductor tapeout processes. Through extensive research, conversations with engineering teams, and deep analysis of industry workflows, I've gained valuable insights into the pain points that slow down innovation.
                  </p>
                  
                  <p>
                    The idea for TapeOutOps emerged from extensive discussions with engineering teams who identified significant inefficiencies in existing workflows, particularly the lack of integrated tools and the substantial time investment required for manual processes. Through this analysis, it became clear that the industry needed more than just another tool—it required a comprehensive platform that deeply understands the tapeout workflow and systematically addresses operational challenges.
                  </p>
                  
                  <p>
                    Every feature we build, every decision we make, is driven by one question: "Will this make engineers' lives easier?" We're not just building software; we're building a solution that empowers teams to focus on what they do best—creating exceptional semiconductor designs.
                  </p>
                  
                  <p class="text-gray-400 italic">
                    "Our mission is simple: eliminate the friction in tapeout workflows so engineers can innovate faster and with greater confidence."
                  </p>
                </div>

                <!-- Contact -->
                <div class="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <a href="mailto:support@tapeoutops.com" class="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span>Get in Touch</span>
                  </a>
                  <a href="https://www.linkedin.com/in/chethan-gopal/" target="_blank" rel="noopener noreferrer" class="px-6 py-3 bg-dark-700 text-gray-300 border border-dark-600 rounded-lg hover:bg-dark-600 transition-colors flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Values Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-white mb-4">Our Values</h2>
          <p class="text-xl text-gray-400">What drives us every day</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="glass-effect rounded-2xl p-8 border border-dark-700 hover:border-neon-blue/50 transition-colors">
            <div class="w-16 h-16 bg-neon-blue/20 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Innovation First</h3>
            <p class="text-gray-400 leading-relaxed">
              We continuously push the boundaries of what's possible in tapeout management. Our team stays ahead of industry trends and technologies to deliver cutting-edge solutions.
            </p>
          </div>

          <div class="glass-effect rounded-2xl p-8 border border-dark-700 hover:border-green-500/50 transition-colors">
            <div class="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">User-Centric Design</h3>
            <p class="text-gray-400 leading-relaxed">
              Every feature is designed with engineers and their workflows in mind. We listen to our users, iterate based on feedback, and prioritize what matters most to them.
            </p>
          </div>

          <div class="glass-effect rounded-2xl p-8 border border-dark-700 hover:border-purple-500/50 transition-colors">
            <div class="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Reliability & Security</h3>
            <p class="text-gray-400 leading-relaxed">
              Enterprise-grade security and reliability for mission-critical workflows. Your data and processes are protected with industry-leading security measures.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-blue/10">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold text-white mb-6">
          Ready to Transform Your Workflow?
        </h2>
        <p class="text-xl text-gray-400 mb-8">
          Join the teams using TapeOutOps to streamline their tapeout processes.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            @click="router.push('/login')"
            class="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-xl hover:opacity-90 transition-opacity shadow-2xl shadow-neon-blue/50"
          >
            Get Started Free
          </button>
          <button
            @click="router.push('/')"
            class="px-8 py-4 text-lg font-semibold bg-dark-800 text-gray-300 border border-dark-700 rounded-xl hover:bg-dark-700 transition-colors"
          >
            Back to Home
          </button>
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
            <h4 class="text-white font-bold mb-4">Product</h4>
            <ul class="space-y-2 text-sm text-gray-300">
              <li><a href="/#features" class="hover:text-neon-blue transition-colors">Features</a></li>
              <li><a href="/#how-it-works" class="hover:text-neon-blue transition-colors">How It Works</a></li>
              <li><router-link to="/documentation" class="hover:text-neon-blue transition-colors">Documentation</router-link></li>
            </ul>
          </div>

          <div>
            <h4 class="text-white font-semibold mb-4">Company</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="/about" class="hover:text-neon-blue transition-colors">About</a></li>
              <li><a href="#" class="hover:text-neon-blue transition-colors">Blog</a></li>
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

