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
 * Make Code Randomly
 * @param {n} a number for the length of the code.
 * @returns {string} code
 */
var makeCode = function (n) {
    var code = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < n; i++) {
        code += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return code;
}


/**
 * Shuffle array in place using Fisher-Yates Shuffle ALG
 * @param {Array} a items The array containing the items.
 * @returns {Array} only if you need a new object
 */
var shuffle =   function(array) {
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

    ForceExpireHIT: function (id, cb) {
        //Example operation, with params 
        console.time('ForceExpireHIT');
        api.req('ForceExpireHIT', {HITId: id}).then(function (res) {
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
    
    DisableHIT: function (id, cb) {
        //Example operation, with params 
        console.time('DisableHIT');
        api.req('DisableHIT', {HITId: id}).then(function (res) {
            //Do something 
            console.log('DisableHIT -> ', res);
            console.timeEnd('DisableHIT');
            cb(res);
        }, function (error) {
            //Handle error 
            console.error(error);
            cb(error);
        });
    },
    
    ExtendHIT: function (hitId, cb) {
        //Example operation, with params 
        var hit = {
          HITId : hitId,
          //MaxAssignmentsIncrement : 1,
          ExpirationIncrementInSeconds : 3600
        }
        console.time('ExtendHIT');
        api.req('ExtendHIT', hit).then(function (res) {
            //Do something 
            console.log('ExtendHIT -> ', res);
            console.timeEnd('ExtendHIT');
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
    init: function (assignmentId, hitId, workerId, turkSubmitTo, db, cb) {
        //Waterfall
        //Client App Init: authentication, content loading, assignemnt Data persist, status update etc.
        MongoDB.find(db, 'authentication', { WorkerId: workerId }, {}, {}, function (doc) { //TODO: optimize - sort by lastModified: -1
                //Authenticate Logic: 1. invited User go through 2. shared user code match
                if (doc.length === 0) { // sharee - the very first time implicit in validteCode
                  cb({
                      status: 422,
                      first: true,
                      type: 'sharee',
                      //code: null,
                      count: -1, // or empty
                      treatment: '', // or empty
                      workerId: workerId,
                      hitId: hitId,
                      assignmentId: assignmentId,
                      turkSubmitTo: turkSubmitTo
                    });
                }else if (doc.length === 1) {
                  if(doc[0].Count > 0 ){ // code still valid
                      if(doc[0].Type === 'invited'){ // invited users
                        if(doc[0].Authenticated){ // invited users - repeated
                          cb({
                              status: 200,
                              first: false,
                              type: 'invited',
                              shareCount: doc[0].ShareCount,//For invited costless shared user - give client hints!
                              code: doc[0].Code,
                              count: doc[0].Count,
                              treatment: doc[0].Treatment,
                              workerId: workerId,
                              hitId: hitId,
                              assignmentId: assignmentId,
                              turkSubmitTo: turkSubmitTo
                          });
                        }else{ // invited users - the very First time!!!  auto auth
                          // get one random treatment and update 
                          var treatments = ['costly', 'costless', 'reciprocity', 'reputation', 'leverage'];
                          shuffle(treatments);
                          
                          MongoDB.update(db, 'authentication', { WorkerId: workerId },
                            {
                                $set: {
                                    Treatment: treatments[0],
                                    Authenticated: true
                                },
                                $currentDate: { "lastModified": true }
                            },
                            {
                                upsert: false,
                                w: 1
                            }, function (r) {
                                cb({
                                    status: 200,
                                    first: true,
                                    type: 'invited',
                                    code: doc[0].Code,
                                    count: doc[0].Count,
                                    treatment: treatments[0],
                                    workerId: workerId,
                                    hitId: hitId,
                                    assignmentId: assignmentId,
                                    turkSubmitTo: turkSubmitTo
                                });
                            });
                          
                        }
                    
                      }else if(doc[0].Type === 'shared'){ // invited users - repeated 
                        // Here a shared's doc[0].Authenticated was always true
                        //  if(doc[0].Treatment === 'costless'){ // For costless share: still let you go !  - the sahrecode user
                          // cb({
                          //     status: 200,
                          //     first: false,
                          //     type: 'shared',
                          //     code: doc[0].Code, 
                          //     count: doc[0].Count,
                          //     treatment: 'costless',
                          //     workerId: workerId,
                          //     hitId: hitId,
                          //     assignmentId: assignmentId,
                          //     turkSubmitTo: turkSubmitTo
                          // });
                        // }else{ // For all other costly share: code has been shared already, fall into sharee flow !
                        //   cb({
                        //       status: 422,
                        //       first: false,
                        //       type: 'shared',
                        //       //accessCode: doc[0].Code,
                        //       count: doc[0].Count,
                        //       treatment: doc[0].Treatment,
                        //       workerId: workerId,
                        //       hitId: hitId,
                        //       assignmentId: assignmentId,
                        //       turkSubmitTo: turkSubmitTo
                        //     });
                          
                        // }    
                        
                         cb({
                              status: 422,
                              first: false,
                              type: 'shared',
                              //accessCode: doc[0].Code,
                              count: doc[0].Count,
                              treatment: doc[0].Treatment,
                              workerId: workerId,
                              hitId: hitId,
                              assignmentId: assignmentId,
                              turkSubmitTo: turkSubmitTo
                          });   
                      }else{ // sharee - repeated
                        // Here a sharee's doc[0].Authenticated always true 
                           cb({
                              status: 200,
                              first: false,
                              type: 'sharee',
                              code: doc[0].Code,
                              count: doc[0].Count,
                              treatment: doc[0].Treatment,
                              workerId: workerId,
                              hitId: hitId,
                              assignmentId: assignmentId,
                              turkSubmitTo: turkSubmitTo
                            });            
                      }
                      
                    }else{ // code invalid
                        // code has been used up already, fall into sharee flow.
                        cb({
                            status: 422,
                            first: false,
                            type: 'sharee',
                            //accessCode: doc[0].Code,
                            count: 0, // or empty
                            treatment: doc[0].Treatment,  // or empty
                            workerId: workerId,
                            hitId: hitId,
                            assignmentId: assignmentId,
                            turkSubmitTo: turkSubmitTo
                          });
                    }
                }else{ // doc.length > 1  - all sharees
                  
                  // Rules for multiple historial records: 
                  // 1. Only one possible Code which Count > 0
                  // 2. If 1 is true, the one is the latest record, and all previoius records have Count === 0
                  var codeIsAvailable = false;
                  var index = -1;
                  for(var i=0; i < doc.length; i++){
                    if(doc[i].Count > 0){
                      codeIsAvailable = true;
                      //count for how many records
                      //break;
                      index = i;
                    }
                  }
                  
                  if(codeIsAvailable){ //sharee - repeatd
                      cb({
                          status: 200,
                          first: false,
                          type: 'sharee', // doc[index].Type,
                          code: doc[index].Code,
                          count: doc[index].Count,
                          treatment: doc[index].Treatment,
                          workerId: workerId,
                          hitId: hitId,
                          assignmentId: assignmentId,
                          turkSubmitTo: turkSubmitTo
                        });
                  }else{  //sharee - new code required
                    //all codes used up, fall into new sharee flow
                    cb({
                      status: 422,
                      first: false,
                      type: 'sharee',
                      // accessCode: doc[0].Code,
                      count: 0,
                      treatment: doc[0].Treatment,
                      workerId: workerId,
                      hitId: hitId,
                      assignmentId: assignmentId,
                      turkSubmitTo: turkSubmitTo
                    });
                  }
               }
         });
    },
    validateCode: function (assignmentId, hitId, workerId, turkSubmitTo, code, db, cb) {
            MongoDB.find(db, 'authentication', { Code: code, Type: {$ne: 'invited'} }, {}, {}, function (doc) {  //shared or sharee
                if (doc.length === 0) { // authentication failed
                    // save the wrong code attempts 
                    MongoDB.update(db, 'attempt', { WorkerId: workerId, Code: code },
                        {
                            $set: {
                                WorkerId: workerId,
                                Code: code,
                                Type: 'wrong'
                            },
                            $currentDate: { "lastModified": true }
                        },
                        {
                            upsert: true,
                            w: 1
                        }, function (r) {
                            console.log('Wrong code is attempting!');
                            cb({
                              status: 404,  // Code Not Found
                              first: false,
                              type: 'sharee',
                              count: -1, // or empty
                              treatment: '', // or empty
                              workerId: workerId,
                              hitId: hitId,
                              assignmentId: assignmentId,
                              turkSubmitTo: turkSubmitTo
                            });
                        }); 
                } else { //doc.length > 0 
                  //code has records 
                  if(doc[0].Count > 0){ // code available, since all code count are synced.
                     //filter out costly and costless shared users
                     var isCostlyShared = false;
                     var isCostlessShared = false;
                     for(var i=0; i < doc.length; i++){
                       if(doc[i].WorkerId === workerId && doc[i].Type === 'shared'){ 
                           isCostlyShared = true;
                       }else if(doc[i].Treatment === 'costless' && doc[i].WorkerId === '-'+workerId){ //doc[i].WorkerId.split('-').length === 2 && doc[i].WorkerId.split('-')[1] === workerId
                           isCostlessShared = true;
                       }else{
                         //do nothing
                       }
                     }
                     if(isCostlyShared){ // authentication failed
                       console.log('Costly shared user is attempting!');
                       cb({
                          status: 451, // Unavailable For Legal Reasons
                          first: false,
                          type: 'shared',
                          count: -1, // or empty
                          treatment: doc[0].Treatment, // or empty
                          workerId: workerId,
                          hitId: hitId,
                          assignmentId: assignmentId,
                          turkSubmitTo: turkSubmitTo
                        });                       
                     }else if(isCostlessShared){ // authentication failed
                       console.log('Costless shared user is attempting after own code used up!');
                       cb({
                          status: 451, // Unavailable For Legal Reasons
                          first: false,
                          type: 'shared',
                          count: -1, // or empty
                          treatment: doc[0].Treatment, // or empty
                          workerId: workerId,
                          hitId: hitId,
                          assignmentId: assignmentId,
                          turkSubmitTo: turkSubmitTo
                        });  
                     }else{
                       // sharee - New user pass code validate
                       // authentication succeed
                       MongoDB.update(db, 'authentication', { WorkerId: workerId, Code: code },
                            {
                                $set: {
                                    WorkerId: workerId,
                                    Code: code,
                                    Type: 'sharee',
                                    Authenticated: true,
                                    Treatment: doc[0].Treatment, // default: code refelcts treatment
                                    Count: doc[0].Count
                                },
                                $currentDate: { "lastModified": true }
                            },
                            {
                                upsert: true,  //should always write new
                                w: 1
                            }, function (r) { // New sharee pass code validate - The Very First Time !!!
                                cb({
                                    status: 200,
                                    first: true,
                                    type: 'sharee',
                                    code: code,
                                    count: doc[0].Count,
                                    treatment: doc[0].Treatment,
                                    workerId: workerId,
                                    hitId: hitId,
                                    assignmentId: assignmentId,
                                    turkSubmitTo: turkSubmitTo
                                });
                            });
                     }
                  }else{ // authentication failed - code used up or a.k.a. expired
                    // find the available total number of codes
                    MongoDB.find(db, 'authentication', { Type: 'shared', Count: {$gt: 0} }, {}, {}, function (availableCodes) {  //Sandbox Test limit: 1-w
                          // save the expired code attempts
                          MongoDB.update(db, 'attempt', { WorkerId: workerId, Code: code },
                              {
                                  $set: {
                                      WorkerId: workerId,
                                      Code: code,
                                      Type: 'expired'
                                  },
                                  $currentDate: { "lastModified": true }
                              },
                              {
                                  upsert: true,
                                  w: 1
                              }, function (r) {
                                  console.log('Expired code is attempting!');
                                  cb({
                                    status: 410, //Gone
                                    first: false,
                                    type: 'sharee',
                                    count: availableCodes.length, // specially, this is the available codes count
                                    treatment: doc[0].Treatment,
                                    workerId: workerId,
                                    hitId: hitId,
                                    assignmentId: assignmentId,
                                    turkSubmitTo: turkSubmitTo
                                  });
                           }); 
                      });
                   }                                              
                }   
           });
    },
    firstUser: function (assignmentId, hitId, workerId, turkSubmitTo, code, nickname, db, cb) { //persist into mongo
      if(nickname){
         MongoDB.update(db, 'authentication', { WorkerId: workerId},
                {
                    $set: {
                        Nickname: nickname
                    },
                    $currentDate: { "lastModified": true }
                },
                {
                    upsert: false,
                    w: 1
                }, function (r) { //final response for the First Time User - invited reputation treatment user only
                    cb({
                        status: 200,
                        first: false,
                        type: 'invited',
                        code: code,
                        count: 50,
                        treatment: 'reputation',
                        workerId: workerId,
                        hitId: hitId,
                        assignmentId: assignmentId,
                        turkSubmitTo: turkSubmitTo
                    });
         }); 
      }else{
         MongoDB.find(db, 'authentication', { Code: code, WorkerId: workerId }, {}, {}, function (firstUserDoc) { 
           if(firstUserDoc.length === 1){ //always for first user.
                  cb({
                        status: 200,
                        first: false,
                        type: firstUserDoc[0].Type,
                        code: code,
                        count: firstUserDoc[0].Count,
                        treatment: firstUserDoc[0].Treatment,
                        workerId: workerId,
                        hitId: hitId,
                        assignmentId: assignmentId,
                        turkSubmitTo: turkSubmitTo
                    });
           }else{
                 cb({
                        status: 422,
                        first: false,
                        type: 'sharee',
                        code: '',
                        count: -1,
                        treatment: '',
                        workerId: workerId,
                        hitId: hitId,
                        assignmentId: assignmentId,
                        turkSubmitTo: turkSubmitTo
                    });
           }
         });
      }
           
    },
    generateCode: function(assignmentId, hitId, workerId, turkSubmitTo, db, cb) {  // TODO: pass code from client and detect hacks
       MongoDB.find(db, 'authentication', { WorkerId: workerId, Type:'invited' }, {}, {}, function (doc) {
         if(doc.length === 1){ 
            if(doc[0].Treatment === 'costless'){ // For costless share - create one shadow costly share record
                  MongoDB.update(db, 'authentication', { _id: doc[0]._id }, //WorkerId: workerId, Code: doc[0].Code
                  {
                      $set: {
                          ShareCount: doc[0].Count,  //for record dup
                          ShareTime: new Date()  //for record dup
                      },
                      $currentDate: { "lastModified": true }
                    },
                    {
                        upsert: false,
                        w: 1
                    }, function (r) {
                        console.log(doc[0].Treatment + ' user('+ workerId +') is Sharing!');
                            MongoDB.insert(db, 'authentication', { 
                              Treatment: 'costless', //doc[0].Treatment,
                              Type: 'shared',   //for record !!!
                              WorkerId: '-'+workerId, //shadow user!
                              Code: doc[0].Code, 
                              Count: 50,  //always share 50! - save money?
                              ShareCount: doc[0].Count,  //for record
                              ShareTime: new Date()  //for record
                            }, function (r) { 
                                  cb({
                                      status: 200,
                                      first: false,
                                      type: 'invited', // not changing
                                      shareCount: doc[0].Count,//For invited costless shared user - give client hints!
                                      code: doc[0].Code, 
                                      count: doc[0].Count,
                                      treatment: 'costless',
                                      workerId: workerId,
                                      hitId: hitId,
                                      assignmentId: assignmentId,
                                      turkSubmitTo: turkSubmitTo
                                  });
                            });    
                    });  
              }else if(doc[0].Treatment === 'leverage'){  // For leverage shared user - double up ur current count
                  MongoDB.update(db, 'authentication', { _id: doc[0]._id }, //WorkerId: workerId, Code: doc[0].Code
                  {
                      $set: {
                          Type: 'shared',
                          Count: 2*doc[0].Count, // match 100%
                          ShareCount: doc[0].Count,  //for record
                          ShareTime: new Date()  //for record
                      },
                      $currentDate: { "lastModified": true }
                    },
                    {
                        upsert: false,
                        w: 1
                    }, function (r) {
                        cb({
                          status: 200, 
                          first: false,
                          type: 'shared',
                          code: doc[0].Code,
                          count: doc[0].Count, 
                          treatment: doc[0].Treatment,
                          workerId: workerId,
                          hitId: hitId,
                          assignmentId: assignmentId,
                          turkSubmitTo: turkSubmitTo
                        });
                   }); 
            }else{  // For all other costly shares
                  MongoDB.update(db, 'authentication', { _id: doc[0]._id }, //WorkerId: workerId, Code: doc[0].Code
                  {
                      $set: {
                          Type: 'shared',
                          ShareCount: doc[0].Count,  //for record
                          ShareTime: new Date()  //for record
                      },
                      $currentDate: { "lastModified": true }
                    },
                    {
                        upsert: false,
                        w: 1
                    }, function (r) {
                        cb({
                          status: 200, 
                          first: false,
                          type: 'shared',
                          code: doc[0].Code,
                          count: doc[0].Count, 
                          treatment: doc[0].Treatment,
                          workerId: workerId,
                          hitId: hitId,
                          assignmentId: assignmentId,
                          turkSubmitTo: turkSubmitTo
                        });
                   }); 
            }
         }else{
           //should never happen - reject/nocode
            cb({
              status: 422, 
              first: false,
              type: 'shared',
              count: -1,
              treatment: '',
              workerId: workerId,
              hitId: hitId,
              assignmentId: assignmentId,
              turkSubmitTo: turkSubmitTo
            });
         }
       });
    },   
    updateCodeCount: function(workerId, code, db, cb) {
      console.log('Submit Hit from -> worker:' + workerId + ' -> code:' + code ); //count log
      MongoDB.find(db, 'authentication', { Code: code, WorkerId: workerId }, {}, {}, function (doc) {
         if(doc.length === 1){
             if(doc[0].Type === 'invited'){ // only update costless invited user own code
                   MongoDB.update(db, 'authentication', { Code: code, WorkerId: workerId }, 
                   { 
                      $set: {
                          Count: doc[0].Count-1,  // -1
                      },
                      $currentDate: { "lastModified": true }
                    },
                    {
                        upsert: false, 
                        w: 1
                    }, function (r) {
                      cb({status: 200});
                   });
              }else{ // Type === sharee, update all except the invited cosless user
                  MongoDB.updateMany(db, 'authentication', { Code: code, Type:{ $ne: 'invited'}}, 
                  {
                    $set: {
                        Count: doc[0].Count-1,  // -1
                    },
                    $currentDate: { "lastModified": true }
                  },
                  {
                      upsert: false,
                      w: 1
                  }, function (r) {
                    cb({status: 200});
                  });                  
            }
         }else{ //something wrong
            cb({status: 404});
         }
      });
    },
    publishHitsPool: function(db, cb){
             //SANDBOX
             var h = 10;  // hits pool size; //8000 for costless //16000 leverage  - estimate 5hrs to publish...
             var w = 1; // workers size
             var c = 50; // code limit times
             //PROD
             //  var h = 40000;  // hits pool size; //8000 for costless //16000 leverage  - estimate 5hrs to publish...
             //  var w = 800; // workers size
             //  var c = 50; // code limit times
          
            //async waterfall with named functions:
            console.time('publishHitsPool');
            async.waterfall([
                batchPublish,
                persistHitIntoDB,
                contactWorkers,  //Release 3.0
                updateStatus
            ], function (err, result) {
                
                assert.equal(null, err);
                
                console.timeEnd('publishHitsPool');
                cb(h);
            });
            function batchPublish(callback) {
                //3. async each publish the targetList in parallel  //maybe eachLimit if reach quot
                var i = 0,
                //Generate targetList
                targetList = [],
                hitList = [],
                //map to HIT model, use Typescript compiled data schema -> /build/model
                lifetimeInSeconds = 3600, //72 hr 259200
                assignmentDurationInSeconds = 300; //5 min
                autoApprovalDelay = 1; //1 sec
                questionString = '<ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd"><ExternalURL>' + config.externalUrl + '</ExternalURL><FrameHeight>' + config.frameHeight + '</FrameHeight></ExternalQuestion>',
                canonicalTitle = 'Rating Movie Posters',
                description = 'This is a group of brief HITs that involve answer 2 quick questions about movie posters',
                keywords = ' ratings, pictures, mturk. movies';
                var hit = new HIT(canonicalTitle, description, keywords, questionString, 1, assignmentDurationInSeconds, lifetimeInSeconds, autoApprovalDelay, { 'Amount': 0.15, 'CurrencyCode': 'USD', 'FormattedPrice': '$0.15' });
               
                for(; i < h; i++){
                    //TODO Performance: spin "externalUrl": "https://mturksharing.azurewebsites.net" upto k
                    // var externalUrlList = ["https://mturksharing.azurewebsites.net","https://mturksharing1.azurewebsites.net","https://mturksharing2.azurewebsites.net","https://mturksharing3.azurewebsites.net"];
                    // externalUrl = shuffle(externalUrlList);
                    // pick externalUrlList[0] or based on id % n !    
                    // Shuffle content - moved to client     
                    targetList.push(hit);
                }
                
                //Gennerate content array randomly here for each n(default n=100) hits:
                // var array = [];
                // for (; i < targetList.length; i++) {
                //     array.push(i);
                // }
                async.eachLimit(targetList, 1, function (hit, processPublish) {
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
                            api.req('CreateHIT', hit).then(function (res) {
                                    var hitTypeId = res.CreateHITResponse.HIT[0].HITTypeId[0];
                                    var hitId = res.CreateHITResponse.HIT[0].HITId[0];
                                    console.log('CreateHIT -> ', hitId); //res                                  
                                    hitList.push(
                                      {
                                        HITTypeId: hitTypeId, 
                                        HITId: hitId,
                                        Title: hit.Title,
                                        Description: hit.Description,
                                        Keywords: hit.Keywords,
                                        Question: hit.Question,
                                        MaxAssignments: hit.MaxAssignments,
                                        AssignmentDurationInSeconds: 300,
                                        LifetimeInSeconds: 3600,
                                        AutoApprovalDelayInSeconds: 1,
                                        Reward: hit.Reward,
                                        RequestGroup: hit.RequestGroup,
                                        Operation: hit.Operation,
                                        Version: hit.Version,
                                        Timestamp: hit.Timestamp,
                                        Signature: hit.Signature                             
                                    });
                                    apicb(null, res);
                                    //callback(null, res); //  { CreateHITResponse: { OperationRequest: [ [Object] ], HIT: [ [Object] ] } }
                                }, function (error) {
                                    //Handle error 
                                    console.error(error);
                                    apicb(error, null);
                                    //console.log('error waiting for republish'); 
                                });
                      }, 300);
                    }
                    async.retry({
                      times: 5,
                      interval: function(retryCount) {
                        return 1000 * Math.pow(2, retryCount);
                      }
                    }, apiCreate, function(err, res) {
                        // do something with the result 
                        processPublish(null);
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
                        //console.log('hitList -> ', hitList);
                        //Update hit Object x
                        // for(var j=0; j < h; j++){
                        //    targetList[j].HITTypeId = hitList[j].HITTypeId;
                        //    targetList[j].HITId = hitList[j].HITId;
                        // }
                        // console.log('targetList -> ', targetList);
                        callback(null, hitList);
                    }
                });
            }   
            //async each - added into waterfall
            function persistHitIntoDB(hitList, callback) {
                async.eachLimit(hitList, 1, function (hit, processPersist) {
                    //console.log('Persist into DB -> {' HITTypeId:' + hit.HITTypeId + ' HITId:' + hit.HITId }');
                    MongoDB.update(db, 'hit', { HITId:  hit.HITId },
                        {
                            $set: {
                                HITTypeId: hit.HITTypeId,
                                HITId: hit.HITId,
                                Title: hit.Title,
                                // Content: hit.Content,
                                Description: hit.Description,
                                Keywords: hit.Keywords,
                                Reward: hit.Reward,
                                MaxAssignments: 1,
                                status: 'published',
                                publishDate: new Date().toISOString()
                            },
                            $currentDate: { "lastModified": true }
                        },
                        {
                            upsert: true, //always expect insert
                            w: 1
                        }, function (r) {
                            processPersist(null);
                        });
                    // MongoDb.insert(db, 'hit', hit, function(r){  // unit test
                    //    processPersist(null);
                    // });
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
                        api.req('GetHIT', { HITId: hitList[0].HITId }).then(function (res) {
                            console.log('GetGroupId: ', res.GetHITResponse.HIT[0].HITGroupId[0]);
                            mturkcb(null, res.GetHITResponse.HIT[0].HITGroupId[0]);
                        }, function (error) {
                            //Handle error 
                            console.error(error);
                            mturkcb(error, null);
                        });
                    },
                    worker: function (mongocb) {
                        MongoDB.find(db, 'worker', { status: { $not: { $in: ['postponed', 'noresponse', 'sent'] } } }, {}, { limit: w }, function (doc) {  //Sandbox Test limit: 1-w
                            mongocb(null, doc);
                        });
                    }
                }, function (err, result) {
                  
                  assert.equal(null, err);
                  
                  var currentLifetimeInSeconds = hitList[0].lifetimeInSeconds;
                  var currentHit = hitList[0];
                  var subject = "New HITs available!"; 
                  var template = "Dear Turker,\n\nWe are conducting a study on how Turkers communicate about HITs. If you would like to participate please read the information below and follow the URL at the bottom of this message to begin working on these HITs.\n\nWe have launched a group of HITs called \"Rating Movie Posters\". These HITs will be available for 72hrs or until our study completes, whichever is sooner (we will inform you by email if the study completes prior to 72hrs). Each HIT in this group involves answering a quick question about a movie poster and pays $0.15. Each HIT will take no more than 20 seconds to complete.\n\nWe have automatically granted you the ability to complete up to 50 of these HITs. Completing all 50 HITs will result in guaranteed pay of $7.50 and should take no longer than 10 minutes.\n\nYou can access these HITs at the following URL: <HITURL> \n\nThanks!\n\nSid"        
                  
                  var workerList = result.worker;
                  async.eachLimit(workerList, 1, function (currentWorker, processNotify) {        
                    //Generate access code for each worker
                    var code = makeCode(5);
                    currentWorker.code = code;
                    //sandbox test: use your test worker id
                    var notice = new NOTICE(currentWorker.WorkerId, subject, formatMessageText(template, currentHit, code, currentLifetimeInSeconds, currentWorker, result.groupId));  
  
                    var apiNotify = function(apicb, previousResult){
                      console.log('calling notify worker');
                      setTimeout(function(){ //protection 2
                        api.req('NotifyWorkers', notice).then(function (res) {
                            // Do something 
                            console.log('NotifyWorkers -> ', currentWorker.WorkerId); 
                            //write into 
                            apicb(null, res);
                        }, function (error) {
                            //Handle error 
                            console.error(error);
                            apicb(error, null);
                        });
                      }, 300);
                    }
                    async.retry({
                      times: 5,
                      interval: function(retryCount) {
                        return 1000 * Math.pow(2, retryCount);
                      }
                    }, apiNotify, function(err, res) {
                        // do something with the result
                        processNotify(null);
                    });                 
                    
                }, function (err) {
                    // if any of the file processing produced an error, err would equal that error
                    if (err) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('Worker failed to notify.');
                        callback(null, []);
                    } else {
                        console.log(workerList.length + ' Workers have been notified successfully.');
                        callback(null, workerList);
                    }
                });

               });

              function formatMessageText(template, hit, code, currentLifetimeInSeconds, worker, groupId) {
                    // Define the string
                    var posponeString = hit.HITTypeId + '_' + worker.WorkerId;

                    // Encode the String
                    var encodedPostponeString = Base64.encode(posponeString);
                    // console.log("encodedPostponeString:",encodedPostponeString);

                    var msg = template.replace('<TITLE>', hit.Title)
                        .replace('<LIFETIME>', parseInt(currentLifetimeInSeconds / 3600) + 'hrs')
                        .replace('<REWARD>', hit.Reward.FormattedPrice)
                        .replace('<CODE>', code)
                        .replace('<HITURL>', 'https://www.mturk.com/mturk/preview?groupId=' + groupId)
                        .replace('<POSTPONEURL>', config.externalUrl + '/postpone?s=' + encodedPostponeString);

                    return msg;
                }

            }
            function updateStatus(workerList, callback) {
              //DB update worker status: sent
              async.eachLimit(workerList, 1, function (currentWorker, processStatus) {        
                                  
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
                        MongoDB.update(db, 'authentication', { WorkerId: currentWorker.WorkerId, Code: currentWorker.code },
                            {
                                $set: {
                                    WorkerId: currentWorker.WorkerId,
                                    Type: 'invited',
                                    Count: c, //50
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
                    /////////////////////
                    // Denomalize 
                    /////////////////////                    
                    // updateCode: function (mongocb) {
                    //     MongoDB.update(db, 'code', { Code: currentWorker.cod },
                    //         {
                    //             $set: {
                    //                 Count: c, //50
                    //             },
                    //             $currentDate: { "lastModified": true }
                    //         },
                    //         {
                    //             upsert: true,  //assert: should always write
                    //             w: 1
                    //         }, function (r) {
                    //             mongocb(null, r)
                    //         });
                    // }
                }, function (err, result) {
                    if (err) {
                        console.error(err);
                    }
                    processStatus(null);
              
                });
                }, function (err) {
                    // if any of the file processing produced an error, err would equal that error
                    if (err) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('Worker failed to notify.');
                        callback(null, []);
                    } else {
                        console.log(workerList.length + ' Workers have been notified successfully.');
                        callback(null, workerList);
                    }
                });
            }
    },
    updateAssignments: function(db, cb) {
        async.waterfall([
            loadHitsFromDB,
            getAssignments,
            persistAssignments,
            NotifyOwner
        ], function (err, result) {
            var msg = 'Updated total: ' + result.length + ' docs';
            cb(msg);
        });
        //Find all current period hits with status:'published' 
        function loadHitsFromDB(callback) {
            //1. Load all hits into hitList
            //publish only n(default n=100) hits in each treatment / period 
            MongoDB.find(db, 'hit', { status: 'published' }, {}, {}, function (doc) {
                //all done before expire
                callback(null, doc);
            });
        }
        //Get /api/assignments/:hitId
        function getAssignments(hitList, callback) {
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
                      }, 300);
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
                    callback(null, []);
                } else {
                    console.log('Assignments have been pulled successfully for ' + hitList.length + 'Hits');
                    callback(null, hitList);
                }
            });
        }
        //Save into db.
        function persistAssignments(hitList, callback) {
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
                    callback(null);
                } else {
                    console.log(hitList.length + ' HITs have been updated successfully.');
                    callback(null);
                }
            });
        }
        function NotifyOwner(callback) {
          MongoDB.find(db, 'hit', { status: 'done' }, {}, {}, function(doc) {
            //all done before expire - notify us //eshin: A2Z7XGBZSO11D0 //kev:
            var notice = new NOTICE('A32D5DD50BKQ6Y', 'HITs Update', doc.length + ' HITs have been done.');
            api.req('NotifyWorkers', notice).then(function(res) {
              //Do something 
              console.log('Notify Us -> ', res);
              callback(null, doc);
            }, function(error) {
              //Handle error db
              console.error(error);
              callback(error, doc);
            });
          });
        }

    },
    // Deprecated
    //Soft get assignments first
    expireHits: function (db, cb) {  
        async.waterfall([
            loadHitsFromDB,
            getAssignments,
            //updateContentCount,
            persistAssignments
        ], function (err, result) {
            var msg = 'Updated total: ' + result.length + ' docs';
            cb(msg);
        });
        //Find all current period hits with status:'published' 
        function loadHitsFromDB(callback) {
            //1. Load all hits into hitList
            //publish only n(default n=100) hits in each treatment / period 
            MongoDB.find(db, 'hit', { status: 'published' }, {}, {}, function (doc) {
                callback(null, doc);
            });
        }
        //Get /api/assignments/:hitId
        function getAssignments(hitList, callback) {
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
                      }, 300);
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
                    callback(null, []);
                } else {
                    console.log('Assignments have been pulled successfully for ' + hitList.length + 'Hits');
                    callback(null, hitList);
                }
            });
        }
        //update content count.
        function updateContentCount(hitList, callback) {
          async.eachLimit(hitList, 1, function (hit, processContent){
              MongoDB.update(db, 'content', { _id: hit.Content._id },
                            {
                                $set: {
                                    HITCount: hit.Content.HITCount + 1
                                },
                                $currentDate: { "lastModified": true }
                            },
                            {
                                upsert: false,
                                w: 1
                            }, function (r) {
                                processContent(null)
               });
          }, function (err) {
                callback(null, hitList);
          });
        }
        //Save into db.
        function persistAssignments(hitList, callback) {
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
                    callback(err, 0);
                } else {
                    console.log(hitList.length + ' HITs have been updated successfully.');
                    callback(null, hitList);
                }
            });
        }
    },
    //extend 24 hrs for all, works even after disappear from mturk
    extendHits: function (db, cb) {  
        async.waterfall([
            loadHitsFromDB,
            extendAll
            // updateHits
        ], function (err, result) {
            var msg = 'Updated total: ' + result.length + ' docs';
            cb(msg);
        });
        //Find all current period hits with status:'published' 
        function loadHitsFromDB(callback) {
            //1. Load all hits into hitList
            //publish only n(default n=100) hits in each treatment / period 
            MongoDB.find(db, 'hit', { status: 'published' }, {}, {}, function (doc) {
                callback(null, doc);
            });
        }
        //update content count.
        function extendAll(hitList, callback) {
          async.eachLimit(hitList, 1, function (hit, processExpire){
              var apiExtendHits = function(apicb, previousResult){
                      console.log('calling extend hit');
                      var newhit = {
                          HITId : hit.HITId,
                          //MaxAssignmentsIncrement : 1,
                          ExpirationIncrementInSeconds : 86400 //24 hrs
                        }
                        setTimeout(function(){ //protection 2
                            api.req('ExtendHIT', newhit).then(function (res) {
                                console.log('ExtendHIT -> ', newhit.HITId);
                                apicb(null, res);
                            }, function (error) {
                                //Handle error 
                                console.error(error);
                                apicb(error, null);
                            });
                      }, 300);
                    }
                    async.retry({
                      times: 5,
                      interval: function(retryCount) {
                        return 1000 * Math.pow(2, retryCount);
                      }
                    }, apiExtendHits, function(err, res) {
                       processExpire(null);
                    });   
          }, function (err) {
             callback(null, hitList);
          });
        }
        //TODO: Save into db?
        function updateHits(hitList, callback) {
            async.each(hitList, function (hit, processPersist) {
                MongoDB.update(db, 'hit', { _id: hit._id },
                    {
                        $set: {
                            status: 'extended',
                            // expireation: now day + 24hrs
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
                    console.log('HIT failed to extend.');
                    callback(err, 0);
                } else {
                    console.log(hitList.length + ' HITs have been extended successfully.');
                    callback(null, hitList);
                }
            });

        }
    },
    
    forceExpireHits: function (db, cb) {  
        async.waterfall([
            loadHitsFromDB,
            forceExpire,
            updateHits
        ], function (err, result) {
            var msg = 'Updated total: ' + result.length + ' docs';
            cb(msg);
        });
        //Find all current period hits with status:'published' 
        function loadHitsFromDB(callback) {
            //1. Load all hits into hitList
            //publish only n(default n=100) hits in each treatment / period 
            MongoDB.find(db, 'hit', { status: { $in: ['published','done'] } }, {}, {}, function (doc) {
                callback(null, doc);
            });
        }
        //update content count.
        function forceExpire(hitList, callback) {
          async.eachLimit(hitList, 1, function (hit, processExpire){
              var apiExpireHits = function(apicb, previousResult){
                      console.log('calling forceExpire for hit');
                      setTimeout(function(){ //protection 2
                            api.req('ForceExpireHIT', {HITId: hit.HITId}).then(function (res) {
                                console.log('ForceExpireHIT:'+ hit.HITId + '->' + res.ForceExpireHITResponse.ForceExpireHITResult[0].Request[0].IsValid[0]);
                                apicb(null, res);
                            }, function (error) {
                                //Handle error 
                                console.error(error);
                                apicb(error, null);
                            });
                      }, 300);
                    }
                    async.retry({
                      times: 5,
                      interval: function(retryCount) {
                        return 1000 * Math.pow(2, retryCount);
                      }
                    }, apiExpireHits, function(err, res) {
                       processExpire(null);
                    });   
          }, function (err) {
             callback(null, hitList);
          });
        }
        //Save into db.
        function updateHits(hitList, callback) {
            async.each(hitList, function (hit, processPersist) {
                MongoDB.update(db, 'hit', { _id: hit._id },
                    {
                        $set: {
                            status: 'expired',
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
                    console.log('HIT failed to expire.');
                    callback(err, 0);
                } else {
                    console.log(hitList.length + ' HITs have been expired successfully.');
                    callback(null, hitList);
                }
            });

        }
    },
    //Deprecated
    postpone: function (s, db, cb) { //Update mongo, secret weapon
        var decodedPostponeString = Base64.decode(s);
        //console.log("decodedPostponeString",decodedPostponeString);
        var hitTypeId = decodedPostponeString.split('_')[0];
        var workerId = decodedPostponeString.split('_')[1];

        //invalidate old code
        var newCode = makeCode(6); //6 is +1 than original

        async.parallel({
                hit: function (mongocb) {
                    MongoDB.updateMany(db, 'hit', { HITTypeId: hitTypeId, status: 'published' },
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
                    MongoDB.update(db, 'authentication', { HITTypeId: hitTypeId, WorkerId: workerId },
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
        });
    },
    noresponse: function (hitTypeId, workerId, db, cb) { //Update mongo, secret weapon
        //invalidate old code
        var newCode = makeCode(6); //6 is +1 than original
        
        async.parallel({
                hit: function (mongocb) {
                    MongoDB.updateMany(db, 'hit', { HITTypeId: hitTypeId, status: 'published' },
                        {
                            $set: {
                                Code: newCode,
                                status: 'noresponse'
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
                                status: 'noresponse'
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
                    MongoDB.update(db, 'authentication', { HITTypeId: hitTypeId, WorkerId: workerId },
                        {
                            $set: {
                                Code: newCode,
                                Type: 'noresponse'
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
                cb(200);   
        });
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
    find: function (db, cb) {
        console.time('DB Data find');
         async.parallel({
                hit: function (cb) {
                    MongoDB.find(db, 'hit', { status: { $in: ['published'] } }, {}, {}, function (doc) {
                        //MongoDB.find(db, 'hit', {}, {}, {limit:100}, function (doc) {
                        cb(null, doc);
                    });
                },
                content: function (cb) {
                    MongoDB.find(db, 'content', {}, {}, {sort: [['HITCount', -1]], limit: 100}, function (doc) {
                        cb(null, doc);
                    });
                },
                worker: function (cb) {
                    MongoDB.find(db, 'worker', {}, {}, {}, function (doc) {
                        cb(null, doc);
                    });
                },
                authentication: function (cb) {
                    MongoDB.find(db, 'authentication', {}, {}, {sort: [['Count', 1]]}, function (doc) {
                        cb(null, doc);
                    });
                },
                attempt: function (cb) {
                    MongoDB.find(db, 'attempt', {}, {}, {}, function (doc) {
                        cb(null, doc);
                    });
                }
            }, function (err, result) {
                assert.equal(null, err);
                cb(result);
                console.timeEnd('DB Data find');
            });
    }
}




module.exports = TurkExpert;