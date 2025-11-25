<template>
  <div class="home">
    <!-- Seção Hero -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="clinic-name">Clínica Vida Nova</h1>
        <p class="clinic-description">
          Sistema Especializado de Gestão para Reabilitação em Dependência Química
        </p>
      </div>
    </section>

    <!-- Seção de Módulos -->
    <section class="modules-section">
      <div class="container">
        <h2 class="section-title">Sistema de Gestão</h2>
        
        <div class="modules-grid">
          <!-- SEUS MÓDULOS -->
          <div class="module-card featured">
            <div class="card-header">
              <h3>Gestão de Leitos</h3>
              <span class="status-badge">Online</span>
            </div>
            <p class="card-description">
              Controle completo de leitos, ocupação e status dos pacientes
            </p>
            <div class="card-features">
              <span class="feature">✅ Controle de ocupação</span>
              <span class="feature">✅ Status em tempo real</span>
              <span class="feature">✅ Gestão por setores</span>
            </div>
            <router-link to="/beds" class="card-button">
              Acessar Gestão de Leitos
            </router-link>
          </div>

          <div class="module-card featured">
            <div class="card-header">
              <h3>Atividades Terapêuticas</h3>
              <span class="status-badge">Online</span>
            </div>
            <p class="card-description">
              Agendamento e gestão de atividades terapêuticas e sessões
            </p>
            <div class="card-features">
              <span class="feature">✅ Agendamento de sessões</span>
              <span class="feature">✅ Controle de participantes</span>
              <span class="feature">✅ Múltiplas terapias</span>
            </div>
            <router-link to="/activities" class="card-button">
              Acessar Atividades
            </router-link>
          </div>

          <!-- MÓDULOS DOS COLEGAS (Em desenvolvimento) -->
          <div class="module-card">
            <div class="card-header">
              <h3>Prontuário Eletrônico</h3>
              <span class="status-badge upcoming">Em Breve</span>
            </div>
            <p class="card-description">
              Registro completo do paciente, evolução clínica e histórico
            </p>
            <div class="card-features">
              <span class="feature">📋 Administração de comissões</span>
              <span class="feature">🔍 Triagem e evolução clínica</span>
              <span class="feature">📊 Relatórios completos</span>
            </div>
            <button class="card-button disabled" disabled>
              Em Desenvolvimento
            </button>
          </div>

          <div class="module-card">
            <div class="card-header">
              <h3>Controle de Medicação</h3>
              <span class="status-badge upcoming">Em Breve</span>
            </div>
            <p class="card-description">
              Sistema rigoroso de prescrição e administração de medicamentos
            </p>
            <div class="card-features">
              <span class="feature">💊 Prescrição médica</span>
              <span class="feature">⏰ Controle de horários</span>
              <span class="feature">📈 Indicadores de qualidade</span>
            </div>
            <button class="card-button disabled" disabled>
              Em Desenvolvimento
            </button>
          </div>

          <div class="module-card">
            <div class="card-header">
              <h3>Gestão Financeira</h3>
              <span class="status-badge upcoming">Em Breve</span>
            </div>
            <p class="card-description">
              Controle financeiro, faturamento e gestão de custos
            </p>
            <div class="card-features">
              <span class="feature">💰 Controle de custos</span>
              <span class="feature">🧾 Faturamento</span>
              <span class="feature">📊 Relatórios financeiros</span>
            </div>
            <button class="card-button disabled" disabled>
              Em Desenvolvimento
            </button>
          </div>

          <div class="module-card">
            <div class="card-header">
              <h3>Indicadores e Relatórios</h3>
              <span class="status-badge upcoming">Em Breve</span>
            </div>
            <p class="card-description">
              Indicadores de qualidade e acompanhamento terapêutico
            </p>
            <div class="card-features">
              <span class="feature">📈 Métricas de qualidade</span>
              <span class="feature">📋 Acompanhamento terapêutico</span>
              <span class="feature">🎯 Indicadores clínicos</span>
            </div>
            <button class="card-button disabled" disabled>
              Em Desenvolvimento
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Rodapé -->
    <footer class="home-footer">
      <div class="container">
        <p>© 2024 Clínica Vida Nova - Sistema de Gestão para Reabilitação</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Lógica da página inicial pode ser adicionada aqui se necessário
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Seção Hero */
.hero-section {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.clinic-name {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.clinic-description {
  font-size: 1.3rem;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Seção de Módulos */
.modules-section {
  padding: 4rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  color: #1e3c72;
  margin-bottom: 3rem;
  font-weight: 600;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.module-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  position: relative;
}

.module-card.featured {
  border: 2px solid #1e3c72;
  transform: scale(1.02);
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(30, 60, 114, 0.15);
}

.module-card.featured:hover {
  transform: translateY(-5px) scale(1.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-header h3 {
  color: #1e3c72;
  font-size: 1.4rem;
  margin: 0;
  flex: 1;
}

.status-badge {
  background: #28a745;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 1rem;
}

.status-badge.upcoming {
  background: #6c757d;
}

.card-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.card-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.feature {
  font-size: 0.9rem;
  color: #555;
}

.card-button {
  display: block;
  background: #1e3c72;
  color: white;
  text-align: center;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s ease;
  border: none;
  width: 100%;
  cursor: pointer;
}

.card-button:hover {
  background: #2a5298;
}

.card-button.disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Rodapé */
.home-footer {
  background: #1e3c72;
  color: white;
  padding: 2rem;
  text-align: center;
  margin-top: 4rem;
}

.home-footer p {
  margin: 0;
  opacity: 0.8;
}

/* Responsividade */
@media (max-width: 768px) {
  .clinic-name {
    font-size: 2rem;
  }
  
  .clinic-description {
    font-size: 1.1rem;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .module-card.featured {
    transform: none;
  }
}
</style>