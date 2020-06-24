'use strict'
var Usuario = require('../models/usuario');
var Tweet = require('../models/tweet')
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');


function iniciarSesion(req, res) {

}

function editarUsuario(req, res) {
    var usuarioId = req.params.idUsuario;
    var params = req.body;
    delete params.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tiene permisos para actualizar el usuario' })
    }

    Usuario.findByIdAndUpdate(usuarioId, params, (err, usuarioEditado) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion de actualizacion' })
        if (!usuarioEditado) return res.status(404).send({ message: 'No fue posible encontrar el usuario' })

        return res.status(200).send({ Usuario: usuarioEditado })

    })
}

function verPerfil(req, res) {
    var params = req.body
    var username = req.params.username;

}

function seguir(req, res) {

}

function siguiendo(req, res) {
    var params = req.body

}

function dejarDeSeguir(req, res) {

}

//FUNCIONES DE TWEET

function agregarTweet(req, res) {
    var tweet = new Tweet();
    var params = req.body;

    if (params.contenido) {
        tweet.contenido = params.contenido,
            tweet.user = req.user.sub
        tweet.save((err, tweetCreado) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion de tweet' });
            if (!tweetCreado) return res.status(404).send({ message: 'Error al agregar tweet' });

            return res.status(200).send({ tweet: tweetCreado });
        })
    } else {
        return res.status(500).send({ message: "No puede agregar un tweet vacio" })
    }
}

function verTweets(req, res) {
    Tweet.find((err, tweets) => {
        if (err) return res.status(500).send({ message: "error en la peticion de tweet" })
        if (!tweets) return res.status(500).send({ message: "error al listar los tweets" })

        return res.status(200).send({ tweets: tweets })
    })
}

function editarTweet(req, res) {
    var tweetId = req.params.tweetId
    var params = req.body
    Tweet.findByIdAndUpdate({ _id: tweetId }, { new: true }, (err, tweetActualizado) => {
        if (err) return res.status(500).send({ message: "Error en la peticion de edicion de tweet" })
        if (!tweetActualizado) return res.status(500).send({ message: "Error al editar el tweet" })
        return res.status(200).send({ Tweet_actualizado: tweetActualizado })
    })
}

function eliminarTweet(req, res) {
    var tweetId = req.params.tweetId;
    Tweet.findByIdAndDelete(tweetId, (err, tweetEliminado) => {
        if (err) return res.status(500).send({ message: "Error en la peticion" })
        if (!tweetEliminado) return res.status(404).send({ message: "No fue posible encontrar el tweet" })
        return res.status(200).send({ message: "Tween Eliminado con exito" })
    })
}

function commands(req, res) {
    var c = req.body.commands;
    var array_de_c = c.split(' ');

    /*
        return res.status(200).send({
            message: "letras: " + array_de_c + " no. de palabras: " + array_de_c.length +
                " palabra 2:" + array_de_c[1]
        })*/

    if (c == "") {
        return res.status(400).send({ message: "no puede ingresar un comando vacio" })
    } else if (array_de_c[0] === "REGISTER" && array_de_c.length == 3) {
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
    } else if (array_de_c[0] == "LOGIN" && array_de_c.length == 3) {
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
                                token: jwt.createToken(usuario)
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
    } else if (array_de_c[0] == "PORFILE" && array_de_c.length == 2) {
        var username = array_de_c[1];
        if (req.user.sub) {
            return res.status(500).send({ message: 'No tiene la autorizacion para ver el usuario' })
        }

        Usuario.find(({ nombre: username }), (err, usuario) => {
            if (err) return res.status(500).send({ message: "error en la peticion" })
            if (!usuario) return res.status(404).send({ message: "no fue posible encontrar el perfil que solicita" })

            return res.status(200).send({ PerfilDelUsuario: usuario })
        })
    }
}

module.exports = {
    commands
}