'use strict'
var Usuario = require('../models/usuario');
var Tweet = require('../models/tweet');
var Follow = require('../models/follow');
const usuario = require('../models/usuario');

function fo(id, nombre) {

    var follow = new Follow();
    follow.idUsuario = id
    follow.nombre = nombre

    follow.save((err, sig) => {
        console.log(sig)
    })
}

function commands(req, res) {
    var c = req.body.commands;
    var array_de_c = c.split(' ');
    var entrada = array_de_c[0].toUpperCase()

    if (c == "") {
        return res.status(400).send({ message: "no puede ingresar un comando vacio" })
    } else if (entrada == "PORFILE" && array_de_c.length == 2) {
        var username = array_de_c[1];


        Usuario.find(({ usuario: username }), (err, usuario) => {
            if (err) return res.status(500).send({ message: "error en la peticion" })
            if (!usuario) return res.status(404).send({ message: "no fue posible encontrar el perfil que solicita" })

            return res.status(200).send({ PerfilDelUsuario: usuario })
        })
    } else if (entrada == "FOLLOW" && array_de_c.length == 2) {
        var username = array_de_c[1];
        if (username == req.user.usuario) {
            return res.status(500).send("ERROR")
        }

        Usuario.update({ usuario: username }, { $addToSet: { seguidores: req.user.usuario } }, { new: true }, (err, siguiendo) => {
            if (err) return res.status(500).send({ message: "Error en la peticion para seguir +" + err })
            if (!siguiendo) return res.status(404).send({ message: "Ocurrio un error en el transcurso de la peticion" })

            return res.status(200).send({ Siguiendo_a: siguiendo })
        })

    } else if (entrada == "UNFOLLOW" && array_de_c.length == 2) {
        var username = array_de_c[1];
        if (username == req.user.usuario) {
            return res.status(500).send("ERROR")
        }

        Usuario.update({ usuario: username }, { $pull: { seguidores: req.user.usuario } } /*{ "seguidores": 1, "_id": 0 }*/ , (err, siguiendo) => {
            if (err) return res.status(500).send({ message: "Error en la peticion para seguir +" + err })
            if (!siguiendo) return res.status(404).send({ message: "Ocurrio un error en el transcurso de la peticion" })
            return res.status(200).send({ Siguiendo_a: siguiendo })
        })

    } else if (entrada == "VIEW_TWEETS") {
        Tweet.find((err, tweets) => {
            if (err) return res.status(500).send({ message: "error en la peticion de tweet" })
            if (!tweets) return res.status(500).send({ message: "error al listar los tweets" })

            return res.status(200).send({ tweets: tweets })
        })
    } else if (entrada == "EDIT_TWEET" && array_de_c.length >= 3) {
        var idTweet = array_de_c[1]
        var primero = array_de_c.shift();
        var segundo = array_de_c.shift();
        var nuevo = array_de_c.join();

        Tweet.findByIdAndUpdate(idTweet, { contenido: nuevo }, { new: true }, (err, tweetActualizado) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion: ' + err })
            if (!tweetActualizado) return res.status(404).send({ message: 'No fue posible encontrar el tweet' })

            return res.status(200).send({ tweetActualizado })
        })

    } else if (entrada == "DELETE_TWEET" && array_de_c.length == 2) {
        var idTweet = array_de_c[1]
        Tweet.findByIdAndDelete(idTweet, (err, tweetEliminado) => {
            if (err) return res.status(500).send({ message: "Error al realizar la peticion de eliminar" })
            if (!tweetEliminado) return res.status(404).send({ message: 'No fue posible encontrar el tweet' })

            return res.status(200).send({ Se_ha_eliminado_el_siguiente_tweet_: tweetEliminado })
        })

    } else if (entrada == "ADD_TWEET") {
        var tweet = new Tweet();
        var user = new Usuario();
        var conteo = 0;
        var params = req.body;

        if (array_de_c) {
            var primero = array_de_c.shift()
            tweet.contenido = array_de_c.join(' '),
                tweet.user = req.user.usuario,
                user.numeroDetweets = conteo + 1;
            tweet.save((err, tweetCreado) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion de tweet +' + err });
                if (!tweetCreado) return res.status(404).send({ message: 'Error al agregar tweet' });

                return res.status(200).send({ tweet: tweetCreado });
            })
        } else {
            return res.status(500).send({ message: "No puede agregar un tweet vacio" })
        }
    } else {
        return res.status(400).send({ message: "Ha ingresado un comando de manera incorrecta, intentelo de nuevo " + array_de_c })
    }
}

module.exports = {
    commands
}