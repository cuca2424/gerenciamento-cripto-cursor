const estrategiaRoutes = require('./routes/estrategia.routes');

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/carteira', carteiraRoutes);
app.use('/api/cripto', criptoRoutes);
app.use('/api/estrategia', estrategiaRoutes); 