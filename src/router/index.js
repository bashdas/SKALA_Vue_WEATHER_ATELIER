import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/WeatherHomeView.vue') },
    { path: '/weather/:cityId', name: 'weather-detail', component: () => import('../views/WeatherDetailView.vue'), props: true },
    { path: '/favorites', name: 'favorites', component: () => import('../views/WeatherFavoritesView.vue') },
    { path: '/about', name: 'about', component: () => import('../views/WeatherAboutView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
