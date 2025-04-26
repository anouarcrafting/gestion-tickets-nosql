const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/ticket_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur MongoDB :'));
db.once('open', () => console.log('MongoDB connecté !'));

// Schéma Ticket
const ticketSchema = new mongoose.Schema({
  titre: String,
  description: String,
  priorité: String,
  statut: { type: String, default: "ouvert" },
  date: { type: Date, default: Date.now },
});
const Ticket = mongoose.model('Ticket', ticketSchema);

// Route pour créer un ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { titre, description, priorité } = req.body;
    const nouveauTicket = new Ticket({ titre, description, priorité });
    await nouveauTicket.save();
    res.status(201).json({ message: 'Ticket créé avec succès', ticket: nouveauTicket });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création', erreur: err.message });
  }
});

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
