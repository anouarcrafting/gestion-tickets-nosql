const jwt = require('jsonwebtoken');
const { Admin, Technicien, Employe } = require('../models/userModel');

// Clé secrète pour JWT - à stocker dans variables d'environnement en production
const JWT_SECRET = 'maSuperCleSecrete123';
const JWT_EXPIRE = '30d';

// Fonction pour créer et envoyer un token JWT
const sendToken = (user, statusCode, res) => {
  // Créer le token
  const token = jwt.sign(
    { id: user._id, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRE }
  );

  // Options pour le cookie
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    httpOnly: true,
  };

  // En production, activer secure: true pour HTTPS
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Envoyer la réponse avec le cookie
  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
};

// @desc    Authentification d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { login, motDePasse } = req.body;

    // Vérifier si login et mot de passe sont fournis
    if (!login || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un login et un mot de passe'
      });
    }

    // Chercher l'utilisateur dans toutes les collections
    let user = await Admin.findOne({ login }).select('+motDePasse');
    if (!user) {
      user = await Technicien.findOne({ login }).select('+motDePasse');
    }
    if (!user) {
      user = await Employe.findOne({ login }).select('+motDePasse');
    }

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si le mot de passe correspond
    const isMatch = await user.matchPassword(motDePasse);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Envoyer le token
    sendToken(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Récupérer les informations de l'utilisateur actuel
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    let user;
    
    // Récupérer l'utilisateur selon son rôle
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user.id);
    } else if (req.user.role === 'technicien') {
      user = await Technicien.findById(req.user.id);
    } else if (req.user.role === 'employe') {
      user = await Employe.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Déconnexion / Effacer le cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 secondes
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
};