'use strict'

var express = require('express')
var usuarioController = require('../controllers/usuarioController')
var md_auth = require('../middlewares/Autentication')

//RUTAS
var api = express.Router()
api.post('/commands', md_auth.ensureAuth, usuarioController.commands)

module.exports = api;