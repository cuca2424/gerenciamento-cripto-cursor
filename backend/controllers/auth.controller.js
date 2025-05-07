const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

// Configuração do nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Função para gerar token de redefinição de senha
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Função para gerar token de verificação de email
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Registro de um novo usuário
exports.register = async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }
    
    // Primeiro, verificar se já existe um usuário com este email
    const existingUser = await req.db.collection('usuarios').findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está registrado' });
    }
    
    // Verificar se existe um registro pendente na coleção usuario_email
    const existingEmailVerification = await req.db.collection('usuario_email').findOne({ email });
    
    if (existingEmailVerification) {
      // Se existir um registro pendente, remover antes de criar um novo
      await req.db.collection('usuario_email').deleteOne({ email });
    }
    
    // Gerar token de verificação de email
    const verificationToken = generateVerificationToken();
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas
    
    // Criar registro na coleção usuario_email apenas com informações necessárias
    const emailRecord = {
      nome,
      email,
      dataCriacao: now,
      emailVerificado: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: expirationDate
    };

    // Inserir na coleção usuario_email
    const result = await req.db.collection('usuario_email').insertOne(emailRecord);
    
    // Enviar email de verificação
    const verificationLink = `${process.env.FRONTEND_URL}/verificar-email/${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verificação de Email',
      html: `
        <p>Olá ${nome},</p>
        <p>Bem-vindo! Por favor, verifique seu email clicando no link abaixo:</p>
        <a href="${verificationLink}">Verificar Email</a>
        <p>Este link é válido por 24 horas.</p>
        <p>Se você não criou esta conta, por favor ignore este email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(201).json({
      message: 'Pré-registro realizado com sucesso. Por favor, verifique seu email.',
      user: {
        id: result.insertedId,
        nome,
        email
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

// Verificação de email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Buscar usuário pelo token de verificação
    const user = await req.db.collection('usuario_email').findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Atualizar status de verificação do email
    await req.db.collection('usuario_email').updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerificado: true
        },
        $unset: {
          emailVerificationToken: "",
          emailVerificationExpires: ""
        }
      }
    );

    res.json({ message: 'Email verificado com sucesso' });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    res.status(500).json({ message: 'Erro ao verificar email' });
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

    // Verificar se o usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({ 
        error: 'Conta inativa. Entre em contato com o suporte.',
        code: 'INACTIVE_ACCOUNT'
      });
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
      telefone: user.telefone,
      role: user.role
    });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({ error: 'Erro ao obter dados do usuário' });
  }
};

// Controlador para solicitação de redefinição de senha
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar se o usuário existe
    const user = await req.db.collection('usuarios').findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Gerar token de redefinição
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token válido por 1 hora

    // Salvar token no usuário
    await req.db.collection('usuarios').updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry
        }
      }
    );

    // Enviar email com link de redefinição
    const resetLink = `${process.env.FRONTEND_URL}/redefinir-senha/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Redefinição de Senha',
      html: `
        <p>Você solicitou a redefinição de sua senha.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetLink}">Redefinir Senha</a>
        <p>Este link é válido por 1 hora.</p>
        <p>Se você não solicitou esta redefinição, ignore este email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email de redefinição enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao processar solicitação de redefinição de senha:', error);
    res.status(500).json({ message: 'Erro ao processar solicitação' });
  }
};

// Controlador para verificar token de redefinição
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Verificando token:', token);
    
    const user = await req.db.collection('usuarios').findOne({
      resetPasswordToken: token
    });

    console.log('Usuário encontrado:', user);

    if (!user) {
      return res.status(400).json({ message: 'Token inválido' });
    }

    // Verificar se o token expirou
    if (!user.resetPasswordExpires || new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({ message: 'Token expirado' });
    }

    res.json({ message: 'Token válido' });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ message: 'Erro ao verificar token' });
  }
};

// Controlador para redefinir senha
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log('Recebido token:', token);
    
    const user = await req.db.collection('usuarios').findOne({
      resetPasswordToken: token
    });

    console.log('Usuário encontrado:', user);

    if (!user) {
      return res.status(400).json({ message: 'Token inválido' });
    }

    // Verificar se o token expirou
    if (!user.resetPasswordExpires || new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({ message: 'Token expirado' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualizar senha
    await req.db.collection('usuarios').updateOne(
      { _id: user._id },
      {
        $set: {
          senha: hashedPassword
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: ""
        }
      }
    );

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro ao redefinir senha' });
  }
};

// Verificar status de verificação do email
exports.checkEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    // Buscar usuário pelo email
    const user = await req.db.collection('usuario_email').findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ verified: user.emailVerificado });
  } catch (error) {
    console.error('Erro ao verificar status do email:', error);
    res.status(500).json({ error: 'Erro ao verificar status do email' });
  }
};
