import { createApp } from 'vue';
import Root from './App.vue';
import vueScrollto from "vue-scrollto";
import "./index.css";

const App = createApp(Root)

App.use(vueScrollto);

App.mount('#app')
