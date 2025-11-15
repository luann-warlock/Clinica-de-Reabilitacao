<template>
  <header class="main-header">
    <div class="header-container">
      <div class="logo">
        <h1>🏥 Clínica Vida Nova</h1>
        <p>Sistema de Gestão</p>
      </div>

      <nav class="navigation">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/about" class="nav-link">Sobre</router-link>
        <router-link to="/login" class="login-btn">Entrar no Sistema</router-link>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent',
}
</script>

<style scoped>
.main-header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo h1 {
  margin: 0;
  font-size: 1.8rem;
}

.logo p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background 0.3s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.login-btn {
  display: inline-block; /* IMPORTANTE: faz o link se comportar como botão */
  background: #00d9ff;
  color: #1e3c72;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  text-decoration: none; /* Remove sublinhado do link */
  text-align: center;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
}
</style>
