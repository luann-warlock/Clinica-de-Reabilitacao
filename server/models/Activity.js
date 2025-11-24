import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['fisioterapia', 'terapia_ocupacional', 'psicologia', 'musical', 'artes', 'recreacao'],
    required: true
  },
  schedule: {
    date: Date,
    startTime: String,
    endTime: String
  },
  therapist: {
    name: String,
    specialty: String
  },
  participants: [{
    patientName: String,
    patientId: String
  }],
  status: {
    type: String,
    enum: ['agendada', 'em_andamento', 'concluída', 'cancelada'],
    default: 'agendada'
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;