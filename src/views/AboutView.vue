<template>
  <div class="about">
    <div class="container">
      <h1>Sobre o Sistema</h1>

      <div class="content-grid">
        <section class="mission">
          <h2>🎯 Nossa Missão</h2>
          <p>
            Fornecer um sistema de gestão completo e especializado para clínicas de reabilitação em
            dependência química, integrando processos clínicos, terapêuticos, administrativos e
            financeiros com segurança, eficiência e conformidade legal.
          </p>
        </section>

        <section class="team">
          <h2>👥 Nossa Equipe</h2>
          <div class="team-members">
            <div class="member">
              <h3>Gabriel Silva</h3>
              <p>Desenvolvedor Front-end & Design</p>
            </div>
            <div class="member">
              <h3>Ítalo Gomes</h3>
              <p>Desenvolvedor Back-end</p>
            </div>
            <div class="member">
              <h3>Luann Victor</h3>
              <p>Analista de Requisitos</p>
            </div>
          </div>
        </section>

        <section class="technologies">
          <h2>🛠 Tecnologias Utilizadas</h2>
          <div class="tech-grid">
            <div class="tech-item">
              <span class="tech-icon">⚡</span>
              <span>Vue.js 3</span>
            </div>
            <div class="tech-item">
              <span class="tech-icon">🎨</span>
              <span>HTML5 & CSS3</span>
            </div>
            <div class="tech-item">
              <span class="tech-icon">📱</span>
              <span>JavaScript ES6+</span>
            </div>
            <div class="tech-item">
              <span class="tech-icon">🚀</span>
              <span>Vue Router</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView',
}
</script>

<style scoped>
.about {
  padding: 2rem;
  min-height: 80vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #1e3c72;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.content-grid {
  display: grid;
  gap: 3rem;
}

section h2 {
  color: #2a5298;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.mission p {
  font-size: 1.1rem;
  line-height: 1.6;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.team-members {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.member {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-top: 4px solid #1e3c72;
}

.member h3 {
  color: #1e3c72;
  margin-bottom: 0.5rem;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.tech-item {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: bold;
}

.tech-icon {
  font-size: 1.5rem;
}
</style>
