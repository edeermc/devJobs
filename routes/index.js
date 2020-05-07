const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.verTrabajos);
    router.get('/administracion', authController.verificaUsuario, authController.mostrarPanel);
    router.get('/editar-perfil', authController.verificaUsuario, usuariosController.editaPerfil);
    router.post('/editar-perfil', authController.verificaUsuario, usuariosController.subirImagen, usuariosController.validaPerfil, usuariosController.editarPerfil);
    router.post('/buscador', vacantesController.buscaVacantes);
    
    router.get('/vacantes/nueva', authController.verificaUsuario, vacantesController.nuevaVacante);
    router.post('/vacantes/nueva', authController.verificaUsuario, vacantesController.validarVacante, vacantesController.guardaVacante);
    router.get('/vacantes/:url', vacantesController.verVacante);
    router.post('/vacantes/:url', vacantesController.subirCV, vacantesController.guardaCandidato);
    router.get('/vacantes/editar/:url', authController.verificaUsuario, vacantesController.editaVacante);
    router.post('/vacantes/editar/:url', authController.verificaUsuario, vacantesController.validarVacante, vacantesController.editarVacante);
    router.delete('/vacantes/eliminar/:id', authController.verificaUsuario, vacantesController.eliminaVacante);
    router.get('/candidatos/:id', authController.verificaUsuario, vacantesController.verCandidatos);
    
    router.get('/crear-cuenta', usuariosController.nuevoUsuario);
    router.post('/crear-cuenta', usuariosController.validaRegistro, usuariosController.guardaUsuario);
    router.get('/iniciar-sesion', usuariosController.iniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    router.get('/cerrar-sesion', authController.verificaUsuario, authController.cerrarSesion);
    router.get('/reestablecer', authController.reestablecerContrasena);
    router.post('/reestablecer', authController.enviaToken);
    router.get('/reestablecer/:token', authController.reestableceContrasena);
    router.post('/reestablecer/:token', authController.cambiaContrasena);
    
    return router;
}