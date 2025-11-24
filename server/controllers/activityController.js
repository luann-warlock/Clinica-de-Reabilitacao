let temporaryActivities = [
  {
    _id: '1',
    name: 'Fisioterapia Matinal',
    type: 'fisioterapia',
    schedule: {
      date: new Date('2024-11-25'),
      startTime: '08:00',
      endTime: '09:00'
    },
    therapist: {
      name: 'Dra. Maria Silva',
      specialty: 'Fisioterapia'
    },
    participants: [
      { patientName: 'João Santos', patientId: 'P001' },
      { patientName: 'Ana Costa', patientId: 'P002' }
    ],
    status: 'agendada',
    notes: 'Exercícios de mobilidade',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Criar nova atividade
export const createActivity = async (req, res) => {
  try {
    const newActivity = {
      _id: Date.now().toString(),
      ...req.body,
      status: 'agendada',
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    temporaryActivities.push(newActivity);
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Buscar todas as atividades
export const getAllActivities = async (req, res) => {
  try {
    res.json(temporaryActivities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar atividade por ID
export const getActivityById = async (req, res) => {
  try {
    const activity = temporaryActivities.find(a => a._id === req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar atividade
export const updateActivity = async (req, res) => {
  try {
    const index = temporaryActivities.findIndex(a => a._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    
    temporaryActivities[index] = {
      ...temporaryActivities[index],
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json(temporaryActivities[index]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deletar atividade
export const deleteActivity = async (req, res) => {
  try {
    const index = temporaryActivities.findIndex(a => a._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    
    temporaryActivities.splice(index, 1);
    res.json({ message: 'Atividade deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};