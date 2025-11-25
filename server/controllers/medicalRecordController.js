const MedicalRecord = require('../models/MedicalRecord');
const Admission = require('../models/Admission'); // 👈 ADICIONADO

// Obter prontuário por paciente - VERSÃO CORRIGIDA
exports.getMedicalRecordByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log(`🔄 Buscando prontuário para paciente: ${patientId}`);
    
    // Buscar dados do paciente primeiro
    const patient = await Admission.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        error: 'Paciente não encontrado',
        patientId 
      });
    }
    
    // Buscar ou criar prontuário
    let medicalRecord = await MedicalRecord.findOne({ patientId });

    if (!medicalRecord) {
      // Criar prontuário vazio se não existir
      medicalRecord = new MedicalRecord({
        patientId,
        medicalHistory: null,
        diagnoses: [],
        evolutions: [],
        prescriptions: []
      });
      await medicalRecord.save();
      console.log('✅ Prontuário vazio criado para paciente:', patientId);
    }

    // Combinar dados do paciente com prontuário
    const responseData = {
      ...medicalRecord.toObject(),
      patientInfo: {
        name: patient.name,
        recordNumber: patient.recordNumber,
        age: patient.age,
        gender: patient.gender,
        admissionDate: patient.admissionDate,
        status: patient.status,
        mainSubstance: patient.mainSubstance
      }
    };

    console.log('✅ Prontuário carregado com sucesso');
    res.json(responseData);
  } catch (error) {
    console.error('❌ Erro ao buscar prontuário:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Criar ou atualizar prontuário
exports.createOrUpdateMedicalRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const medicalRecordData = req.body;

    console.log(`🔄 Criando/atualizando prontuário para paciente: ${patientId}`, medicalRecordData);

    let medicalRecord = await MedicalRecord.findOne({ patientId });

    if (medicalRecord) {
      // Atualizar prontuário existente
      medicalRecord = await MedicalRecord.findOneAndUpdate(
        { patientId },
        { $set: medicalRecordData },
        { new: true, runValidators: true }
      );
      console.log('✅ Prontuário atualizado:', medicalRecord._id);
    } else {
      // Criar novo prontuário
      medicalRecord = new MedicalRecord({
        patientId,
        ...medicalRecordData
      });
      await medicalRecord.save();
      console.log('✅ Novo prontuário criado:', medicalRecord._id);
    }

    res.json(medicalRecord);
  } catch (error) {
    console.error('❌ Erro ao salvar prontuário:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Adicionar evolução
exports.addEvolution = async (req, res) => {
  try {
    const { patientId } = req.params;
    const evolutionData = req.body;

    console.log(`🔄 Adicionando evolução para paciente: ${patientId}`, evolutionData);

    const medicalRecord = await MedicalRecord.findOneAndUpdate(
      { patientId },
      {
        $push: { 
          evolutions: {
            ...evolutionData,
            date: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      },
      { new: true, runValidators: true, upsert: true }
    );

    if (!medicalRecord) {
      return res.status(404).json({ error: 'Prontuário não encontrado' });
    }

    const newEvolution = medicalRecord.evolutions[medicalRecord.evolutions.length - 1];
    console.log('✅ Evolução adicionada:', newEvolution._id);
    
    res.json(newEvolution);
  } catch (error) {
    console.error('❌ Erro ao adicionar evolução:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Adicionar prescrição
exports.addPrescription = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptionData = req.body;

    console.log(`🔄 Adicionando prescrição para paciente: ${patientId}`, prescriptionData);

    const medicalRecord = await MedicalRecord.findOneAndUpdate(
      { patientId },
      {
        $push: { 
          prescriptions: {
            ...prescriptionData,
            date: new Date(),
            status: 'active'
          }
        },
        $set: { updatedAt: new Date() }
      },
      { new: true, runValidators: true, upsert: true }
    );

    if (!medicalRecord) {
      return res.status(404).json({ error: 'Prontuário não encontrado' });
    }

    const newPrescription = medicalRecord.prescriptions[medicalRecord.prescriptions.length - 1];
    console.log('✅ Prescrição adicionada:', newPrescription._id);
    
    res.json(newPrescription);
  } catch (error) {
    console.error('❌ Erro ao adicionar prescrição:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Adicionar diagnóstico
exports.addDiagnosis = async (req, res) => {
  try {
    const { patientId } = req.params;
    const diagnosisData = req.body;

    console.log(`🔄 Adicionando diagnóstico para paciente: ${patientId}`, diagnosisData);

    const medicalRecord = await MedicalRecord.findOneAndUpdate(
      { patientId },
      {
        $push: { 
          diagnoses: {
            ...diagnosisData,
            date: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      },
      { new: true, runValidators: true, upsert: true }
    );

    if (!medicalRecord) {
      return res.status(404).json({ error: 'Prontuário não encontrado' });
    }

    const newDiagnosis = medicalRecord.diagnoses[medicalRecord.diagnoses.length - 1];
    console.log('✅ Diagnóstico adicionado:', newDiagnosis._id);
    
    res.json(newDiagnosis);
  } catch (error) {
    console.error('❌ Erro ao adicionar diagnóstico:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Atualizar histórico médico
exports.updateMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const medicalHistoryData = req.body;

    console.log(`🔄 Atualizando histórico médico para paciente: ${patientId}`, medicalHistoryData);

    const medicalRecord = await MedicalRecord.findOneAndUpdate(
      { patientId },
      {
        $set: { 
          medicalHistory: medicalHistoryData,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true, upsert: true }
    );

    console.log('✅ Histórico médico atualizado');
    res.json(medicalRecord.medicalHistory);
  } catch (error) {
    console.error('❌ Erro ao atualizar histórico médico:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};