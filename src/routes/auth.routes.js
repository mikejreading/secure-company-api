const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { validateRegistration, validateLogin } = require('../middleware/validation.middleware');
const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

module.exports = router;
