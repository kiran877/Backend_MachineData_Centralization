const express = require('express');
const router = express.Router();
const hardwareController = require('../controllers/hardwareController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// PLCs
router.get('/plcs', authMiddleware, roleMiddleware('User'), hardwareController.getPLCs);
router.post('/plcs', authMiddleware, roleMiddleware('Supervisor'), hardwareController.createPLC);
router.put('/plcs/:id', authMiddleware, roleMiddleware('Supervisor'), hardwareController.updatePLC);
router.delete('/plcs/:id', authMiddleware, roleMiddleware('Supervisor'), hardwareController.deletePLC);

// HMIs
router.get('/hmis', authMiddleware, roleMiddleware('User'), hardwareController.getHMIs);
router.post('/hmis', authMiddleware, roleMiddleware('Supervisor'), hardwareController.createHMI);
router.put('/hmis/:id', authMiddleware, roleMiddleware('Supervisor'), hardwareController.updateHMI);
router.delete('/hmis/:id', authMiddleware, roleMiddleware('Supervisor'), hardwareController.deleteHMI);

module.exports = router;
