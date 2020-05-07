const mongoose = require('mongoose');
const Usuario = mongoose.model('Usuario');
const { body, sanitizeBody, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');

exports.nuevoUsuario = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes de manera gratuita, solo crea una cuenta.'
    });
}

exports.guardaUsuario = async (req, res, next) => {
    const usuario = new Usuario(req.body);
    
    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
}

exports.validaRegistro = async (req, res, next) => {
    const rules = [
        sanitizeBody('nombre').escape(),
        sanitizeBody('email').escape(),
        sanitizeBody('contrasena').escape(),
        sanitizeBody('confirmar').escape(),
        body('nombre', 'El nombre es obligatorio').not().isEmpty(),
        body('email', 'El correo electrónico debe ser válido').isEmail(),
        body('contrasena', 'La contraseña no puede ir vacía').not().isEmpty(),
        body('confirmar', 'Confirmar contraseña no puede ir vacía').not().isEmpty(),
        body('confirmar', 'La contraseña es diferente').equals(req.body.contrasena)
    ];
    await Promise.all(rules.map( validation => validation.run(req) ));
    const errores = validationResult(req);
    
    if (errores.isEmpty()) {
        return next();
    } else {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes de manera gratuita, solo crea una cuenta.',
            mensajes: req.flash()
        });
    }
}

exports.iniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Inicia sesión den devJobs'
    });
}

exports.editaPerfil = (req, res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil el devJobs',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        usuario: req.user
    });
}

exports.editarPerfil = async (req, res) => {
    const usuario = await Usuario.findById(req.user._id);
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if (req.body.contrasena) {
        usuario.contrasena = req.body.contrasena;
    }
    if (req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();
    req.flash('correcto', 'Se han guardado cambios exitosamente');
    res.redirect('/administracion');
}

exports.validaPerfil = async (req, res, next) => {
    console.log(req);
    const rules = [
        sanitizeBody('nombre').escape(),
        sanitizeBody('email').escape(),
        body('nombre', 'El nombre no puede ir vacío').not().isEmpty(),
        body('email', 'El correo electrónico no puede ir vacío').isEmail()
    ];
    await Promise.all(rules.map( validation => validation.run(req) ));
    const errores = validationResult(req);
    
    if (errores.isEmpty()) {
        return next();
    } else {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil el devJobs',
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            usuario: req.user,
            mensajes: req.flash()
        });
    }
}

exports.subirImagen = (req, res, next) => {
    console.log('Ahorita vemos que pedo');
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo pesa más de los 100kb permitidos');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }

            res.redirect('/administracion');
            return;
        } else {
            next();
        }
    });
}

const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/perfiles');
        }, 
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            const newName = `${shortid.generate()}.${extension}`;
            cb(null, newName);
        }
    }),
    fileFilter (req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');