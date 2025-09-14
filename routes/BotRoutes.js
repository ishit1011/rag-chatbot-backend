const express = require('express');
const verifyGoogleToken = require('../middlewares/authGoogle');
const { getGeminiResponse } = require('../controllers/BotControllers');

const router = express.Router();

router.post('/get-response',verifyGoogleToken,getGeminiResponse);

module.exports = router;