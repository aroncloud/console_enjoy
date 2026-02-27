import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import en from './lang/translations/en.json'
import fr from './lang/translations/fr.json'
import './style.css'
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)
const i18n = createI18n({
  legacy: false, 
  locale: 'fr',
  fallbackLocale: 'en',
  messages: {
    en,
    fr
  }
})

app.use(pinia)
app.use(router)
app.use(i18n) 

app.mount('#app')