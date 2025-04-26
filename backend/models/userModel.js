const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schéma de base pour tous les utilisateurs
const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Nom est obligatoire']
  },
  email: {
    type: String,
    required: [true, 'Email est obligatoire'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  login: {
    type: String,
    required: [true, 'Login est obligatoire'],
    unique: true
  },
  motDePasse: {
    type: String,
    required: [true, 'Mot de passe est obligatoire'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'technicien', 'employe'],
    required: true
  },
  // Champs spécifiques aux employés
  poste: {
    type: String,
    required: function() { return this.role === 'employe'; }
  },
  departement: {
    type: String,
    required: function() { return this.role === 'employe'; }
  },
  // Champs spécifiques aux techniciens
  specialité: {
    type: String,
    required: function() { return this.role === 'technicien'; }
  }
}, {
  timestamps: true,
  collection: function() {
    // Utiliser la collection appropriée selon le rôle
    if (this.role === 'admin') return 'Admin';
    if (this.role === 'technicien') return 'Techniciens';
    if (this.role === 'employe') return 'Employes';
  }
});

// Middleware pour hasher le mot de passe avant l'enregistrement
userSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.motDePasse);
};

// Créer les modèles pour chaque type d'utilisateur
const Admin = mongoose.model('Admin', userSchema, 'Admin');
const Technicien = mongoose.model('Technicien', userSchema, 'Techniciens');
const Employe = mongoose.model('Employe', userSchema, 'Employes');

module.exports = { Admin, Technicien, Employe };