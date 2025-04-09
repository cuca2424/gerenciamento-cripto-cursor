const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const carteiraRoutes = require('./routes/carteira.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const historicoRoutes = require('./routes/historico.routes');
const graficosRoutes = require('./routes/graficos.routes');
const authRoutes = require('./routes/auth.routes');
const criptoRoutes = require('./routes/cripto.routes');
const { seedDatabase } = require('./seed');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;
MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('cripto_db');
    console.log('Connected to MongoDB');
    
    // Attach db to each request
    app.use((req, res, next) => {
      req.db = db;
      next();
    });
    
    // Seed database with initial data
    seedDatabase(db);
    
    // Routes
    app.use('/auth', authRoutes);
    app.use('/usuario', usuarioRoutes);
    app.use('/carteira', carteiraRoutes);
    app.use('/cripto', criptoRoutes);
    app.use('/graficos', graficosRoutes);
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
