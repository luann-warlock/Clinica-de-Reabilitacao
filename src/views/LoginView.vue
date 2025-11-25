<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Clínica Vida Nova</h1>
        <p>Acesso ao Sistema de Gestão</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>E-mail</label>
          <input 
            v-model="loginData.email" 
            type="email" 
            placeholder="seu@email.com"
            required
            :disabled="loading"
          >
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input 
            v-model="loginData.password" 
            type="password" 
            placeholder="Sua senha"
            required
            :disabled="loading"
          >
        </div>

        <div class="form-group">
          <label>Tipo de Usuário</label>
          <select v-model="loginData.userType" :disabled="loading">
            <option value="medico_psiquiatra">Médico Psiquiatra</option>
            <option value="enfermeiro">Enfermeiro</option>
            <option value="terapeuta">Terapeuta</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        <button 
          type="submit" 
          class="login-button"
          :disabled="loading"
        >
          <span v-if="loading">Entrando...</span>
          <span v-else>Entrar no Sistema</span>
        </button>
      </form>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="login-footer">
        <p>Não tem uma conta? <router-link to="/register">Cadastre-se aqui</router-link></p>
        <p>Problemas para acessar? Contate o administrador</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const loginData = ref({
  email: '',
  password: '',
  userType: 'medico_psiquiatra'
})

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData.value)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login')
    }

    // Login bem-sucedido
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.data.user))
    
    // Redirecionar para dashboard
    router.push('/dashboard')
    
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #1e3c72;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.login-header p {
  color: #666;
  font-size: 1rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1e3c72;
}

.login-button {
  width: 100%;
  background: #1e3c72;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-button:hover:not(:disabled) {
  background: #2a5298;
}

.login-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.login-footer p {
  margin: 0.25rem 0;
}

.login-footer a {
  color: #1e3c72;
  text-decoration: none;
  font-weight: 600;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>