const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    contrasena: {
        type: String,
        required: true,
        trim: true
    },
    token: String, 
    expira: Date,
    imagen: String
});

usuariosSchema.pre('save', async function (next) {
    if (!this.isModified('contrasena')) {
        next();
    } else {
        const hash = await bcrypt.hash(this.contrasena, 12);
        this.contrasena = hash;
    }
});

usuariosSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next('Este correo ha sido registrado previamente');
    } else {
        next(error);
    }
});

usuariosSchema.methods = {
    comparaContrasena: function (pass) {
        return bcrypt.compareSync(pass, this.contrasena);
    }
}

module.exports = mongoose.model('Usuario', usuariosSchema);