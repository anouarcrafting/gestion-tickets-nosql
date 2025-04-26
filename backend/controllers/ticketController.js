const Ticket = require('../models/ticketModel');
const { Employe, Technicien } = require('../models/userModel');

// @desc    Récupérer tous les tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    let query;
    
    // Filtrage selon le rôle de l'utilisateur
    if (req.user.role === 'employe') {
      // Un employé ne voit que ses propres tickets
      query = Ticket.find({ employeId: req.user.id });
    } else if (req.user.role === 'technicien') {
      // Un technicien voit les tickets qui lui sont assignés
      query = Ticket.find({ technicienId: req.user.id });
    } else {
      // Admin voit tous les tickets
      query = Ticket.find();
    }
    
    // Ajout des filtres de recherche
    if (req.query.statut) {
      query = query.find({ statut: req.query.statut });
    }
    if (req.query.priorité) {
      query = query.find({ priorité: req.query.priorité });
    }
    
    // Population des références
    query = query.populate('employeId', 'nom email')
                 .populate('technicienId', 'nom email specialité');
    
    // Exécution de la requête
    const tickets = await query;
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Récupérer un ticket spécifique
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('employeId', 'nom email')
      .populate('technicienId', 'nom email specialité');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket avec l'id ${req.params.id} non trouvé`
      });
    }
    
    // Vérification des autorisations
    if (req.user.role === 'employe' && ticket.employeId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à accéder à ce ticket'
      });
    }
    
    if (req.user.role === 'technicien' && 
        (!ticket.technicienId || ticket.technicienId._id.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à accéder à ce ticket'
      });
    }
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Créer un nouveau ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res) => {
  try {
    // Si c'est un employé qui crée le ticket, utiliser son ID
    if (req.user.role === 'employe') {
      req.body.employeId = req.user.id;
    } else if (req.body.employeId) {
      // Vérifier si l'employé existe
      const employe = await Employe.findById(req.body.employeId);
      if (!employe) {
        return res.status(400).json({
          success: false,
          message: 'Employé non trouvé'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'ID d\'employé requis'
      });
    }
    
    // Si un technicien est assigné, vérifier s'il existe
    if (req.body.technicienId) {
      const technicien = await Technicien.findById(req.body.technicienId);
      if (!technicien) {
        return res.status(400).json({
          success: false,
          message: 'Technicien non trouvé'
        });
      }
    }
    
    // Ajouter l'historique initial
    if (!req.body.historique) {
      req.body.historique = [];
    }
    
    req.body.historique.push({
      date: new Date(),
      action: 'Ticket créé',
      effectuéPar: req.user.email
    });
    
    // Création du ticket
    const ticket = await Ticket.create(req.body);
    
    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    console.error(err);
    
    // Gestion des erreurs de validation
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Mettre à jour un ticket
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket avec l'id ${req.params.id} non trouvé`
      });
    }
    
    // Vérification des autorisations
    if (req.user.role === 'employe' && ticket.employeId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce ticket'
      });
    }
    
    // Un technicien ne peut modifier que les tickets qui lui sont assignés
    if (req.user.role === 'technicien' && 
        (!ticket.technicienId || ticket.technicienId.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce ticket'
      });
    }
    
    // Si on change le statut, ajouter à l'historique
    if (req.body.statut && req.body.statut !== ticket.statut) {
      if (!req.body.historique) {
        req.body.historique = ticket.historique || [];
      }
      
      req.body.historique.push({
        date: new Date(),
        action: `Statut changé de ${ticket.statut} à ${req.body.statut}`,
        effectuéPar: req.user.email
      });
    }
    
    // Si on assigne un technicien, ajouter à l'historique
    if (req.body.technicienId && 
        (!ticket.technicienId || req.body.technicienId.toString() !== ticket.technicienId.toString())) {
      // Vérifier si le technicien existe
      const technicien = await Technicien.findById(req.body.technicienId);
      if (!technicien) {
        return res.status(400).json({
          success: false,
          message: 'Technicien non trouvé'
        });
      }
      
      if (!req.body.historique) {
        req.body.historique = ticket.historique || [];
      }
      
      req.body.historique.push({
        date: new Date(),
        action: `Assigné à ${technicien.nom}`,
        effectuéPar: req.user.email
      });
    }
    
    // Mise à jour du ticket
    ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('employeId', 'nom email')
      .populate('technicienId', 'nom email specialité');
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Supprimer un ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket avec l'id ${req.params.id} non trouvé`
      });
    }
    
    // Seul un admin peut supprimer un ticket
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce ticket'
      });
    }
    
    await ticket.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Ticket supprimé'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};