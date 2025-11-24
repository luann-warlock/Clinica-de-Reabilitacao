<template>
  <div class="medication-view">
    <!-- Header da Página -->
    <div class="page-header">
      <div class="header-content">
        <h1>💊 Controle de Medicação</h1>
        <p>Prescrição eletrônica, dispensação controlada e administração de medicamentos</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openNewPrescription()">
          📝 Nova Prescrição
        </button>
        <button class="btn-secondary" @click="showTodayMedications">
          📋 Medicações de Hoje
        </button>
      </div>
    </div>

    <!-- Alertas e Status -->
    <div class="alerts-section">
      <div class="alert urgent">
        <span>🚨 <strong>{{ getPendingCount() }} medicações pendentes</strong> para administração imediata</span>
      </div>
      <div class="alert warning">
        <span>⚠️ <strong>{{ getControlledMedications().length }} medicamentos controlados</strong> necessitam de conferência</span>
      </div>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="quick-stats">
      <div class="stat-item">
        <div class="stat-icon">💊</div>
        <div class="stat-info">
          <h3>Para Administrar Hoje</h3>
          <p class="stat-number">{{ getTodayMedications().length }}</p>
          <span class="stat-detail">{{ getPendingCount() }} pendentes</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">⚠️</div>
        <div class="stat-info">
          <h3>Controlados</h3>
          <p class="stat-number">{{ getControlledMedications().length }}</p>
          <span class="stat-detail">Portaria 344</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>Administradas</h3>
          <p class="stat-number">{{ getAdministeredCount() }}</p>
          <span class="stat-detail">Hoje</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">⏰</div>
        <div class="stat-info">
          <h3>Próximas 2h</h3>
          <p class="stat-number">{{ getNext2HoursMedications().length }}</p>
          <span class="stat-detail">Próximas doses</span>
        </div>
      </div>
    </div>

    <!-- Filtros e Busca -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Filtrar por:</label>
        <select v-model="currentFilter" class="filter-select">
          <option value="all">Todas as Medicações</option>
          <option value="pending">Pendentes</option>
          <option value="administered">Administradas</option>
          <option value="controlled">Controlados</option>
          <option value="today">Apenas Hoje</option>
        </select>
      </div>
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchTerm"
          placeholder="Buscar por paciente, medicamento ou prescrição..."
          class="search-input"
        >
      </div>
    </div>

    <!-- Lista de Medicações -->
    <div class="medications-table">
      <div class="table-header">
        <div class="table-row header-row">
          <div class="table-cell">Paciente</div>
          <div class="table-cell">Medicamento</div>
          <div class="table-cell">Dose/Horário</div>
          <div class="table-cell">Tipo</div>
          <div class="table-cell">Status</div>
          <div class="table-cell">Prescritor</div>
          <div class="table-cell">Ações</div>
        </div>
      </div>
      
      <div class="table-body">
        <div 
          v-for="med in filteredMedications" 
          :key="med.id"
          :class="['table-row', { 'urgent-row': isUrgent(med) }]"
        >
          <div class="table-cell">
            <strong>{{ med.patientName }}</strong>
            <br>
            <small>Pront: {{ med.patientRecord }}</small>
          </div>
          <div class="table-cell">
            <strong>{{ med.medicationName }}</strong>
            <br>
            <small>{{ med.dosage }}</small>
          </div>
          <div class="table-cell">
            <div class="time-info">
              <span class="time-badge">{{ med.scheduledTime }}</span>
              <br>
              <small v-if="med.administrationTime">
                Admin: {{ med.administrationTime }}
              </small>
            </div>
          </div>
          <div class="table-cell">
            <span :class="['type-badge', `type-${med.medicationType}`]">
              {{ getMedicationTypeLabel(med.medicationType) }}
            </span>
          </div>
          <div class="table-cell">
            <span :class="['status-badge', `status-${med.status}`]">
              {{ getStatusLabel(med.status) }}
            </span>
            <br>
            <small v-if="med.administeredBy">
              Por: {{ med.administeredBy }}
            </small>
          </div>
          <div class="table-cell">
            {{ med.prescribedBy }}
            <br>
            <small>{{ formatDate(med.prescriptionDate) }}</small>
          </div>
          <div class="table-cell">
            <button 
              v-if="med.status === 'pending' && isDue(med)"
              class="action-btn administer-btn"
              @click="administerMedication(med)"
            >
              💊 Administrar
            </button>
            <button 
              v-else-if="med.status === 'pending'"
              class="action-btn schedule-btn"
              @click="viewDetails(med)"
            >
              ⏰ Agendada
            </button>
            <button 
              v-else
              class="action-btn view-btn"
              @click="viewDetails(med)"
            >
              👁️ Detalhes
            </button>
            <button class="action-btn edit-btn" @click="editPrescription(med)">
              ✏️ Editar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Nova/Editar Prescrição -->
    <div v-if="showNewPrescription" class="modal-overlay">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h2>{{ isEditing ? '✏️ Editar Prescrição' : '📝 Nova Prescrição Médica' }}</h2>
          <button class="close-btn" @click="closeNewPrescription()">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="savePrescription" class="prescription-form">
            <div class="form-section">
              <h3>Informações do Paciente</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Paciente *</label>
                  <select v-model="newPrescription.patientId" required>
                    <option value="">Selecione um paciente</option>
                    <option 
                      v-for="patient in patients" 
                      :key="patient.id" 
                      :value="patient.id"
                    >
                      {{ patient.name }} ({{ patient.recordNumber }})
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Prescritor *</label>
                  <input 
                    type="text" 
                    v-model="newPrescription.prescribedBy" 
                    placeholder="Dr. Nome Completo"
                    required
                  >
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Detalhes da Medicação</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Medicamento *</label>
                  <input 
                    type="text" 
                    v-model="newPrescription.medicationName" 
                    placeholder="Nome do medicamento"
                    required
                  >
                </div>
                <div class="form-group">
                  <label>Dosagem *</label>
                  <input 
                    type="text" 
                    v-model="newPrescription.dosage" 
                    placeholder="Ex: 50mg, 10ml"
                    required
                  >
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Via de Administração *</label>
                  <select v-model="newPrescription.administrationRoute" required>
                    <option value="oral">Oral</option>
                    <option value="intravenosa">Intravenosa</option>
                    <option value="intramuscular">Intramuscular</option>
                    <option value="subcutanea">Subcutânea</option>
                    <option value="topica">Tópica</option>
                    <option value="inalatoria">Inalatória</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Tipo de Medicamento *</label>
                  <select v-model="newPrescription.medicationType" required>
                    <option value="routine">Rotina</option>
                    <option value="controlled">Controlado (Port. 344)</option>
                    <option value="antibiotic">Antibiótico</option>
                    <option value="psychotropic">Psicotrópico</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Esquema Posológico</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Horário Programado *</label>
                  <input 
                    type="time" 
                    v-model="newPrescription.scheduledTime" 
                    required
                  >
                </div>
                <div class="form-group">
                  <label>Frequência *</label>
                  <select v-model="newPrescription.frequency" required>
                    <option value="single-dose">Dose Única</option>
                    <option value="every-4h">4/4 horas</option>
                    <option value="every-6h">6/6 horas</option>
                    <option value="every-8h">8/8 horas</option>
                    <option value="every-12h">12/12 horas</option>
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group full-width">
                  <label>Observações</label>
                  <textarea 
                    v-model="newPrescription.observations" 
                    rows="3"
                    placeholder="Observações específicas sobre a administração..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeNewPrescription()">
                Cancelar
              </button>
              <button type="submit" class="btn-save">
                💾 {{ isEditing ? 'Atualizar Prescrição' : 'Salvar Prescrição' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de Administração -->
    <div v-if="showAdministerModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>💊 Administrar Medicação</h2>
          <button class="close-btn" @click="closeAdministerModal()">×</button>
        </div>
        
        <div class="modal-body" v-if="administeringMedication">
          <div class="administration-details">
            <div class="detail-item">
              <strong>Paciente:</strong> {{ administeringMedication.patientName }}
            </div>
            <div class="detail-item">
              <strong>Medicamento:</strong> {{ administeringMedication.medicationName }}
            </div>
            <div class="detail-item">
              <strong>Dosagem:</strong> {{ administeringMedication.dosage }}
            </div>
            <div class="detail-item">
              <strong>Via:</strong> {{ getRouteLabel(administeringMedication.administrationRoute) }}
            </div>
            
            <div class="administration-form">
              <div class="form-group">
                <label>Responsável pela Administração *</label>
                <input 
                  type="text" 
                  v-model="administrationData.administeredBy"
                  placeholder="Seu nome completo"
                  required
                >
              </div>
              
              <div class="form-group">
                <label>Observações da Administração</label>
                <textarea 
                  v-model="administrationData.observations"
                  rows="3"
                  placeholder="Registre qualquer observação relevante..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeAdministerModal()">Cancelar</button>
          <button class="btn-save" @click="confirmAdministration()">
            ✅ Confirmar Administração
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'MedicationView',
  data() {
    return {
      showNewPrescription: false,
      showAdministerModal: false,
      searchTerm: '',
      currentFilter: 'all',
      administeringMedication: null,
      administrationData: {
        administeredBy: '',
        observations: '',
      },
      isEditing: false,
      editingMedicationId: null,
      newPrescription: this.getEmptyPrescription(),
      patients: [
        {
          id: 1,
          name: 'João Silva Santos',
          recordNumber: '2024-001'
        },
        {
          id: 2,
          name: 'Maria Oliveira Costa',
          recordNumber: '2024-002'
        },
        {
          id: 3,
          name: 'Carlos Alberto Souza',
          recordNumber: '2024-003'
        }
      ],
      medications: []
    }
  },
  computed: {
    filteredMedications() {
      let filtered = this.medications

      if (this.currentFilter !== 'all') {
        switch (this.currentFilter) {
          case 'pending':
            filtered = filtered.filter(med => med.status === 'pending')
            break
          case 'administered':
            filtered = filtered.filter(med => med.status === 'administered')
            break
          case 'controlled':
            filtered = filtered.filter(med => med.medicationType === 'controlled')
            break
          case 'today':
            filtered = this.getTodayMedications()
            break
        }
      }

      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(med => 
          med.patientName.toLowerCase().includes(term) ||
          med.medicationName.toLowerCase().includes(term) ||
          med.patientRecord.toLowerCase().includes(term)
        )
      }

      return filtered
    }
  },
  methods: {
    async loadMedications() {
      try {
        const response = await api.get('/medications')
        this.medications = response.data
      } catch (error) {
        console.error('Erro ao carregar medicações:', error)
        // Fallback para dados mock se a API não estiver disponível
        this.medications = this.getMockMedications()
      }
    },

    getEmptyPrescription() {
      return {
        patientId: '',
        medicationName: '',
        dosage: '',
        administrationRoute: 'oral',
        medicationType: 'routine',
        scheduledTime: '',
        frequency: 'single-dose',
        prescribedBy: '',
        observations: ''
      }
    },

    getMockMedications() {
      return [
        {
          id: 1,
          patientId: 1,
          patientName: 'João Silva Santos',
          patientRecord: '2024-001',
          medicationName: 'Diazepam',
          dosage: '10mg',
          administrationRoute: 'oral',
          medicationType: 'controlled',
          scheduledTime: '08:00',
          frequency: 'daily',
          status: 'pending',
          prescribedBy: 'Dr. Silva',
          prescriptionDate: '2024-01-15',
          observations: 'Monitorar sedação'
        }
      ]
    },
    
    openNewPrescription() {
      this.isEditing = false
      this.editingMedicationId = null
      this.newPrescription = this.getEmptyPrescription()
      this.showNewPrescription = true
    },

    async editPrescription(medication) {
      this.newPrescription = {
        patientId: medication.patientId.toString(),
        medicationName: medication.medicationName,
        dosage: medication.dosage,
        administrationRoute: medication.administrationRoute,
        medicationType: medication.medicationType,
        scheduledTime: medication.scheduledTime,
        frequency: medication.frequency,
        prescribedBy: medication.prescribedBy,
        observations: medication.observations || ''
      }
      
      this.isEditing = true
      this.editingMedicationId = medication.id
      this.showNewPrescription = true
    },

    closeNewPrescription() {
      this.showNewPrescription = false
      this.isEditing = false
      this.editingMedicationId = null
      this.newPrescription = this.getEmptyPrescription()
    },

    async savePrescription() {
      if (!this.newPrescription.patientId) {
        alert('Por favor, selecione um paciente.')
        return
      }

      const patient = this.patients.find(p => p.id == this.newPrescription.patientId)
      if (!patient) {
        alert('Paciente não encontrado.')
        return
      }

      try {
        const prescriptionData = {
          ...this.newPrescription,
          patientId: parseInt(this.newPrescription.patientId),
          patientName: patient.name,
          patientRecord: patient.recordNumber
        }

        if (this.isEditing) {
          // Atualizar medicação existente
          const response = await api.put(`/medications/${this.editingMedicationId}`, prescriptionData)
          const updatedMedication = response.data
          
          // Atualizar na lista local
          const index = this.medications.findIndex(m => m.id === this.editingMedicationId)
          if (index !== -1) {
            this.medications[index] = updatedMedication
          }
          
          alert(`✅ Prescrição de ${updatedMedication.medicationName} atualizada com sucesso!`)
        } else {
          // Criar nova prescrição
          const response = await api.post('/medications', prescriptionData)
          this.medications.unshift(response.data)
          alert(`✅ Prescrição criada com sucesso para ${patient.name}!`)
        }

        this.closeNewPrescription()
      } catch (error) {
        console.error('Erro ao salvar prescrição:', error)
        alert(error.response?.data?.error || 'Erro ao salvar prescrição')
      }
    },

    getTodayMedications() {
      return this.medications.filter(med => {
        return med.status === 'pending' || 
               (med.status === 'administered' && this.isToday(med.administrationTime))
      })
    },

    getControlledMedications() {
      return this.medications.filter(med => med.medicationType === 'controlled')
    },

    getPendingCount() {
      return this.medications.filter(med => med.status === 'pending').length
    },

    getAdministeredCount() {
      return this.medications.filter(med => 
        med.status === 'administered' && this.isToday(med.administrationTime)
      ).length
    },

    getNext2HoursMedications() {
      const now = new Date()
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      
      return this.medications.filter(med => {
        if (med.status !== 'pending') return false
        
        const [hours, minutes] = med.scheduledTime.split(':')
        const medTime = new Date()
        medTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        
        return medTime > now && medTime <= twoHoursLater
      })
    },

    isToday(dateString) {
      if (!dateString) return false
      const today = new Date().toDateString()
      const medDate = new Date(dateString).toDateString()
      return today === medDate
    },

    isDue(medication) {
      const now = new Date()
      const [hours, minutes] = medication.scheduledTime.split(':')
      const medTime = new Date()
      medTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      return now >= medTime
    },

    isUrgent(medication) {
      if (medication.status !== 'pending') return false
      
      const now = new Date()
      const [hours, minutes] = medication.scheduledTime.split(':')
      const medTime = new Date()
      medTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      return medTime <= oneHourAgo
    },

    getMedicationTypeLabel(type) {
      const labels = {
        routine: 'Rotina',
        controlled: 'Controlado',
        antibiotic: 'Antibiótico',
        psychotropic: 'Psicotrópico'
      }
      return labels[type] || type
    },

    getStatusLabel(status) {
      const labels = {
        pending: 'Pendente',
        administered: 'Administrada',
        cancelled: 'Cancelada'
      }
      return labels[status] || status
    },

    getRouteLabel(route) {
      const labels = {
        oral: 'Oral',
        intravenosa: 'Intravenosa',
        intramuscular: 'Intramuscular',
        subcutanea: 'Subcutânea',
        topica: 'Tópica',
        inalatoria: 'Inalatória'
      }
      return labels[route] || route
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('pt-BR')
    },

    viewDetails(medication) {
      const details = `
💊 DETALHES DA MEDICAÇÃO

Paciente: ${medication.patientName}
Medicamento: ${medication.medicationName}
Dosagem: ${medication.dosage}
Via: ${this.getRouteLabel(medication.administrationRoute)}
Tipo: ${this.getMedicationTypeLabel(medication.medicationType)}
Horário: ${medication.scheduledTime}
Status: ${this.getStatusLabel(medication.status)}
Prescritor: ${medication.prescribedBy}

Observações: ${medication.observations || 'Nenhuma'}
      `.trim()

      alert(details)
    },

    async administerMedication(medication) {
      this.administeringMedication = { ...medication }
      this.administrationData = {
        administeredBy: '',
        observations: ''
      }
      this.showAdministerModal = true
    },

    showTodayMedications() {
      this.currentFilter = 'today'
    },

    closeAdministerModal() {
      this.showAdministerModal = false
      this.administeringMedication = null
    },

    async confirmAdministration() {
      if (!this.administrationData.administeredBy) {
        alert('Por favor, informe o responsável pela administração.')
        return
      }

      try {
        const now = new Date()
        const timeString = now.toTimeString().substring(0, 5)
        
        const administrationData = {
          status: 'administered',
          administeredBy: this.administrationData.administeredBy,
          administrationTime: timeString,
          administrationObservations: this.administrationData.observations
        }

        const response = await api.put(`/medications/${this.administeringMedication.id}`, administrationData)
        
        // Atualizar na lista local
        const index = this.medications.findIndex(m => m.id === this.administeringMedication.id)
        if (index !== -1) {
          this.medications[index] = response.data
        }

        alert(`Medicação administrada com sucesso!\nRegistrado por: ${this.administrationData.administeredBy}`)
        this.closeAdministerModal()
      } catch (error) {
        console.error('Erro ao administrar medicação:', error)
        alert(error.response?.data?.error || 'Erro ao administrar medicação')
      }
    }
  },
  mounted() {
    this.loadMedications()
  }
}
</script>

<style scoped>
/* Os estilos permanecem exatamente os mesmos do MedicationView.vue original */
.medication-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.header-content h1 {
  color: #1e3c72;
  margin-bottom: 0.5rem;
}

.header-content p {
  color: #666;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.alerts-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.alert {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
}

.alert.urgent {
  background: #fef2f2;
  border: 2px solid #fecaca;
  color: #dc2626;
}

.alert.warning {
  background: #fffbeb;
  border: 2px solid #fed7aa;
  color: #ea580c;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #1e3c72;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info h3 {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-number {
  color: #1e3c72;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.stat-detail {
  color: #10b981;
  font-size: 0.8rem;
  font-weight: 500;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  background: white;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.medications-table {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
}

.table-header {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr 1.5fr 2fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  align-items: center;
}

.header-row {
  font-weight: bold;
  color: #1e3c72;
}

.table-row:not(.header-row) {
  border-bottom: 1px solid #f1f5f9;
}

.table-row:not(.header-row):hover {
  background: #f8fafc;
}

.urgent-row {
  background: #fef2f2 !important;
  border-left: 4px solid #dc2626;
}

.type-badge, .status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-routine {
  background: #d1fae5;
  color: #065f46;
}

.type-controlled {
  background: #fef3c7;
  color: #92400e;
}

.type-antibiotic {
  background: #dbeafe;
  color: #1e40af;
}

.type-psychotropic {
  background: #e9d5ff;
  color: #7c3aed;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-administered {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #f1f5f9;
  color: #64748b;
}

.time-badge {
  background: #1e3c72;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: bold;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
}

.administer-btn {
  background: #10b981;
  color: white;
  font-weight: bold;
}

.schedule-btn {
  background: #f59e0b;
  color: white;
}

.view-btn {
  background: #dbeafe;
  color: #1e40af;
}

.edit-btn {
  background: #fef3c7;
  color: #92400e;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.large-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  color: #1e3c72;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
}

.prescription-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
}

.form-section h3 {
  color: #1e3c72;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1e3c72;
}

.full-width {
  grid-column: 1 / -1;
}

.administration-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
}

.detail-item strong {
  color: #1e3c72;
}

.administration-form {
  margin-top: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancel {
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn-save {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
</style>