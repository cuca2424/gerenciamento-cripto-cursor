
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

// Registro de um novo usuário
exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se o email já está em uso
    const existingUser = await req.db.collection('usuarios').findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está registrado' });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);
    
    // Criar novo usuário
    const newUser = {
      nome,
      email,
      senha: hashedPassword,
      saldoReais: 0,
      aporteTotal: 0,
      dataCriacao: new Date()
    };
    
    const result = await req.db.collection('usuarios').insertOne(newUser);
    
    // Criar token JWT
    const user = { ...newUser, id: result.insertedId };
    delete user.senha; // Remover senha antes de enviar ao cliente
    
    const token = jwt.sign(
      { id: result.insertedId, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: result.insertedId,
        nome: user.nome,
        email: user.email,
        saldoReais: user.saldoReais,
        aporteTotal: user.aporteTotal
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Buscar usuário pelo email
    const user = await req.db.collection('usuarios').findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    // Verificar senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    // Criar token JWT
    const token = jwt.sign(
      { id: user._id, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        saldoReais: user.saldoReais,
        aporteTotal: user.aporteTotal
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

// Obter dados do usuário atual
exports.me = async (req, res) => {
  try {
    // Buscar usuário pelo ID (vindo do middleware de autenticação)
    const user = await req.db.collection('usuarios').findOne(
      { _id: new req.ObjectId(req.userId) },
      { projection: { senha: 0 } } // Excluir senha da resposta
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      id: user._id,
      nome: user.nome,
      email: user.email,
      saldoReais: user.saldoReais,
      aporteTotal: user.aporteTotal
    });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({ error: 'Erro ao obter dados do usuário' });
  }
};
