const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const { body, sanitizeBody, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');

exports.nuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
}

exports.guardaVacante = async (req, res) => {
    const vacante = new Vacante(req.body);
    vacante.autor = req.user._id;
    vacante.skills = req.body.skills.split(',');

    const nueva = await vacante.save();
    res.redirect(`/vacantes/${nueva.url}`);
}

exports.verVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');
    
    if (!vacante) {
        return next();
    } else {
        res.render('vacante', {
            nombrePagina: vacante.titulo,
            barra: true,
            vacante
        });
    }
}

exports.editaVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });

    if (!vacante) { 
        return next();
    } else {
        res.render('editar-vacante', {
            nombrePagina: `Editar - ${vacante.titulo}`,
            vacante,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen
        });
    }
}

exports.editarVacante = async (req, res, next) => {
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(',');
    const vacante = await Vacante.findOneAndUpdate(
        { 
            url: req.params.url 
        }, 
        vacanteActualizada,
        {
            new: true,
            runValidators: true
        }
    );

    res.redirect(`/vacantes/${vacante.url}`);
}

exports.validarVacante = async (req, res, next) => {
    const rules = [
        sanitizeBody('titulo').escape(),
        sanitizeBody('empresa').escape(),
        sanitizeBody('ubicacion').escape(),
        sanitizeBody('salario').escape(),
        sanitizeBody('contrato').escape(),
        sanitizeBody('skills').escape(),
        body('titulo', 'El titulo de la vacante no puede ir vacía').not().isEmpty(),
        body('empresa', 'La empresa no puede ir vacía').not().isEmpty(),
        body('ubicacion', 'La ubicacion no puede ir vacía').not().isEmpty(),
        body('contrato', 'Selecciona un tipo de contrato válido').not().isEmpty(),
        body('skills', 'Selecciona al menos un conocimiento').not().isEmpty()
    ];
    await Promise.all(rules.map( validation => validation.run(req) ));
    const errores = validationResult(req);
    
    if (errores.isEmpty()) {
        return next();
    } else {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            mensajes: req.flash()
        });
    }
}

exports.eliminaVacante = async (req, res) => {
    const vacante = await Vacante.findById(req.params.id);
    if (validaAutor(vacante, req.user)) {
        await vacante.remove();
        res.status(200).send('Vacante eliminada correctamente');
    } else {
        res.status(403).send('La vacante no pertenece al usuario autenticado');
    }
}

const validaAutor = (vacante = {}, usuario = {}) => {
    return vacante.autor.equals(usuario._id);
}

exports.subirCV = (req, res, next) => {
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

            res.redirect('back');
            return;
        } else {
            next();
        }
    });
}

exports.guardaCandidato = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });
    if (!vacante) return res.redirect('/');

    const nuevo = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    };
    vacante.candidatos.push(nuevo);
    await vacante.save();

    req.flash('correcto', 'Se ha enviado correctamente tu solicitud');
    res.redirect('/');
}

const configuracionMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/cv');
        }, 
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            const newName = `${shortid.generate()}.${extension}`;
            cb(null, newName);
        }
    }),
    fileFilter (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('cv');

exports.verCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);

    if (!vacante) next();
    if (vacante.autor != req.user._id.toString()) return next();
    res.render('candidatos', {
        nombrePagina: `Candidatos - Vacante ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    });
}

exports.buscaVacantes = async (req, res) => {
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    });

    res.render('home', {
        nombrePagina: `Resultados para la busqueda: ${req.body.q}`,
        barra: true,
        vacantes
    });
}