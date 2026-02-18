const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Tags
router.get('/', authMiddleware, roleMiddleware('User'), tagController.getTags);
router.post('/', authMiddleware, roleMiddleware('Supervisor'), tagController.createTag);
router.put('/:id', authMiddleware, roleMiddleware('Supervisor'), tagController.updateTag);
router.delete('/:id', authMiddleware, roleMiddleware('Supervisor'), tagController.deleteTag);

// Alarms
router.get('/alarms', authMiddleware, roleMiddleware('User'), tagController.getAlarmConfigs);
router.post('/alarms', authMiddleware, roleMiddleware('Supervisor'), tagController.createAlarmConfig);

module.exports = router;
