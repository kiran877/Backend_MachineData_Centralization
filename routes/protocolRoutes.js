const express = require('express');
const router = express.Router();
const protocolController = require('../controllers/protocolController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protocol Master
router.get('/', authMiddleware, roleMiddleware('User'), protocolController.getProtocols);
router.post('/', authMiddleware, roleMiddleware('Admin'), protocolController.createProtocol);

// Machine Links
router.get('/machine', authMiddleware, roleMiddleware('User'), protocolController.getMachineProtocols);
router.post('/machine', authMiddleware, roleMiddleware('Supervisor'), protocolController.linkMachineProtocol);
router.delete('/machine/:machine_id/:protocol_id', authMiddleware, roleMiddleware('Supervisor'), protocolController.unlinkMachineProtocol);

module.exports = router;
