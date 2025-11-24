<template>
  <div class="navigation-buttons">
    <button 
      @click="goBack" 
      class="nav-button back-button"
      :disabled="!canGoBack"
    >
      ← Voltar
    </button>
    
    <button 
      @click="goForward" 
      class="nav-button forward-button"
      :disabled="!canGoForward"
    >
      Avançar →
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canGoBack = ref(false)
const canGoForward = ref(false)

// Verificar histórico de navegação
const checkNavigation = () => {
  canGoBack.value = window.history.length > 1
  // Não temos acesso direto ao forward, então usamos uma aproximação
  canGoForward.value = window.history.state?.forward || false
}

// Navegação personalizada
const goBack = () => {
  router.back()
}

const goForward = () => {
  router.forward()
}

// Atualizar estado quando a rota mudar
router.afterEach(() => {
  setTimeout(checkNavigation, 100)
})

onMounted(() => {
  checkNavigation()
  window.addEventListener('popstate', checkNavigation)
})

onUnmounted(() => {
  window.removeEventListener('popstate', checkNavigation)
})
</script>

<style scoped>
.navigation-buttons {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
}

.nav-button {
  background: #1e3c72;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(30, 60, 114, 0.3);
  transition: all 0.3s ease;
  min-width: 120px;
}

.nav-button:hover:not(:disabled) {
  background: #2a5298;
  transform: translateX(-5px);
  box-shadow: 0 6px 16px rgba(30, 60, 114, 0.4);
}

.nav-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.back-button:hover:not(:disabled) {
  transform: translateX(-5px);
}

.forward-button:hover:not(:disabled) {
  transform: translateX(5px);
}

/* Responsividade */
@media (max-width: 768px) {
  .navigation-buttons {
    position: fixed;
    bottom: 20px;
    top: auto;
    right: 20px;
    transform: none;
    flex-direction: row;
  }
  
  .nav-button {
    min-width: 100px;
    padding: 10px 14px;
    font-size: 0.9rem;
  }
}
</style>