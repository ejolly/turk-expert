///////////////////////////////////////////////////////////////////////////
//*    *    *    *    *    *
//┬    ┬    ┬    ┬    ┬    ┬
//│    │    │    │    │    |
//│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
//│    │    │    │    └───── month (1 - 12)
//│    │    │    └────────── day of month (1 - 31)
//│    │    └─────────────── hour (0 - 23)
//│    └──────────────────── minute (0 - 59)
//└───────────────────────── second (0 - 59, OPTIONAL)
///////////////////////////////////////////////////////////////////////////

var CronJob = require('cron').CronJob,
mturk = require('mturk-api'),
config = require('../config').mTurk,
api = mturk.createClient(config),
async = require('async'),
MongoDB = require('./db'),
TurkExpert = require('./controller'),
NOTICE = require('../build/model/notice');

var job = {
   start: function(task){
     if(task === 1 ){
        var task = new CronJob('*/10 * * * *', function() {
          console.log('task 1: update assignments - Every one hour ');
          /*
          * Runs every period
          */
          async.waterfall([
                loadHitsFromDB,
                getAssignments,
                persistAssignments
            ], function (err, result) {
                console.log('Updated total: ' + result.length + ' docs');
            });
          //Find all current period hits with status:'published' 
          function loadHitsFromDB(callback) {
                //1. Load all hits into hitList
                //publish only n(default n=100) hits in each treatment / period 
                MongoDB.find(db, 'hit', { status: 'published'}, {}, {}, function (doc) { 
                    if(doc.length === 0){
                      //all done before expire - notify us
                      var notice = new NOTICE('A32D5DD50BKQ6Y', 'HITs Done!', 'All hits are done!');
                      api.req('NotifyWorkers', notice).then(function (res) {
                          //Do something 
                          console.log('Notify Us -> ', res);
                          cb(null, doc);
                      }, function (error) {
                          //Handle error 
                          console.error(error);
                          callback(error, doc);
                      });
                    }else{
                      callback(null, doc);
                    }     
                });
           }
          //Get /api/assignments/:hitId
          function getAssignments(hitList, callback) {
            async.each(hitList, function (hit, process) {
               api.req('GetAssignmentsForHIT', { HITId: hit.HITId }).then(function (res) {
                    //Do something 
                    console.log('GetAssignmentsForHIT -> ', res);
                    console.timeEnd('GetAssignmentsForHIT');
                    //add assignment into hit
                    //hit.NumOfAssignments = res.GetAssignmentsForHITResponse.GetAssignmentsForHITResult[0].TotalNumResults;
                    hit.Assignments = res.GetAssignmentsForHITResponse.GetAssignmentsForHITResult[0].Assignment;
                    
                    process(null);
                }, function (error) {
                    //Handle error 
                    console.error(error);
                    process(error);
                });
            },function(err){
              if (err) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('Assignments failed to process.');
                        callback(null, []);
                    } else {
                        console.log('Assignments have been pulled successfully for ' + hitList.length + 'Hits');
                        callback(null, hitList);
                    }
            });
          }
          //Save into db.
          function persistAssignments(hitList, callback){
             async.each(hitList, function (hit, processPersist) {
                   MongoDB.update(db, 'hit', { _id: hit._id },
                        {
                            $set: {
                                NumOfAssignments: hit.NumOfAssignments,
                                Assignments: Assignments,
                                status: hit.MaxAssignments === Assignments.length ? 'done' : hit.status,
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
          
          }, function () {
            /* This function is executed when the job stops */
            console.log('Task 1 Completed!');
          },
          true, /* Start the job right now */
          'America/Los_Angeles' /* Time zone of this job. */
        );
        task.start();
     }
     
     else if(task === 2){ // update hits expiration, timeout / done
       var task = new CronJob('00 00 09 * * 1-5', function() {
          console.log('task 2: update assginments, hits - expiration');
          
          /*
          * Runs every weekday (Monday through Friday)
          * at 9:00:00 AM. It does not run on Saturday
          * or Sunday.
          */
          
         async.waterfall([
                loadHitsFromDB,
                getAssignments,
                persistAssignments
            ], function (err, result) {
                console.log('Updated total: ' + result.length + ' docs');
            });
          //Find all current period hits with status:'published' 
          function loadHitsFromDB(callback) {
                //1. Load all hits into hitList
                //publish only n(default n=100) hits in each treatment / period 
                MongoDB.find(db, 'hit', { status: 'published'}, {}, {}, function (doc) { 
                    callback(null, doc);
                });
           }
          //Get /api/assignments/:hitId
          function getAssignments(hitList, callback) {
            async.each(hitList, function (hit, process) {
               api.req('GetAssignmentsForHIT', { HITId: hit.HITId }).then(function (res) {
                    //Do something 
                    console.log('GetAssignmentsForHIT -> ', res);
                    console.timeEnd('GetAssignmentsForHIT');
                    //add assignment into hit
                    //hit.NumOfAssignments = res.GetAssignmentsForHITResponse.GetAssignmentsForHITResult[0].TotalNumResults;
                    hit.Assignments = res.GetAssignmentsForHITResponse.GetAssignmentsForHITResult[0].Assignment;
                    
                    process(null);
                }, function (error) {
                    //Handle error 
                    console.error(error);
                    process(error);
                });
            },function(err){
              if (err) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('Assignments failed to process.');
                        callback(null, []);
                    } else {
                        console.log('Assignments have been pulled successfully for ' + hitList.length + 'Hits');
                        callback(null, hitList);
                    }
            });
          }
          //Save into db.
          function persistAssignments(hitList, callback){
             async.each(hitList, function (hit, processPersist) {
                   MongoDB.update(db, 'hit', { _id: hit._id },
                        {
                            $set: {
                                NumOfAssignments: hit.NumOfAssignments,
                                Assignments: Assignments,
                                status: hit.MaxAssignments === Assignments.length ? 'done' : 'expired',
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
          }, function () {
            /* This function is executed when the job stops */
            //publish next round:
            TurkExpert.publishTreatments(["control", "costly", "framing", "reciprocity", "reputation"], function (result) {
                console.log('hitPublishResult=' + result);
            });
            console.log('Task 2 Completed!');
          },
          true, /* Start the job right now */
          'America/Los_Angeles' /* Time zone of this job. */
        );
        task.start();
     }

     
   }
}

module.exports = job;