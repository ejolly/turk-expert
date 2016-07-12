var mturk = require('mturk-api'),
config = require('../config').mTurk,
api = mturk.createClient(config),
MongoDB = require('./db');

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
  //Restful M-Turk API
  //////////////////////////////////////////////////////////////////////////
  GetAccountBalance: function (cb) {
    //Example operation, no params 
    api.req('GetAccountBalance').then(function(res){
      //Do something 
      console.log('GetAccountBalance -> ', res);
      cb(res);
    }, function(error){
      //Handle error 
      console.error(error);
    });
  },

  SearchHITs: function(size, num, cb) {
    //Example operation, with params 
    api.req('SearchHITs', { PageSize: size || 10, PageNumber: num || 1 }).then(function(res){
      //Do something 
      console.log('SearchHITs -> ', res);
      cb(res);
    }, function(error){
      //Handle error 
      console.error(error);
    });
  },

  GetHIT: function(id, cb) {
    //Example operation, with params 
    api.req('GetHIT', { HITId: id }).then(function(res){
      //Do something 
      console.log('GetHIT -> ', res);
      cb(res);
    }, function(error){
      //Handle error 
      console.error(error);
    });
  },

  GetAssignment: function(id, cb) {
    //Example operation, with params 
    api.req('GetAssignment', { AssignmentId: id }).then(function(res){
      //Do something 
      console.log('GetAssignmentId -> ', res);
      cb(res);
    }, function(error){
      //Handle error 
      console.error(error);
    });
  },

  CreateHIT: function(HIT, cb) {
    //Example operation, with params 
    api.req('CreateHIT', hit).then(function(res){
      //Do something 
      console.log('CreateHIT -> ', res);
      cb(res); // cb(null, response.HIT[0]);
    }, function(error){
      //Handle error 
      console.error(error);
    });
  },
  
  NotifyWorkers: function(notice, cb) {
    //Example operation, with params 
    api.req('NotifyWorkers', notice).then(function(res){
      //Do something 
      console.log('NotifyWorkers -> ', res);
      cb(res);
    }, function(error){
      //Handle error 
      console.error(error);
    });
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
  find: function(target, cb){
    MongoDB.findOne(target, function(result){
      //console.log(' result: j%', result);
      cb(result); 
    });
  }
}




module.exports = TurkExpert;