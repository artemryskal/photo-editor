import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import vuetify from '@/plugins/vuetify'
import Notifications from '@kyvg/vue3-notification'
import '@/scss/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)
app.use(Notifications)

app.mount('#app')
