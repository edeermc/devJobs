const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

const router= require('./routes');
require('dotenv').config({ path: 'variables.env' });
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('handlebars', exphbs({
    handlebars: allowInsecurePrototypeAccess(handlebars),
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars')
}));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});
app.use('/', router());
app.use((req, res, next) => {
    next(createError(404, 'Página no encontrada'));
});
app.use((error, req, res) => {
    res.locals.mensaje = error.message;
    res.locals.estatus = error.status || 500;
    res.status(res.locals.estatus);
    res.render('error');
});
app.listen(process.env.PORT, '0.0.0.0', () => {
    console.info('El servidor esta funcionando');
});