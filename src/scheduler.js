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
async = require('async'),
TurkExpert = require('./controller');

var job = {
   start: function(task){
     if(task === 1 ){
        var task = new CronJob('*/10 * * * *', function() {
          console.log('task 1: update assignments - status ');
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
                    hit.NumOfAssignments = res.GetAssignmentsForHITResponse.GetAssignmentsForHITResult[0].TotalNumResults;
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
                        //console.log('targetList ->', JSON.stringify(targetList, null, 2));
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
                                status: 'done',
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
            console.log('Task Completed!')
          },
          true, /* Start the job right now */
          'America/Los_Angeles' /* Time zone of this job. */
        );
        task.start();
     }
     
    //  else if(task === 2){ // update hits expiration, timeout / done
    //    var task = new CronJob('*/5 * * * *', function() {
    //       console.log('task 2: update hits - expiration, worker - timeout');
    //       /*
    //       * Runs every weekday (Monday through Friday)
    //       * at certain AM. or period
    //       */
    //       }, function () {
    //         /* This function is executed when the job stops */
    //       },
    //       true, /* Start the job right now */
    //       'America/Los_Angeles' /* Time zone of this job. */
    //     );
    //     task.start();
    //  }

     
   }
}

module.exports = job;