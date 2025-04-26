const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schéma simplifié juste pour test
const adminSchema = new mongoose.Schema({
  nom: String,
  email: String,
  login: String,
  motDePasse: String,
  role: String,
}, { collection: 'Admin' }); // spécifie explicitement la collection

const Admin = mongoose.model('Admin', adminSchema);

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/ticket_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function hashPasswordForAdmin(login) {
  try {
    const admin = await Admin.findOne({ login });

    if (!admin) {
      console.log(`❌ Aucun administrateur trouvé avec le login "${login}"`);
      return;
    }

    // Vérifie s'il est déjà hashé
    if (admin.motDePasse.startsWith('$2b$')) {
      console.log("🔐 Le mot de passe est déjà hashé.");
    } else {
      const hashed = await bcrypt.hash(admin.motDePasse, 10);
      admin.motDePasse = hashed;
      await admin.save();
      console.log("✅ Mot de passe hashé avec succès !");
    }

  } catch (err) {
    console.error("Erreur :", err);
  } finally {
    mongoose.connection.close();
  }
}

// Change le login ici selon ce que tu veux hasher
hashPasswordForAdmin('admin2');
