'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
    usuario: String,
    password: String,
    numeroDetweets: Number,
    seguidores: []


})

module.exports = mongoose.model('usuario', UsuarioSchema);