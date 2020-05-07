const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuario = mongoose.model('Usuario');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'contrasena'
}, async (email, contrasena, done) => {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) 
        return done(null, false, {
            message: 'El usuario no existe'
        });
    
    const verificarContrasena = usuario.comparaContrasena(contrasena);
    if (!verificarContrasena) return done(null, false, {
            message: 'Contraseña inválida'
        });
    
    return done(null, usuario);
}));

passport.serializeUser((usuario, done) => done(null, usuario._id));
passport.deserializeUser(async (id, done) => {
   const usuario = await Usuario.findById(id).exec();
   return done(null, usuario);
});

module.exports = passport;