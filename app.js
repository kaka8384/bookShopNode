var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let bodyParser = require('body-parser');
let systemConfig = require('./system.config');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var bluebird = require('bluebird');
mongoose.connect(systemConfig.mongooseConnect,{ useNewUrlParser: true });
mongoose.Promise=bluebird;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productRouter = require('./routes/product');
var categoryRouter = require('./routes/category');
var customerRouter = require('./routes/customer');
var shoppingCatRouter = require('./routes/shoppingCat');
var orderRouter = require('./routes/order');
var product_commentRouter = require('./routes/product_comment');
var product_collectRouter = require('./routes/product_collect');
var product_issueRouter = require('./routes/product_issue');
var shippingAddressRouter = require('./routes/shippingAddress');
var uploadRouter = require('./routes/upload');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Credentials','true');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
app.use(allowCrossDomain);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ 
  name: 'accountSession',
  secret: 'account system', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1800000, httpOnly:false },  
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



app.use('/', indexRouter);
app.use('/api', usersRouter);
app.use('/api',productRouter);
app.use('/api',categoryRouter);
app.use('/api',customerRouter);
app.use('/api',shoppingCatRouter);
app.use('/api',orderRouter);
app.use('/api',product_commentRouter);
app.use('/api',product_issueRouter);
app.use('/api',shippingAddressRouter);
app.use('/api',uploadRouter);
app.use('/api',product_collectRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error:'+err);
});

module.exports = app;
