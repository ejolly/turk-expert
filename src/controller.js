var mturk = require('mturk-api'),
    config = require('../config').mTurk,
    api = mturk.createClient(config),
    assert = require('assert'),
    async = require('async'),
    MongoDB = require('./db'),
    HIT = require('../build/model/hit'),
    NOTICE = require('../build/model/notice');

//1. Amazon Mechanical Turk limits the velocity of requests. 
//Normally, if you exceed the limit you will receive a 
//503 Service Unavailable error. As of v2.0, our interface 
//automatically throttles your requests to 3 per second.


//2. DEPRECATION NOTICE: please use mturk.createClient() instead 
//the connect method will no longer be supported in v3.0 
//------------------------------------------
// mturk.connect(config).then(function (api) {
//   api.req('GetAccountBalance').then(function (res) {
//     //Do something
//     console.log('GetAccountBalance -> ', res);
//     callback(res);
//   }).catch(console.error);
// }).catch(console.error); 

/**
 * Create Base64 Object - Gobal
 * 
*/
var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }

/**
 * Generate Code Randomly
 * @param {n} a number for the length of the code.
 * @returns {string} code
 */
var generateCode = function (n) {
    var code = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < n; i++) {
        code += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return code;
}

var TurkExpert = {
    //////////////////////////////////////////////////////////////////////////
    //M-Turk API Proxy
    //////////////////////////////////////////////////////////////////////////
    GetAccountBalance: function (cb) {
        //Example operation, no params 
        console.time('GetAccountBalance');
        api.req('GetAccountBalance').then(function (res) {
            //Do something 
            console.log('GetAccountBalance -> ', res);
            console.timeEnd('GetAccountBalance');
            cb(res);
        }, function (error) {
            //Handle error 
            console.error(error);
            cb(error);
        });
    },

    SearchHITs: function (size, num, cb) {
        //Example operation, with params 
        console.time('SearchHITs');
        api.req('SearchHITs', { PageSize: size || 10, PageNumber: num || 1 }).then(function (res) {
            //Do something 
            console.log('SearchHITs -> ', res);
            console.timeEnd('SearchHITs');
            cb(res);
        }, function (error) {
            //Handle error 
            console.error(error);
            cb(error);
        });
    },

    GetHIT: function (id, cb) {
        //Example operation, with params 
        console.time('GetHIT');
        api.req('GetHIT', { HITId: id }).then(function (res) {
            //Do something 
            console.log('GetHIT -> ', res);
            console.timeEnd('GetHIT');
            cb(res);
        }, function (error) {
            //Handle error 
            console.error(error);
            cb(error);
        });
    },

    GetAssignment: function (id, cb) {
        //Example operation, with params 
        console.time('GetAssignment');
        api.req('GetAssignment', { AssignmentId: id }).then(function (res) {
            //Do something 
            console.log('GetAssignment -> ', res);
            console.timeEnd('GetAssignment');
            cb(res);
        }, function (error) {
            //Handle error 
            console.error(error);
            cb(error);
        });
    },

    GetAssignmentsForHit: function (id, cb) {
        //Example operation, with params 
        console.time('GetAssignmentsForHIT');
        api.req('GetAssignmentsForHIT', { HITId: id }).then(function (res) {
            //Do something 
            console.log('GetAssignmentsForHIT -> ', res);
            console.timeEnd('GetAssignmentsForHIT');
            cb(res);
        }, function (error) {
            //Handle error 
            console.error(error);
            cb(error);
        });
    },

    CreateHIT: function (HIT, cb) {
        //Example operation, with params 
        console.time('CreateHIT');
        api.req('CreateHIT', hit).then(function (res) {
            //Do something 
            console.log('CreateHIT -> ', res);
            console.timeEnd('CreateHIT');
            cb(res); // cb(null, response.HIT[0]);
        }, function (error) {
            //Handle error 
            console.error(error);
            cb(error);
        });
    },

    NotifyWorkers: function (notice, cb) {
        //Example operation, with params 
        console.time('NotifyWorkers');
        api.req('NotifyWorkers', notice).then(function (res) {
            //Do something 
            console.log('NotifyWorkers -> ', res);
            console.timeEnd('NotifyWorkers');
            cb(res);
        }, function (error) {
            //Handle error 
            console.error(error);
            cb(error);
        });
    },

    RegisterHITType: function (hit, cb) {
        //Example operation, with params 
        console.time('RegisterHITType');
        api.req('RegisterHITType', hit).then(function (res) {
            //Do something 
            console.log('RegisterHITType -> ', res);
            console.timeEnd('RegisterHITType');
            cb(res);
        }, function (error) {
            //Handle error 
            console.error(error);
            cb(error);
        });
    },

    ForceExpireHIT: function (hitId, cb) {
        //Example operation, with params 
        console.time('ForceExpireHIT');
        api.req('ForceExpireHIT', hitId).then(function (res) {
            //Do something 
            console.log('ForceExpireHIT -> ', res);
            console.timeEnd('ForceExpireHIT');
            cb(res);
        }, function (error) {
            //Handle error 
            console.error(error);
            cb(error);
        });
    },


    //////////////////////////////////////////////////////////////////////////
    //Turk Expert API - Core
    /////////////////////////////////////////////////////////////////////////
    init: function (assignmentId, hitId, workerId, turkSubmitTo, cb) {
        //Waterfall
        //Client App Init: authentication, content loading, assignemnt Data persist, status update etc.
        MongoDB.connect(function (db) {
            async.parallel({
                hit: function (mongocb) {
                    MongoDB.find(db, 'hit', { HITId: hitId, status: { $not: { $in: ['expired'] } } }, {}, {}, function (doc) {
                        mongocb(null, doc);
                    });
                },
                authentication: function (mongocb) {
                    MongoDB.find(db, 'authentication', { WorkerId: workerId }, {}, {}, function (doc) {
                        mongocb(null, doc);
                    });
                }
            }, function (err, result) {
                //assert.equal(null, err);
                db.close();
                //Authenticate Logic: 1. invited code match 2. hitId still valid - published 3. Hittype match
                if (result.hit.length === 0) {
                    cb({ code: 404 }); //hit not found or expired
                } else if (result.hit.length === 1) {
                    // if(result.hit[0].status === 'postponed'){
                    // MSG for postponed group
                    // }
                    if (result.authentication.length === 0) {
                        cb({
                            code: 422,
                            content: result.hit[0].Content,
                            type: 'shared',
                            obj: {
                                hid: result.hit[0].HITTypeId,
                                wid: workerId
                            },
                            assignmentId: assignmentId,
                            turkSubmitTo: turkSubmitTo
                        }); //worker not found, new user
                    } else {
                        //result.authentication is an array 
                        var authList = result.authentication;
                        var flg = false;
                        var index = 0;
                        var i = 0;
                        for (; i < authList.length; i++) {
                            if (authList[i].HITTypeId === result.hit[0].HITTypeId) {
                                flg = true;
                                index = i;
                            }
                        }
                        if (flg) {
                            if (authList[index].Authenticated) {
                                cb({
                                    code: 200,
                                    type: result.hit[0].Treatment,
                                    content: result.hit[0].Content,
                                    assignmentId: assignmentId,
                                    turkSubmitTo: turkSubmitTo
                                }); //worker already authenticated - repeated
                            } else {
                                cb({
                                    code: 422,
                                    content: result.hit[0].Content,
                                    type: result.hit[0].Treatment, // This gonna be the treatmet
                                    obj: {
                                        hid: result.hit[0].HITTypeId,
                                        wid: workerId
                                    },
                                    assignmentId: assignmentId,
                                    turkSubmitTo: turkSubmitTo
                                });//invited not authenticated
                            }

                        } else {
                            //not authenticated for this current hitType
                            cb({
                                code: 422,
                                content: result.hit[0].Content,
                                type: 'shared', // This gonna be the shared
                                obj: {
                                    hid: result.hit[0].HITTypeId,
                                    wid: workerId
                                },
                                assignmentId: assignmentId,
                                turkSubmitTo: turkSubmitTo
                            });

                        }
                    }
                }
            });
        })
    },
    validateCode: function (type, content, obj, code, assignmentId, turkSubmitTo, cb) {
        MongoDB.connect(function (db) {
            MongoDB.find(db, 'authentication', { HITTypeId: obj.hid, Code: code }, {}, {}, function (doc) {
                if (doc.length === 0) { // authentication failed
                    cb({
                        code: 403,
                        content: content,
                        type: type,
                        obj: obj,
                        assignmentId: assignmentId,
                        turkSubmitTo: turkSubmitTo
                    });
                } else {
                    //save u as a new record or update invited to authenticated true
                    var authenticatedWorkers = [];
                    doc.forEach(function (entry) {
                        authenticatedWorkers.push(entry.WorkerId);
                    });
                    var newType = 'shared'; //default
                    if (authenticatedWorkers.indexOf(obj.wid) === -1) {
                        newType = 'shared'; // new user - shared
                    } else {
                        newType = type;   // invited
                    }
                    MongoDB.update(db, 'authentication', { HITTypeId: obj.hid, WorkerId: obj.wid, Code: code },
                        {
                            $set: {
                                WorkerId: obj.wid,
                                Code: code,
                                Type: newType,
                                Authenticated: true
                            },
                            $currentDate: { "lastModified": true }
                        },
                        {
                            upsert: true,  //should always write new
                            w: 1
                        }, function (r) { // authentication success - The Very First Time !!!
                            cb({
                                code: 200,
                                firstTimeUser: newType,
                                content: content,
                                obj: obj,  //no more authentication params, but keep for first User process
                                assignmentId: assignmentId,
                                turkSubmitTo: turkSubmitTo
                            });
                        });
                }
            });
        })
    },
    firstUser: function (nickname, content, obj, assignmentId, turkSubmitTo, cb) { //persist into mongo
        MongoDB.connect(function (db) {
            MongoDB.update(db, 'authentication', { HITTypeId: obj.hid, WorkerId: obj.wid },
                {
                    $set: {
                        Nickname: nickname
                    },
                    $currentDate: { "lastModified": true }
                },
                {
                    upsert: false,
                    w: 1
                }, function (r) { //final response for the First Time User
                    cb({
                        code: 200,
                        content: content,
                        //obj: obj //no more authentication params
                        assignmentId: assignmentId,
                        turkSubmitTo: turkSubmitTo
                    });
                    db.close();
                });
        });
    },
    postpone: function (s, cb) { //Update mongo, secret weapon
        var decodedPostponeString = Base64.decode(s);
        //console.log("decodedPostponeString",decodedPostponeString);
        var hidTypeId = decodedPostponeString.split('_')[0];
        var workerId = decodedPostponeString.split('_')[1];

        //invalidate old code
        var newCode = generateCode(6); //6 is +1 than original

        MongoDB.connect(function (db) {
            async.parallel({
                hit: function (mongocb) {
                    MongoDB.updateMany(db, 'hit', { HITTypeId: hidTypeId, status: 'published' },
                        {
                            $set: {
                                Code: newCode,
                                status: 'postponed'
                            },
                            $currentDate: { "lastModified": true }
                        },
                        {
                            upsert: false,
                            multi: true,
                            w: 1
                        }, function (r) {
                            mongocb(null, r);
                        });
                },
                worker: function (mongocb) {
                    MongoDB.update(db, 'worker', { WorkerId: workerId, status: 'sent' },
                        {
                            $set: {
                                status: 'postponed'
                            },
                            $currentDate: { "lastModified": true }
                        },
                        {
                            upsert: false,
                            w: 1
                        }, function (r) {
                            mongocb(null, r);
                        });
                },
                authentication: function (mongocb) {
                    MongoDB.update(db, 'authentication', { HITTypeId: hidTypeId, WorkerId: workerId },
                        {
                            $set: {
                                Code: newCode,
                                Type: 'postponed'
                            },
                            $currentDate: { "lastModified": true }
                        },
                        {
                            upsert: false,
                            w: 1
                        }, function (r) {
                            mongocb(null, r);
                        });
                }
            }, function (err, result) {
                if (err) {
                    console.error(err);
                }
                //processing
                cb(200); // Or template for user after postponed    
                db.close();
            });
        });
    },
    publishTreatments: function (treatments, cb) {
        ///// Parallel -> 5 treatments [ "control", "costly", "framing", "reciprocity", "reputation" ]
        // MongoDB.connect(function (db) {
        //     //Call the time generater, pass into publishTreatment
        //     async.each(treatments, function (treatment, processTreatment) {
        //         publishTreatment(db, treatment, function (result) {
        //             processTreatment(result);
        //         });
        //     }, function (count) {
        //         cb(count + ' HITs have been processed successfully for each Treatment.<br/>All Treatments have been processed successfully.');
        //         //db.close();
        //     })
        //  });
        ///// To Reduce mongo connections
        async.waterfall([
            connectToDB,
            getTreatmentContent,
            publishTreatment,
            closeDB
            //notifyWokers
        ], function (err, result) {
            console.timeEnd('publishTreatment');
            cb(result);
        });
        function connectToDB(callback) {
            MongoDB.connect(function (db) {
                callback(null, db);
            });
        }
        function getTreatmentContent(db, callback) {
            MongoDB.find(db, 'content', {}, { '_id': 1, 'User': 1, 'Tweet': 1, 'Date': 1, 'Time': 1 }, { sort: [['HITCount', 1]], limit: 500 }, function (contentTotalList) {
                var publishDate = makePublishTime();
                callback(null, db, contentTotalList, publishDate);
            });
        }
        function publishTreatment(db, contentTotalList, publishDate, callback) {
            shuffle(contentTotalList);
            var contentObj = {};
            for (var i = 0; i < treatments.length; i++) {
                contentObj[treatments[i]] = contentTotalList.slice(i * 100, (i + 1) * 100);
            }
            async.eachLimit(treatments, 1, function (treatment, processTreatment) {
                var contentList = contentObj[treatment];
                //wait a bit
                console.log('Publish ' + treatment + ' In 10s');
                //setTimeout(function(){ //protection 1
                    //do what you need here
                    console.log('Publish ' + treatment + ' Now');
                    publish(db, treatment, contentList, publishDate, function (result) {
                        processTreatment(null);
                    });
                //}, 5000);
                
            }, function (err) {
                callback(null, db, contentTotalList.length + ' HITs have been processed successfully for each Treatment.<br/>All Treatments have been processed successfully.');
            });
        }
        function closeDB(db, result, callback) {
            db.close();
            callback(null, result);
        }
        //West-Coast Date Time for publishing  
        function makePublishTime() {
            var options = { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            var today = new Date();
            return today.toLocaleString('en-US', options) + ' PDT';
        }
        /**
         * Shuffle array in place using Fisher-Yates Shuffle ALG
         * @param {Array} a items The array containing the items.
         * @returns {Array} only if you need a new object
         */
        function shuffle(array) {
            var counter = array.length;
            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                var index = Math.floor(Math.random() * counter);

                // Decrease counter by 1
                counter--;

                // And swap the last element with it
                var temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }

            return array;
        }



        //private
        function publish(db, treatment, contentList, publishDate, cb) {
            //async waterfall with named functions:
            console.time('publishTreatment');
            async.waterfall([
                loadHitsFromDB,
                applyFilterLogic,
                batchPublish,
                persistHitIntoDB,
                contactWorkers,
                updateStatus
            ], function (err, result) {
                console.timeEnd('publishTreatment');
                cb(result);
            });
            function loadHitsFromDB(callback) {
                //1. Load all hits into hitList
                //publish only n(default n=100) hits in each treatment / period 
                //TODO: only publish new not posponed
                MongoDB.find(db, 'hit', { Treatment: treatment, status: { $not: { $in: ['published', 'postponed', 'done', 'expired'] } } }, {}, { limit: 100 }, function (doc) { //Sandbox Test: limit = 1-100
                    callback(null, doc);
                });
            }
            function applyFilterLogic(hitList, callback) {
                //2. Apply publish logic filter into targetList 
                async.mapSeries(hitList, function (entry, processModel) {
                    //map to HIT model, use Typescript compiled data schema -> /build/model
                    var lifetimeInSeconds = 900;
                    var assignmentDurationInSeconds = 300;
                    var autoApprovalDelay = 1;
                    var questionString = '<ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd"><ExternalURL>' + config.externalUrl + '</ExternalURL><FrameHeight>' + config.frameHeight + '</FrameHeight></ExternalQuestion>';
                    var hit = new HIT(entry.Title, entry.Description + " Launched on: " + publishDate, entry.Keywords, questionString, entry.MaxAssignments, assignmentDurationInSeconds, lifetimeInSeconds, autoApprovalDelay, { 'Amount': 0.1, 'CurrencyCode': 'USD', 'FormattedPrice': '$0.10' });
                    var id = entry._id; //To keep the track of each hit in db.
                    var treatment = entry.Treatment;

                    var hitObj = {
                        id: id,
                        treatment: treatment,
                        hit: hit,
                        lifetimeInSeconds: lifetimeInSeconds
                    }
                    processModel(null, hitObj);
                }, function (err, result) {
                    // results is now an array for each file
                    callback(null, result);
                });

            }
            function batchPublish(targetList, callback) {
                //3. async each publish the targetList in parallel  //maybe eachLimit if reach quot
                var i = 0;
                //Gennerate content array randomly here for each n(default n=100) hits:
                var array = [];
                for (; i < targetList.length; i++) {
                    array.push(i + 1);
                }
                var code = generateCode(5);
                //console.log('Code: ', code);
                //  for(var i=0; i < targetList.length; i++){
                //    var hitObj = targetList[i];
                //    api.req('CreateHIT', hitObj.hit).then(function (res) {
                //         hitObj.hit.HITTypeId = res.CreateHITResponse.HIT[0].HITTypeId[0],
                //         hitObj.hit.HITId = res.CreateHITResponse.HIT[0].HITId[0],
                //         hitObj.hit.Content = contentList[array[i]],
                //         hitObj.hit.Code = code;
                //         console.log('kev: wait the callback !', hitObj);
                //    }, function (error) {
                //         //Handle error 
                //         console.error(error);
                //    });
                //  }
                //  callback(null, targetList);
                async.eachLimit(targetList, 1, function (hitObj, processPublish) {
                    // Perform operation on each HIT here.
                    //console.log('Processing HIT: ', hit);
                    //These requests will be queued and executed at a rate of 3 per second

                    //Solution1: Register First One in each group and createHit for the rest with the HITTypeId
                    //Solution2: Async parallel publish automatically batch those into each group!!!
                    
                    // try calling apiMethod 10 times with exponential backoff
                    // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
                    var apiCreate = function(apicb, previousResult){
                      console.log('calling create hit');
                      setTimeout(function(){ //protection 2
                            api.req('CreateHIT', hitObj.hit).then(function (res) {
                                    console.log('CreateHIT -> ', res.CreateHITResponse.HIT[0].HITId[0]); //res
                                    apicb(null, res);
                                    //callback(null, res); //  { CreateHITResponse: { OperationRequest: [ [Object] ], HIT: [ [Object] ] } }
                                }, function (error) {
                                    //Handle error 
                                    console.error(error);
                                    apicb(error, null);
                                    //console.log('error waiting for republish'); 
                                });
                      }, 1000);
                    }
                    async.retry({
                      times: 5,
                      interval: function(retryCount) {
                        return 1000 * Math.pow(2, retryCount);
                      }
                    }, apiCreate, function(err, res) {
                        // do something with the result
                          i--;
                          //console.log("ImageArray["+ i +"] = ", array[i]);

                          // persistHitIntoDB asynchronously
                          // persistHitIntoDB(hitObj.id, res.CreateHITResponse.HIT[0], array[i], code);

                          //Update hit Object
                          hitObj.hit.HITTypeId = res.CreateHITResponse.HIT[0].HITTypeId[0],
                          hitObj.hit.HITId = res.CreateHITResponse.HIT[0].HITId[0],
                          hitObj.hit.Content = contentList[array[i]],
                          hitObj.hit.Code = code;
                          processPublish(null);
                    });                 
                    //setTimeout(function(){
                     // console.log('Publish one for ' + hitObj.treatment);
                      // api.req('CreateHIT', hitObj.hit).then(function (res) {
                      //     //console.log('CreateHIT -> ', res.CreateHITResponse.HIT[0].HITId[0]); //res 

                      //     i--;
                      //     //console.log("ImageArray["+ i +"] = ", array[i]);

                      //     // persistHitIntoDB asynchronously
                      //     // persistHitIntoDB(hitObj.id, res.CreateHITResponse.HIT[0], array[i], code);

                      //     //Update hit Object
                      //     hitObj.hit.HITTypeId = res.CreateHITResponse.HIT[0].HITTypeId[0],
                      //     hitObj.hit.HITId = res.CreateHITResponse.HIT[0].HITId[0],
                      //     hitObj.hit.Content = contentList[array[i]],
                      //     hitObj.hit.Code = code;

                      //     processPublish(null);
                      //     //callback(null, res); //  { CreateHITResponse: { OperationRequest: [ [Object] ], HIT: [ [Object] ] } }
                      // }, function (error) {
                      //     //Handle error 
                      //     console.error(error);
                      //     console.log('error waiting for republish'); 
                      //     processPublish(error);
                      // });
                   // }, 1000);
                    
                }, function (err) {
                    // if any of the file processing produced an error, err would equal that error
                    if (err) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('HIT failed to process.');
                        callback(null, []);
                    } else {
                        console.log(targetList.length + ' HITs have been created successfully.');
                        callback(null, targetList);
                    }
                });
            }
            
            
            //async each - added into waterfall
            function persistHitIntoDB(hitList, callback) {
                async.eachLimit(hitList, 1, function (hitObj, processPersist) {
                    //console.log('Persist into DB -> {_id:'+ hitObj.id + ' HITTypeId:' + hitObj.hit.HITTypeId + ' HITId:' + hitObj.hit.HITId + ' Content:'+ hitObj.hit.Content + ' Code:' + hitObj.hit.Code +'}');
                    MongoDB.update(db, 'hit', { _id: hitObj.id },
                        {
                            $set: {
                                HITTypeId: hitObj.hit.HITTypeId,
                                HITId: hitObj.hit.HITId,
                                Content: hitObj.hit.Content,
                                Code: hitObj.hit.Code,
                                status: 'published',
                                publishDate: publishDate
                            },
                            $currentDate: { "lastModified": true }
                        },
                        {
                            upsert: false,
                            w: 1
                        }, function (r) {
                            processPersist(null);
                        });
                }, function (err) {
                    if (err) {
                        console.log('HIT failed to save.');
                        callback(null, 0);
                    } else {
                        console.log(hitList.length + ' HITs have been saved successfully.');
                        callback(null, hitList);
                    }
                });
            }
            function contactWorkers(hitList, callback) {
                // console.time('contactWorkers');
                async.parallel({
                    groupId: function (mturkcb) {
                        api.req('GetHIT', { HITId: hitList[0].hit.HITId }).then(function (res) {
                            //Do something 
                            console.log('GetGroupId: ', res.GetHITResponse.HIT[0].HITGroupId[0]);
                            mturkcb(null, res.GetHITResponse.HIT[0].HITGroupId[0]);
                        }, function (error) {
                            //Handle error 
                            console.error(error);
                            mturkcb(error, null);
                        });
                    },
                    worker: function (mongocb) {
                        MongoDB.find(db, 'worker', { Treatment: treatment }, {}, { limit: 1 }, function (doc) {  //Sandbox Test:  status: { $not: /sent/ }
                            mongocb(null, doc);
                        });
                    }
                }, function (err, result) {
                    assert.equal(null, err);
                    //Sandbox TEST
                    var currentWorker = result.worker[0];
                    var currentTreatment = hitList[0].treatment;
                    var currentLifetimeInSeconds = hitList[0].lifetimeInSeconds;
                    var currentHit = hitList[0].hit;
                    var subject = "New HITs available!";
                    var template = "Dear Turker,\n\nYou previously indicated that you would like to be notified of future HIT opportunities from us so we're letting you know about a recently posted group of 100 HITs called <TITLE>. These HITs will be available for <LIFETIME>.\n\nThis is a simple task that involves answering questions about real tweets and pays <REWARD> per HIT. Each HIT will take no more than 1 minute to complete.\nIn order to start working on these HITs, please enter the following code which will grant you access to the HIT group: <CODE>\n\nYou can access these HITs at the following URL: <HITURL>\n\nIf you're not available, no problem, just let us know by clicking on the following link, which will expire the code above. You'll still be eligible to receive future HIT notifications.\n<POSTPONEURL>\n\nThanks!\n\nSid";
                    var notice = new NOTICE(currentWorker.WorkerId, subject, formatMessageText(template, currentHit, currentLifetimeInSeconds, currentWorker, result.groupId));
                    api.req('NotifyWorkers', notice).then(function (res) {
                        // Do something 
                        // console.log('NotifyWorkers -> ', JSON.stringify(res, null, 2)); 
                        // console.timeEnd('contactWorkers');
                        //write into 
                        callback(null, hitList.length, currentWorker, currentTreatment, currentHit);
                    }, function (error) {
                        //Handle error 
                        console.error(error);
                        callback(null, 0)
                    });
                });

                function formatMessageText(template, hit, currentLifetimeInSeconds, worker, groupId) {
                    // Define the string
                    var posponeString = hit.HITTypeId + '_' + worker.WorkerId;

                    // Encode the String
                    var encodedPostponeString = Base64.encode(posponeString);
                    // console.log("encodedPostponeString:",encodedPostponeString);

                    var msg = template.replace('<TITLE>', hit.Title)
                        .replace('<LIFETIME>', parseInt(currentLifetimeInSeconds / 3600) + 'hrs')
                        .replace('<REWARD>', hit.Reward.FormattedPrice)
                        .replace('<CODE>', hit.Code)
                        .replace('<HITURL>', 'https://workersandbox.mturk.com/mturk/preview?groupId=' + groupId)
                        .replace('<POSTPONEURL>', config.externalUrl + '/postpone?s=' + encodedPostponeString);

                    return msg;
                }

            }
            function updateStatus(count, currentWorker, currentTreatment, currentHit, callback) {
                //DB update worker status: sent
                //'TEST' currentWorker.WorkerId                    
                async.parallel({
                    updateWorker: function (mongocb) {
                        MongoDB.update(db, 'worker', { WorkerId: currentWorker.WorkerId },
                            {
                                $set: {
                                    status: 'sent'
                                },
                                $currentDate: { "lastModified": true }
                            },
                            {
                                upsert: false,
                                w: 1
                            }, function (r) {
                                mongocb(null, r)
                            });
                    },
                    updateAuthentication: function (mongocb) {
                        MongoDB.update(db, 'authentication', { HITTypeId: currentHit.HITTypeId },
                            {
                                $set: {
                                    WorkerId: currentWorker.WorkerId,
                                    Code: currentHit.Code,
                                    Type: currentTreatment,
                                    Authenticated: false
                                },
                                $currentDate: { "lastModified": true }
                            },
                            {
                                upsert: true,  //assert: should always write
                                w: 1
                            }, function (r) {
                                mongocb(null, r)
                            });
                    }
                }, function (err, result) {
                    if (err) {
                        console.error(err);
                        callback(null, 0);
                    } else {
                        callback(null, count);
                    }
                });
            }
        }

    },

    updateAssignments: function (cb) {
        async.waterfall([
            connectToDB,
            loadHitsFromDB,
            getAssignments,
            persistAssignments,
            loadUpdatedHitsFromDB
        ], function (err, result) {
            var msg = 'Updated total: ' + result.length + ' docs';
            cb(msg);
        });
        function connectToDB(callback) {
            MongoDB.connect(function (db) {
                callback(null, db);
            });
        }
        //Find all current period hits with status:'published' 
        function loadHitsFromDB(db, callback) {
            //1. Load all hits into hitList
            //publish only n(default n=100) hits in each treatment / period 
            MongoDB.find(db, 'hit', { status: 'published' }, {}, {}, function (doc) {
                //all done before expire
                callback(null, db, doc);
            });
        }
        //Get /api/assignments/:hitId
        function getAssignments(db, hitList, callback) {
            async.eachLimit(hitList, 1, function (hit, processAssignments) {
                 var apiAssignments = function(apicb, previousResult){
                      console.log('calling get assignments for hit');
                      setTimeout(function(){ //protection 2
                            api.req('GetAssignmentsForHIT', { HITId: hit.HITId }).then(function (res) {
                                    console.log('GetAssignmentsForHIT -> ', hit.HITId); //res
                                    apicb(null, res);
                                    //callback(null, res); //  { CreateHITResponse: { OperationRequest: [ [Object] ], HIT: [ [Object] ] } }
                                }, function (error) {
                                    //Handle error 
                                    console.error(error);
                                    apicb(error, null);
                                    //console.log('error waiting for republish'); 
                                });
                      }, 1000);
                    }
                    async.retry({
                      times: 5,
                      interval: function(retryCount) {
                        return 1000 * Math.pow(2, retryCount);
                      }
                    }, apiAssignments, function(err, res) {
                          if (res.GetAssignmentsForHITResponse.GetAssignmentsForHITResult[0].TotalNumResults > 0) {
                              hit.Assignments = res.GetAssignmentsForHITResponse.GetAssignmentsForHITResult[0].Assignment;
                          } else {
                              hit.Assignments = [];
                          }
                          processAssignments(null);
                    });                 
            }, function (err) {
                if (err) {
                    // One of the iterations produced an error.
                    // All processing will now stop.
                    console.log('Assignments failed to process.');
                    callback(null, db, []);
                } else {
                    console.log('Assignments have been pulled successfully for ' + hitList.length + 'Hits');
                    callback(null, db, hitList);
                }
            });
        }
        //Save into db.
        function persistAssignments(db, hitList, callback) {
            async.each(hitList, function (hit, processPersist) {
                MongoDB.update(db, 'hit', { _id: hit._id },
                    {
                        $set: {
                            Assignments: hit.Assignments,
                            status: hit.MaxAssignments === hit.Assignments.length ? 'done' : hit.status,
                        },
                        $currentDate: { "lastModified": true }
                    },
                    {
                        upsert: false,
                        w: 1
                    }, function (r) {
                        processPersist(null);
                    });
            }, function (err) {
                if (err) {
                    console.log('HIT failed to save.');
                    callback(null, db);
                } else {
                    console.log(hitList.length + ' HITs have been updated successfully.');
                    callback(null, db);
                }
            });
        }
        function loadUpdatedHitsFromDB(db, callback) {
          MongoDB.find(db, 'hit', { status: 'done' }, {}, {}, function(doc) {
            //all done before expire - notify us
            var notice = new NOTICE('A2Z7XGBZSO11D0', 'HITs Update', doc.length + ' HITs have been done.');
            api.req('NotifyWorkers', notice).then(function(res) {
              //Do something 
              console.log('Notify Us -> ', res);
              callback(null, doc);
            }, function(error) {
              //Handle error 
              console.error(error);
              callback(error, doc);
            });
          });
        }

    },


    expireHits: function (cb) {
        async.waterfall([
            connectToDB,
            loadHitsFromDB,
            getAssignments,
            persistAssignments
        ], function (err, result) {
            var msg = 'Updated total: ' + result.length + ' docs';
            cb(msg);
        });
        function connectToDB(callback) {
            MongoDB.connect(function (db) {
                callback(null, db);
            });
        }
        //Find all current period hits with status:'published' 
        function loadHitsFromDB(db, callback) {
            //1. Load all hits into hitList
            //publish only n(default n=100) hits in each treatment / period 
            MongoDB.find(db, 'hit', { status: 'published' }, {}, {}, function (doc) {
                callback(null, db, doc);
            });
        }
        //Get /api/assignments/:hitId
        function getAssignments(db, hitList, callback) {
            async.eachLimit(hitList, 1, function (hit, processAssignments) {
                  var apiAssignments = function(apicb, previousResult){
                      console.log('calling get assignments for hit');
                      setTimeout(function(){ //protection 2
                            api.req('GetAssignmentsForHIT', { HITId: hit.HITId }).then(function (res) {
                                    console.log('GetAssignmentsForHIT -> ', hit.HITId); //res
                                    apicb(null, res);
                                    //callback(null, res); //  { CreateHITResponse: { OperationRequest: [ [Object] ], HIT: [ [Object] ] } }
                                }, function (error) {
                                    //Handle error 
                                    console.error(error);
                                    apicb(error, null);
                                    //console.log('error waiting for republish'); 
                                });
                      }, 1000);
                    }
                    async.retry({
                      times: 5,
                      interval: function(retryCount) {
                        return 1000 * Math.pow(2, retryCount);
                      }
                    }, apiAssignments, function(err, res) {
                          if (res.GetAssignmentsForHITResponse.GetAssignmentsForHITResult[0].TotalNumResults > 0) {
                              hit.Assignments = res.GetAssignmentsForHITResponse.GetAssignmentsForHITResult[0].Assignment;
                          } else {
                              hit.Assignments = [];
                          }
                          processAssignments(null);
                    });  
            }, function (err) {
                if (err) {
                    // One of the iterations produced an error.
                    // All processing will now stop.
                    console.log('Assignments failed to process.');
                    callback(null, db, []);
                } else {
                    console.log('Assignments have been pulled successfully for ' + hitList.length + 'Hits');
                    callback(null, db, hitList);
                }
            });
        }
        //Save into db.
        function persistAssignments(db, hitList, callback) {
            async.each(hitList, function (hit, processPersist) {
                MongoDB.update(db, 'hit', { _id: hit._id },
                    {
                        $set: {
                            Assignments: hit.Assignments,
                            status: hit.MaxAssignments === hit.Assignments.length ? 'done' : 'expired',
                        },
                        $currentDate: { "lastModified": true }
                    },
                    {
                        upsert: false,
                        w: 1
                    }, function (r) {
                        processPersist(null);
                    });
            }, function (err) {
                if (err) {
                    console.log('HIT failed to save.');
                    callback(null, 0);
                } else {
                    console.log(hitList.length + ' HITs have been updated successfully.');
                    callback(null, hitList);
                }
            });

        }
    },






    //////////////////////////////////////////////////////////////////////////
    //Mongo API Proxy
    //////////////////////////////////////////////////////////////////////////
    /**
     * Find all collections
     * @param {Array} target
     * @param {Callbak} cb
     * @return {Array} result
     */
    find: function (cb) {
        console.time('DB Data find');
        MongoDB.connect(function (db) {
            async.parallel({
                hit: function (cb) {
                    MongoDB.find(db, 'hit', { status: { $in: ['published', 'postponed', 'expired'] } }, {}, {}, function (doc) {
                        //MongoDB.find(db, 'hit', {}, {}, {limit:100}, function (doc) {
                        cb(null, doc);
                    });
                },
                content: function (cb) {
                    MongoDB.find(db, 'content', {}, {}, { limit: 10 }, function (doc) {
                        cb(null, doc);
                    });
                },
                worker: function (cb) {
                    MongoDB.find(db, 'worker', {}, {}, { ligmit: 10 }, function (doc) {
                        cb(null, doc);
                    });
                },
                authentication: function (cb) {
                    MongoDB.find(db, 'authentication', {}, {}, {}, function (doc) {
                        cb(null, doc);
                    });
                }
            }, function (err, result) {
                assert.equal(null, err);
                db.close();
                cb(result);
                console.timeEnd('DB Data find');
            });
        })
    }
}




module.exports = TurkExpert;