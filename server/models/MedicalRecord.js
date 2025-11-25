const mongoose = require('mongoose');

const evolutionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['medical', 'nursing', 'psychological', 'multidisciplinary'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  medicationsPrescribed: [String]
}, {
  _id: true // 👈 GARANTIR que cada evolução tem seu próprio ID
});

const prescriptionSchema = new mongoose.Schema({
  medicationName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  route: {
    type: String,
    enum: ['oral', 'intravenosa', 'intramuscular', 'subcutanea'],
    required: true
  },
  frequency: {
    type: String,
    enum: ['dose-unica', '4-4h', '6-6h', '8-8h', '12-12h', 'diario'],
    required: true
  },
  prescribedBy: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'suspended', 'cancelled'],
    default: 'active'
  },
  duration: String,
  observations: String
}, {
  _id: true // 👈 GARANTIR que cada prescrição tem seu próprio ID
});

const diagnosisSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true // 👈 GARANTIR que cada diagnóstico tem seu próprio ID
});

const medicalHistorySchema = new mongoose.Schema({
  mainSubstance: {
    type: String,
    enum: ['alcool', 'cocaina', 'maconha', 'medicamentos', 'outras'],
    required: true
  },
  usageTime: {
    type: String,
    required: true
  },
  previousTreatments: String,
  comorbidities: String,
  currentMedications: String,
  familyHistory: String,
  allergies: String
});

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission', // 👈 REFERÊNCIA CORRETA para o modelo Admission
    required: true
  },
  medicalHistory: medicalHistorySchema,
  diagnoses: [diagnosisSchema],
  evolutions: [evolutionSchema],
  prescriptions: [prescriptionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar updatedAt antes de salvar
medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índices para melhor performance
medicalRecordSchema.index({ patientId: 1 }); // Índice único para busca por paciente
medicalRecordSchema.index({ createdAt: -1 }); // Índice para ordenação por data

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);