var positionId = "59193d08354db8f3633fe705";
var accessCode = "59193d08354db8f3633fe706";
var noOfUsers = 10;
var emailPrefix = "scrTester";
var mailinator = "@mailinator.com";

var mongodb = require("mongodb")
var mongoClient = mongodb.MongoClient;
var requirelib = require('requirelib');
var sha = requirelib('util').sha;
var encryption = requirelib('encryption');
var encryptJson = requirelib('util').encryptJson;
var crypto = require('crypto');

var expiration ={
  "regular_user":90000,
  "admin_user":1440
}

var db;
var salt = '9zc/xtczYIX0Q5jY0ptb4jIKkxkWTKmywJCc3HIS';
var saltAes = '2d59463ef295dac3fb4a4658d66d853c';
var iv = '180ace3dd7c4a426';


mongoClient.connect("mongodb://localhost/ai-load-tester", function (err, dbConnection) {
  db = dbConnection;
  var k;
  var newEmail = [];
  var username = [];
  var i = noOfUsers;  
  var email = emailPrefix;

  var ecryptPassword = sha('12345678');

  for (k = 1; k <= i; k++){
    newEmail[k] = email + k + mailinator;
    username[k] = email + k;
  } 
  for(var j = 1; j < newEmail.length; j++){
    var userObj = {
      username: newEmail[j],
      password: ecryptPassword.password,
      email: sha(newEmail[j], salt).password,
      phone: encryption.encryptText("9898989898", saltAes, iv),
      createdByAdminUser: '000000000000000000000001',
      isActive: true,
      doiToken: sha(Date.now() + Math.random).password,      
      salt: ecryptPassword.salt,
      isLoadTest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      activatedAt: new Date(),
      signupMethod: "ai",
      apnTokensAndroid: [],
      apnTokens: [],
      authExpiresAt: new Date(Date.now() + expiration.regular_user * 60 * 1000)
    };  
    createUser(userObj,newEmail[j]);
  }
});


function createUser(userObj,email) {
  db.collection("users").insertOne(userObj, function (err, data) {
    if(err) {
      console.log(err)
    } else {
      var mainInfo = {
        firstName: 'Test',
        lastName: 'Test New',
        email: email.toLowerCase(),
        dateOfBirth: '28/09/1994'
      };
      // var objID = new ObjectID(data.insertedId)
      var profileObj = {
        _id: data.insertedId,
        role: 'candidates',
        userType: 'candidates',
        isLoadTest: true,
        signupParams: {},
        watsonPI: {},
        deviceInfo: {},
        onboarding: [],
        onboardingFlow: [],
        scoreHistory: [],
        createdAt: new Date(),
        updatedAt: null,
        profileResponses: [],
        payloadInfo: [],
        easyRetrievalProfileResponses: [],
        easyRetrievalOrganizationResponses: [],
        mainInfo: encryptJson(mainInfo, saltAes, iv),
        salt: crypto.randomBytes(30).toString('base64')
      };
      db.collection("user_profiles").insertOne(profileObj, function (err, updata) {
        if(err) {
          console.log('err while user_profile for ==>', updata.insertedId)
        } else {
          var objectId = require("mongodb").ObjectID;
          var createObj = {
            user: objectId(data.insertedId),
            position: objectId(positionId),
            createdBy: objectId(data.insertedId),
            accessCode: objectId(accessCode),
            reqObj: null,
            accessToken: null,
            tpToken: null,
            tpId: null,
            isLoadTest: true,
            createdAt: new Date(),
            updatedAt: null,
            appliedAt: null,
            deviceInfo: [],
            completedAt: null,
            startedAt: null,
            versant4sWebSourcedID: null,
            versant4sTestInstanceID: null,
            versant4sStatus: null,
            versantWrittenScreenerWebSourcedID: null,
            versantWrittenScreenerTestInstanceID: null,
            versantWrittenScreenerStatus: null,
            versantSpeakingWebSourcedID: null,
            versantSpeakingTestInstanceID: null,
            versantSpeakingStatus: null,
            versantWrittenWebSourcedID: null,
            versantWrittenTestInstanceID: null,
            versantWrittenStatus: null,
            versantWebSourcedID: null,
            versantTestInstanceID: null,
            versantStatus: null,
            shareScores: true,
            isFavorite: false,
            notes: "",
            snapshots: [],
            recordings: [],
            userStatus: [],
            scores: {},
            status: "new",
            session: null,
          };
          // if (post.tpToken && post.tpId) {
          //   createObj.tpToken = post.tpToken;
          //   createObj.tpId = post.tpId;
          //   createObj.reqObj = post.reqObj;
          // }
          db.collection("applications").insertOne(createObj, function (err, appdata) {
            if(err) {
              console.log("error while saving app data ==> ", updata.insertedId)
            }else {
              console.log("successfuly created for ==> ", updata.insertedId)
            }
          })
        }
      });
    }
  })
}