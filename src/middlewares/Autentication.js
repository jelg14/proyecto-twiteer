'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_secreta'
var bcrypt = require('bcrypt-nodejs');
var jwt2 = require('../services/jwt');


exports.ensureAuth = function(req, res, next) {
    var c = req.body.commands;
    var array_de_c = c.split(' ');
    var entrada = array_de_c[0].toUpperCase()
    var Usuario = require('../models/usuario');

    if (!req.headers.authorization && entrada == "PORFILE" || entrada == "FOLLOW") {
        return res.status(400).send("no posee cabezera de autorizacion")
    } else if (entrada == "LOGIN" || entrada == "REGISTER") {
        if (entrada == "REGISTER" && array_de_c.length == 3) {
            var username = array_de_c[1]
            var password = array_de_c[2]

            var user = new Usuario();

            user.usuario = username;

            Usuario.find({
                $or: [
                    { usuario: username }
                ]
            }).exec((err, users) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion de usuarios' })
                if (users && users.length >= 1) {
                    return res.status(500).send({ message: 'El usuario ya existe' })
                } else {
                    bcrypt.hash(password, null, null, (err, hash) => {
                        user.password = hash;

                        user.save((err, usuarioGuardado) => {
                            if (err) return res.status(500).send({ message: 'Error al guardar el Usuario' })
                            if (usuarioGuardado) {
                                res.status(200).send({ user: usuarioGuardado })
                            } else {
                                res.status(404).send({ message: 'No se ha podido registrar el usuario' })
                            }
                        })
                    })
                }
            })
        } else if (entrada == "LOGIN" && array_de_c.length == 3) {
            var nombre = array_de_c[1];
            var password = array_de_c[2]

            Usuario.findOne({ usuario: nombre }, (err, usuario) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion' })

                if (usuario) {

                    bcrypt.compare(password, usuario.password, (err, check) => {
                        if (check) {
                            var gettoken = true;
                            if (gettoken) {
                                return res.status(200).send({
                                    token: jwt2.createToken(usuario)
                                })
                            } else {
                                usuario.password = undefined;
                                return res.status(200).send({ user: usuario });
                            }
                        } else {
                            return res.status(400).send({ message: 'el usuario no se ha podido identificar' })
                        }
                    })
                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido logear' })
                }
            })
        }
    } else {

        var token = req.headers.authorization.replace(/['"]+/g, '');
        try {
            var playload = jwt.decode(token, secret)
            if (playload.exp <= moment.unix()) {
                return res.status(401).send({
                    message: 'El token ha expirado'
                })
            }
        } catch (error) {
            return res.status(404).send({
                message: 'El token no es valido'
            })
        }
        req.user = playload
        next()
    }
}