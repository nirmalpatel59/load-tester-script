var mongodb = require("mongodb")
var mongoClient = mongodb.MongoClient;
var db;
mongoClient.connect("mongodb://localhost/ai-load-tester", function (err, dbConnection) {
  db = dbConnection;
  var myquery = { "isLoadTest" : true };
  deleteUser(myquery);
});


function deleteUser(myquery) {     
  db.collection("users").deleteMany(myquery, function (err, data) {
    if(err) {
      console.log(err)
    } else {
      console.log("Email deleted")
    }
  })
}
