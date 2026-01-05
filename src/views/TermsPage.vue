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
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
        <p class="text-gray-400 mb-8">Last updated: January 2026</p>

        <div class="glass-effect rounded-2xl p-8 md:p-12 border border-dark-700 space-y-8">
          <section>
            <h2 class="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p class="text-gray-300 leading-relaxed">
              By accessing and using TapeOutOps, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">2. Use License</h2>
            <p class="text-gray-300 leading-relaxed mb-4">Permission is granted to use TapeOutOps for internal business purposes. This license does not include:</p>
            <ul class="list-disc list-inside ml-4 space-y-2 text-gray-300">
              <li>Commercial resale or sublicensing of the service</li>
              <li>Modification or reverse engineering of the platform</li>
              <li>Use of the platform for any illegal purpose</li>
              <li>Removal of copyright or proprietary notations</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <div class="space-y-4 text-gray-300 leading-relaxed">
              <p>To access certain features, you must register for an account. You agree to:</p>
              <ul class="list-disc list-inside ml-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">4. User Responsibilities</h2>
            <p class="text-gray-300 leading-relaxed mb-4">You are responsible for:</p>
            <ul class="list-disc list-inside ml-4 space-y-2 text-gray-300">
              <li>Compliance with all applicable laws and regulations</li>
              <li>Ensuring the accuracy of data you upload to the platform</li>
              <li>Maintaining confidentiality of sensitive information</li>
              <li>Respecting intellectual property rights</li>
              <li>Not using the service to transmit harmful code or malware</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
            <p class="text-gray-300 leading-relaxed">
              The TapeOutOps platform, including its original content, features, and functionality, is owned by TapeOutOps and is protected by international copyright, trademark, and other intellectual property laws. Your use of the platform does not grant you ownership of any intellectual property rights.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">6. Service Availability</h2>
            <p class="text-gray-300 leading-relaxed">
              We strive to maintain high availability of our service, but we do not guarantee uninterrupted, error-free, or secure operation. We reserve the right to modify, suspend, or discontinue any part of the service at any time with or without notice.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
            <p class="text-gray-300 leading-relaxed">
              TapeOutOps shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. Our total liability shall not exceed the amount you paid for the service in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">8. Termination</h2>
            <p class="text-gray-300 leading-relaxed">
              We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">9. Changes to Terms</h2>
            <p class="text-gray-300 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the platform. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">10. Contact Information</h2>
            <p class="text-gray-300 leading-relaxed">
              For questions about these Terms of Service, please contact us at:
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

