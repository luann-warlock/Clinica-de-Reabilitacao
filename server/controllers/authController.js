import jwt from 'jsonwebtoken';

// Versão simplificada - senhas em texto puro (APENAS PARA DESENVOLVIMENTO)
const temporaryUsers = [
  {
    _id: '1',
    name: 'Dr. Silva',
    email: 'medico@clinica.com',
    password: '123456', // Senha em texto puro
    userType: 'medico_psiquiatra',
    isActive: true
  },
  {
    _id: '2', 
    name: 'Enfermeira Ana',
    email: 'enfermeira@clinica.com',
    password: '123456', // Senha em texto puro
    userType: 'enfermeiro',
    isActive: true
  },
  {
    _id: '3',
    name: 'Terapeuta Carlos',
    email: 'terapeuta@clinica.com', 
    password: '123456', // Senha em texto puro
    userType: 'terapeuta',
    isActive: true
  },
  {
    _id: '4',
    name: 'Admin Sistema',
    email: 'admin@clinica.com', 
    password: '123456', // Senha em texto puro
    userType: 'administrador',
    isActive: true
  }
];

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Tentativa de login:', email, password); // Para debug

    // 1. Verificar se email e password existem
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor, forneça email e senha'
      });
    }

    // 2. Verificar se usuário existe e senha está correta (AGORA EM TEXTO PURO)
    const user = temporaryUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      console.log('Usuário não encontrado ou senha incorreta'); // Debug
      return res.status(401).json({
        status: 'fail',
        message: 'Email ou senha incorretos'
      });
    }

    // 3. Se tudo ok, enviar token para o cliente
    const token = jwt.sign(
      { id: user._id }, 
      'seu_jwt_secret_aqui',
      { expiresIn: '24h' }
    );

    console.log('Login bem-sucedido para:', user.name); // Debug

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType
        }
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor: ' + error.message
    });
  }
};

// Proteger rotas
export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Acesso não autorizado'
      });
    }

    const decoded = jwt.verify(token, 'seu_jwt_secret_aqui');
    const currentUser = temporaryUsers.find(u => u._id === decoded.id);
    
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'Usuário não encontrado'
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido'
    });
  }
};

// Cadastro de novo usuário
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, userType } = req.body;

    console.log('Tentativa de cadastro:', email); // Debug

    // 1. Validar dados
    if (!name || !email || !password || !confirmPassword || !userType) {
      return res.status(400).json({
        status: 'fail',
        message: 'Todos os campos são obrigatórios'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'As senhas não coincidem'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // 2. Verificar se email já existe
    const existingUser = temporaryUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Este email já está em uso'
      });
    }

    // 3. Criar novo usuário (em produção, usar bcrypt)
    const newUser = {
      _id: (temporaryUsers.length + 1).toString(),
      name,
      email,
      password, // Em produção: await bcrypt.hash(password, 12)
      userType,
      isActive: true,
      createdAt: new Date()
    };

    temporaryUsers.push(newUser);

    console.log('Novo usuário criado:', newUser.name); // Debug

    // 4. Retornar sucesso
    res.status(201).json({
      status: 'success',
      message: 'Conta criada com sucesso!',
      data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          userType: newUser.userType
        }
      }
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

export const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log('🔧 Tentativa de deletar usuário por email:', email);

    // 1. Verificar se o usuário existe
    const userIndex = temporaryUsers.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuário não encontrado com este email'
      });
    }

    const userToDelete = temporaryUsers[userIndex];

    // 2. Não permitir deletar usuários padrão do sistema
    const defaultEmails = [
      'medico@clinica.com', 
      'enfermeira@clinica.com', 
      'terapeuta@clinica.com', 
      'admin@clinica.com'
    ];
    
    if (defaultEmails.includes(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Não é possível deletar usuários padrão do sistema'
      });
    }

    // 3. Remover usuário do array
    const deletedUser = temporaryUsers.splice(userIndex, 1)[0];
    
    console.log('✅ Usuário deletado:', deletedUser.name);
    console.log('📊 Total de usuários agora:', temporaryUsers.length);

    // 4. Retornar sucesso
    res.status(200).json({
      status: 'success',
      message: `Usuário "${deletedUser.name}" deletado com sucesso!`,
      data: {
        user: {
          name: deletedUser.name,
          email: deletedUser.email,
          userType: deletedUser.userType
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// Listar todos os usuários (para você ver quem existe)
export const getAllUsers = async (req, res) => {
  try {
    // Remover senhas da resposta por segurança
    const usersWithoutPasswords = temporaryUsers.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      isActive: user.isActive,
      createdAt: user.createdAt
    }));

    res.status(200).json({
      status: 'success',
      data: {
        users: usersWithoutPasswords,
        total: temporaryUsers.length,
        message: '💡 Dica: Use "curl -X DELETE http://localhost:3000/api/auth/users/email/SEU_EMAIL@AQUI.com" para deletar'
      }
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};