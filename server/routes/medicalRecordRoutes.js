const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

// Rotas do Prontuário Eletrônico
router.get('/patient/:patientId', medicalRecordController.getMedicalRecordByPatient);
router.post('/patient/:patientId', medicalRecordController.createOrUpdateMedicalRecord);
router.put('/patient/:patientId/medical-history', medicalRecordController.updateMedicalHistory);
router.post('/patient/:patientId/evolutions', medicalRecordController.addEvolution);
router.post('/patient/:patientId/prescriptions', medicalRecordController.addPrescription);
router.post('/patient/:patientId/diagnoses', medicalRecordController.addDiagnosis);

module.exports = router;