const express = require('express');
const router = express.Router();
const { sendMail } = require('../Controllers/mailController');

router.post('/contact', sendMail);

module.exports = router;
