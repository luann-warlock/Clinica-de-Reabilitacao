const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB (corrigida)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clinica-reabilitacao')
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => console.log('❌ Erro MongoDB:', err.message));

// Dados em memória (temporário)
let patients = [];
let nextId = 1;

let medications = [];
let nextMedicationId = 1;

// Rotas básicas de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Servidor rodando', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
  });
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ message: 'API da Clínica de Reabilitação - Backend Online' });
});

// 👇 ROTAS PARA PACIENTES 👇
app.get('/api/patients', (req, res) => {
  res.json(patients);
});

app.post('/api/patients', (req, res) => {
  try {
    const patientData = {
      id: nextId++,
      recordNumber: `2024-${String(nextId).padStart(3, '0')}`,
      ...req.body,
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'triagem'
    };

    patients.push(patientData);
    res.status(201).json(patientData);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar paciente' });
  }
});

app.get('/api/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id == req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }
  res.json(patient);
});

// 👇 ROTAS PARA MEDICAÇÕES 👇
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

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/patients`);
  console.log(`   http://localhost:${PORT}/api/medications`);
});