const adminAuth = (req, res, next) => {
  console.log(req);
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
  }
  next();
};

module.exports = adminAuth; 