'use strict';
var express = require("express"), 
app = express(),
busboy = require('connect-busboy'); //middleware for form/file upload, before loading routes
app.use(busboy());
var router = require("./routes"),
brand = require('./lib/utils/brand'),
path = __dirname + '/views/', 
port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000, 
host = process.env.OPENSHIFT_NODEJS_IP,
bodyParser = require('body-parser'),
job = require('./src/scheduler'); //scheduler

////////////////////////////////////////////////////////
//MONGO Pooling
////////////////////////////////////////////////////////
var MongoDB = require('./src/db');
// Initialize connection once
MongoDB.connect(function (db){


  app.use(bodyParser.json());       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({    // to support URL-encoded bodies
    extended: true
  })); 

  //TODO: settimeout
  // var connectTimeout = require('connect-timeout');

  // //var timeout = connectTimeout({ time: 10000 });
  // var longTimeout = connectTimeout({ time: 45000 });

  // app.use(timeout); // you can set a global timeout value
  // app.get('/', longTimeout, yourHandler); // or router


  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  // Serving static files in Express
  app.use('/', express.static(__dirname + '/public'));
  app.use(express.static('./'));

  app.use(function(req, res, next) {
      req.db = db;
      next();
  });

  app.use('/', router);
  app.use('*', function (req, res) {
      res.render('pages/404');
  });

  app.listen(port, host, function () {
    host = host || 'localhost';
    brand.log();
    console.log('Server is running at ' + host + ':' + port);    
  });
  
//Scheduler 
//job.start(1);
//job.start(2);

});


