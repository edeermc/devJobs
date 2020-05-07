const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortid = require('shortid');

const vacanteSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: 'EL nombre de la vacante es obligatorio',
        trim: true
    }, 
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoria'
    },
    salario: {
        type: String,
        default: 0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    }, 
    url: {
        type: String,
        trim: true,
        lowercase: true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuario',
        required: 'El autor es obligatorio'
    }
});

vacanteSchema.pre('save', function (next) {
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;

    next();
});

vacanteSchema.index({ titulo: 'text' });

module.exports = mongoose.model('Vacante', vacanteSchema);