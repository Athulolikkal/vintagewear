var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require("express-handlebars");
require('dotenv').config();

var indexRouter = require('./routes/user');
// var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars')
// var fileUpload = require('express-fileupload');
const bodyparser=require('body-parser');

let Handlebars=require("handlebars");


Handlebars.registerHelper("ifCheck", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});


var app = express();
var db=require('./config/connection')
var session=require('express-session')

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, private,no-store,must-revalidate,max-stale=0,pre-check=0')
  next()
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/' }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"key",cookie:{maxAge:600000}}))
// app.use(fileUpload());
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())

db.connect((err)=>{
  if(err)
  console.log("connection error"+err);
  else
    console.log("database connected");
  })

app.use('/', indexRouter);
// app.use('/user', usersRouter);
app.use('/admin',adminRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
res.render('404error')
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
