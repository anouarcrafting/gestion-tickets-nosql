const express = require('express');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes d'utilisateurs nécessitent un admin
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router
  .route('/')
  .post(createUser);

router
  .route('/:role')
  .get(getUsers);

router
  .route('/:id')
  .put(updateUser);

router
  .route('/:role/:id')
  .delete(deleteUser);

module.exports = router;