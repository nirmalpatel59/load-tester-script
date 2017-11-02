var mongodb = require("mongodb")
var mongoClient = mongodb.MongoClient;
var db;
mongoClient.connect("mongodb://localhost/ai-enterprise", function (err, dbConnection) {
  db = dbConnection;
  createUser(userObj);
});

var userObj = {
  username: "test123",
  password: "password",
  email: "test333@gmail.com",
  phone: "9898889988",
  createdByAdminUser: '000000000000000000000001',
  isActive: true
};

function createUser(userObj) {
  db.collection("Users").insertOne(userObj, function (err, data) {
    if(err) {
      console.log(err)
    } else {
      console.log("data saved")
    }
  })
}
