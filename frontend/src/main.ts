// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import "highlight.js/styles/default.min.css";
// import "highlight.js/styles/base16/framer.min.css";
import "highlight.js/styles/base16/apathy.min.css";
import "katex/dist/katex.min.css";

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.mount('#app')
