var express = require('express'),
    router = express.Router(),
    basicAuth = require('basic-auth'),
    conf = require('./config'),
    path = require('path'),    //used for file path
    fs = require('fs-extra'),      //File System - for file manipulation
    TurkExpert = require('./src/controller');

router.use(function (req, res, next) {
    console.log(req.method + req.url);
    next();
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
    var assignmentId = req.query.assignmentId || false;
    // if(req.query.assignmentId !== 'ASSIGNMENT_ID_NOT_AVAILABLE'){
    //   assignmentId = req.query.assignmentId;
    // }    
    var hitId = req.query.hitId || false;    
    var workerId = req.query.workerId || false;
    var turkSubmitTo = req.query.turkSubmitTo || false;
    ////////// Sandbox Test ///////////////////    
    // console.log('kev: assignmentId', assignmentId);
    // console.log('kev: hitId', hitId);
    // console.log('kev: workerId', workerId);
    // console.log('kev: turkSubmitTo', turkSubmitTo);
    if( assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE'  ) {
       //preview
       //console.log('preview');
       res.render('pages/info');
    }else if(!assignmentId || !hitId || !workerId || !turkSubmitTo){
       //raw crul
       //console.log('raw crul');
       res.render('pages/notfound');
    }else{ 
      TurkExpert.init(assignmentId, hitId, workerId, turkSubmitTo, function (e) {
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
    }
});

//TODO: v2.0 
// router.get('/leaderboard', function (req, res) {
//     //client app
//     //call api for auth, content
//     res.render('pages/leaderboard', {
//         //just for testing,  
//         "items": 
//         [
//             {"name": "abc", "numShares": "100"},
//             {"name": "xyz", "numShares": "75"},
//             {"name": "cdc", "numShares": "0"}
//         ]
//     });
// });
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === conf.admin.username  && user.pass === conf.admin.password) {
    return next();
  } else {
    return unauthorized(res);
  };
};


router.get('/admin', auth, function (req, res) {
    //basicAuth(req,res,'pages/admin');
    res.render('pages/admin');
});

router.get('/charts', auth, function (req, res) {
    //basicAuth(req,res,'pages/charts'); 
    res.render('pages/charts');
});

//Query all the db collections - TODO Modulize
router.get('/tables', auth, function (req, res) {
    //basicAuth(req,res,'pages/tables');
    TurkExpert.find(function (result) {
        res.render('pages/tables', result);
    });
});

router.get('/manage', auth, function (req, res) {
    //basicAuth(req,res,'pages/manage'); 
    res.render('pages/manage');
});

router.get('/support', auth, function (req, res) {
    //basicAuth(req,res,'pages/support'); 
    res.render('pages/support');
});

/////////////////////// Upload Actions from csv  - TODO Modulize
//uploadHit 
router.post('/uploadHit', auth, function (req, res, next) {
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


//uploadContent
router.post('/uploadContent', auth, function (req, res, next) {
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
            var command = 'mongoimport -h localhost -d turkexpert -c content --type csv --headerline --file ' + __dirname + '/data/' + filename;
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
                res.redirect('manage?contentUploadResult=' + output);  //where to go next + output
            });

        });
    });
});

//uploadWorker
router.post('/uploadWorker', auth, function (req, res, next) {
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
router.post('/publishHits', auth, function (req, res) {
    //Batch Call from DB - hits // "control" , "costly", "framing", "reciprocity", "reputation"
    res.redirect('manage');
    TurkExpert.publishTreatments(["control", "costly", "framing", "reciprocity", "reputation"], function (result) {
        res.redirect('manage?hitPublishResult=' + result);
    });
});
//batchUpdateAssignments
router.post('/updateAssignments', auth, function (req, res) {
    //Batch Call from DB - hits
    TurkExpert.updateAssignments(function (result) {
        res.redirect('manage?assignmentUpdateResult=' + result);
    });
});
//batchExpireHits
router.post('/expireHits', auth, function (req, res) {
    //Batch Call from DB - hits
    TurkExpert.expireHits(function (result) {
        res.redirect('manage?hitExpireResult=' + result);
    });
});

//Client: valideYourCode
router.post('/validateCode', function (req, res) {
    //Batch Call from DB - hits
    // console.log(req.body.accessObj.wid);
    // console.log(req.body.accessObj.hid);
    // console.log(req.body.accessCode);
    // console.log(req.body.accessContent);
    // console.log(req.body.accessType);
    //turkSubmitTo
    //assignmentId

    TurkExpert.validateCode(req.body.accessType, req.body.accessContent, req.body.accessObj, req.body.accessCode, req.body.accessAssignmentId, req.body.accessSubmitTo, function (e) {
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

//Client: firstUser
router.post('/firstUser', function (req, res) {
    if(req.body.nickname){ // Treatment reputation - persist first user input data
        TurkExpert.firstUser(req.body.nickname, req.body.accessContent, req.body.accessObj, req.body.accessAssignmentId, req.body.accessSubmitTo, function (e) {
            res.render('pages/index', { 
                auth: true,
                e: e
            });
        });
    }else{
        res.render('pages/index', { // other treatments - render diretly.
            auth: true,
            e: {
                code: 200,
                content: req.body.accessContent,
                assignmentId: req.body.accessAssignmentId, 
                turkSubmitTo: req.body.accessSubmitTo
            }
        });
    }    
});

//pontpone
router.get('/postpone', function (req, res) {
  if(!req.query.s){
       res.render('pages/notfound');
  }else{
    TurkExpert.postpone(req.query.s,function (e) {
        res.render('pages/postpone');
    });
  }
});


//TBD
router.get('/forms', auth, function (req, res) {
    res.render('pages/forms');
});

router.get('/bootstrap-elements', auth, function (req, res) {
    res.render('pages/bootstrap-elements');
});

router.get('/bootstrap-grid', auth, function (req, res) {
    res.render('pages/bootstrap-grid');
});

router.get('/blank-page', auth,  function (req, res) {
    res.render('pages/blank-page');
});

router.get('/roadmap', auth, function (req, res) {
    res.render('pages/roadmap');
});
router.get('/about', auth, function (req, res) {
    res.render('pages/about', { company: 'Microsoft' });
});

//api
router.get('/api/balance', auth, function (req, res) {
    TurkExpert.GetAccountBalance(function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});

router.get('/api/hits', auth, function (req, res) {
    //CGI-style
    //optional: size -> PageSize
    //optional: page -> PageNumber
    TurkExpert.SearchHITs(req.query.size, req.query.page, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});

router.get('/api/hit/:id', auth, function (req, res) {
    //required: id -> HITId
    TurkExpert.GetHIT(req.params.id, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});

router.get('/api/expire/:id', auth, function (req, res) {
    //required: id -> HITId
    TurkExpert.ForceExpireHIT(req.params.id, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});

router.get('/api/assignment/:id', auth, function (req, res) {
    //required: id -> AssignmentId
    TurkExpert.GetAssignment(req.params.id, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});

router.get('/api/assignments/:id', auth, function (req, res) {
    //required: id -> HITId
    TurkExpert.GetAssignmentsForHit(req.params.id, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
});


router.post('/api/hit', auth, function (req, res) {
    //HIT schema -> /src/model/hit.ts
    TurkExpert.CreateHIT(req.body.hit, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });

});

router.post('/api/hits', auth, function (req, res) {
    //Batch Call from DB - hit
    console.log('Batch pubsh from DB!');
    //TurkExpert
    res.send(200);
});


router.post('/api/notice', auth, function (req, res) {
    //HIT schema -> /src/model/hit.ts
    TurkExpert.NotifyWorkers(req.body.notice, function (e) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(e, null, 2));
    });
    //Batch Call from DB - notice
});





module.exports = router;
