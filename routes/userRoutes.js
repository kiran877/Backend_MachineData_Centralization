const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('Admin'), userController.getUsers);
router.post('/register', authMiddleware, roleMiddleware('Admin'), userController.registerUser);

// Lookup routes for form filling
router.get('/roles', authMiddleware, userController.getRoles);
router.get('/departments', authMiddleware, userController.getDepartments);

module.exports = router;
