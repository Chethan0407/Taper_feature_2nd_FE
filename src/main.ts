import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason)
})

const app = createApp(App)

// Vue error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('🚨 Vue error:', err, info)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
