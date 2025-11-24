<template>
  <div class="dashboard">
    <!-- Header Personalizado -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1>Dashboard - Sistema de Gestão</h1>
        <p class="user-welcome">Bem-vindo, <strong>{{ user.name }}</strong> | {{ getUserTypeLabel(user.userType) }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-report" @click="generateReport">📊 Relatório Diário</button>
        <button class="btn-profile" @click="viewProfile">👤 Meu Perfil</button>
      </div>
    </div>

    <!-- Métricas Principais -->
    <div class="metrics-grid">
      <!-- Métricas comuns a todos -->
      <div class="metric-card">
        <div class="metric-icon">🏥</div>
        <div class="metric-info">
          <h3>Leitos Ocupados</h3>
          <p class="metric-value">{{ metrics.occupiedBeds }}/{{ metrics.totalBeds }}</p>
          <p class="metric-percentage">{{ Math.round((metrics.occupiedBeds / metrics.totalBeds) * 100) }}%</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">👥</div>
        <div class="metric-info">
          <h3>Pacientes Ativos</h3>
          <p class="metric-value">{{ metrics.activePatients }}</p>
          <p class="metric-change">+2 esta semana</p>
        </div>
      </div>

      <!-- Métricas específicas por tipo de usuário -->
      <div v-if="user.userType === 'medico_psiquiatra'" class="metric-card">
        <div class="metric-icon">💊</div>
        <div class="metric-info">
          <h3>Prescrições Hoje</h3>
          <p class="metric-value">{{ metrics.todayPrescriptions }}</p>
          <p class="metric-alert">{{ metrics.pendingPrescriptions }} pendentes</p>
        </div>
      </div>

      <div v-if="user.userType === 'enfermeiro'" class="metric-card">
        <div class="metric-icon">⏰</div>
        <div class="metric-info">
          <h3>Medicações Hoje</h3>
          <p class="metric-value">{{ metrics.todayMedications }}</p>
          <p class="metric-alert">{{ metrics.pendingMedications }} pendentes</p>
        </div>
      </div>

      <div v-if="user.userType === 'terapeuta'" class="metric-card">
        <div class="metric-icon">🎯</div>
        <div class="metric-info">
          <h3>Sessões Hoje</h3>
          <p class="metric-value">{{ metrics.todaySessions }}</p>
          <p class="metric-alert">{{ metrics.pendingSessions }} em andamento</p>
        </div>
      </div>

      <div v-if="user.userType === 'administrador'" class="metric-card">
        <div class="metric-icon">💰</div>
        <div class="metric-info">
          <h3>Faturamento</h3>
          <p class="metric-value">R$ {{ metrics.revenue }}</p>
          <p class="metric-change">+5% este mês</p>
        </div>
      </div>

      <!-- Métrica comum adicional -->
      <div class="metric-card">
        <div class="metric-icon">📋</div>
        <div class="metric-info">
          <h3>Atividades</h3>
          <p class="metric-value">{{ metrics.totalActivities }}</p>
          <p class="metric-change">{{ metrics.ongoingActivities }} em andamento</p>
        </div>
      </div>
    </div>

    <!-- Ações Rápidas por Tipo de Usuário -->
    <div class="quick-actions">
      <h2>Ações Rápidas</h2>
      <div class="actions-grid">
        <!-- Ações para Médico -->
        <div v-if="user.userType === 'medico_psiquiatra'" class="action-item">
          <div class="action-icon">📝</div>
          <span>Prescrever Medicação</span>
        </div>

        <div v-if="user.userType === 'medico_psiquiatra'" class="action-item">
          <div class="action-icon">🔍</div>
          <span>Avaliar Paciente</span>
        </div>

        <!-- Ações para Enfermeiro -->
        <div v-if="user.userType === 'enfermeiro'" class="action-item">
          <div class="action-icon">💉</div>
          <span>Administrar Medicação</span>
        </div>

        <div v-if="user.userType === 'enfermeiro'" class="action-item">
          <div class="action-icon">📊</div>
          <span>Registrar Sinais Vitais</span>
        </div>

        <!-- Ações para Terapeuta -->
        <div v-if="user.userType === 'terapeuta'" class="action-item">
          <div class="action-icon">🎯</div>
          <span>Agendar Sessão</span>
        </div>

        <div v-if="user.userType === 'terapeuta'" class="action-item">
          <div class="action-icon">📈</div>
          <span>Registrar Evolução</span>
        </div>

        <!-- Ações para Administrador -->
        <div v-if="user.userType === 'administrador'" class="action-item">
          <div class="action-icon">👥</div>
          <span>Gerenciar Usuários</span>
        </div>

        <div v-if="user.userType === 'administrador'" class="action-item">
          <div class="action-icon">💰</div>
          <span>Relatórios Financeiros</span>
        </div>

        <!-- Ações comuns a todos -->
        <div class="action-item" @click="$router.push('/beds')">
          <div class="action-icon">🏥</div>
          <span>Gestão de Leitos</span>
        </div>

        <div class="action-item" @click="$router.push('/activities')">
          <div class="action-icon">🎯</div>
          <span>Atividades Terapêuticas</span>
        </div>
      </div>
    </div>

    <!-- Módulos do Sistema -->
    <div class="system-modules">
      <h2>Módulos do Sistema</h2>
      <div class="modules-grid">
        <!-- Seus módulos sempre disponíveis -->
        <div class="module-item available" @click="$router.push('/beds')">
          <div class="module-icon">🏥</div>
          <div class="module-info">
            <h3>Gestão de Leitos</h3>
            <p>Controle completo de leitos e ocupação</p>
          </div>
          <div class="module-status">Online</div>
        </div>

        <div class="module-item available" @click="$router.push('/activities')">
          <div class="module-icon">🎯</div>
          <div class="module-info">
            <h3>Atividades Terapêuticas</h3>
            <p>Agendamento e gestão de atividades</p>
          </div>
          <div class="module-status">Online</div>
        </div>

        <!-- Módulos futuros -->
        <div class="module-item coming-soon">
          <div class="module-icon">📋</div>
          <div class="module-info">
            <h3>Prontuário Eletrônico</h3>
            <p>Registro completo do paciente</p>
          </div>
          <div class="module-status">Em Breve</div>
        </div>

        <div class="module-item coming-soon">
          <div class="module-icon">💊</div>
          <div class="module-info">
            <h3>Controle de Medicação</h3>
            <p>Prescrição e administração</p>
          </div>
          <div class="module-status">Em Breve</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref({})
const metrics = ref({})

// Dados de exemplo baseados no tipo de usuário
const userMetrics = {
  medico_psiquiatra: {
    occupiedBeds: 18,
    totalBeds: 30,
    activePatients: 24,
    todayPrescriptions: 56,
    pendingPrescriptions: 3,
    totalActivities: 17,
    ongoingActivities: 2
  },
  enfermeiro: {
    occupiedBeds: 18,
    totalBeds: 30,
    activePatients: 24,
    todayMedications: 42,
    pendingMedications: 5,
    totalActivities: 17,
    ongoingActivities: 2
  },
  terapeuta: {
    occupiedBeds: 18,
    totalBeds: 30,
    activePatients: 24,
    todaySessions: 8,
    pendingSessions: 2,
    totalActivities: 17,
    ongoingActivities: 2
  },
  administrador: {
    occupiedBeds: 18,
    totalBeds: 30,
    activePatients: 24,
    revenue: '15.240,00',
    totalActivities: 17,
    ongoingActivities: 2
  }
}

const getUserTypeLabel = (userType) => {
  const labels = {
    medico_psiquiatra: 'Médico Psiquiatra',
    enfermeiro: 'Enfermeiro',
    terapeuta: 'Terapeuta',
    administrador: 'Administrador'
  }
  return labels[userType] || userType
}

const generateReport = () => {
  alert('Gerando relatório diário...')
}

const viewProfile = () => {
  alert('Abrindo perfil do usuário...')
}

onMounted(() => {
  // Recuperar usuário do localStorage
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
    metrics.value = userMetrics[user.value.userType] || userMetrics.medico_psiquiatra
  } else {
    // Se não há usuário, redirecionar para login
    router.push('/login')
  }
})
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.welcome-section h1 {
  color: #1e3c72;
  margin-bottom: 0.5rem;
}

.user-welcome {
  color: #666;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-report, .btn-profile {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.btn-report {
  background: #1e3c72;
  color: white;
}

.btn-profile {
  background: #6c757d;
  color: white;
}

.btn-report:hover {
  background: #2a5298;
}

.btn-profile:hover {
  background: #5a6268;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #1e3c72;
}

.metric-icon {
  font-size: 2rem;
}

.metric-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1e3c72;
  margin: 0;
}

.metric-percentage, .metric-change, .metric-alert {
  margin: 0;
  font-size: 0.9rem;
}

.metric-percentage {
  color: #28a745;
}

.metric-change {
  color: #6c757d;
}

.metric-alert {
  color: #dc3545;
}

.quick-actions {
  margin-bottom: 3rem;
}

.quick-actions h2 {
  color: #1e3c72;
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.action-item:hover {
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.5rem;
}

.system-modules h2 {
  color: #1e3c72;
  margin-bottom: 1rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.module-item {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-item.available {
  border-left: 4px solid #28a745;
}

.module-item.available:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.module-item.coming-soon {
  border-left: 4px solid #6c757d;
  opacity: 0.7;
  cursor: not-allowed;
}

.module-icon {
  font-size: 2rem;
}

.module-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.module-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.module-status {
  margin-left: auto;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.available .module-status {
  background: #d4edda;
  color: #155724;
}

.coming-soon .module-status {
  background: #e2e3e5;
  color: #383d41;
}

/* Responsividade */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>