<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-lg border-b border-dark-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
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
          <div class="flex items-center space-x-4">
            <button @click="router.push('/login')" class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <div class="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
        <p class="text-gray-400 mb-8">Last updated: January 2026</p>

        <div class="glass-effect rounded-2xl p-8 md:p-12 border border-dark-700 space-y-8">
          <section>
            <h2 class="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p class="text-gray-300 leading-relaxed">
              TapeOutOps ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform for semiconductor tapeout workflow management.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <div class="space-y-4 text-gray-300 leading-relaxed">
              <div>
                <h3 class="text-xl font-semibold text-white mb-2">Personal Information</h3>
                <p>We collect information that you provide directly to us, including:</p>
                <ul class="list-disc list-inside ml-4 mt-2 space-y-2">
                  <li>Name and email address</li>
                  <li>Company affiliation and role</li>
                  <li>Account credentials and authentication information</li>
                </ul>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-2">Usage Information</h3>
                <p>We automatically collect information about how you use our platform, including:</p>
                <ul class="list-disc list-inside ml-4 mt-2 space-y-2">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and features used</li>
                  <li>Timestamp and duration of sessions</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p class="text-gray-300 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul class="list-disc list-inside ml-4 space-y-2 text-gray-300">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <p class="text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
            <p class="text-gray-300 leading-relaxed mb-4">We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:</p>
            <ul class="list-disc list-inside ml-4 space-y-2 text-gray-300">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
            <p class="text-gray-300 leading-relaxed mb-4">You have the right to:</p>
            <ul class="list-disc list-inside ml-4 space-y-2 text-gray-300">
              <li>Access and review your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
            <p class="text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
              <a href="mailto:support@tapeoutops.com" class="text-neon-blue hover:text-neon-purple transition-colors">support@tapeoutops.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

// Scroll to top when component mounts
onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
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

