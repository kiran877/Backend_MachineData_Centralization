const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Plants
router.get('/plants', authMiddleware, roleMiddleware('User'), orgController.getPlants);
router.post('/plants', authMiddleware, roleMiddleware('Supervisor'), orgController.createPlant);

// Areas
router.get('/areas', authMiddleware, roleMiddleware('User'), orgController.getAreas);
router.post('/areas', authMiddleware, roleMiddleware('Supervisor'), orgController.createArea);

// Lines
router.get('/lines', authMiddleware, roleMiddleware('User'), orgController.getLines);
router.post('/lines', authMiddleware, roleMiddleware('Supervisor'), orgController.createLine);

module.exports = router;
