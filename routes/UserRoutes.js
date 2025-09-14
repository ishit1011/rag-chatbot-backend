const express = require('express');
const { createUserSession } = require('../controllers/UserController');
const verifyGoogleToken = require('../middlewares/authGoogle');
const router = express.Router();

router.post('/create-user-session',verifyGoogleToken,createUserSession); // create/get user session

module.exports = router;