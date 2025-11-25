const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar rotas
const admissionRoutes = require('./routes/admissionRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const financialRoutes = require('./routes/financialRoutes'); // 👈 ADICIONADO

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clinica-reabilitacao')
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => console.log('❌ Erro MongoDB:', err.message));

// 👇 USAR ROTAS DE ADMISSÃO DO MONGODB
app.use('/api/patients', admissionRoutes);

// 👇 USAR ROTAS DO PRONTUÁRIO DO MONGODB
app.use('/api/medical-records', medicalRecordRoutes);

// 👇 USAR ROTAS DO FINANCEIRO DO MONGODB (ADICIONADO)
app.use('/api/financial', financialRoutes);

// Rotas básicas de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Servidor rodando', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
    modules: {
      patients: '✅',
      medicalRecords: '✅', 
      financial: '✅',
      medications: '✅'
    }
  });
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API da Clínica de Reabilitação - Backend Online',
    modules: ['patients', 'medical-records', 'financial', 'medications']
  });
});

// 👇 ROTAS PARA MEDICAÇÕES (MANTIDAS EM MEMÓRIA) 👇
let medications = [];
let nextMedicationId = 1;

app.get('/api/medications', (req, res) => {
  res.json(medications);
});

app.post('/api/medications', (req, res) => {
  try {
    const medicationData = {
      id: nextMedicationId++,
      ...req.body,
      prescriptionDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    medications.push(medicationData);
    res.status(201).json(medicationData);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar medicação' });
  }
});

app.put('/api/medications/:id', (req, res) => {
  try {
    const medicationId = parseInt(req.params.id);
    const medicationIndex = medications.findIndex(m => m.id === medicationId);
    
    if (medicationIndex === -1) {
      return res.status(404).json({ error: 'Medicação não encontrada' });
    }

    medications[medicationIndex] = {
      ...medications[medicationIndex],
      ...req.body
    };

    res.json(medications[medicationIndex]);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar medicação' });
  }
});

app.get('/api/medications/patient/:patientId', (req, res) => {
  const patientId = parseInt(req.params.patientId);
  const patientMedications = medications.filter(m => m.patientId === patientId);
  res.json(patientMedications);
});

app.delete('/api/medications/:id', (req, res) => {
  try {
    const medicationId = parseInt(req.params.id);
    medications = medications.filter(m => m.id !== medicationId);
    res.json({ message: 'Medicação deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar medicação' });
  }
});

// Rota para listar todos os endpoints disponíveis
app.get('/api', (req, res) => {
  res.json({
    message: '📚 Endpoints disponíveis da API',
    endpoints: {
      health: 'GET /api/health',
      patients: {
        'GET /api/patients': 'Listar pacientes',
        'POST /api/patients': 'Criar paciente',
        'GET /api/patients/:id': 'Buscar paciente por ID',
        'PUT /api/patients/:id': 'Atualizar paciente',
        'DELETE /api/patients/:id': 'Deletar paciente',
        'GET /api/patients/stats/admissions': 'Estatísticas de admissões'
      },
      medications: {
        'GET /api/medications': 'Listar medicações',
        'POST /api/medications': 'Criar medicação',
        'PUT /api/medications/:id': 'Atualizar medicação',
        'GET /api/medications/patient/:patientId': 'Medicações do paciente',
        'DELETE /api/medications/:id': 'Deletar medicação'
      },
      medicalRecords: {
        'GET /api/medical-records/patient/:patientId': 'Buscar prontuário',
        'POST /api/medical-records/patient/:patientId': 'Criar/atualizar prontuário',
        'PUT /api/medical-records/patient/:patientId/medical-history': 'Atualizar histórico',
        'POST /api/medical-records/patient/:patientId/evolutions': 'Adicionar evolução',
        'POST /api/medical-records/patient/:patientId/prescriptions': 'Adicionar prescrição',
        'POST /api/medical-records/patient/:patientId/diagnoses': 'Adicionar diagnóstico'
      },
      financial: {
        'GET /api/financial/payments': 'Listar pagamentos',
        'POST /api/financial/payments': 'Criar pagamento',
        'PUT /api/financial/payments/:id': 'Atualizar pagamento',
        'PATCH /api/financial/payments/:id/pay': 'Registrar pagamento',
        'DELETE /api/financial/payments/:id': 'Deletar pagamento',
        'GET /api/financial/expenses': 'Listar despesas',
        'POST /api/financial/expenses': 'Criar despesa',
        'GET /api/financial/reports': 'Relatórios financeiros',
        'GET /api/financial/stats': 'Estatísticas rápidas'
      }
    }
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe`,
    suggestion: 'Acesse /api para ver todos os endpoints disponíveis'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`\n📚 MÓDULOS DISPONÍVEIS:`);
  console.log(`   👥 Pacientes:     http://localhost:${PORT}/api/patients`);
  console.log(`   💊 Medicações:    http://localhost:${PORT}/api/medications`);
  console.log(`   📋 Prontuário:    http://localhost:${PORT}/api/medical-records/patient/1`);
  console.log(`   💰 Financeiro:    http://localhost:${PORT}/api/financial/payments`);
  console.log(`   📊 Estatísticas:  http://localhost:${PORT}/api/patients/stats/admissions`);
  console.log(`   🩺 Health Check:  http://localhost:${PORT}/api/health`);
  console.log(`   📖 Documentação:  http://localhost:${PORT}/api`);
  console.log(`\n✅ Backend completo funcionando!`);
  console.log(`✅ Módulo de Admissão com MongoDB integrado!`);
  console.log(`✅ Módulo de Prontuário com MongoDB integrado!`);
  console.log(`✅ Módulo Financeiro com MongoDB integrado!`);
});