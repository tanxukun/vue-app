import { createApp } from 'vue'
import App from './App.vue'
import * as VueRouter from 'vue-router';
import Login from './components/Login.vue';
import HelloWorld from './components/HelloWorld.vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import ChatRoom from './components/ChatRoom.vue'

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [
        {path: '/index', component: ChatRoom},
        {path: '/', component: Login}
    ]
})

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
