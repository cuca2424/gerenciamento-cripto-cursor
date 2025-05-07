const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

module.exports = async (req, res, next) => {
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

    // Verificar status do usuário no banco de dados
    const user = await req.db.collection('usuarios').findOne({ 
      _id: new ObjectId(decoded.id)
    }, {
      projection: { senha: 0 } // Excluir senha do objeto retornado
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se o usuário está ativo e com assinatura válida
    if (!user.ativo) {
      return res.status(401).json({ 
        error: 'Conta inativa. Entre em contato com o suporte.',
        code: 'INACTIVE_ACCOUNT'
      });
    }

    // Verificar status da assinatura
    if (!user.statusAssinatura || user.statusAssinatura !== 'active') {
      return res.status(401).json({ 
        error: 'Assinatura inativa. Por favor, renove sua assinatura.',
        code: 'INACTIVE_SUBSCRIPTION'
      });
    }

    // Adicionar objeto user completo à requisição
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};
