const { Admin, Technicien, Employe } = require('../models/userModel');

// @desc    Récupérer tous les utilisateurs selon le rôle
// @route   GET /api/users/:role
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.params;
    let users;

    // Récupérer les utilisateurs selon le rôle
    if (role === 'admin') {
      users = await Admin.find();
    } else if (role === 'technicien') {
      users = await Technicien.find();
    } else if (role === 'employe') {
      users = await Employe.find();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Créer un nouvel utilisateur
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { role } = req.body;
    let user;

    // Créer l'utilisateur selon le rôle
    if (role === 'admin' || role === 'superadmin') {
      user = await Admin.create(req.body);
    } else if (role === 'technicien') {
      user = await Technicien.create(req.body);
    } else if (role === 'employe') {
      user = await Employe.create(req.body);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    
    // Gestion des erreurs de validation Mongoose
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Gestion des erreurs de duplicata
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cet email ou login existe déjà'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    let user;

    // Mettre à jour l'utilisateur selon le rôle
    if (role === 'admin' || role === 'superadmin') {
      user = await Admin.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
    } else if (role === 'technicien') {
      user = await Technicien.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
    } else if (role === 'employe') {
      user = await Employe.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur avec l'id ${id} non trouvé`
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

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:role/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const { role, id } = req.params;
    let result;

    // Supprimer l'utilisateur selon le rôle
    if (role === 'admin') {
      result = await Admin.findByIdAndDelete(id);
    } else if (role === 'technicien') {
      result = await Technicien.findByIdAndDelete(id);
    } else if (role === 'employe') {
      result = await Employe.findByIdAndDelete(id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur avec l'id ${id} non trouvé`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};