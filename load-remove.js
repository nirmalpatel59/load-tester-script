var mongodb = require("mongodb")
var mongoClient = mongodb.MongoClient;
var requirelib = require('requirelib');
var sha = requirelib('util').sha;
var encryption = requirelib('encryption');
var encryptJson = requirelib('util').encryptJson;
var crypto = require('crypto');



mongoClient.connect("mongodb://localhost/ai-load-tester", function (err, db) {
  Promise.all([removeUsers(db), removeUsersProfile(db), removeApplications(db)]).then(function(){
    db.close();
  })
})


function removeUsers(db) {
  return new Promise(function (resolve, reject) {
    db.collection("users").remove({ "isLoadTest": true }, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  }) 
}

function removeUsersProfile(db) {
  return new Promise(function (resolve, reject) {
    db.collection("user_profiles").remove({ "isLoadTest": true }, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  }) 
}

function removeApplications(db) {
  return new Promise(function (resolve, reject) {
    db.collection("applications").remove({ "isLoadTest": true }, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  })
}