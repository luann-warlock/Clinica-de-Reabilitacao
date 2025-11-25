const express = require('express');
const router = express.Router();
const {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission,
  getAdmissionStats,
  getPatientsForSelect
} = require('../controllers/admissionController');

// @route   POST /api/patients
// @desc    Criar nova admissão de paciente
// @access  Public
router.post('/', createAdmission);

// @route   GET /api/patients
// @desc    Buscar todas as admissões
// @access  Public
router.get('/', getAdmissions);

// @route   GET /api/patients/stats/admissions
// @desc    Buscar estatísticas de admissões
// @access  Public
router.get('/stats/admissions', getAdmissionStats);

// @route   GET /api/patients/select/patients
// @desc    Buscar pacientes para select (usado no Financeiro)
// @access  Public
router.get('/select/patients', getPatientsForSelect);

// @route   GET /api/patients/:id
// @desc    Buscar admissão por ID
// @access  Public
router.get('/:id', getAdmissionById);

// @route   PUT /api/patients/:id
// @desc    Atualizar admissão
// @access  Public
router.put('/:id', updateAdmission);

// @route   DELETE /api/patients/:id
// @desc    Deletar admissão
// @access  Public
router.delete('/:id', deleteAdmission);

module.exports = router;