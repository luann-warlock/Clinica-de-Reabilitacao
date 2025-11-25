import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import BedManagementView from '@/views/BedManagementView.vue'
import TherapeuticActivitiesView from '@/views/TherapeuticActivitiesView.vue'
import RegisterView from '@/views/RegisterView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
  },
  {
    path: '/admission',
    name: 'admission',
    component: () => import('../views/AdmissionView.vue'),
  },
  {
    path: '/medication',
    name: 'medication',
    component: () => import('../views/MedicationView.vue'),
  },
  {
    path: '/medical-record',
    name: 'medical-record',
    component: () => import('../views/MedicalRecordView.vue'),
  },
  {
    path: '/financial',
    name: 'financial',
    component: () => import('../views/FinancialView.vue'),
  },
  {
    path: '/beds',
    name: 'beds',
    component: BedManagementView
  },
  {
    path: '/activities',
    name: 'activities',
    component: TherapeuticActivitiesView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
