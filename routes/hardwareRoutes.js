const express = require('express');
const router = express.Router();
const hardwareController = require('../controllers/hardwareController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// PLCs
router.get('/plcs', authMiddleware, roleMiddleware('User'), hardwareController.getPLCs);
router.post('/plcs', authMiddleware, roleMiddleware('Supervisor'), hardwareController.createPLC);

// HMIs
router.get('/hmis', authMiddleware, roleMiddleware('User'), hardwareController.getHMIs);
router.post('/hmis', authMiddleware, roleMiddleware('Supervisor'), hardwareController.createHMI);

module.exports = router;
