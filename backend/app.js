const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

// Importation des routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware pour le logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour les cookies
app.use(cookieParser());

// Middleware pour CORS
app.use(cors({
  origin: 'http://localhost:3000', // Ajustez selon votre frontend
  credentials: true
}));

// pour le débogage
app.use((req, res, next) => {
    console.log('CORS Middleware Executed');
    next();
  });

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Définir les routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur'
  });
});

module.exports = app;