const jwt = require('jsonwebtoken');
const { Admin, Technicien, Employe } = require('../models/userModel');

// Clé secrète pour JWT - à stocker dans variables d'environnement en production
const JWT_SECRET = 'maSuperCleSecrete123';

// Middleware de protection des routes
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans les headers ou les cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Récupérer le token depuis le header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Récupérer le token depuis les cookies
    token = req.cookies.token;
  }

  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé à accéder à cette ressource'
    });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Récupérer l'utilisateur selon son rôle
    let user;
    if (decoded.role === 'admin' || decoded.role === 'superadmin') {
      user = await Admin.findById(decoded.id);
    } else if (decoded.role === 'technicien') {
      user = await Technicien.findById(decoded.id);
    } else if (decoded.role === 'employe') {
      user = await Employe.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      success: false,
      message: 'Non autorisé à accéder à cette ressource'
    });
  }
};

// Middleware pour vérifier les rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`
      });
    }
    next();
  };
};
