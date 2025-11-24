<template>
  <div class="activities-management">
    <div class="header">
      <h1>Atividades Terapêuticas</h1>
      <button class="btn-primary" @click="showAddActivityForm = true">
        + Nova Atividade
      </button>
    </div>

    <div v-if="loading" class="message loading">
      ⏳ Carregando atividades...
    </div>
    
    <div v-if="error" class="message error">
      ❌ {{ error }}
    </div>

    <!-- Formulário para nova atividade -->
    <div v-if="showAddActivityForm" class="form-container">
      <h3>Nova Atividade Terapêutica</h3>
      <form @submit.prevent="createActivity">
        <div class="form-group">
          <label>Nome da Atividade:</label>
          <input v-model="newActivity.name" type="text" required placeholder="Ex: Fisioterapia Matinal">
        </div>
        
        <div class="form-group">
          <label>Tipo:</label>
          <select v-model="newActivity.type" required>
            <option value="fisioterapia">Fisioterapia</option>
            <option value="terapia_ocupacional">Terapia Ocupacional</option>
            <option value="psicologia">Psicologia</option>
            <option value="musical">Musical</option>
            <option value="artes">Artes</option>
            <option value="recreacao">Recreação</option>
          </select>
        </div>

        <div class="form-group">
          <label>Terapeuta:</label>
          <input v-model="newActivity.therapist.name" type="text" required placeholder="Nome do terapeuta">
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Salvar</button>
          <button type="button" class="btn-secondary" @click="showAddActivityForm = false">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de atividades -->
    <div v-if="activities.length > 0" class="activities-grid">
      <div 
        v-for="activity in activities" 
        :key="activity._id" 
        :class="['activity-card', `status-${activity.status}`]"
      >
        <div class="activity-header">
          <h3>{{ activity.name }}</h3>
          <span class="type-badge">{{ activity.type }}</span>
        </div>
        
        <div class="activity-info">
          <p><strong>Terapeuta:</strong> {{ activity.therapist.name }}</p>
          <p><strong>Status:</strong> {{ activity.status }}</p>
          <p><strong>Participantes:</strong> {{ activity.participants.length }}</p>
        </div>

        <div class="activity-actions">
          <button class="btn-small" @click="editActivity(activity)">Editar</button>
          <button class="btn-small btn-danger" @click="deleteActivity(activity._id)">
            Excluir
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="message info">
      📝 Nenhuma atividade cadastrada. Clique em "Nova Atividade" para começar.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const activities = ref([])
const loading = ref(true)
const error = ref('')
const showAddActivityForm = ref(false)
const newActivity = ref({
  name: '',
  type: 'fisioterapia',
  therapist: {
    name: ''
  }
})

onMounted(async () => {
  await loadActivities()
})

const loadActivities = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await fetch('http://localhost:3000/api/activities')
    
    if (!response.ok) throw new Error('Erro ao carregar atividades')
    
    activities.value = await response.json()
  } catch (err) {
    error.value = 'Não foi possível conectar ao servidor.'
    console.error('Erro:', err)
  } finally {
    loading.value = false
  }
}

const createActivity = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newActivity.value)
    })

    if (!response.ok) throw new Error('Erro ao criar atividade')

    await loadActivities()
    showAddActivityForm.value = false
    newActivity.value = { name: '', type: 'fisioterapia', therapist: { name: '' } }
    alert('✅ Atividade criada com sucesso!')
  } catch (err) {
    alert('❌ Erro ao criar atividade: ' + err.message)
  }
}

const deleteActivity = async (activityId) => {
  if (confirm('Tem certeza que deseja excluir esta atividade?')) {
    try {
      const response = await fetch(`http://localhost:3000/api/activities/${activityId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir atividade')

      await loadActivities()
      alert('✅ Atividade excluída com sucesso!')
    } catch (err) {
      alert('❌ Erro ao excluir atividade: ' + err.message)
    }
  }
}

const editActivity = (activity) => {
  alert(`✏️ Editar atividade ${activity.name} - Em desenvolvimento`)
}
</script>

<style scoped>
.activities-management {
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

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.activity-card {
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  background: #e9ecef;
  color: #495057;
  text-transform: capitalize;
}

.activity-info p {
  margin: 8px 0;
  color: #555;
}

.activity-actions {
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