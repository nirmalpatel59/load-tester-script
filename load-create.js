var mongodb = require("mongodb")
var mongoClient = mongodb.MongoClient;
var requirelib = require('requirelib');
var sha = requirelib('util').sha;
var encryption = requirelib('encryption');
var encryptJson = requirelib('util').encryptJson;
var crypto = require('crypto');

var db;
var salt = '9zc/xtczYIX0Q5jY0ptb4jIKkxkWTKmywJCc3HIS';
var saltAes = '2d59463ef295dac3fb4a4658d66d853c';
var iv = '180ace3dd7c4a426';

mongoClient.connect("mongodb://localhost/ai-load-tester", function (err, dbConnection) {
  db = dbConnection;

  var k;
  var newEmail = [];
  var username = [];
  var i = 0;  
  var email = "loadtest";
  var mailinator = "@mailinator.com";

  var ecryptPassword = sha('12345678');  

  for (k = 0; k <= i; k++){
    newEmail[k] = email + k + mailinator;
    username[k] = email + k;
  } 
  
  for(var j = 0; j < newEmail.length; j++){
    var userObj = {
      username: username[j],
      password: ecryptPassword.password,
      email: sha(newEmail[j], salt).password,
      phone: encryption.encryptText("9898989898", saltAes, iv),
      createdByAdminUser: '000000000000000000000001',
      isActive: true,
      doiToken: sha(Date.now() + Math.random).password,      
      salt: ecryptPassword.salt,
      isLoadTest: true
    };  
    // console.log(userObj);
    createUser(userObj,newEmail[j]);
  }
});


function createUser(userObj,email) {
  // console.log(email);
  db.collection("users").insertOne(userObj, function (err, data) {
    if(err) {
      console.log(err)
    } else {
        // console.log(salt);
        // console.log(iv);

        var mainInfo = {
                          firstName: 'Test',
                          lastName: 'Test New',
                          email: email.toLowerCase(),
                          dateOfBirth: '28/09/1994'
                       };

        // var profileObj = {
        //     _id: data.insertedId,
        //     role: 'candidates',
        //     mainInfo: encryptJson(mainInfo, salt, iv),
        //     signupParams: {},
        //     deviceInfo: {},
        //     onboarding: [],
        //     onboardingFlow: [],
        //     salt: crypto.randomBytes(30).toString('base64'),
        // };
        console.log(crypto.randomBytes(30).toString('base64'));               
        console.log(encryptJson(mainInfo, salt, iv));

    }
  })
}
