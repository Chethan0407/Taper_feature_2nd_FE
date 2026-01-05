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
          <div class="flex items-center space-x-4">
            <router-link to="/" class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Home
            </router-link>
            <router-link to="/login" class="px-6 py-2 text-sm font-medium bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:opacity-90 transition-opacity">
              Get Started
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Documentation Content -->
    <div class="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Documentation</h1>
          <p class="text-xl text-gray-400">Complete guide to using TapeOutOps for semiconductor tapeout workflows</p>
        </div>

        <!-- Table of Contents -->
        <div class="bg-dark-900/50 border border-dark-700 rounded-2xl p-6 mb-8">
          <h2 class="text-2xl font-bold text-white mb-4">Table of Contents</h2>
          <ul class="space-y-2 text-gray-300">
            <li><a href="#getting-started" class="hover:text-neon-blue transition-colors">1. Getting Started</a></li>
            <li><a href="#projects" class="hover:text-neon-blue transition-colors">2. Projects</a></li>
            <li><a href="#specifications" class="hover:text-neon-blue transition-colors">3. Specifications</a></li>
            <li><a href="#checklists" class="hover:text-neon-blue transition-colors">4. Checklists</a></li>
            <li><a href="#speclint" class="hover:text-neon-blue transition-colors">5. SpecLint</a></li>
            <li><a href="#vendors" class="hover:text-neon-blue transition-colors">6. Vendors</a></li>
            <li><a href="#companies" class="hover:text-neon-blue transition-colors">7. Companies</a></li>
            <li><a href="#api" class="hover:text-neon-blue transition-colors">8. API Reference</a></li>
          </ul>
        </div>

        <!-- Getting Started -->
        <section id="getting-started" class="mb-12">
          <h2 class="text-3xl font-bold text-white mb-6">1. Getting Started</h2>
          <div class="bg-dark-900/50 border border-dark-700 rounded-2xl p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Creating an Account</h3>
            <p class="text-gray-300 leading-relaxed">
              To get started with TapeOutOps, you'll need to create an account using your company email address. 
              Personal email addresses (Gmail, Yahoo, etc.) are not allowed for security reasons.
            </p>
            <ol class="list-decimal list-inside space-y-2 text-gray-300 ml-4">
              <li>Navigate to the <router-link to="/login" class="text-neon-blue hover:underline">Login page</router-link></li>
              <li>Click "Sign up" to create a new account</li>
              <li>Enter your full name, company email, and create a secure password</li>
              <li>Verify your email address using the OTP sent to your inbox</li>
              <li>Once verified, you can log in and start using TapeOutOps</li>
            </ol>
          </div>
        </section>

        <!-- Projects -->
        <section id="projects" class="mb-12">
          <h2 class="text-3xl font-bold text-white mb-6">2. Projects</h2>
          <div class="bg-dark-900/50 border border-dark-700 rounded-2xl p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Creating a Project</h3>
            <p class="text-gray-300 leading-relaxed">
              Projects are the central organizing unit in TapeOutOps. Each project represents a semiconductor tapeout 
              effort and contains related specifications, checklists, and other workflow items.
            </p>
            <div class="bg-dark-800 rounded-lg p-4 mt-4">
              <p class="text-sm text-gray-400 mb-2">To create a project:</p>
              <ol class="list-decimal list-inside space-y-1 text-gray-300 text-sm ml-4">
                <li>Go to the Projects page from the sidebar</li>
                <li>Click "Create Project" button</li>
                <li>Enter project name, description, and select relevant metadata</li>
                <li>Choose the platform, EDA tools, and project type</li>
                <li>Click "Create" to save your project</li>
              </ol>
            </div>
            <h3 class="text-xl font-semibold text-white mt-6">Project Management</h3>
            <p class="text-gray-300 leading-relaxed">
              Once created, you can view project details, manage specifications, track checklists, and monitor 
              the overall progress of your tapeout workflow.
            </p>
          </div>
        </section>

        <!-- Specifications -->
        <section id="specifications" class="mb-12">
          <h2 class="text-3xl font-bold text-white mb-6">3. Specifications</h2>
          <div class="bg-dark-900/50 border border-dark-700 rounded-2xl p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Managing Specifications</h3>
            <p class="text-gray-300 leading-relaxed">
              Specifications define the requirements and constraints for your semiconductor design. You can create, 
              edit, and link specifications to track dependencies and relationships.
            </p>
            <div class="grid md:grid-cols-2 gap-4 mt-4">
              <div class="bg-dark-800 rounded-lg p-4">
                <h4 class="font-semibold text-white mb-2">Creating Specifications</h4>
                <p class="text-sm text-gray-300">
                  Create new specifications with titles, descriptions, and metadata. Link related specifications 
                  to track dependencies.
                </p>
              </div>
              <div class="bg-dark-800 rounded-lg p-4">
                <h4 class="font-semibold text-white mb-2">Linking Specifications</h4>
                <p class="text-sm text-gray-300">
                  Link specifications together to show relationships and dependencies in your design workflow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Checklists -->
        <section id="checklists" class="mb-12">
          <h2 class="text-3xl font-bold text-white mb-6">4. Checklists</h2>
          <div class="bg-dark-900/50 border border-dark-700 rounded-2xl p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Checklist Templates</h3>
            <p class="text-gray-300 leading-relaxed">
              Create reusable checklist templates that can be instantiated for different projects. Templates help 
              standardize your tapeout workflow processes.
            </p>
            <h3 class="text-xl font-semibold text-white mt-6">Active Checklists</h3>
            <p class="text-gray-300 leading-relaxed">
              Active checklists are instances of templates assigned to specific projects. Track completion progress, 
              upload evidence, and approve checklists as you complete each item.
            </p>
            <div class="bg-dark-800 rounded-lg p-4 mt-4">
              <p class="text-sm text-gray-400 mb-2">Checklist Workflow:</p>
              <ol class="list-decimal list-inside space-y-1 text-gray-300 text-sm ml-4">
                <li>Create a checklist template with required items</li>
                <li>Instantiate the template for a project</li>
                <li>Complete checklist items and upload evidence</li>
                <li>Approve the checklist when all items are complete</li>
              </ol>
            </div>
          </div>
        </section>

        <!-- SpecLint -->
        <section id="speclint" class="mb-12">
          <h2 class="text-3xl font-bold text-white mb-6">5. SpecLint</h2>
          <div class="bg-dark-900/50 border border-dark-700 rounded-2xl p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Linting Specifications</h3>
            <p class="text-gray-300 leading-relaxed">
              SpecLint automatically checks your specifications for common issues, naming conventions, and compliance 
              with best practices. Run linting to identify potential problems before tapeout.
            </p>
            <h3 class="text-xl font-semibold text-white mt-6">Custom Rules</h3>
            <p class="text-gray-300 leading-relaxed">
              Create custom linting rules to enforce your organization's specific requirements. Rules can check for 
              forbidden keywords, regex patterns, or naming conventions.
            </p>
          </div>
        </section>

        <!-- Vendors -->
        <section id="vendors" class="mb-12">
          <h2 class="text-3xl font-bold text-white mb-6">6. Vendors</h2>
          <div class="bg-dark-900/50 border border-dark-700 rounded-2xl p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Vendor Management</h3>
            <p class="text-gray-300 leading-relaxed">
              Manage vendor information and relationships. Track vendor contacts, capabilities, and project associations 
              to streamline your tapeout partnerships.
            </p>
          </div>
        </section>

        <!-- Companies -->
        <section id="companies" class="mb-12">
          <h2 class="text-3xl font-bold text-white mb-6">7. Companies</h2>
          <div class="bg-dark-900/50 border border-dark-700 rounded-2xl p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Company Profiles</h3>
            <p class="text-gray-300 leading-relaxed">
              View and manage company profiles. Each company profile contains information about the organization, 
              its members, and associated projects.
            </p>
          </div>
        </section>

        <!-- API Reference -->
        <section id="api" class="mb-12">
          <h2 class="text-3xl font-bold text-white mb-6">8. API Reference</h2>
          <div class="bg-dark-900/50 border border-dark-700 rounded-2xl p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Authentication</h3>
            <p class="text-gray-300 leading-relaxed mb-4">
              All API requests require authentication using a Bearer token. Include the token in the Authorization header:
            </p>
            <div class="bg-dark-800 rounded-lg p-4">
              <code class="text-sm text-neon-blue">
                Authorization: Bearer &lt;your-token&gt;
              </code>
            </div>
            <h3 class="text-xl font-semibold text-white mt-6">Base URL</h3>
            <p class="text-gray-300 leading-relaxed">
              All API endpoints are prefixed with <code class="text-neon-blue">/api/v1</code>
            </p>
            <h3 class="text-xl font-semibold text-white mt-6">Common Endpoints</h3>
            <div class="bg-dark-800 rounded-lg p-4 space-y-2">
              <div class="text-sm">
                <code class="text-neon-blue">GET /api/v1/projects</code>
                <span class="text-gray-400 ml-2">List all projects</span>
              </div>
              <div class="text-sm">
                <code class="text-neon-blue">GET /api/v1/specifications</code>
                <span class="text-gray-400 ml-2">List specifications</span>
              </div>
              <div class="text-sm">
                <code class="text-neon-blue">GET /api/v1/checklists/templates</code>
                <span class="text-gray-400 ml-2">List checklist templates</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Support -->
        <section class="mb-12">
          <div class="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 rounded-2xl p-6 text-center">
            <h2 class="text-2xl font-bold text-white mb-4">Need Help?</h2>
            <p class="text-gray-300 mb-4">
              If you have questions or need assistance, please contact our support team.
            </p>
            <a href="mailto:support@tapeoutops.com" class="inline-block px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:opacity-90 transition-opacity">
              Contact Support
            </a>
          </div>
        </section>
      </div>
    </div>

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
              <li><router-link to="/#features" class="hover:text-neon-blue transition-colors">Features</router-link></li>
              <li><router-link to="/#how-it-works" class="hover:text-neon-blue transition-colors">How It Works</router-link></li>
              <li><router-link to="/documentation" class="hover:text-neon-blue transition-colors">Documentation</router-link></li>
            </ul>
          </div>

          <div>
            <h4 class="text-white font-bold mb-4">Company</h4>
            <ul class="space-y-2 text-sm text-gray-300">
              <li><router-link to="/about" class="hover:text-neon-blue transition-colors">About</router-link></li>
              <li><a href="mailto:support@tapeoutops.com" class="hover:text-neon-blue transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-white font-bold mb-4">Legal</h4>
            <ul class="space-y-2 text-sm text-gray-300">
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
// Documentation page - no auth required
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>

