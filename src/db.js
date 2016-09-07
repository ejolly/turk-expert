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



var MongoDB = {

  connect: function(cb){   //TODO: Pooling 
     MongoClient.connect(config.url, function (err, db) {
      assert.equal(null, err);
      console.log("Connected to DB.");
      cb(db);
    });
  },
  find: function (db, name, query, fields, options, cb) {   //TODO: Add limit support 
    var cursor = db.collection(name).find(query, fields, options);
    var result = []; //{};
    //result[name] = []
    console.log("Find collection: ", name);
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
  aggregate: function (db, name, query, fields, options, cb) {
    var cursor = db.collection(name).aggregate(query, fields, options);
    var result = []; //{};
    //result[name] = []
    console.log("Aggregate collection: ", name);
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
  },
  update: function(db, name, query, fields, options, cb){
    db.collection(name).updateOne(query, fields, options).then(function(r) {
        // assert.equal(1, r.result.n);
        // assert.equal(1, r.result.nModified);
        // assert.equal(1, r.matchedCount);
        // assert.equal(1, r.modifiedCount);
        // assert.equal(0, r.upsertedCount); 
        console.log('Update One DB -> ', query);    //+ r.result.n + ' docs'
        cb(r);
    });
  },
  updateMany: function(db, name, query, fields, options, cb){
    db.collection(name).updateMany(query, fields, options).then(function(r) {
        // assert.equal(1, r.result.n);
        // assert.equal(1, r.result.nModified);
        // assert.equal(1, r.matchedCount);
        // assert.equal(1, r.modifiedCount);
        // assert.equal(0, r.upsertedCount); 
        console.log('Update Many DB -> ', query);    //+ r.result.n + ' docs'
        cb(r);
    });
  },
  findAndModify: function(db, name, query, fields, options, cb){
    db.collection(name).findAndModify(query, fields, options).then(function(r) {
        console.log('FindAndModify DB -> ', query);    //+ r.result.n + ' docs'
        cb(r);
    });
  },
  insert: function(db, name, doc, cb){
    db.collection(name).insertOne(doc).then(function(r) {
        console.log('Insert DB -> ', doc); 
        cb(r);
    });
  }
}

module.exports = MongoDB;