'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var follow = Schema({
    idUsuario: { type: Schema.ObjectId, ref: 'usuario' },
    nombre: String,
    siguiendo: [{
        idUsuario: String,
        usuario: String
    }]

})

module.exports = mongoose.model('follow', follow);