const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientRecord: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentDate: Date,
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentType: {
    type: String,
    enum: ['mensalidade', 'particular', 'convenio', 'taxa'],
    required: true
  },
  insurance: {
    type: String,
    enum: ['unimed', 'amil', 'sulamerica', 'bradesco', 'particular', ''],
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'transferencia', '']
  },
  receipt: String,
  observations: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['folha_pagamento', 'aluguel', 'utilidades', 'medicamentos', 'manutencao', 'outros'],
    required: true
  },
  observations: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const financialSchema = new mongoose.Schema({
  // Este schema pode ser usado para relatórios agregados se necessário
  monthlyRevenue: Number,
  totalExpenses: Number,
  period: Date
});

paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Atualizar status para 'overdue' se a data de vencimento passou
  if (this.status === 'pending' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);
const Expense = mongoose.model('Expense', expenseSchema);
const Financial = mongoose.model('Financial', financialSchema);

module.exports = { Payment, Expense, Financial };