var express = require('express');
var router = express.Router();

var ctrlAdmin = require('../controllers/admin');
var ctrlBlog = require('../controllers/blog');

router.get('/logout', ctrlAdmin.logout);
router.get('/login', ctrlAdmin.loginPage);
router.get('/register', ctrlAdmin.registerPage);
router.post('/register', ctrlAdmin.registerAdmin);
router.post('/login', ctrlAdmin.loginAdmin);

module.exports = router;
