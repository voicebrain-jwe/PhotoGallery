import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import ItemsListPage from '../views/ItemsListPage.vue';
import ItemDetailPage from '../views/ItemDetailPage.vue';
import ItemFormPage from '../views/ItemFormPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/items'
  },
  {
    path: '/items',
    name: 'Items',
    component: ItemsListPage
  },
  {
    path: '/items/new',
    name: 'NewItem',
    component: ItemFormPage
  },
  {
    path: '/items/:id',
    name: 'ItemDetail',
    component: ItemDetailPage
  },
  {
    path: '/items/:id/edit',
    name: 'EditItem',
    component: ItemFormPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
