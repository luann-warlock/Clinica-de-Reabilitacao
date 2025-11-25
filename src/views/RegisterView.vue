<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>Clínica Vida Nova</h1>
        <p>Criar Nova Conta</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label>Nome Completo *</label>
            <input 
              v-model="registerData.name" 
              type="text" 
              placeholder="Seu nome completo"
              required
              :disabled="loading"
            >
          </div>
        </div>

        <div class="form-group">
          <label>E-mail *</label>
          <input 
            v-model="registerData.email" 
            type="email" 
            placeholder="seu@email.com"
            required
            :disabled="loading"
          >
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Senha *</label>
            <input 
              v-model="registerData.password" 
              type="password" 
              placeholder="Mínimo 6 caracteres"
              required
              :disabled="loading"
              minlength="6"
            >
          </div>

          <div class="form-group">
            <label>Confirmar Senha *</label>
            <input 
              v-model="registerData.confirmPassword" 
              type="password" 
              placeholder="Digite novamente"
              required
              :disabled="loading"
            >
          </div>
        </div>

        <div class="form-group">
          <label>Tipo de Usuário *</label>
          <select v-model="registerData.userType" :disabled="loading" required>
            <option value="">Selecione um tipo</option>
            <option value="medico_psiquiatra">Médico Psiquiatra</option>
            <option value="enfermeiro">Enfermeiro</option>
            <option value="terapeuta">Terapeuta</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        <div class="form-group terms-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="registerData.acceptTerms"
              required
            >
            <span>Eu aceito os <a href="#" @click.prevent="showTerms">termos de uso</a> e <a href="#" @click.prevent="showPrivacy">política de privacidade</a></span>
          </label>
        </div>

        <button 
          type="submit" 
          class="register-button"
          :disabled="loading || !passwordsMatch || !registerData.acceptTerms"
        >
          <span v-if="loading">Criando Conta...</span>
          <span v-else>Criar Minha Conta</span>
        </button>
      </form>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="!passwordsMatch && registerData.confirmPassword" class="error-message">
        As senhas não coincidem
      </div>

      <div class="register-footer">
        <p>Já tem uma conta? <router-link to="/login">Faça login aqui</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const registerData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  userType: '',
  acceptTerms: false
})

// Computed para verificar se as senhas coincidem
const passwordsMatch = computed(() => {
  return registerData.value.password === registerData.value.confirmPassword
})

const showTerms = () => {
  alert('Termos de uso do sistema...')
}

const showPrivacy = () => {
  alert('Política de privacidade...')
}

const handleRegister = async () => {
  try {
    loading.value = true
    error.value = ''

    // Validações
    if (!passwordsMatch.value) {
      throw new Error('As senhas não coincidem')
    }

    if (!registerData.value.acceptTerms) {
      throw new Error('Você deve aceitar os termos de uso')
    }

    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData.value)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar conta')
    }

    // Cadastro bem-sucedido
    alert('✅ Conta criada com sucesso! Faça login para continuar.')
    router.push('/login')
    
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 2rem;
}

.register-card {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 500px;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  color: #1e3c72;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.register-header p {
  color: #666;
  font-size: 1rem;
}

.register-form {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.terms-group {
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
  margin-top: 0.2rem;
}

.checkbox-label a {
  color: #1e3c72;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.register-button {
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
  margin-top: 1rem;
}

.register-button:hover:not(:disabled) {
  background: #2a5298;
}

.register-button:disabled {
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

.register-footer {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.register-footer a {
  color: #1e3c72;
  text-decoration: none;
  font-weight: 600;
}

.register-footer a:hover {
  text-decoration: underline;
}

/* Responsividade */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .register-card {
    padding: 2rem;
  }
}
</style>