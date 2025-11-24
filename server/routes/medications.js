const express = require('express');
const router = express.Router();

// Dados em memória (temporário - substituir por MongoDB depois)
let medications = [];
let nextMedicationId = 1;

// GET /api/medications - Listar todas as medicações
router.get('/', (req, res) => {
  res.json(medications);
});

// POST /api/medications - Criar nova medicação
router.post('/', (req, res) => {
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

// PUT /api/medications/:id - Atualizar medicação (para administrar)
router.put('/:id', (req, res) => {
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

// GET /api/medications/patient/:patientId - Buscar medicações por paciente
router.get('/patient/:patientId', (req, res) => {
  const patientId = parseInt(req.params.patientId);
  const patientMedications = medications.filter(m => m.patientId === patientId);
  res.json(patientMedications);
});

// DELETE /api/medications/:id - Deletar medicação
router.delete('/:id', (req, res) => {
  try {
    const medicationId = parseInt(req.params.id);
    medications = medications.filter(m => m.id !== medicationId);
    res.json({ message: 'Medicação deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar medicação' });
  }
});

module.exports = router;