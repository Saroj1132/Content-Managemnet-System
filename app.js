var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require("express-handlebars")
var flash=require("connect-flash")
var session=require("express-session")
var {globalVariables}=require("./configuere/configu")
var fileupload=require("express-fileupload")
var adminrouteer=require("./routes/adminroutes")
var defaultrouter = require('./routes/defaultRoutes');
var expressValidator = require("express-validator")
var app = express();

//flash and session

app.use(session({
    secret: 'anysecret',
    saveUninitialized: true,
    resave: true
}));

app.use(flash())

app.use(globalVariables)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




app.use('/', defaultrouter);
app.use("/admin", adminrouteer)



app.engine('handlebars', hbs({defaultLayout: 'default'}));
app.set('view engine' , 'handlebars');


//express validator

app.use(expressValidator ({
    errorFormatter: function(param, msg, value){
      var namespace=param.split('.')
      , root = namespace.shift()
      , formParam = root
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']'
      }
      return {
        param: formParam,
        msg:msg,
        value: value
      }
    }
  }))
  
  


app.use(fileupload())

app.listen(3000)

module.exports = app;
