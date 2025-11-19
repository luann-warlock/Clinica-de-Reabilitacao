<template>
  <div class="medical-record-view">
    <!-- Header da Página - ORIGINAL -->
    <div class="page-header">
      <div class="header-content">
        <h1>📋 Prontuário Eletrônico</h1>
        <p>Histórico médico completo, evoluções diárias e prescrições integradas</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="showNewEvolution = true">
          📝 Nova Evolução
        </button>
        <button class="btn-secondary" @click="generateRealReport">
          📊 Gerar Relatório
        </button>
      </div>
    </div>

    <!-- Seleção de Paciente - ORIGINAL -->
    <div class="patient-selector">
      <div class="form-group">
        <label>Selecionar Paciente</label>
        <select v-model="selectedPatientId" @change="loadPatientData" class="patient-select">
          <option value="">Selecione um paciente</option>
          <option v-for="patient in patients" :key="patient.id" :value="patient.id">
            {{ patient.name }} ({{ patient.recordNumber }})
          </option>
        </select>
      </div>
    </div>

    <!-- Info do Paciente Selecionado - ORIGINAL -->
    <div v-if="selectedPatient" class="patient-info-card">
      <div class="patient-header">
        <h3>{{ selectedPatient.name }}</h3>
        <span class="patient-record">Prontuário: {{ selectedPatient.recordNumber }}</span>
      </div>
      <div class="patient-details">
        <div class="detail-item">
          <strong>Idade:</strong> {{ selectedPatient.age }} anos
        </div>
        <div class="detail-item">
          <strong>Gênero:</strong> {{ selectedPatient.gender }}
        </div>
        <div class="detail-item">
          <strong>Admissão:</strong> {{ formatDate(selectedPatient.admissionDate) }}
        </div>
        <div class="detail-item">
          <strong>Status:</strong> 
          <span :class="['status-badge', `status-${selectedPatient.status}`]">
            {{ getStatusLabel(selectedPatient.status) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Abas do Prontuário - ORIGINAL -->
    <div v-if="selectedPatient" class="medical-record-tabs">
      <div class="tabs-header">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- ABA: Histórico Médico - ORIGINAL -->
        <div v-if="currentTab === 'history'" class="tab-panel">
          <div class="section-header">
            <h3>🩺 Histórico Médico Completo</h3>
            <button class="btn-primary small" @click="openEditMedicalHistory">
              ✏️ Editar Histórico
            </button>
          </div>

          <div class="history-sections">
            <!-- Anamnese -->
            <div class="history-section">
              <h4>Anamnese e Avaliação Inicial</h4>
              <div class="history-content">
                <div v-if="selectedPatient.medicalHistory" class="history-grid">
                  <div class="history-item">
                    <strong>Substância Principal:</strong>
                    <span>{{ getSubstanceLabel(selectedPatient.medicalHistory.mainSubstance) }}</span>
                  </div>
                  <div class="history-item">
                    <strong>Tempo de Uso:</strong>
                    <span>{{ selectedPatient.medicalHistory.usageTime }}</span>
                  </div>
                  <div class="history-item">
                    <strong>Tratamentos Anteriores:</strong>
                    <span>{{ selectedPatient.medicalHistory.previousTreatments || 'Nenhum' }}</span>
                  </div>
                  <div class="history-item">
                    <strong>Comorbidades:</strong>
                    <span>{{ selectedPatient.medicalHistory.comorbidities || 'Nenhuma registrada' }}</span>
                  </div>
                  <div class="history-item">
                    <strong>Medicações em Uso:</strong>
                    <span>{{ selectedPatient.medicalHistory.currentMedications || 'Nenhuma' }}</span>
                  </div>
                  <div class="history-item">
                    <strong>Histórico Familiar:</strong>
                    <span>{{ selectedPatient.medicalHistory.familyHistory || 'Não informado' }}</span>
                  </div>
                  <div class="history-item">
                    <strong>Alergias:</strong>
                    <span>{{ selectedPatient.medicalHistory.allergies || 'Nenhuma conhecida' }}</span>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <p>Histórico médico não preenchido</p>
                  <button class="btn-primary" @click="openEditMedicalHistory">
                    Preencher Histórico
                  </button>
                </div>
              </div>
            </div>

            <!-- Diagnósticos -->
            <div class="history-section">
              <h4>Diagnósticos</h4>
              <div class="diagnoses-list">
                <div v-for="diagnosis in selectedPatient.diagnoses" :key="diagnosis.id" class="diagnosis-item">
                  <span class="diagnosis-code">{{ diagnosis.code }}</span>
                  <span class="diagnosis-description">{{ diagnosis.description }}</span>
                  <span class="diagnosis-date">{{ formatDate(diagnosis.date) }}</span>
                </div>
                <div v-if="!selectedPatient.diagnoses?.length" class="empty-state">
                  <p>Nenhum diagnóstico registrado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ABA: Evoluções Clínicas - ORIGINAL -->
        <div v-if="currentTab === 'evolutions'" class="tab-panel">
          <div class="section-header">
            <h3>📈 Evoluções Clínicas</h3>
            <button class="btn-primary" @click="showNewEvolution = true">
              ➕ Nova Evolução
            </button>
          </div>

          <div class="evolutions-list">
            <div v-for="evolution in selectedPatient.evolutions" :key="evolution.id" class="evolution-card">
              <div class="evolution-header">
                <div class="evolution-meta">
                  <span class="evolution-date">{{ formatDateTime(evolution.date) }}</span>
                  <span class="evolution-author">por {{ evolution.author }}</span>
                </div>
                <div class="evolution-actions">
                  <button class="action-btn view-btn" @click="viewEvolution(evolution)">
                    👁️ Ver
                  </button>
                </div>
              </div>
              <div class="evolution-content">
                <p>{{ evolution.content }}</p>
              </div>
              <div class="evolution-footer">
                <span :class="['evolution-type', `type-${evolution.type}`]">
                  {{ getEvolutionTypeLabel(evolution.type) }}
                </span>
                <span v-if="evolution.medicationsPrescribed" class="medications-count">
                  💊 {{ evolution.medicationsPrescribed.length }} medicações
                </span>
              </div>
            </div>

            <div v-if="!selectedPatient.evolutions?.length" class="empty-state">
              <p>Nenhuma evolução clínica registrada</p>
              <button class="btn-primary" @click="showNewEvolution = true">
                Registrar Primeira Evolução
              </button>
            </div>
          </div>
        </div>

        <!-- ABA: Prescrições - ORIGINAL -->
        <div v-if="currentTab === 'prescriptions'" class="tab-panel">
          <div class="section-header">
            <h3>💊 Prescrições Médicas</h3>
            <button class="btn-primary" @click="showNewPrescription = true">
              ➕ Nova Prescrição
            </button>
          </div>

          <div class="prescriptions-list">
            <div v-for="prescription in selectedPatient.prescriptions" :key="prescription.id" class="prescription-card">
              <div class="prescription-header">
                <div class="prescription-info">
                  <h4>{{ prescription.medicationName }}</h4>
                  <span class="prescription-date">{{ formatDate(prescription.date) }}</span>
                </div>
                <div class="prescription-status">
                  <span :class="['status-badge', `status-${prescription.status}`]">
                    {{ getPrescriptionStatusLabel(prescription.status) }}
                  </span>
                </div>
              </div>
              <div class="prescription-details">
                <div class="detail-item">
                  <strong>Dosagem:</strong> {{ prescription.dosage }}
                </div>
                <div class="detail-item">
                  <strong>Frequência:</strong> {{ getFrequencyLabel(prescription.frequency) }}
                </div>
                <div class="detail-item">
                  <strong>Via:</strong> {{ getRouteLabel(prescription.route) }}
                </div>
                <div class="detail-item">
                  <strong>Prescritor:</strong> {{ prescription.prescribedBy }}
                </div>
              </div>
              <div v-if="prescription.observations" class="prescription-observations">
                <strong>Observações:</strong> {{ prescription.observations }}
              </div>
            </div>

            <div v-if="!selectedPatient.prescriptions?.length" class="empty-state">
              <p>Nenhuma prescrição registrada</p>
              <button class="btn-primary" @click="showNewPrescription = true">
                Adicionar Prescrição
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nova Evolução - ORIGINAL -->
    <div v-if="showNewEvolution" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>📝 Nova Evolução Clínica</h2>
          <button class="close-btn" @click="showNewEvolution = false">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveEvolution" class="evolution-form">
            <div class="form-group">
              <label>Tipo de Evolução *</label>
              <select v-model="newEvolution.type" required>
                <option value="medical">Médica</option>
                <option value="nursing">Enfermagem</option>
                <option value="psychological">Psicológica</option>
                <option value="multidisciplinary">Multidisciplinar</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Conteúdo da Evolução *</label>
              <textarea 
                v-model="newEvolution.content" 
                rows="6"
                placeholder="Descreva a evolução do paciente, sinais vitais, comportamento, progressos, etc."
                required
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Responsável *</label>
              <input 
                type="text" 
                v-model="newEvolution.author" 
                placeholder="Seu nome e cargo"
                required
              >
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showNewEvolution = false">
                Cancelar
              </button>
              <button type="submit" class="btn-save">
                💾 Salvar Evolução
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Nova Prescrição - ORIGINAL -->
    <div v-if="showNewPrescription" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>💊 Nova Prescrição Médica</h2>
          <button class="close-btn" @click="showNewPrescription = false">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="savePrescription" class="prescription-form">
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
                <select v-model="newPrescription.route" required>
                  <option value="oral">Oral</option>
                  <option value="intravenosa">Intravenosa</option>
                  <option value="intramuscular">Intramuscular</option>
                  <option value="subcutanea">Subcutânea</option>
                </select>
              </div>
              <div class="form-group">
                <label>Frequência *</label>
                <select v-model="newPrescription.frequency" required>
                  <option value="dose-unica">Dose Única</option>
                  <option value="4-4h">4/4 horas</option>
                  <option value="6-6h">6/6 horas</option>
                  <option value="8-8h">8/8 horas</option>
                  <option value="12-12h">12/12 horas</option>
                  <option value="diario">Diário</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Prescritor *</label>
                <input 
                  type="text" 
                  v-model="newPrescription.prescribedBy" 
                  placeholder="Dr. Nome Completo"
                  required
                >
              </div>
              <div class="form-group">
                <label>Duração</label>
                <input 
                  type="text" 
                  v-model="newPrescription.duration" 
                  placeholder="Ex: 7 dias, até nova avaliação"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label>Observações</label>
              <textarea 
                v-model="newPrescription.observations" 
                rows="3"
                placeholder="Observações específicas sobre a prescrição..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showNewPrescription = false">
                Cancelar
              </button>
              <button type="submit" class="btn-save">
                💾 Salvar Prescrição
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Editar Histórico Médico - ORIGINAL -->
    <div v-if="showEditMedicalHistory" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>✏️ Editar Histórico Médico</h2>
          <button class="close-btn" @click="showEditMedicalHistory = false">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveMedicalHistory" class="medical-history-form">
            <div class="form-group">
              <label>Substância Principal *</label>
              <select v-model="editingMedicalHistory.mainSubstance" required>
                <option value="alcool">Álcool</option>
                <option value="cocaina">Cocaína/Crack</option>
                <option value="maconha">Maconha</option>
                <option value="medicamentos">Medicamentos Controlados</option>
                <option value="outras">Outras Substâncias</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tempo de Uso *</label>
              <input 
                type="text" 
                v-model="editingMedicalHistory.usageTime" 
                placeholder="Ex: 5 anos, 2 meses"
                required
              >
            </div>

            <div class="form-group">
              <label>Tratamentos Anteriores</label>
              <textarea 
                v-model="editingMedicalHistory.previousTreatments" 
                rows="2"
                placeholder="Descreva tratamentos anteriores, internações, etc."
              ></textarea>
            </div>

            <div class="form-group">
              <label>Comorbidades</label>
              <textarea 
                v-model="editingMedicalHistory.comorbidities" 
                rows="2"
                placeholder="Liste comorbidades existentes (hipertensão, diabetes, etc.)"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Medicações em Uso</label>
              <textarea 
                v-model="editingMedicalHistory.currentMedications" 
                rows="2"
                placeholder="Liste medicações em uso contínuo"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Histórico Familiar</label>
              <input 
                type="text" 
                v-model="editingMedicalHistory.familyHistory" 
                placeholder="Histórico de dependência química na família"
              >
            </div>

            <div class="form-group">
              <label>Alergias</label>
              <input 
                type="text" 
                v-model="editingMedicalHistory.allergies" 
                placeholder="Liste alergias conhecidas"
              >
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showEditMedicalHistory = false">
                Cancelar
              </button>
              <button type="submit" class="btn-save">
                💾 Salvar Histórico
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MedicalRecordView',
  data() {
    return {
      selectedPatientId: '',
      currentTab: 'history',
      showNewEvolution: false,
      showNewPrescription: false,
      showEditMedicalHistory: false,
      tabs: [
        { id: 'history', label: '🩺 Histórico Médico' },
        { id: 'evolutions', label: '📈 Evoluções' },
        { id: 'prescriptions', label: '💊 Prescrições' }
      ],
      newEvolution: {
        type: 'medical',
        content: '',
        author: ''
      },
      newPrescription: {
        medicationName: '',
        dosage: '',
        route: 'oral',
        frequency: 'dose-unica',
        prescribedBy: '',
        duration: '',
        observations: ''
      },
      editingMedicalHistory: {
        mainSubstance: 'alcool',
        usageTime: '',
        previousTreatments: '',
        comorbidities: '',
        currentMedications: '',
        familyHistory: '',
        allergies: ''
      },
      patients: [
        {
          id: 1,
          name: 'João Silva Santos',
          recordNumber: '2024-001',
          age: 34,
          gender: 'masculino',
          admissionDate: '2024-01-15',
          status: 'internado',
          medicalHistory: {
            mainSubstance: 'alcool',
            usageTime: '8 anos',
            previousTreatments: '2 internações anteriores',
            comorbidities: 'Hipertensão, Ansiedade',
            currentMedications: 'Sertralina 50mg, Losartana 50mg',
            familyHistory: 'Pai com histórico de alcoolismo',
            allergies: 'Penicilina'
          },
          diagnoses: [
            {
              id: 1,
              code: 'F10.2',
              description: 'Transtorno por uso de álcool - dependência',
              date: '2024-01-15'
            },
            {
              id: 2,
              code: 'F41.1',
              description: 'Transtorno de ansiedade generalizada',
              date: '2024-01-16'
            }
          ],
          evolutions: [
            {
              id: 1,
              type: 'medical',
              content: 'Paciente em abstinência alcoólica. Apresenta tremores finos e ansiedade. Sinais vitais estáveis. Iniciado protocolo de desintoxicação.',
              author: 'Dr. Silva - Psiquiatra',
              date: '2024-01-18T10:30:00',
              medicationsPrescribed: ['Diazepam 10mg', 'Vitamina B1 100mg']
            },
            {
              id: 2,
              type: 'nursing',
              content: 'Paciente colaborativo. Aceitando medicação. Sono preservado. Apetite reduzido.',
              author: 'Enf. Ana Souza',
              date: '2024-01-18T14:15:00'
            }
          ],
          prescriptions: [
            {
              id: 1,
              medicationName: 'Diazepam',
              dosage: '10mg',
              route: 'oral',
              frequency: '8-8h',
              prescribedBy: 'Dr. Silva',
              date: '2024-01-15',
              status: 'active',
              duration: '7 dias',
              observations: 'Reduzir gradualmente a partir do 4º dia'
            },
            {
              id: 2,
              medicationName: 'Vitamina B1',
              dosage: '100mg',
              route: 'oral',
              frequency: 'diario',
              prescribedBy: 'Dr. Silva',
              date: '2024-01-15',
              status: 'active',
              observations: 'Prevenção de síndrome de Wernicke-Korsakoff'
            }
          ]
        },
        {
          id: 2,
          name: 'Maria Oliveira Costa',
          recordNumber: '2024-002',
          age: 28,
          gender: 'feminino',
          admissionDate: '2024-01-16',
          status: 'internado'
        }
      ]
    }
  },
  computed: {
    selectedPatient() {
      return this.patients.find(p => p.id == this.selectedPatientId) || null
    }
  },
  methods: {
    // ... (todos os métodos permanecem EXATAMENTE iguais) ...
    // Manter todos os métodos da versão anterior
    loadPatientData() {
      console.log('Carregando dados do paciente:', this.selectedPatientId)
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('pt-BR')
    },
    
    formatDateTime(dateTimeString) {
      return new Date(dateTimeString).toLocaleString('pt-BR')
    },
    
    getStatusLabel(status) {
      const labels = {
        triagem: 'Em Triagem',
        internado: 'Internado',
        alta: 'Alta Médica'
      }
      return labels[status] || status
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
    
    getEvolutionTypeLabel(type) {
      const labels = {
        medical: 'Médica',
        nursing: 'Enfermagem',
        psychological: 'Psicológica',
        multidisciplinary: 'Multidisciplinar'
      }
      return labels[type] || type
    },
    
    getPrescriptionStatusLabel(status) {
      const labels = {
        active: 'Ativa',
        completed: 'Concluída',
        suspended: 'Suspensa',
        cancelled: 'Cancelada'
      }
      return labels[status] || status
    },
    
    getRouteLabel(route) {
      const labels = {
        oral: 'Oral',
        intravenosa: 'Intravenosa',
        intramuscular: 'Intramuscular',
        subcutanea: 'Subcutânea'
      }
      return labels[route] || route
    },
    
    getFrequencyLabel(frequency) {
      const labels = {
        'dose-unica': 'Dose Única',
        '4-4h': '4/4 horas',
        '6-6h': '6/6 horas',
        '8-8h': '8/8 horas',
        '12-12h': '12/12 horas',
        'diario': 'Diário',
        'semanal': 'Semanal'
      }
      return labels[frequency] || frequency
    },
    
    openEditMedicalHistory() {
      if (this.selectedPatient.medicalHistory) {
        this.editingMedicalHistory = { ...this.selectedPatient.medicalHistory }
      } else {
        this.editingMedicalHistory = {
          mainSubstance: 'alcool',
          usageTime: '',
          previousTreatments: '',
          comorbidities: '',
          currentMedications: '',
          familyHistory: '',
          allergies: ''
        }
      }
      this.showEditMedicalHistory = true
    },
    
    saveMedicalHistory() {
      if (!this.selectedPatient.medicalHistory) {
        this.selectedPatient.medicalHistory = {}
      }
      this.selectedPatient.medicalHistory = { ...this.editingMedicalHistory }
      this.showEditMedicalHistory = false
      alert('Histórico médico salvo com sucesso!')
    },
    
    viewEvolution(evolution) {
      const details = `
📋 EVOLUÇÃO CLÍNICA

Data: ${this.formatDateTime(evolution.date)}
Tipo: ${this.getEvolutionTypeLabel(evolution.type)}
Autor: ${evolution.author}

Conteúdo:
${evolution.content}

${evolution.medicationsPrescribed ? `Medicações: ${evolution.medicationsPrescribed.join(', ')}` : ''}
      `.trim()
      
      alert(details)
    },
    
    saveEvolution() {
      if (!this.selectedPatient) return
      
      const newEvolution = {
        id: this.selectedPatient.evolutions ? this.selectedPatient.evolutions.length + 1 : 1,
        type: this.newEvolution.type,
        content: this.newEvolution.content,
        author: this.newEvolution.author,
        date: new Date().toISOString()
      }
      
      if (!this.selectedPatient.evolutions) {
        this.selectedPatient.evolutions = []
      }
      
      this.selectedPatient.evolutions.unshift(newEvolution)
      this.showNewEvolution = false
      this.resetNewEvolution()
      
      alert('Evolução registrada com sucesso!')
    },
    
    savePrescription() {
      if (!this.selectedPatient) return
      
      const newPrescription = {
        id: this.selectedPatient.prescriptions ? this.selectedPatient.prescriptions.length + 1 : 1,
        medicationName: this.newPrescription.medicationName,
        dosage: this.newPrescription.dosage,
        route: this.newPrescription.route,
        frequency: this.newPrescription.frequency,
        prescribedBy: this.newPrescription.prescribedBy,
        date: new Date().toISOString().split('T')[0],
        status: 'active',
        duration: this.newPrescription.duration,
        observations: this.newPrescription.observations
      }
      
      if (!this.selectedPatient.prescriptions) {
        this.selectedPatient.prescriptions = []
      }
      
      this.selectedPatient.prescriptions.unshift(newPrescription)
      this.showNewPrescription = false
      this.resetNewPrescription()
      
      alert('Prescrição salva com sucesso!')
    },
    
    resetNewEvolution() {
      this.newEvolution = {
        type: 'medical',
        content: '',
        author: ''
      }
    },
    
    resetNewPrescription() {
      this.newPrescription = {
        medicationName: '',
        dosage: '',
        route: 'oral',
        frequency: 'dose-unica',
        prescribedBy: '',
        duration: '',
        observations: ''
      }
    },
    
    generateRealReport() {
      if (!this.selectedPatient) {
        alert('Selecione um paciente para gerar o relatório.')
        return
      }
      
      // Criar conteúdo HTML para o relatório
      const reportContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório Médico - ${this.selectedPatient.name}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    line-height: 1.6;
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px;
                    border-bottom: 2px solid #1e3c72;
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: #1e3c72; 
                    margin: 0;
                }
                .header .subtitle {
                    color: #666;
                    font-size: 16px;
                }
                .section { 
                    margin-bottom: 25px;
                    page-break-inside: avoid;
                }
                .section h2 { 
                    color: #1e3c72; 
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 5px;
                }
                .patient-info { 
                    background: #f8fafc; 
                    padding: 15px; 
                    border-radius: 8px;
                    border-left: 4px solid #1e3c72;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .info-item {
                    margin-bottom: 8px;
                }
                .info-item strong {
                    color: #1e3c72;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 15px 0;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 10px; 
                    text-align: left; 
                }
                th { 
                    background-color: #1e3c72; 
                    color: white; 
                }
                .evolution-card {
                    background: #f8fafc;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 6px;
                    border-left: 3px solid #2a5298;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 15px;
                }
                @media print {
                    body { margin: 0; }
                    .header { margin-bottom: 20px; }
                    .section { margin-bottom: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏥 Clínica Vida Nova</h1>
                <p class="subtitle">Relatório Médico Completo</p>
            </div>

            <div class="section">
                <h2>📋 Dados do Paciente</h2>
                <div class="patient-info">
                    <div class="info-grid">
                        <div class="info-item"><strong>Nome:</strong> ${this.selectedPatient.name}</div>
                        <div class="info-item"><strong>Prontuário:</strong> ${this.selectedPatient.recordNumber}</div>
                        <div class="info-item"><strong>Idade:</strong> ${this.selectedPatient.age} anos</div>
                        <div class="info-item"><strong>Gênero:</strong> ${this.selectedPatient.gender}</div>
                        <div class="info-item"><strong>Data de Admissão:</strong> ${this.formatDate(this.selectedPatient.admissionDate)}</div>
                        <div class="info-item"><strong>Status:</strong> ${this.getStatusLabel(this.selectedPatient.status)}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🩺 Histórico Médico</h2>
                ${this.selectedPatient.medicalHistory ? `
                    <div class="info-grid">
                        <div class="info-item"><strong>Substância Principal:</strong> ${this.getSubstanceLabel(this.selectedPatient.medicalHistory.mainSubstance)}</div>
                        <div class="info-item"><strong>Tempo de Uso:</strong> ${this.selectedPatient.medicalHistory.usageTime}</div>
                        <div class="info-item"><strong>Tratamentos Anteriores:</strong> ${this.selectedPatient.medicalHistory.previousTreatments || 'Nenhum'}</div>
                        <div class="info-item"><strong>Comorbidades:</strong> ${this.selectedPatient.medicalHistory.comorbidities || 'Nenhuma'}</div>
                        <div class="info-item"><strong>Medicações em Uso:</strong> ${this.selectedPatient.medicalHistory.currentMedications || 'Nenhuma'}</div>
                        <div class="info-item"><strong>Histórico Familiar:</strong> ${this.selectedPatient.medicalHistory.familyHistory || 'Não informado'}</div>
                        <div class="info-item"><strong>Alergias:</strong> ${this.selectedPatient.medicalHistory.allergies || 'Nenhuma conhecida'}</div>
                    </div>
                ` : '<p>Histórico médico não preenchido.</p>'}
            </div>

            ${this.selectedPatient.diagnoses && this.selectedPatient.diagnoses.length > 0 ? `
            <div class="section">
                <h2>📝 Diagnósticos</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descrição</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.selectedPatient.diagnoses.map(diagnosis => `
                            <tr>
                                <td>${diagnosis.code}</td>
                                <td>${diagnosis.description}</td>
                                <td>${this.formatDate(diagnosis.date)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            ${this.selectedPatient.evolutions && this.selectedPatient.evolutions.length > 0 ? `
            <div class="section">
                <h2>📈 Evoluções Clínicas</h2>
                ${this.selectedPatient.evolutions.map(evolution => `
                    <div class="evolution-card">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <strong>${this.formatDateTime(evolution.date)}</strong>
                            <span style="background: #e2e8f0; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                                ${this.getEvolutionTypeLabel(evolution.type)}
                            </span>
                        </div>
                        <p><strong>Responsável:</strong> ${evolution.author}</p>
                        <p>${evolution.content}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${this.selectedPatient.prescriptions && this.selectedPatient.prescriptions.length > 0 ? `
            <div class="section">
                <h2>💊 Prescrições Médicas</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Medicamento</th>
                            <th>Dosagem</th>
                            <th>Frequência</th>
                            <th>Via</th>
                            <th>Prescritor</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.selectedPatient.prescriptions.map(prescription => `
                            <tr>
                                <td>${prescription.medicationName}</td>
                                <td>${prescription.dosage}</td>
                                <td>${this.getFrequencyLabel(prescription.frequency)}</td>
                                <td>${this.getRouteLabel(prescription.route)}</td>
                                <td>${prescription.prescribedBy}</td>
                                <td>${this.getPrescriptionStatusLabel(prescription.status)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            <div class="footer">
                <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')} - Clínica Vida Nova</p>
                <p>Este é um documento confidencial. Uso restrito à equipe médica.</p>
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
    }
  }
}
</script>

<style scoped>
/* ESTILOS ORIGINAIS RESTAURADOS */
.medical-record-view {
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

.btn-primary.small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
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

/* Seletor de Paciente */
.patient-selector {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
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

.patient-select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

/* Info do Paciente */
.patient-info-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.patient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.patient-header h3 {
  color: #1e3c72;
  margin: 0;
}

.patient-record {
  color: #666;
  font-weight: 500;
}

.patient-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Abas */
.medical-record-tabs {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tab-button {
  padding: 1rem 2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-button.active {
  color: #1e3c72;
  border-bottom-color: #1e3c72;
  background: white;
}

.tab-content {
  padding: 2rem;
}

/* Conteúdo das Abas */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  color: #1e3c72;
  margin: 0;
}

/* Histórico Médico */
.history-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.history-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #1e3c72;
}

.history-section h4 {
  color: #1e3c72;
  margin-bottom: 1rem;
}

.history-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

/* Evoluções */
.evolutions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.evolution-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #1e3c72;
}

.evolution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.evolution-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.evolution-date {
  font-weight: bold;
  color: #1e3c72;
}

.evolution-author {
  color: #666;
  font-size: 0.9rem;
}

.evolution-content {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.evolution-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.evolution-type {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-medical {
  background: #dbeafe;
  color: #1e40af;
}

.type-nursing {
  background: #d1fae5;
  color: #065f46;
}

.type-psychological {
  background: #f3e8ff;
  color: #7c3aed;
}

.type-multidisciplinary {
  background: #fef3c7;
  color: #92400e;
}

.medications-count {
  color: #666;
  font-size: 0.9rem;
}

/* Prescrições */
.prescriptions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prescription-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #1e3c72;
}

.prescription-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.prescription-info h4 {
  color: #1e3c72;
  margin: 0 0 0.5rem 0;
}

.prescription-date {
  color: #666;
  font-size: 0.9rem;
}

.prescription-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.prescription-observations {
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #e2e8f0;
}

/* Estados Vazios */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state p {
  margin-bottom: 1rem;
}

/* Badges e Status */
.status-badge {
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

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-completed {
  background: #dbeafe;
  color: #1e40af;
}

.status-suspended {
  background: #fef3c7;
  color: #92400e;
}

.status-cancelled {
  background: #fecaca;
  color: #dc2626;
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

/* Formulários */
.evolution-form,
.prescription-form,
.medical-history-form {
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

/* Diagnósticos */
.diagnoses-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.diagnosis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #1e3c72;
}

.diagnosis-code {
  font-weight: bold;
  color: #1e3c72;
  min-width: 80px;
}

.diagnosis-description {
  flex: 1;
  margin: 0 1rem;
}

.diagnosis-date {
  color: #666;
  font-size: 0.9rem;
}
</style>