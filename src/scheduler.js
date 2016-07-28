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

var schedule = require('node-schedule');

var job = {
   start: function(task){
     if(task === 1){ // update assignments 
        var min = 1;
        var j1 = schedule.scheduleJob('* /1 * * *', function(){
        console.log('The answer to life, the universe, and everything!');
        });
     }else if(task === 2){ // update hits expiration / timeout / done
       var hr = 24;
       var j2 = schedule.scheduleJob('* * /24 * *', function(){
         console.log('The answer to life, the universe, and everything!');
       });
     }
   }
}

module.exports = job;