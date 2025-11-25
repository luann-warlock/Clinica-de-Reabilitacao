const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do paciente é obrigatório'],
    trim: true
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    trim: true
  },
  birthDate: {
    type: Date,
    required: [true, 'Data de nascimento é obrigatória']
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['masculino', 'feminino', 'outro'],
    required: true
  },
  admissionType: {
    type: String,
    enum: ['voluntaria', 'involuntaria', 'compulsoria'],
    required: true
  },
  mainSubstance: {
    type: String,
    enum: ['alcool', 'cocaina', 'maconha', 'medicamentos', 'outras'],
    default: 'alcool'
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['triagem', 'internado', 'alta'],
    default: 'triagem'
  },
  recordNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// REMOVIDO: Middleware pre('save') problemático
// A geração do recordNumber será feita no controller

module.exports = mongoose.model('Admission', admissionSchema);