import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            redirect: '/login'
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/view/auth/Login.vue')
        },  
        {
            path: '/register',
            name: 'register',
            component: () => import('@/view/auth/Register.vue')
        },
        {
            path: '/bonds/register',
            name: 'bond-register',
            component: () => import('@/view/bono/RegisterBono.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/bonds/list',
            name: 'bond-list',
            component: () => import('@/view/lista-bono/ListaBonos.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/bonds/flow',
            name: 'bond-flow',
            component: () => import('@/view/flujo-bono/FlujoBono.vue'),
            meta: { requiresAuth: true }
        }
    ]
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
    const { isAuthenticated, initializeAuth } = useAuth()
    
    // Inicializar autenticación desde localStorage
    initializeAuth()
    
    // Si la ruta requiere autenticación
    if (to.meta.requiresAuth) {
        if (!isAuthenticated.value) {
            next('/login')
            return
        }
    }
    
    // Si está autenticado y va al login/register, redirigir al dashboard
    if ((to.path === '/login' || to.path === '/register') && isAuthenticated.value) {
        next('/bonds/list')
        return
    }
    
    next()
})

export default router