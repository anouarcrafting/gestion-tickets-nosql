const mongoose = require('mongoose');

// Fonction pour se connecter à la base de données
const connectDB = () => {
  mongoose.connect('mongodb://localhost:27017/ticket_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
};

// Exportation de la fonction pour la connecter dans d'autres fichiers
module.exports = connectDB;
// Ce fichier contient la logique de connexion à la base de données MongoDB. Il utilise Mongoose pour gérer les connexions et les erreurs.