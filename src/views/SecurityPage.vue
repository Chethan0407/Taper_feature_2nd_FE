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
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Security</h1>
        <p class="text-gray-400 mb-8">Our commitment to keeping your data secure</p>

        <div class="glass-effect rounded-2xl p-8 md:p-12 border border-dark-700 space-y-8">
          <section>
            <h2 class="text-2xl font-bold text-white mb-4">Security Overview</h2>
            <p class="text-gray-300 leading-relaxed">
              At TapeOutOps, security is a fundamental aspect of our platform. We implement industry-standard security measures to protect your sensitive semiconductor design data and ensure the confidentiality, integrity, and availability of your information.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">Data Encryption</h2>
            <div class="space-y-4 text-gray-300 leading-relaxed">
              <div>
                <h3 class="text-xl font-semibold text-white mb-2">Encryption in Transit</h3>
                <p>All data transmitted between your browser and our servers is encrypted using TLS 1.3, ensuring that your information cannot be intercepted during transmission.</p>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-2">Encryption at Rest</h3>
                <p>All data stored on our servers is encrypted using AES-256 encryption, providing strong protection for your sensitive information even when stored.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">Authentication & Access Control</h2>
            <div class="space-y-4 text-gray-300 leading-relaxed">
              <ul class="list-disc list-inside ml-4 space-y-2">
                <li>Multi-factor authentication (MFA) support for enhanced security</li>
                <li>Strong password requirements and policies</li>
                <li>Role-based access control (RBAC) to limit data access</li>
                <li>Session management with automatic timeout</li>
                <li>Regular security audits and access reviews</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">Infrastructure Security</h2>
            <div class="space-y-4 text-gray-300 leading-relaxed">
              <div>
                <h3 class="text-xl font-semibold text-white mb-2">Server Security</h3>
                <p>Our servers are hosted in secure data centers with physical security measures, redundant systems, and regular security updates.</p>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-2">Network Security</h3>
                <p>We employ firewalls, intrusion detection systems, and network segmentation to protect against unauthorized access and attacks.</p>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white mb-2">Regular Updates</h3>
                <p>We regularly update our systems and dependencies to patch security vulnerabilities and maintain the latest security standards.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">Data Protection</h2>
            <div class="space-y-4 text-gray-300 leading-relaxed">
              <ul class="list-disc list-inside ml-4 space-y-2">
                <li>Regular automated backups with secure storage</li>
                <li>Data isolation between customers</li>
                <li>Secure data deletion procedures</li>
                <li>Compliance with data protection regulations</li>
                <li>Data retention policies aligned with your business needs</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">Security Monitoring</h2>
            <p class="text-gray-300 leading-relaxed mb-4">We continuously monitor our systems for security threats:</p>
            <ul class="list-disc list-inside ml-4 space-y-2 text-gray-300">
              <li>24/7 security monitoring and alerting</li>
              <li>Automated threat detection and response</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Incident response procedures</li>
              <li>Security logging and audit trails</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">Compliance</h2>
            <p class="text-gray-300 leading-relaxed">
              We maintain compliance with industry standards and regulations relevant to semiconductor data protection, ensuring that your sensitive design information is handled according to best practices.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">Security Best Practices for Users</h2>
            <div class="space-y-4 text-gray-300 leading-relaxed">
              <p>To enhance security, we recommend:</p>
              <ul class="list-disc list-inside ml-4 space-y-2">
                <li>Using strong, unique passwords</li>
                <li>Enabling multi-factor authentication</li>
                <li>Regularly reviewing account access and permissions</li>
                <li>Keeping your browser and devices up to date</li>
                <li>Reporting any suspicious activity immediately</li>
                <li>Not sharing account credentials</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">Reporting Security Issues</h2>
            <p class="text-gray-300 leading-relaxed">
              If you discover a security vulnerability, please report it to us immediately at:
              <a href="mailto:security@tapeoutops.com" class="text-neon-blue hover:text-neon-purple transition-colors">security@tapeoutops.com</a>
            </p>
            <p class="text-gray-300 leading-relaxed mt-4">
              We take security vulnerabilities seriously and will investigate and address any reported issues promptly.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-white mb-4">Updates to Security Practices</h2>
            <p class="text-gray-300 leading-relaxed">
              We continuously improve our security practices and may update this security page from time to time. We encourage you to review this page periodically to stay informed about our security measures.
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

