<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🏥 Clínica Vida Nova</h1>
          <p>Acesso ao Sistema de Gestão</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" v-model="email" placeholder="seu@email.com" required />
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Sua senha"
              required
            />
          </div>

          <div class="form-group">
            <label for="userType">Tipo de Usuário</label>
            <select id="userType" v-model="userType" class="user-type-select">
              <option value="medico">Médico Psiquiatra</option>
              <option value="enfermeiro">Enfermeiro</option>
              <option value="administrativo">Administrativo</option>
              <option value="terapeuta">Terapeuta</option>
            </select>
          </div>

          <button type="submit" class="login-button">
            <span v-if="!loading">Entrar no Sistema</span>
            <span v-else>Carregando...</span>
          </button>
        </form>

        <div class="login-footer">
          <p>Problemas para acessar? <a href="#">Contate o administrador</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      userType: 'medico',
      loading: false,
    }
  },
  methods: {
    handleLogin() {
      this.loading = true

      // Simulação de login (depois conectaremos com backend)
      setTimeout(() => {
        this.loading = false
        // Redireciona para o dashboard
        this.$router.push('/dashboard')
      }, 1500)
    },
  },
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #1e3c72;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input,
select {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #1e3c72;
}

.user-type-select {
  background: white;
  cursor: pointer;
}

.login-button {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 1rem;
}

.login-button:hover {
  transform: translateY(-2px);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.login-footer a {
  color: #1e3c72;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
