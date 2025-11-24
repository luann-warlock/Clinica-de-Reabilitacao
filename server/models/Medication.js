const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  patientRecord: { type: String, required: true },
  medicationName: { type: String, required: true },
  dosage: { type: String, required: true },
  administrationRoute: { 
    type: String, 
    enum: ['oral', 'intravenosa', 'intramuscular', 'subcutanea', 'topica', 'inalatoria'],
    required: true 
  },
  medicationType: {
    type: String,
    enum: ['routine', 'controlled', 'antibiotic', 'psychotropic'],
    required: true
  },
  scheduledTime: { type: String, required: true }, // Formato HH:MM
  frequency: {
    type: String,
    enum: ['single-dose', 'every-4h', 'every-6h', 'every-8h', 'every-12h', 'daily', 'weekly'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'administered', 'cancelled'],
    default: 'pending'
  },
  prescribedBy: { type: String, required: true },
  prescriptionDate: { type: Date, default: Date.now },
  administeredBy: { type: String },
  administrationTime: { type: String }, // Formato HH:MM
  administrationObservations: { type: String },
  observations: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);