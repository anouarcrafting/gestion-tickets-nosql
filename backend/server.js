const app = require('./app');
const connectDB = require('./config/db');

// Connexion à la base de données
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err, promise) => {
  console.log(`Erreur: ${err.message}`);
  // Fermer le serveur & sortir du processus
  server.close(() => process.exit(1));
});