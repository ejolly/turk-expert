var mturk = require('mturk-api'),
    config = require('../config').mTurk,
    api = mturk.createClient(config),
    assert = require('assert'),
    async = require('async'),
    MongoDB = require('./db'),
    HIT = require('../build/model/hit');

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
    //M-Turk API
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
        });
    },

    GetAssignment: function (id, cb) {
        //Example operation, with params 
        console.time('GetAssignment');
        api.req('GetAssignment', { AssignmentId: id }).then(function (res) {
            //Do something 
            console.log('GetAssignmentId -> ', res);
            console.timeEnd('GetAssignment');
            cb(res);
        }, function (error) {
            //Handle error 
            console.error(error);
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
        });
    },

    //////////////////////////////////////////////////////////////////////////
    //Turk Expert API
    /////////////////////////////////////////////////////////////////////////
    publishHits: function (cb) {
        //async waterfall with named functions:
        console.time('publishHits');
        async.waterfall([
            loadHitsFromDB,
            applyFilterLogic,
            batchPublish,
        ], function (err, result) {
            cb(result);
        });
        function loadHitsFromDB(callback) {
            //1. Load all hits into hitList
            MongoDB.connect(function (db) {
                MongoDB.find(db, 'hit', function (doc) {
                    callback(null, doc);
                });
            });
        }
        function applyFilterLogic(hitList, callback) {
            //2. TOOD: Apply publish logic filter into targetList -, treatment parallel, map to model
            var limit = 5; // publish only 100 hits in same treatment / period
            async.map(hitList.slice(0, limit), function (entry, processModel) {
                //map to HIT model, use Typescript compiled data schema -> /build/model
                var questionString = '<ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd"><ExternalURL>'+config.externalUrl+'</ExternalURL><FrameHeight>'+config.frameHeight+'</FrameHeight></ExternalQuestion>';
                var hit = new HIT(entry.Title, entry.Description, entry.Keywords, questionString, 1, 120, 86400, 10, { 'Amount': 0.1, 'CurrencyCode': 'USD', 'FormattedPrice': '$0.10' });
                //console.log('Generate HIT: ', hit);
                processModel(null, hit);
            }, function (err, result) {
                // results is now an array of stats for each file
                callback(null, result);
            });

        }
        function batchPublish(targetList, callback) {
            //3. async each publish the targetList in parallel  //maybe eachLimit if reach quota
            async.each(targetList, function(hit, processPublish) {
                // Perform operation on each HIT here.
                //console.log('Processing HIT: ', hit);
                //These requests will be queued and executed at a rate of 3 per second
                console.time('CreateHIT ',(targetList.indexOf(hit)+1));
                api.req('CreateHIT', hit).then(function (res) {
                    console.timeEnd('CreateHIT ',(targetList.indexOf(hit)+1));
                    //console.log('CreateHIT -> ', res);
                    processPublish(null); //callback(null, res); //  { CreateHITResponse: { OperationRequest: [ [Object] ], HIT: [ [Object] ] } }
                }, function (error) {
                    //Handle error 
                    console.error(error);
                    processPublish(error);
                });
            }, function(err) {
                // if any of the file processing produced an error, err would equal that error
                if( err ) {
                // One of the iterations produced an error.
                // All processing will now stop.
                  callback(null, 'HIT failed to process.');
                } else {
                  callback(null, 'Total '+ targetList.length +' HITs have been processed successfully.');
                }
                console.timeEnd('publishHits');
            });     
        }
    },



    //////////////////////////////////////////////////////////////////////////
    //Mongo API
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
                    MongoDB.find(db, 'hit', function (doc) {
                        cb(null, doc);
                    });
                },
                notice: function (cb) {
                    MongoDB.find(db, 'notice', function (doc) {
                        cb(null, doc);
                    });
                },
                worker: function (cb) {
                    MongoDB.find(db, 'worker', function (doc) {
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