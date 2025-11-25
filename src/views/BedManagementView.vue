<template>
  <div class="bed-management">
    <div class="header">
      <h1>Gestão de Leitos</h1>
      <button class="btn-primary" @click="showAddBedForm = true">
        + Adicionar Leito
      </button>
    </div>

    <!-- Mensagem de loading/erro -->
    <div v-if="loading" class="message loading">
      ⏳ Carregando leitos...
    </div>
    
    <div v-if="error" class="message error">
      ❌ {{ error }}
    </div>

    <!-- Formulário para adicionar leito -->
    <div v-if="showAddBedForm" class="form-container">
      <h3>Adicionar Novo Leito</h3>
      <form @submit.prevent="createBed">
        <div class="form-group">
          <label>Número do Leito:</label>
          <input v-model="newBed.bedNumber" type="text" required placeholder="Ex: 101A">
        </div>
        
        <div class="form-group">
          <label>Setor:</label>
          <select v-model="newBed.sector" required>
            <option value="enfermaria">Enfermaria</option>
            <option value="semi-intensivo">Semi-Intensivo</option>
            <option value="intensivo">Intensivo</option>
            <option value="observação">Observação</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Salvar</button>
          <button type="button" class="btn-secondary" @click="showAddBedForm = false">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de leitos -->
    <div v-if="beds.length > 0" class="beds-grid">
      <div 
        v-for="bed in beds" 
        :key="bed._id" 
        :class="['bed-card', `status-${bed.status}`]"
      >
        <div class="bed-header">
          <h3>Leito {{ bed.bedNumber }}</h3>
          <span class="status-badge">{{ bed.status }}</span>
        </div>
        
        <div class="bed-info">
          <p><strong>Setor:</strong> {{ bed.sector }}</p>
          <p><strong>ID:</strong> {{ bed._id }}</p>
        </div>

        <div class="bed-actions">
          <button class="btn-small" @click="editBed(bed)">Editar</button>
          <button class="btn-small btn-danger" @click="deleteBed(bed._id)">
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Mensagem quando não há leitos -->
    <div v-else-if="!loading" class="message info">
      📝 Nenhum leito cadastrado. Clique em "Adicionar Leito" para começar.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Dados reativos
const beds = ref([])
const loading = ref(true)
const error = ref('')
const showAddBedForm = ref(false)
const newBed = ref({
  bedNumber: '',
  sector: 'enfermaria'
})

// Carregar leitos quando a página abrir
onMounted(async () => {
  await loadBeds()
})

// Carregar todos os leitos
const loadBeds = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await fetch('http://localhost:3000/api/beds')
    
    if (!response.ok) {
      throw new Error('Erro ao carregar leitos')
    }
    
    beds.value = await response.json()
  } catch (err) {
    error.value = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
    console.error('Erro:', err)
  } finally {
    loading.value = false
  }
}

// Criar novo leito
const createBed = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/beds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBed.value)
    })

    if (!response.ok) {
      throw new Error('Erro ao criar leito')
    }

    await loadBeds() // Recarregar a lista
    showAddBedForm.value = false
    newBed.value = { bedNumber: '', sector: 'enfermaria' }
    alert('✅ Leito criado com sucesso!')
  } catch (err) {
    alert('❌ Erro ao criar leito: ' + err.message)
  }
}

// Excluir leito
const deleteBed = async (bedId) => {
  if (confirm('Tem certeza que deseja excluir este leito?')) {
    try {
      const response = await fetch(`http://localhost:3000/api/beds/${bedId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir leito')
      }

      await loadBeds()
      alert('✅ Leito excluído com sucesso!')
    } catch (err) {
      alert('❌ Erro ao excluir leito: ' + err.message)
    }
  }
}

// Editar leito (vamos implementar depois)
const editBed = (bed) => {
  alert(`✏️ Editar leito ${bed.bedNumber} - Em desenvolvimento`)
}
</script>

<style scoped>
.bed-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #1e3c72;
}

.beds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.bed-card {
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.bed-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.bed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: capitalize;
}

.status-disponível .status-badge { background: #d4edda; color: #155724; }
.status-ocupado .status-badge { background: #f8d7da; color: #721c24; }
.status-em_limpeza .status-badge { background: #fff3cd; color: #856404; }
.status-manutenção .status-badge { background: #e2e3e5; color: #383d41; }

.bed-info p {
  margin: 8px 0;
  color: #555;
}

.bed-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.btn-primary {
  background: #1e3c72;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary:hover {
  background: #2a5298;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-small {
  background: #2a5298;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  flex: 1;
}

.btn-danger {
  background: #dc3545;
}

.btn-danger:hover {
  background: #c82333;
}

.form-container {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 30px;
  border-left: 4px solid #1e3c72;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-actions {
  display: flex;
  gap: 15px;
}

.message {
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
  font-weight: bold;
}

.loading { background: #d1ecf1; color: #0c5460; }
.error { background: #f8d7da; color: #721c24; }
.info { background: #e2e3e5; color: #383d41; }
</style>