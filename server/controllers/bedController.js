import Bed from '../models/Bed.js';

// Array temporário em memória (substitui o MongoDB)
let temporaryBeds = [
  {
    _id: '1',
    bedNumber: '101A',
    status: 'disponível',
    sector: 'enfermaria',
    patient: null,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2', 
    bedNumber: '102B',
    status: 'ocupado',
    sector: 'semi-intensivo',
    patient: {
      name: 'João Silva',
      admissionId: 'ADM001',
      admissionDate: new Date('2024-01-15')
    },
    notes: 'Paciente em observação',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Criar um novo leito
export const createBed = async (req, res) => {
  try {
    const newBed = {
      _id: Date.now().toString(),
      ...req.body,
      status: 'disponível',
      patient: null,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    temporaryBeds.push(newBed);
    res.status(201).json(newBed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Buscar todos os leitos
export const getAllBeds = async (req, res) => {
  try {
    res.json(temporaryBeds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar leito por ID
export const getBedById = async (req, res) => {
  try {
    const bed = temporaryBeds.find(b => b._id === req.params.id);
    if (!bed) {
      return res.status(404).json({ error: 'Leito não encontrado' });
    }
    res.json(bed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar leito
export const updateBed = async (req, res) => {
  try {
    const index = temporaryBeds.findIndex(b => b._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Leito não encontrado' });
    }
    
    temporaryBeds[index] = {
      ...temporaryBeds[index],
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json(temporaryBeds[index]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deletar leito
export const deleteBed = async (req, res) => {
  try {
    const index = temporaryBeds.findIndex(b => b._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Leito não encontrado' });
    }
    
    temporaryBeds.splice(index, 1);
    res.json({ message: 'Leito deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};