var express = require('express'),
    router = express.Router(),
    auth = require('basic-auth'),
    conf = require('./config'),
    path = require('path'),    //used for file path
    fs = require('fs-extra'),      //File System - for file manipulation
    TurkExpert = require('./src/controller');

router.use(function (req, res, next) {

    console.log(req.method + req.url);

    //basic auth every endpoint except get /
    if (req.method === 'GET' && req.url === '/') {
        next();
    } else if (req.method === 'GET' && req.url === '/leaderboard'){
        next();
    }
     else {
        var user = auth(req);
        if (!user || user.name !== conf.admin.username || user.pass !== conf.admin.password) {
            res.statusCode = 401
            res.setHeader('WWW-Authenticate', 'Basic realm="TurkExpertAuthentication"')
            res.end('Access denied');
        } else {
            //res.render(target);
            //res.end('Access granted');
            next();
        }
    }
});

router.get('/', function (req, res) {
    //client app
    //call api for client init: authentication, content loading, assignemnt Data persist, status update etc.
    ////////////////////////////// From MTurk Doc /////////////////////////////////////////////
    // 1. The URL you use for the ExternalURL must use the HTTPS protocol.
    // 2. An iframe generated in MTurk experiment page to present our client app content.
    // 3. The Frame's URL and Parameters - The URL used for the frame is the ExternalURL of the question with the following parameters appended: 
    // assignmentId, 
    // hitId, 
    // turkSubmitTo, 
    // workerId. 
    // These parameters are appended CGI-style
    //////////////////////////////////////////////////////////////////////////////////////////
    TurkExpert.init(req.query.assignmentId, req.query.hitId, req.query.workerId, req.query.turkSubmitTo, function (e) {
        if (e.code === 404) {
            res.render('pages/notfound');
        } else if (e.code === 422) {
            res.render('pages/index', { // not yet authenticated
                auth: false,
                e: e
            });
        } else if (e.code === 200) {
            res.render('pages/index', { // already authenticated
                auth: true,
                e: e
            });
        }
    });

});

router.get('/leaderboard', function (req, res) {
    //client app
    //TODO: call api for auth, content
    res.render('pages/leaderboard', {
        //just for testing,  
        "items": 
        [
            {"name": "abc", "numShares": "100"},
            {"name": "xyz", "numShares": "75"},
            {"name": "cdc", "numShares": "0"}
        ]
    });

});


// var basicAuth = function (req, res, target) {
//     var user = auth(req);
//     if (!user || user.name !== conf.admin.username || user.pass !== conf.admin.password) {
//         res.statusCode = 401
//         res.setHeader('WWW-Authenticate', 'Basic realm="TurkExpertAuthentication"')
//         res.end('Access denied');
//     } else {
//         res.render(target);
//         //res.end('Access granted');
//     }
// }

router.get('/admin', function (req, res) {
    //basicAuth(req,res,'pages/admin');
    res.render('pages/admin');
});

router.get('/charts', function (req, res) {
    //basicAuth(req,res,'pages/charts'); 
    res.render('pages/charts');
});

//Query all the db collections - TODO Modulize
router.get('/tables', function (req, res) {
    //basicAuth(req,res,'pages/tables');
    TurkExpert.find(function (result) {
        res.render('pages/tables', result);
    });
});

router.get('/manage', function (req, res) {
    //basicAuth(req,res,'pages/manage'); 
    res.render('pages/manage');
});

router.get('/support', function (req, res) {
    //basicAuth(req,res,'pages/support'); 
    res.render('pages/support');
});

/////////////////////// Upload Actions from csv  - TODO Modulize
//uploadHit 
router.post('/uploadHit', function (req, res, next) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename + ' to path ->' + __dirname + '/data/');

        //step 1
        //Path where image will be uploaded
        fstream = fs.createWriteStream(__dirname + '/data/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("Uploaded: " + filename);

            //step 2
            // persist into mongo
            // script.js
            var exec = require('child_process').exec;
            var command = 'mongoimport -h localhost -d turkexpert -c hit --type csv --headerline --file ' + __dirname + '/data/' + filename;
            var output = null;
            exec(command, function (error, stdout, stderr) {
                console.log('stdout: ', stdout);
                console.log('stderr: ', stderr);
                console.log('---------------');
                output = stdout + stderr;
                if (error !== null) {
                    console.log('exec error: ', error);
                }
                //step 3
                res.redirect('manage?hitUploadResult=' + output);  //where to go next + output
            });

        });
    });
});

//uploadNotice
router.post('/uploadNotice', function (req, res, next) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename + ' to path ->' + __dirname + '/data/');

        //step 1
        //Path where image will be uploaded
        fstream = fs.createWriteStream(__dirname + '/data/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("Uploaded: " + filename);

            //step 2
            // persist into mongo
            // script.js
            var exec = require('child_process').exec;
            var command = 'mongoimport -h localhost -d turkexpert -c notice --type csv --headerline --file ' + __dirname + '/data/' + filename;
            var output = null;
            exec(command, function (error, stdout, stderr) {
                console.log('stdout: ', stdout);
                console.log('stderr: ', stderr);
                console.log('---------------');
                output = stdout + stderr;
                if (error !== null) {
                    console.log('exec error: ', error);
                }
                //step 3
                res.redirect('manage?noticeUploadResult=' + output);  //where to go next + output
            });

        });
    });
});

//uploadWorker
router.post('/uploadWorker', function (req, res, next) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename + ' to path ->' + __dirname + '/data/');

        //step 1
        //Path where image will be uploaded
        fstream = fs.createWriteStream(__dirname + '/data/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("Uploaded: " + filename);

            //step 2
            // persist into mongo
            // script.js
            var exec = require('child_process').exec;
            var command = 'mongoimport -h localhost -d turkexpert -c worker --type csv --headerline --file ' + __dirname + '/data/' + filename;
            var output = null;
            exec(command, function (error, stdout, stderr) {
                console.log('stdout: ', stdout);
                console.log('stderr: ', stderr);
                console.log('---------------');
                output = stdout + stderr;
                if (error !== null) {
                    console.log('exec error: ', error);
                }
                //step 3
                res.redirect('manage?workerUploadResult=' + output);  //where to go next + output
            });

        });
    });
});

//batchCreateHits
router.post('/publishHits', function (req, res) {
    //Batch Call from DB - hits
    TurkExpert.publishTreatments(["control", "costly", "framing", "reciprocity", "reputation"], function (result) {
        res.redirect('manage?hitPublishResult=' + result);
    });
});

//valideYourCode
router.post('/validateCode', function (req, res) {
    //Batch Call from DB - hits
    // console.log(req.body.accessObj.wid);
    // console.log(req.body.accessObj.hid);
    // console.log(req.body.accessCode);
    // console.log(req.body.accessContent);

    TurkExpert.validateCode(req.body.accessContent, req.body.accessObj, req.body.accessCode, function (e) {
        if(e.code === 200){
            res.render('pages/index', { // first time authenticated
                auth: true,
                e: e
            });
        }else if(e.code === 403){
            res.render('pages/index', { // authentication failed
                auth: false,
                e: e
            });
        }        
    });
});

//TBD
router.get('/forms', function (req, res) {
    res.render('pages/forms');
});

router.get('/bootstrap-elements', function (req, res) {
    res.render('pages/bootstrap-elements');
});

router.get('/bootstrap-grid', function (req, res) {
    res.render('pages/bootstrap-grid');
});

router.get('/blank-page', function (req, res) {
    res.render('pages/blank-page');
});

router.get('/roadmap', function (req, res) {
    res.render('pages/roadmap');
});
router.get('/about', function (req, res) {
    res.render('pages/about', { company: 'Microsoft' });
});

//api
router.get('/api/balance', function (req, res) {
    TurkExpert.GetAccountBalance(function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});

router.get('/api/hits', function (req, res) {
    //CGI-style
    //optional: size -> PageSize
    //optional: page -> PageNumber
    TurkExpert.SearchHITs(req.query.size, req.query.page, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});

router.get('/api/hit/:id', function (req, res) {
    //required: id -> HITId
    TurkExpert.GetHIT(req.params.id, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});

router.get('/api/assignment/:id', function (req, res) {
    //required: id -> AssignmentId
    TurkExpert.GetAssignment(req.params.id, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});

router.get('/api/assignments/:id', function (req, res) {
    //required: id -> HITId
    TurkExpert.GetAssignmentsForHit(req.params.id, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});


router.post('/api/hit', function (req, res) {
    //HIT schema -> /src/model/hit.ts
    TurkExpert.CreateHIT(req.body.hit, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });

});

router.post('/api/hits', function (req, res) {
    //TODO: Batch Call from DB - hit
    console.log('Batch pubsh from DB!');
    //TurkExpert
    res.send(200);
});


router.post('/api/notice', function (req, res) {
    //HIT schema -> /src/model/hit.ts
    TurkExpert.NotifyWorkers(req.body.notice, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
    //TODO: Batch Call from DB - notice
});





module.exports = router;
