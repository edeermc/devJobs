module.exports = {
    seleccionarSkills: (seleccionadas = [], opciones) => {
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];
        let html = '';

        skills.forEach(skill => {
            html += `<li ${seleccionadas.includes(skill) ? 'class="activo"' : ''}>${skill}</li>`;
        });

        return opciones.fn().html = html;
    }, 
    tipoContrato: (contrato, opciones) => {
        return opciones.fn(this).replace(
            new RegExp(` value="${contrato}"`), '$& selected="selected"'
        );
    },
    mostrarAlertas: (alertas = {}, contenido) => {
        const categoria = Object.keys(alertas);

        let html = '';
        if (categoria.length) {
            alertas[categoria].forEach(alerta => {
                html += `<div class="${categoria} alerta">${alerta}</div>`;
            });
        }

        return contenido.fn().html = html;
    }
}