import 'vuestic-ui/css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createVuestic } from 'vuestic-ui'

createApp(App).use(createVuestic()).mount('#app')
