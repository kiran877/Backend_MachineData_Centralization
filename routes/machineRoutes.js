const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('User'), machineController.getMachines);
router.get('/:id', authMiddleware, roleMiddleware('User'), machineController.getMachineById);
router.post('/', authMiddleware, roleMiddleware('Supervisor'), machineController.createMachine);
router.put('/:id', authMiddleware, roleMiddleware('Supervisor'), machineController.updateMachine);
router.delete('/:id', authMiddleware, roleMiddleware('Admin'), machineController.deleteMachine);

module.exports = router;
