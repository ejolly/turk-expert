var MongoClient = require('mongodb').MongoClient, //TODO: Pooling
//////////////////////////////////////
// If node.js cannot find module 'mongodb'
// npm install mongodb -g
// cd /path/to/my/app/folder
// npm link mongodb
/////////////////////////////////////
// Fixed: npm install mongodb --save
assert = require('assert'),
config = require('../config').db.mongo;




var MongoDB = {
    findOne: function(collection, cb){
      MongoClient.connect(config.url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected to DB - findOne.");
        findOneData(collection, db, function(doc) {
            cb(doc);
            db.close();
        });
      });     
    },
    findAll: function(collections, cb){
      MongoClient.connect(config.url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected to DB - findAll.");
        findAllData(collections, db, function(result) {
            cb(result);
        });
      });     
    }
}

var findOneData = function(name, db, cb) {
   var cursor = db.collection(name).find();
   var result = []; //{};
   //result[name] = [];
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         result.push(doc);
      } else {
         //end
         db.close();
         cb(result);
      }
   });
};


//TODO: get all collectons data
var findAllData = function(names, db, cb){
  var collections = names || db.getCollectionNames();
  var result = {};
  collections.forEach(function(item, index){
    result[item] = db.collection(item).find().toArray();
  });
  cb(result);
};


module.exports = MongoDB;