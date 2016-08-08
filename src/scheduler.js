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
TurkExpert = require('./controller');

var job = {
   start: function(task){
     if(task === 1 ){
        var task = new CronJob('*/60 * * * * *', function() {
          console.log('task 1: update assignments - Every one hour ');
          /*
          * Runs every period
          */
          TurkExpert.updateAssignments(function(msg){
            console.log(msg);
          });
          
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
       var task = new CronJob('00 00 09 * * 0-6', function() {
          console.log('task 2: update assginments, hits - expiration');
          
          /*
          * Runs every weekday (Monday through Friday)
          * at 9:00:00 AM. It does not run on Saturday
          * or Sunday.
          */
          TurkExpert.expireHits(function(msg){
            console.log(msg);
          });
          
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