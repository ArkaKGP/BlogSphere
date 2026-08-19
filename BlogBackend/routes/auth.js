const express = require('express');
const router = express.Router();
const { register, login, getTotalUsers } = require('../Controllers/authControllers');

router.post('/register', register);
router.post('/login', login);
router.get('/totalusers', getTotalUsers);

module.exports = router;
