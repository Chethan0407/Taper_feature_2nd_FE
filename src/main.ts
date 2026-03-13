import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

console.log('🚀 main.ts: Starting app initialization...')

// Global error handler
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error)
  console.error('🚨 Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  })
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason)
})

try {
  console.log('🚀 main.ts: Creating Vue app...')
  const app = createApp(App)
  
  // Vue error handler
  app.config.errorHandler = (err, instance, info) => {
    console.error('🚨 Vue error:', err, info)
  }
  
  console.log('🚀 main.ts: Setting up Pinia...')
  app.use(createPinia())
  
  console.log('🚀 main.ts: Setting up Router...')
  app.use(router)
  
  console.log('🚀 main.ts: Mounting app to #app...')
  app.mount('#app')
  console.log('✅ main.ts: App mounted successfully!')
} catch (error: any) {
  console.error('❌ main.ts: Failed to initialize app:', error)
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h1>Application Failed to Load</h1>
      <p>Error: ${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `
}
