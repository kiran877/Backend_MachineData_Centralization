const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Processes
router.get('/', authMiddleware, roleMiddleware('User'), processController.getProcesses);
router.post('/', authMiddleware, roleMiddleware('Supervisor'), processController.createProcess);
router.put('/:id', authMiddleware, roleMiddleware('Supervisor'), processController.updateProcess);
router.delete('/:id', authMiddleware, roleMiddleware('Supervisor'), processController.deleteProcess);

// Parameters
router.get('/parameters', authMiddleware, roleMiddleware('User'), processController.getParameters);
router.post('/parameters', authMiddleware, roleMiddleware('Supervisor'), processController.createParameter);
router.put('/parameters/:id', authMiddleware, roleMiddleware('Supervisor'), processController.updateParameter);
router.delete('/parameters/:id', authMiddleware, roleMiddleware('Supervisor'), processController.deleteParameter);

module.exports = router;
