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


    //////////////////////////////////////////////////////////////////////////
    //Turk Expert API - Core
    /////////////////////////////////////////////////////////////////////////
    init: function (assignmentId, hitId, workerId, turkSubmitTo, cb) {
        //Waterfall
        //Client App Init: authentication, content loading, assignemnt Data persist, status update etc.
        MongoDB.connect(function (db) {
            async.parallel({
                hit: function (mongocb) {
                    MongoDB.find(db, 'hit', { HITId: hitId, status: 'published' }, {}, {}, function (doc) {
                        mongocb(null, doc);
                    });
                },
                authentication: function (mongocb) {
                    MongoDB.find(db, 'authentication', { WorkerId: workerId }, {}, {}, function (doc) {
                        mongocb(null, doc);
                    });
                }
            }, function (err, result) {
                assert.equal(null, err);
                db.close();
                //Authenticate Logic: 1. master code match 2. hitId still valid - published 3. Hittype match
                if (result.hit.length === 0) { 
                    cb({ code: 404 }); //hit not found or expired
                } else if (result.hit.length === 1) {
                    if (result.authentication.length === 0) {
                        cb({
                            code: 422, 
                            content: result.hit[0].Content,
                            obj: {
                                hid: result.hit[0].HITTypeId,
                                wid: workerId
                            }
                        }); //worker not found, new user
                    } else if (result.authentication.length === 1) {
                        if (result.authentication[0].Authenticated) {
                            cb({ 
                                code: 200,
                                content: result.hit[0].Content
                             }); //worker already authenticated
                        } else {
                            cb({
                                code: 422, 
                                content: result.hit[0].Content,
                                obj: {
                                    hid: result.hit[0].HITTypeId,
                                    wid: workerId
                                }
                            });//master not authenticated
                        }
                    }
                }
            });
        })
    },
    validateCode: function (content, obj, code, cb) {
        MongoDB.connect(function (db) {
            MongoDB.find(db, 'authentication', { HITTypeId: obj.hid, Code: code }, {}, {}, function (doc) {
                if (doc.length === 0) { // authentication failed
                    cb({
                        code: 403,
                        content: content,
                        obj: obj
                    });
                } else {
                    //save u as a new record or update invited to authenticated true
                    var authenticatedWorkers = [];
                    doc.forEach(function(entry){
                        authenticatedWorkers.push(entry.WorkerId); 
                    });
                    var type = 'shared'; //default
                    if(authenticatedWorkers.indexOf(obj.wid)=== -1){ //new user
                        type = 'shared';
                    }else{
                        type = 'invited';  
                    }
                    MongoDB.update(db, 'authentication', { HITTypeId: obj.hid, WorkerId: obj.wid, Code: code },
                        {
                            $set: {
                                WorkerId: obj.wid,
                                Code: code,
                                Type: type,
                                Authenticated: true
                            },
                            $currentDate: { "lastModified": true }
                        },
                        {
                            upsert: true,
                            w: 1
                        }, function (r) { // authentication success
                            cb({
                                code: 200,
                                content: content
                                //obj: obj //no more authentication params
                            });
                        });
                }
            });
        })
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
            publishTreatment,
            closeDB
            //notifyWokers
        ], function (err, result) {
            console.timeEnd('publishTreatment');
            cb(result);
        });
        function connectToDB(callback) {
            MongoDB.connect(function (db) {
                var publishDate = makePublishTime();
                callback(null, db, publishDate);
            });
        }
        function publishTreatment(db, publishDate, callback) {
            async.each(treatments, function (treatment, processTreatment) {
                publish(db, treatment, publishDate, function (result) {
                    processTreatment(result);
                });
            }, function (count) {
                callback(null, db, count + ' HITs have been processed successfully for each Treatment.<br/>All Treatments have been processed successfully.');
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
            return today.toLocaleString('en-US', options);
        }


        //private
        function publish(db, treatment, publishDate, cb) {
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
                MongoDB.find(db, 'hit', { Treatment: treatment }, {}, { limit: 1 }, function (doc) {
                    callback(null, doc);
                });
            }
            function applyFilterLogic(hitList, callback) {
                //2. Apply publish logic filter into targetList 
                async.map(hitList, function (entry, processModel) {
                    //map to HIT model, use Typescript compiled data schema -> /build/model
                    var questionString = '<ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd"><ExternalURL>' + config.externalUrl + '</ExternalURL><FrameHeight>' + config.frameHeight + '</FrameHeight></ExternalQuestion>';
                    var hit = new HIT(entry.Title, entry.Description + " Launched on: " + publishDate, entry.Keywords, questionString, 1, 30, 120, 10, { 'Amount': 0.1, 'CurrencyCode': 'USD', 'FormattedPrice': '$0.10' });
                    var id = entry._id; //To keep the track of each hit in db.
                    processModel(null, { id: id, hit: hit });
                }, function (err, result) {
                    // results is now an array for each file
                    callback(null, result);
                });

            }
            function batchPublish(targetList, callback) {
                //3. async each publish the targetList in parallel  //maybe eachLimit if reach quota

                var i = 0;
                //Gennerate Image randomly here for each n(default n=100) hits:
                var array = [];
                for (; i < targetList.length; i++) {
                    array.push(i + 1);
                }
                shuffle(array);
                //console.log('ImageArray: ', array);
                //Gennerate Code randomly here for each n(default n=100) hits:
                var code = generaterCode(5);
                //console.log('Code: ', code);

                async.each(targetList, function (hitObj, processPublish) {
                    // Perform operation on each HIT here.
                    //console.log('Processing HIT: ', hit);
                    //These requests will be queued and executed at a rate of 3 per second

                    //Solution1: Register First One in each group and createHit for the rest with the HITTypeId
                    //Solution2: Async parallel publish automatically batch those into each group!!!
                    api.req('CreateHIT', hitObj.hit).then(function (res) {
                        //console.log('CreateHIT -> ', res.CreateHITResponse.HIT[0].HITId[0]); //res 

                        i--;
                        //console.log("ImageArray["+ i +"] = ", array[i]);

                        // persistHitIntoDB asynchronously
                        // persistHitIntoDB(hitObj.id, res.CreateHITResponse.HIT[0], array[i], code);

                        //Update hit Object
                        hitObj.hit.HITTypeId = res.CreateHITResponse.HIT[0].HITTypeId[0],
                            hitObj.hit.HITId = res.CreateHITResponse.HIT[0].HITId[0],
                            hitObj.hit.Content = array[i],
                            hitObj.hit.Code = code;

                        processPublish(null);
                        //callback(null, res); //  { CreateHITResponse: { OperationRequest: [ [Object] ], HIT: [ [Object] ] } }
                    }, function (error) {
                        //Handle error 
                        console.error(error);
                        processPublish(error);
                    });
                }, function (err) {
                    // if any of the file processing produced an error, err would equal that error
                    if (err) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('HIT failed to process.');
                        callback(null, []);
                    } else {
                        console.log(targetList.length + ' HITs have been created successfully.');
                        //console.log('targetList ->', JSON.stringify(targetList, null, 2));
                        callback(null, targetList);
                    }
                });
            }
            //async each - added into waterfall
            function persistHitIntoDB(hitList, callback) {
                async.each(hitList, function (hitObj, processPersist) {
                    //console.log('Persist into DB -> {_id:'+ hitObj.id + ' HITTypeId:' + hitObj.hit.HITTypeId + ' HITId:' + hitObj.hit.HITId + ' Content:'+ hitObj.hit.Content + ' Code:' + hitObj.hit.Code +'}');
                    MongoDB.update(db, 'hit', { _id: hitObj.id },
                        {
                            $set: {
                                HITTypeId: hitObj.hit.HITTypeId,
                                HITId: hitObj.hit.HITId,
                                Content: hitObj.hit.Content,
                                Code: hitObj.hit.Code,
                                status: 'published'
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
                console.time('contactWorkers');
                async.parallel({
                    notice: function (mongocb) {
                        MongoDB.find(db, 'notice', { Treatment: treatment }, {}, { limit: 1 }, function (doc) {
                            mongocb(null, doc);
                        });
                    },
                    worker: function (mongocb) {
                        MongoDB.find(db, 'worker', { Treatment: treatment, status: { $not: /sent/ } }, {}, { limit: 1 }, function (doc) {  //, status: 'new'
                            mongocb(null, doc);
                        });
                    }
                }, function (err, result) {
                    assert.equal(null, err);
                    var currentHit = hitList[0].hit;
                    var currentWorker = result.worker[0];
                    var notice = new NOTICE('TEST', result.notice[0].Subject, formatMessageText(result.notice[0].MessageText, currentHit)); //result.worker[0].WorkerIdGFEDCBA32D5DD50BKQ6Y
                    api.req('NotifyWorkers', notice).then(function (res) {
                        //Do something 
                        //console.log('NotifyWorkers -> ', JSON.stringify(res, null, 2)); 
                        console.timeEnd('contactWorkers');
                        //write into db
                        callback(null, hitList.length, currentWorker, currentHit);
                    }, function (error) {
                        //Handle error 
                        console.error(error);
                        callback(null, 0)
                    });
                });

                function formatMessageText(template, hit) {
                    //TODO: Update tempalte
                    return template.replace('<TITLE>', hit.Title)
                    .replace('<DATETIME>', hit.lastModified)
                    .replace('<REWARD>', hit.Reward.FormattedPrice)
                    .replace('<CODE>', hit.Code)
                    .replace('<LIFETIME>', parseInt(hit.LifetimeInSeconds/3600) + 'hrs')
                    .replace('<HITURL>','replaceWithHITGroupURL') //TODO
                    .replace('<POSTPONEURL>','replacewithPostponeEndpoint') //TODO
                    .replace('<LEADERBOARDURL>', 'app.com/leaderboard') //TODO
                }

            }
            function updateStatus(count, currentWorker, currentHit, callback) {
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
                                    Type: 'invited',
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
            /**
             * Generate Code Randomly
             * @param {n} a number for the length of the code.
             * @returns {string} code
             */
            function generaterCode(n) {
                var code = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < n; i++) {
                    code += possible.charAt(Math.floor(Math.random() * possible.length));
                }

                return code;
            }


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
                    MongoDB.find(db, 'hit', {}, {}, {}, function (doc) {
                        cb(null, doc);
                    });
                },
                notice: function (cb) {
                    MongoDB.find(db, 'notice', {}, {}, {}, function (doc) {
                        cb(null, doc);
                    });
                },
                worker: function (cb) {
                    MongoDB.find(db, 'worker', {}, {}, {}, function (doc) {
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