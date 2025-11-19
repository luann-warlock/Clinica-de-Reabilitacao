<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="user-info">
        <h1>Dashboard - Sistema de Gestão</h1>
        <p>Bem-vindo, <strong>Dr. Silva</strong> | Médico Psiquiatra</p>
      </div>
      <div class="header-actions">
        <button class="action-btn">📋 Relatório Diário</button>
        <button class="action-btn">👤 Meu Perfil</button>
      </div>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🛏️</div>
        <div class="stat-info">
          <h3>Leitos Ocupados</h3>
          <p class="stat-number">18/30</p>
          <span class="stat-percentage">60%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>Pacientes Ativos</h3>
          <p class="stat-number">24</p>
          <span class="stat-percentage">+2 esta semana</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💊</div>
        <div class="stat-info">
          <h3>Medicações Hoje</h3>
          <p class="stat-number">56</p>
          <span class="stat-percentage">3 pendentes</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <h3>Atividades</h3>
          <p class="stat-number">8</p>
          <span class="stat-percentage">2 em andamento</span>
        </div>
      </div>
    </div>

    <!-- Módulos do Sistema -->
    <div class="modules-section">
      <h2>Módulos do Sistema</h2>
      <div class="modules-grid">
        <!-- Módulo 1: Admissão e Triagem -->
        <div class="module-card" @click="navigateToModule('admission')">
          <div class="module-icon">👥</div>
          <div class="module-content">
            <h3>Admissão e Triagem</h3>
            <p>Controle de entrada de pacientes, avaliação inicial e documentação legal</p>
            <div class="module-status">
              <span class="status-badge">3 novas admissões</span>
            </div>
          </div>
        </div>

        <!-- Módulo 2: Prontuário Eletrônico -->
        <div class="module-card" @click="navigateToModule('medical-record')">
          <div class="module-icon">📋</div>
          <div class="module-content">
            <h3>Prontuário Eletrônico</h3>
            <p>Registro completo de anamnese, evolução clínica e histórico</p>
            <div class="module-status">
              <span class="status-badge">12 atualizações pendentes</span>
            </div>
          </div>
        </div>

        <!-- Módulo 3: Plano Terapêutico -->
        <div class="module-card" @click="navigateToModule('treatment-plan')">
          <div class="module-icon">🎯</div>
          <div class="module-content">
            <h3>Plano Terapêutico Individual</h3>
            <p>PTI personalizado com metas e acompanhamento de progresso</p>
            <div class="module-status">
              <span class="status-badge">5 planos para revisão</span>
            </div>
          </div>
        </div>

        <!-- Módulo 4: Controle de Medicação -->
        <div class="module-card" @click="navigateToModule('medication')">
          <div class="module-icon">💊</div>
          <div class="module-content">
            <h3>Controle de Medicação</h3>
            <p>Prescrição eletrônica, dispensação controlada e administração</p>
            <div class="module-status">
              <span class="status-badge warning">3 medicamentos pendentes</span>
            </div>
          </div>
        </div>

        <!-- Módulo 5: Gestão de Leitos -->
        <div class="module-card" @click="navigateToModule('beds')">
          <div class="module-icon">🛏️</div>
          <div class="module-content">
            <h3>Gestão de Leitos</h3>
            <p>Controle de ocupação, disponibilidade e tempo de permanência</p>
            <div class="module-status">
              <span class="status-badge">12 leitos disponíveis</span>
            </div>
          </div>
        </div>

        <!-- Módulo 6: Atividades Terapêuticas -->
        <div class="module-card" @click="navigateToModule('activities')">
          <div class="module-icon">🧘</div>
          <div class="module-content">
            <h3>Atividades Terapêuticas</h3>
            <p>Grupos de apoio, terapia ocupacional e atividades complementares</p>
            <div class="module-status">
              <span class="status-badge">4 atividades hoje</span>
            </div>
          </div>
        </div>

        <!-- Módulo 7: Financeiro -->
        <div class="module-card" @click="navigateToModule('financial')">
          <div class="module-icon">💰</div>
          <div class="module-content">
            <h3>Financeiro</h3>
            <p>Controle de mensalidades, convênios e faturamento</p>
            <div class="module-status">
              <span class="status-badge">R$ 45.230,00 este mês</span>
            </div>
          </div>
        </div>

        <!-- Módulo 8: Controle de Visitas -->
        <div class="module-card" @click="navigateToModule('visits')">
          <div class="module-icon">👨‍👩‍👧‍👦</div>
          <div class="module-content">
            <h3>Controle de Visitas</h3>
            <p>Gestão de visitas familiares conforme protocolo terapêutico</p>
            <div class="module-status">
              <span class="status-badge">8 visitas agendadas</span>
            </div>
          </div>
        </div>

        <!-- Módulo 9: Relatórios -->
        <div class="module-card" @click="navigateToModule('reports')">
          <div class="module-icon">📊</div>
          <div class="module-content">
            <h3>Relatórios e Indicadores</h3>
            <p>Indicadores de qualidade, taxas e relatórios gerenciais</p>
            <div class="module-status">
              <span class="status-badge">Relatório mensal pronto</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Atividades Recentes -->
    <div class="recent-activities">
      <h2>Atividades Recentes</h2>
      <div class="activities-list">
        <div class="activity-item">
          <div class="activity-icon">➕</div>
          <div class="activity-content">
            <p><strong>Novo paciente admitido</strong> - João Silva</p>
            <span class="activity-time">Há 2 horas</span>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">💊</div>
          <div class="activity-content">
            <p><strong>Medicação administrada</strong> - Paciente Maria Santos</p>
            <span class="activity-time">Há 3 horas</span>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">📝</div>
          <div class="activity-content">
            <p><strong>Evolução clínica registrada</strong> - Dr. Carlos</p>
            <span class="activity-time">Há 4 horas</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardView',
  methods: {
    navigateToModule(moduleName) {
      const routes = {
        admission: '/admission',
        'medical-record': '/medical-record',
        'treatment-plan': '/treatment-plan',
        medication: '/medication', //
        beds: '/beds',
        activities: '/activities',
        financial: '/financial',
        visits: '/visits',
        reports: '/reports',
      }

      if (routes[moduleName]) {
        this.$router.push(routes[moduleName])
      } else {
        alert(`Módulo ${moduleName} será implementado em breve!`)
      }
    },
  },
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.user-info h1 {
  color: #1e3c72;
  margin-bottom: 0.5rem;
}

.user-info p {
  color: #666;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

/* Estatísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #1e3c72;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info h3 {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-number {
  color: #1e3c72;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.stat-percentage {
  color: #10b981;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Módulos */
.modules-section {
  margin-bottom: 3rem;
}

.modules-section h2 {
  color: #1e3c72;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.module-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #1e3c72;
}

.module-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.module-content h3 {
  color: #1e3c72;
  margin: 0 0 0.5rem 0;
}

.module-content p {
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.module-status {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  background: #dbeafe;
  color: #1e3c72;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

/* Atividades Recentes */
.recent-activities h2 {
  color: #1e3c72;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.activities-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.activity-time {
  color: #666;
  font-size: 0.8rem;
}
</style>
