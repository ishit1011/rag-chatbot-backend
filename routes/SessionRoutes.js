const express = require('express');
const verifyGoogleToken = require('../middlewares/authGoogle');
const { saveSessionMessage, getSessionMessages, deleteSessionMessages } = require('../controllers/SessionController');
const router = express.Router();

router.post('/save-message',verifyGoogleToken,saveSessionMessage);
router.post('/get-messages',verifyGoogleToken,getSessionMessages);
router.post('/clear-session',verifyGoogleToken,deleteSessionMessages);

module.exports = router;