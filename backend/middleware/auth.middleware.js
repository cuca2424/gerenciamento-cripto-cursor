
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

module.exports = (req, res, next) => {
  // Obter token do header Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso não autorizado. Token não fornecido' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Adicionar ID do usuário ao objeto da requisição
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};
