const Admission = require('../models/Admission');

// @desc    Criar nova admissão
// @route   POST /api/patients
// @access  Public
const createAdmission = async (req, res) => {
  try {
    console.log('🔄 Criando nova admissão:', req.body);
    
    // Verificar se CPF já existe
    const existingPatient = await Admission.findOne({ cpf: req.body.cpf });
    if (existingPatient) {
      return res.status(400).json({
        error: 'CPF já cadastrado no sistema',
        patient: existingPatient
      });
    }

    // Gerar número de prontuário
    const year = new Date().getFullYear();
    const count = await Admission.countDocuments();
    const recordNumber = `${year}-${(count + 1).toString().padStart(3, '0')}`;

    // Preparar dados do paciente
    const patientData = {
      ...req.body,
      cpf: req.body.cpf.replace(/\D/g, ''), // Remove formatação do CPF
      recordNumber: recordNumber,
      admissionDate: new Date()
    };

    const admission = new Admission(patientData);
    await admission.save();
    
    console.log('✅ Admissão criada:', admission.recordNumber);
    
    res.status(201).json(admission);
  } catch (error) {
    console.error('❌ Erro ao criar admissão:', error);
    
    // Mensagens de erro mais específicas
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Dados de admissão inválidos',
        details: errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'CPF ou número de prontuário já existe' 
      });
    }
    
    res.status(400).json({ 
      error: 'Erro ao criar admissão',
      details: error.message 
    });
  }
};

// @desc    Buscar todas as admissões
// @route   GET /api/patients
// @access  Public
const getAdmissions = async (req, res) => {
  try {
    console.log('🔄 Buscando todas as admissões');
    
    const admissions = await Admission.find().sort({ admissionDate: -1 });
    
    console.log(`✅ ${admissions.length} admissões encontradas`);
    
    res.json(admissions);
  } catch (error) {
    console.error('❌ Erro ao buscar admissões:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar admissões',
      details: error.message 
    });
  }
};

// @desc    Buscar admissão por ID
// @route   GET /api/patients/:id
// @access  Public
const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // CORREÇÃO: Validar se o ID é válido
    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        error: 'ID de admissão inválido ou não fornecido' 
      });
    }

    console.log(`🔄 Buscando admissão ID: ${id}`);
    
    const admission = await Admission.findById(id);
    
    if (!admission) {
      return res.status(404).json({ 
        error: 'Admissão não encontrada' 
      });
    }
    
    console.log('✅ Admissão encontrada:', admission.recordNumber);
    
    res.json(admission);
  } catch (error) {
    console.error('❌ Erro ao buscar admissão:', error);
    
    // CORREÇÃO: Tratar erro de ID inválido
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'ID de admissão inválido' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao buscar admissão',
      details: error.message 
    });
  }
};

// @desc    Atualizar admissão
// @route   PUT /api/patients/:id
// @access  Public
const updateAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    
    // CORREÇÃO: Validar se o ID é válido
    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        error: 'ID de admissão inválido ou não fornecido' 
      });
    }

    console.log(`🔄 Atualizando admissão ID: ${id}`, req.body);
    
    // Preparar dados para atualização
    const updateData = { ...req.body };
    if (updateData.cpf) {
      updateData.cpf = updateData.cpf.replace(/\D/g, '');
    }

    // Verificar se CPF já existe em outro paciente
    if (updateData.cpf) {
      const existingPatient = await Admission.findOne({ 
        cpf: updateData.cpf, 
        _id: { $ne: id } 
      });
      
      if (existingPatient) {
        return res.status(400).json({
          error: 'CPF já cadastrado em outro paciente'
        });
      }
    }

    const admission = await Admission.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!admission) {
      return res.status(404).json({ 
        error: 'Admissão não encontrada' 
      });
    }
    
    console.log('✅ Admissão atualizada:', admission.recordNumber);
    
    res.json(admission);
  } catch (error) {
    console.error('❌ Erro ao atualizar admissão:', error);
    
    // CORREÇÃO: Tratar erro de ID inválido
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'ID de admissão inválido' 
      });
    }
    
    // Mensagens de erro mais específicas
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Dados de admissão inválidos',
        details: errors 
      });
    }
    
    res.status(400).json({ 
      error: 'Erro ao atualizar admissão',
      details: error.message 
    });
  }
};

// @desc    Deletar admissão
// @route   DELETE /api/patients/:id
// @access  Public
const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    
    // CORREÇÃO: Validar se o ID é válido
    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        error: 'ID de admissão inválido ou não fornecido' 
      });
    }

    console.log(`🔄 Deletando admissão ID: ${id}`);
    
    const admission = await Admission.findByIdAndDelete(id);
    
    if (!admission) {
      return res.status(404).json({ 
        error: 'Admissão não encontrada' 
      });
    }
    
    console.log('✅ Admissão deletada:', admission.recordNumber);
    
    res.json({ 
      message: 'Admissão deletada com sucesso',
      patient: admission 
    });
  } catch (error) {
    console.error('❌ Erro ao deletar admissão:', error);
    
    // CORREÇÃO: Tratar erro de ID inválido
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'ID de admissão inválido' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao deletar admissão',
      details: error.message 
    });
  }
};

// @desc    Buscar estatísticas de admissões
// @route   GET /api/patients/stats/admissions
// @access  Public
const getAdmissionStats = async (req, res) => {
  try {
    console.log('🔄 Buscando estatísticas de admissões');
    
    const stats = await Admission.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          voluntaria: {
            $sum: { $cond: [{ $eq: ['$admissionType', 'voluntaria'] }, 1, 0] }
          },
          involuntaria: {
            $sum: { $cond: [{ $eq: ['$admissionType', 'involuntaria'] }, 1, 0] }
          },
          compulsoria: {
            $sum: { $cond: [{ $eq: ['$admissionType', 'compulsoria'] }, 1, 0] }
          },
          triagem: {
            $sum: { $cond: [{ $eq: ['$status', 'triagem'] }, 1, 0] }
          },
          internado: {
            $sum: { $cond: [{ $eq: ['$status', 'internado'] }, 1, 0] }
          },
          alta: {
            $sum: { $cond: [{ $eq: ['$status', 'alta'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      total: 0,
      voluntaria: 0,
      involuntaria: 0,
      compulsoria: 0,
      triagem: 0,
      internado: 0,
      alta: 0
    };
    
    console.log('✅ Estatísticas calculadas:', result);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar estatísticas',
      details: error.message 
    });
  }
};

// @desc    Buscar pacientes para select (usado no Financeiro)
// @route   GET /api/patients/select/patients
// @access  Public
const getPatientsForSelect = async (req, res) => {
  try {
    console.log('🔄 Buscando pacientes para select');

    const patients = await Admission.find({})
      .select('name recordNumber admissionDate status')
      .sort({ name: 1 });

    console.log(`✅ ${patients.length} pacientes encontrados para select`);

    res.json(patients);
  } catch (error) {
    console.error('❌ Erro ao buscar pacientes para select:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar pacientes',
      details: error.message 
    });
  }
};

module.exports = {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission,
  getAdmissionStats,
  getPatientsForSelect
};