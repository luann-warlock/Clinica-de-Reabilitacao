const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission', // ✅ CORRIGIDO: Mudar de 'Patient' para 'Admission'
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

// Middleware pre-save
paymentSchema.pre('save', function() {
  this.updatedAt = Date.now();
  
  // Atualizar status para 'overdue' se a data de vencimento passou
  if (this.status === 'pending' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
});

module.exports = mongoose.model('Payment', paymentSchema);