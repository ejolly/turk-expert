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

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({    // to support URL-encoded bodies
  extended: true
})); 


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// Serving static files in Express
app.use('/', express.static(__dirname + '/public'));

app.use(express.static('./'));
app.use('/', router);
app.use('*', function (req, res) {
    res.render('pages/404');
});

app.listen(port, host, function () {
    host = host || 'localhost';
    brand.log();
    console.log('Server is running at ' + host + ':' + port);    
});

// Scheduler 
job.start(1);