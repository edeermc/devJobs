const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuario = mongoose.model('Usuario');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Campos vacios, verifica tu información'
});

exports.verificaUsuario = (req, res, next) => {
    if (req.isAuthenticated())  {
        next();
    } else {
        res.redirect('/iniciar-sesion');
    }
}

exports.cerrarSesion = (req, res) => {
    req.logout();
    req.flash('correcto', 'Has cerrado sesión exitosamente!');
    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async (req, res) => {
    const vacantes = await Vacante.find({ autor: req.user._id });
    res.render('administracion', {
        nombrePagina: 'Panel de administración',
        tagline: 'Crea y administra tus vacantes desde aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    });
}

exports.reestablecerContrasena = (req, res) => {
    res.render('reestablecer', {
        nombrePagina: 'Reestablecer contraseña',
        tagline: 'Si ya tienes una cuenta, pero olvidaste tu contraseña, recuperala aquí'
    });
}

exports.enviaToken = async (req, res) => {
    const usuario = await Usuario.findOne({ email: req.body.email });
    if (!usuario) {
        req.flash('error', 'No existe la cuenta que desea recuperar');
        res.redirect('/reestablecer');
    } else {
        usuario.token = crypto.randomBytes(20).toString('hex');
        usuario.expira = Date.now() + 3600000;
        await usuario.save();
        const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;
        
        await enviarEmail.enviaCorreo({
            usuario,
            subject: 'Recuperar contraseña',
            resetUrl,
            archivo: 'recuperar'
        });
        req.flash('correcto', 'Se ha enviado un correo para que puedas reestablecer tu cuenta');
        res.redirect('/iniciar-sesion');
    }
}

exports.reestableceContrasena = async (req, res) => {
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if (!usuario) {
        req.flash('error', 'El correo ya no es válido, intenta nuevamentes');
        return res.redirect('/reestablecer');
    } else {
        res.render('nueva-contrasena', {
            nombrePagina: 'Nueva contraseña'
        });
    }
}

exports.cambiaContrasena = async (req, res) => {
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if (!usuario) {
        req.flash('error', 'El correo ya no es válido, intenta nuevamentes');
        return res.redirect('/reestablecer');
    } else {
        usuario.contrasena = req.body.contrasena;
        usuario.token = undefined;
        usuario.expira = undefined;
        await usuario.save();

        req.flash('correcto', 'La contraseña se ha reestablecido exitosamente');
        res.redirect('/iniciar-sesion');
    }
}