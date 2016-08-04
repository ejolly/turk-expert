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

var CronJob = require('cron').CronJob;

var job = {
   start: function(task){
     if(task === 1 ){
        var task = new CronJob('*/1 * * * *', function() {
          console.log('task 1: update assignments - status ');
          /*
          * Runs every period
          */
          }, function () {
            /* This function is executed when the job stops */
          },
          true, /* Start the job right now */
          'America/Los_Angeles' /* Time zone of this job. */
        );
        task.start();
     }else if(task === 2){ // update hits expiration, timeout / done
       var task = new CronJob('*/5 * * * *', function() {
          console.log('task 2: update hits - expiration, postpone, timeout / users - postpone, done ');
          /*
          * Runs every weekday (Monday through Friday)
          * at certain AM. or period
          */
          }, function () {
            /* This function is executed when the job stops */
          },
          true, /* Start the job right now */
          'America/Los_Angeles' /* Time zone of this job. */
        );
        task.start();
     }

     
   }
}

module.exports = job;