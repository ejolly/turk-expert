var MongoClient = require('mongodb').MongoClient,
  //////////////////////////////////////
  // If node.js cannot find module 'mongodb'
  // npm install mongodb -g
  // cd /path/to/my/app/folder
  // npm link mongodb
  /////////////////////////////////////
  // Fixed: npm install mongodb --save
  assert = require('assert'),
  config = require('../config').db.mongo;
  //TODO: Pooling


var MongoDB = {
  connect: function(cb){
     MongoClient.connect(config.url, function (err, db) {
      assert.equal(null, err);
      console.log("Connected to DB.");
      cb(db);
    });
  },
  find: function (db, name, cb) {
    var cursor = db.collection(name).find();
    var result = []; //{};
    //result[name] = []
    console.log("collection: ", name);
    cursor.each(function (err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        result.push(doc);
      } else {
        //end
        cb(result);
      }
    });
  },
  findAll: function (db, names, cb) {
    var collections = names || db.getCollectionNames();
    var result = {};
    collections.forEach(function (item, index) {
      result[item] = db.collection(item).find().toArray();
    });
    cb(result);
  }
}

module.exports = MongoDB;