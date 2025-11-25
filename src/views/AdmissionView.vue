<template>
  <div class="admission-view">
    <!-- Header da Página -->
    <div class="page-header">
      <div class="header-content">
        <h1>👥 Admissão e Triagem de Pacientes</h1>
        <p>Controle de entrada, avaliação inicial e documentação legal</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="showNewPatientForm = true; isEditing = false;">➕ Nova Admissão</button>
        <button class="btn-secondary" @click="generateAdmissionsReport">📊 Relatório de Admissões</button>
      </div>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="quick-stats">
      <div class="stat-item">
        <span class="stat-number">{{ patients.length }}</span>
        <span class="stat-label">Pacientes Totais</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ getPatientsByType('voluntaria').length }}</span>
        <span class="stat-label">Internações Voluntárias</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ getPatientsByType('involuntaria').length }}</span>
        <span class="stat-label">Internações Involuntárias</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ getPendingAdmissions().length }}</span>
        <span class="stat-label">Pendentes de Triagem</span>
      </div>
    </div>

    <!-- Filtros e Busca -->
    <div class="filters-section">
      <div class="search-box">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Buscar paciente por nome, CPF ou prontuário..."
          class="search-input"
        />
      </div>
      <div class="filter-buttons">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="['filter-btn', { active: currentFilter === filter.value }]"
          @click="currentFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Lista de Pacientes -->
    <div class="patients-table">
      <div class="table-header">
        <div class="table-row header-row">
          <div class="table-cell">Prontuário</div>
          <div class="table-cell">Paciente</div>
          <div class="table-cell">CPF</div>
          <div class="table-cell">Tipo Internação</div>
          <div class="table-cell">Data Admissão</div>
          <div class="table-cell">Status</div>
          <div class="table-cell">Ações</div>
        </div>
      </div>

      <div class="table-body">
        <div v-for="patient in filteredPatients" :key="patient._id || patient.id" class="table-row">
          <div class="table-cell">{{ patient.recordNumber }}</div>
          <div class="table-cell">
            <strong>{{ patient.name }}</strong>
            <br />
            <small>{{ patient.age }} anos • {{ patient.gender }}</small>
          </div>
          <div class="table-cell">{{ formatCPF(patient.cpf) }}</div>
          <div class="table-cell">
            <span :class="['badge', `badge-${patient.admissionType}`]">
              {{ getAdmissionTypeLabel(patient.admissionType) }}
            </span>
          </div>
          <div class="table-cell">{{ formatDate(patient.admissionDate) }}</div>
          <div class="table-cell">
            <span :class="['status', `status-${patient.status}`]">
              {{ getStatusLabel(patient.status) }}
            </span>
          </div>
          <div class="table-cell">
            <button class="action-btn view-btn" @click="viewPatient(patient)">👁️ Visualizar</button>
            <button class="action-btn edit-btn" @click="editPatient(patient)">✏️ Editar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Novo Paciente / Edição -->
    <div v-if="showNewPatientForm" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Paciente' : 'Nova Admissão de Paciente' }}</h2>
          <button class="close-btn" @click="showNewPatientForm = false">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="savePatient" class="patient-form">
            <div class="form-row">
              <div class="form-group">
                <label>Nome Completo *</label>
                <input type="text" v-model="newPatient.name" required />
              </div>
              <div class="form-group">
                <label>CPF *</label>
                <input type="text" v-model="newPatient.cpf" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Data de Nascimento *</label>
                <input type="date" v-model="newPatient.birthDate" required />
              </div>
              <div class="form-group">
                <label>Gênero *</label>
                <select v-model="newPatient.gender" required>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tipo de Internação *</label>
                <select v-model="newPatient.admissionType" required>
                  <option value="voluntaria">Voluntária</option>
                  <option value="involuntaria">Involuntária</option>
                  <option value="compulsoria">Compulsória</option>
                </select>
              </div>
              <div class="form-group">
                <label>Substância Principal</label>
                <select v-model="newPatient.mainSubstance">
                  <option value="alcool">Álcool</option>
                  <option value="cocaina">Cocaína/Crack</option>
                  <option value="maconha">Maconha</option>
                  <option value="medicamentos">Medicamentos Controlados</option>
                  <option value="outras">Outras Substâncias</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showNewPatientForm = false">
                Cancelar
              </button>
              <button type="submit" class="btn-save">
                💾 {{ isEditing ? 'Atualizar' : 'Salvar Admissão' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'AdmissionView',
  data() {
    return {
      showNewPatientForm: false,
      searchTerm: '',
      currentFilter: 'all',
      isEditing: false,
      editingPatientId: null,
      filters: [
        { label: 'Todos', value: 'all' },
        { label: 'Voluntárias', value: 'voluntaria' },
        { label: 'Involuntárias', value: 'involuntaria' },
        { label: 'Compulsórias', value: 'compulsoria' },
        { label: 'Pendentes', value: 'pending' },
      ],
      newPatient: {
        name: '',
        cpf: '',
        birthDate: '',
        gender: 'masculino',
        admissionType: 'voluntaria',
        mainSubstance: 'alcool',
      },
      patients: []
    }
  },
  computed: {
    filteredPatients() {
      let filtered = this.patients

      // Filtro por busca
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(
          (patient) =>
            patient.name.toLowerCase().includes(term) ||
            patient.cpf.includes(term) ||
            patient.recordNumber.toLowerCase().includes(term),
        )
      }

      // Filtro por tipo
      if (this.currentFilter !== 'all') {
        if (this.currentFilter === 'pending') {
          filtered = filtered.filter((patient) => patient.status === 'triagem')
        } else {
          filtered = filtered.filter((patient) => patient.admissionType === this.currentFilter)
        }
      }

      return filtered
    },
  },
  methods: {
    async loadPatients() {
      try {
        const response = await api.get('/patients')
        this.patients = response.data
        console.log('Pacientes carregados:', this.patients)
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error)
        alert('Erro ao carregar lista de pacientes')
      }
    },
    
    async savePatient() {
      try {
        // Calcular idade a partir da data de nascimento
        const birthDate = new Date(this.newPatient.birthDate)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        
        const patientData = {
          ...this.newPatient,
          age: age
        }

        let response
        if (this.isEditing) {
          // CORREÇÃO: Verificar se editingPatientId está definido
          if (!this.editingPatientId) {
            throw new Error('ID do paciente não encontrado para edição')
          }
          
          // ATUALIZAR paciente existente
          response = await api.put(`/patients/${this.editingPatientId}`, patientData)
          
          // Atualizar na lista local - CORREÇÃO: usar _id
          const index = this.patients.findIndex(p => p._id === this.editingPatientId)
          if (index !== -1) {
            this.patients.splice(index, 1, response.data)
          }
        } else {
          // CRIAR novo paciente
          response = await api.post('/patients', patientData)
          // Adicionar à lista local
          this.patients.unshift(response.data)
        }

        // Fechar modal e resetar form
        this.showNewPatientForm = false
        this.resetNewPatientForm()

        const action = this.isEditing ? 'atualizado' : 'admitido'
        alert(`Paciente ${response.data.name} ${action} com sucesso!\nProntuário: ${response.data.recordNumber}`)
      } catch (error) {
        console.error('Erro ao salvar paciente:', error)
        alert(error.response?.data?.error || error.message || 'Erro ao salvar paciente')
      }
    },

    editPatient(patient) {
      console.log('🔍 Dados do paciente para edição:', patient)
      console.log('🔍 ID do paciente:', patient._id)

      // CORREÇÃO: Usar _id do MongoDB em vez de id
      this.isEditing = true
      this.editingPatientId = patient._id || patient.id

      // CORREÇÃO: Converter data do MongoDB para formato do input (YYYY-MM-DD)
      let birthDateForInput = ''
      if (patient.birthDate) {
        const date = new Date(patient.birthDate)
        birthDateForInput = date.toISOString().split('T')[0] // Formato YYYY-MM-DD
      }

      this.newPatient = {
        name: patient.name,
        cpf: patient.cpf,
        birthDate: birthDateForInput, // Agora vai aparecer corretamente no input
        gender: patient.gender,
        admissionType: patient.admissionType,
        mainSubstance: patient.mainSubstance || 'alcool',
      }
      this.showNewPatientForm = true
    },

    viewPatient(patient) {
      const details = `
📋 PRONTUÁRIO: ${patient.recordNumber}
👤 NOME: ${patient.name}
📅 IDADE: ${patient.age} anos
⚧ GÊNERO: ${patient.gender}
🔢 CPF: ${this.formatCPF(patient.cpf)}
🏥 TIPO INTERNAÇÃO: ${this.getAdmissionTypeLabel(patient.admissionType)}
💊 SUBSTÂNCIA PRINCIPAL: ${this.getSubstanceLabel(patient.mainSubstance)}
📅 DATA ADMISSÃO: ${this.formatDate(patient.admissionDate)}
📊 STATUS: ${this.getStatusLabel(patient.status)}
      `.trim()

      alert(details)
    },

    generateAdmissionsReport() {
      // Criar conteúdo HTML para o relatório
      const reportContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Admissões - Clínica Vida Nova</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3c72; padding-bottom: 20px; }
                .header h1 { color: #1e3c72; margin: 0; }
                .header .subtitle { color: #666; font-size: 16px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #1e3c72; color: white; }
                .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
                .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 20px 0; }
                .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #1e3c72; }
                .stat-card h3 { margin: 0; font-size: 1.5rem; color: #1e3c72; }
                .stat-card p { margin: 5px 0 0 0; color: #666; }
                @media print {
                    body { margin: 0; }
                    .header { margin-bottom: 20px; }
                    .stats { margin: 15px 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏥 Clínica Vida Nova</h1>
                <p class="subtitle">Relatório de Admissões - ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="stats">
                <div class="stat-card">
                    <h3>${this.patients.length}</h3>
                    <p>Total de Pacientes</p>
                </div>
                <div class="stat-card">
                    <h3>${this.getPatientsByType('voluntaria').length}</h3>
                    <p>Voluntárias</p>
                </div>
                <div class="stat-card">
                    <h3>${this.getPatientsByType('involuntaria').length}</h3>
                    <p>Involuntárias</p>
                </div>
                <div class="stat-card">
                    <h3>${this.getPendingAdmissions().length}</h3>
                    <p>Em Triagem</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Prontuário</th>
                        <th>Paciente</th>
                        <th>Idade</th>
                        <th>Gênero</th>
                        <th>Tipo Internação</th>
                        <th>Substância</th>
                        <th>Data Admissão</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.patients.map(patient => `
                        <tr>
                            <td>${patient.recordNumber}</td>
                            <td>${patient.name}</td>
                            <td>${patient.age} anos</td>
                            <td>${patient.gender}</td>
                            <td>${this.getAdmissionTypeLabel(patient.admissionType)}</td>
                            <td>${this.getSubstanceLabel(patient.mainSubstance)}</td>
                            <td>${this.formatDate(patient.admissionDate)}</td>
                            <td>${this.getStatusLabel(patient.status)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
                <p>Clínica Vida Nova - Sistema de Gestão</p>
                <p>Documento confidencial - Uso interno</p>
            </div>
        </body>
        </html>
      `;
      
      // Abrir nova janela com o relatório
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(reportContent);
      reportWindow.document.close();
      
      // Opção de impressão
      setTimeout(() => {
        reportWindow.print();
      }, 500);
    },

    getPatientsByType(type) {
      return this.patients.filter((patient) => patient.admissionType === type)
    },
    
    getPendingAdmissions() {
      return this.patients.filter((patient) => patient.status === 'triagem')
    },
    
    formatCPF(cpf) {
      if (!cpf) return '---'
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    },
    
    formatDate(date) {
      if (!date) return '---'
      return new Date(date).toLocaleDateString('pt-BR')
    },
    
    getAdmissionTypeLabel(type) {
      const labels = {
        voluntaria: 'Voluntária',
        involuntaria: 'Involuntária',
        compulsoria: 'Compulsória',
      }
      return labels[type] || type
    },

    getSubstanceLabel(substance) {
      const labels = {
        alcool: 'Álcool',
        cocaina: 'Cocaína/Crack',
        maconha: 'Maconha',
        medicamentos: 'Medicamentos Controlados',
        outras: 'Outras Substâncias'
      }
      return labels[substance] || substance
    },
    
    getStatusLabel(status) {
      const labels = {
        triagem: 'Em Triagem',
        internado: 'Internado',
        alta: 'Alta Médica',
      }
      return labels[status] || status
    },
    
    resetNewPatientForm() {
      this.newPatient = {
        name: '',
        cpf: '',
        birthDate: '',
        gender: 'masculino',
        admissionType: 'voluntaria',
        mainSubstance: 'alcool',
      }
      this.isEditing = false
      this.editingPatientId = null
    },
  },
  mounted() {
    this.loadPatients()
  }
}
</script>

<style scoped>
.admission-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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

/* Estatísticas Rápidas */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  border-left: 4px solid #1e3c72;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #1e3c72;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* Filtros */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background: #1e3c72;
  color: white;
  border-color: #1e3c72;
}

/* Tabela */
.patients-table {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-header {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr 1fr 2fr;
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

/* Badges e Status */
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-voluntaria {
  background: #d1fae5;
  color: #065f46;
}

.badge-involuntaria {
  background: #fef3c7;
  color: #92400e;
}

.badge-compulsoria {
  background: #fee2e2;
  color: #991b1b;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-triagem {
  background: #fef3c7;
  color: #92400e;
}

.status-internado {
  background: #d1fae5;
  color: #065f46;
}

.status-alta {
  background: #dbeafe;
  color: #1e40af;
}

/* Botões de Ação */
.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.view-btn {
  background: #dbeafe;
  color: #1e40af;
}

.edit-btn {
  background: #fef3c7;
  color: #92400e;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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

/* Formulário */
.patient-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1e3c72;
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