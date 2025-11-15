<template>
  <div class="home">
    <div class="hero-section">
      <h1>Clínica Vida Nova</h1>
      <p class="subtitle">Sistema Especializado de Gestão para Reabilitação em Dependência Química</p>
      <div class="features">
        <div class="feature-card">
          <h3>👥 Gestão de Pacientes</h3>
          <p>Controle completo de admissão, triagem e evolução clínica</p>
        </div>
        <div class="feature-card">
          <h3>💊 Controle de Medicação</h3>
          <p>Sistema rigoroso de prescrição e administração de medicamentos</p>
        </div>
        <div class="feature-card">
          <h3>📊 Relatórios</h3>
          <p>Indicadores de qualidade e acompanhamento terapêutico</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  padding: 2rem;
}

.hero-section {
  text-align: center;
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  color: #1e3c72;
  font-size: 3rem;
  margin-bottom: 1rem;
}

.subtitle {
  color: #2a5298;
  font-size: 1.3rem;
  margin-bottom: 3rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-left: 4px solid #1e3c72;
}

.feature-card h3 {
  color: #1e3c72;
  margin-bottom: 1rem;
}
</style>