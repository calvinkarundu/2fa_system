const http = require('http');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const session = require('express-session');
const logger = require('morgan');

const router = require('./router');

const app = express();

const port = process.env.PORT;

app.set('port', port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(session({
    secret: 'You no know it!',
    resave: false,
    saveUninitialized: true,
}));
app.use(express.urlencoded({ extended: false }));

app.use(router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Start the server
const server = http.createServer(app);
server.listen(port);
server.on('listening', function() {
    console.log('Listening on ' + port);
});

