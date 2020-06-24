'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
    usuario: String,
    password: String,
    UsuariosALosQueSigue: []
})

module.exports = mongoose.model('usuario', UsuarioSchema);