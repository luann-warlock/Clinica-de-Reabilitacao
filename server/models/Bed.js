import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['disponível', 'ocupado', 'em_limpeza', 'manutenção'],
    default: 'disponível'
  },
  sector: {
    type: String,
    required: true,
    enum: ['enfermaria', 'semi-intensivo', 'intensivo', 'observação']
  },
  patient: {
    name: String,
    admissionId: String,
    admissionDate: Date
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

const Bed = mongoose.model('Bed', bedSchema);

export default Bed;