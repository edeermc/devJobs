const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.verTrabajos = async (req, res, next) => {
    const vacantes = await Vacante.find();
    if (!vacantes) return next();

    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y publica trabajos para desarrolladores web',
        barra: true,
        boton: true,
        vacantes
    });
}