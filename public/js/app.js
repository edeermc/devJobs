import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');
    const alertas = document.querySelector('.alertas');

    if (skills) {
        skills.addEventListener('click', agregarSkill);
        skillsSeleccionados();
    }

    if (alertas) {
        limpiaAlertas();
    }

    const vacantesListado = document.querySelector('.panel-administracion');
    if (vacantesListado) {
        vacantesListado.addEventListener('click', accionesListado);
    }
});

const skills = new Set();
const agregarSkill = (e) => {
    if (e.target.tagName === 'LI') {
        if (e.target.classList.contains('activo')) {
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }

    document.querySelector('#skills').value = [...skills];
}

const skillsSeleccionados = () => {
    const seleccionados = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));
    seleccionados.forEach(skill => {
        skills.add(skill.textContent);
    });

    document.querySelector('#skills').value = [...skills];
}

const limpiaAlertas = () => {
    const alertas = document.querySelector('.alertas');
    const interval = setInterval(() => {
        if (alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        } else if (alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 2000);
}

const accionesListado = (e) => {
    e.preventDefault();
    if (e.target.dataset.eliminar) {
        Swal.fire({
            title: 'Confirmar eliminación',
            text: 'Una vez eliminada la vacante no se podrá recuperar',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'No, cancelar'
        }).then((result) => {
            if (result.value) {
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
                axios.delete(url, { 
                    params: { url } 
                }).then(function (respuesta) {
                    if (respuesta.status === 200) {
                        Swal.fire(
                            'Eliminado',
                            respuesta.data,
                            'success'
                        );
                    } else {
                        Swal.fire(
                            'Ha ocurrido un error',
                            respuesta.data,
                            'error'
                        );
                    }

                    e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                });
            };
        }).catch(() => {
            Swal.fire(
                'Ha ocurrido un error',
                'No se ha podido eliminar la vacante solicitada',
                'error'
            );
        });
    } else if (e.target.tagName === 'A') {
        window.location.href = e.target.href;
    }
}