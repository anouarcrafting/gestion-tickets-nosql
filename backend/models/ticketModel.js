const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire']
  },
  priorité: {
    type: String,
    enum: ['basse', 'moyenne', 'haute', 'urgente'],
    default: 'moyenne'
  },
  statut: {
    type: String,
    enum: ['nouveau', 'en cours', 'en attente', 'résolu', 'fermé'],
    default: 'nouveau'
  },
  dateCréation: {
    type: Date,
    default: Date.now
  },
  fichierJoint: {
    type: String,
    default: null
  },
  employeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe',
    required: true
  },
  technicienId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technicien',
    default: null
  },
  historique: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      action: {
        type: String,
        required: true
      },
      effectuéPar: {
        type: String,
        required: true
      }
    }
  ]
}, {
  timestamps: true,
  collection: 'tickets'
});

module.exports = mongoose.model('Ticket', ticketSchema);