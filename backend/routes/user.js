'use strict';

// import express
const express = require('express');

// import router
const router = express.Router();

// import user controller
const userCtrl = require('../controllers/user');

// signup route
router.post('/signup', userCtrl.signup);

// login route
router.post('/login', userCtrl.login);

module.exports = router;