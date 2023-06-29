/*I broke down and stop learning php. This will have to do instead

This script is the server for this project. It is intended to be run within NodeJS

I got most of this off the internet - Brandt Norwood
*/


const express = require('express');
var mysql = require('mysql2');
const app = express();

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "6ceyxhuv",
  database: "FJCHangerLog",
  insecureAuth: true
});

var fullDebug = true;

//get sql formatted datetime (used for debug too)
function getTime(){
  const now = new Date(Date.now());
  const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ');

  return formattedDateTime;
}

//slay the god forsaken CORS dragon
//ALL HAIL CHAT GPT for this solution
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//this one is for troubleshooting. Just contact the server in the browser and see if its up
app.get("/", (req,res) => {res.json("Im Awake! - " + getTime()); console.log("Contacted in browser - "+ getTime());});
app.use(express.json());

app.get("/toggleDebug", (req,res) => {
  fullDebug = !fullDebug;
  res.json("Toggled Debug to " + fullDebug)
  console.log("Debug toggled to - " + fullDebug + " - " + getTime());
})


// Handle GET hanger data request
//Had chat GPT rewrite this to fix a bug with empty hangers
app.get('/hangerData', (req, res) => {
  con.connect(function(err) {
    const query = "SELECT TailNumber, HangerID FROM aircraftmovements WHERE BlockOut IS NULL;";
    con.query(query, function (err, result) {
      if (err) throw err;
      
      var tailNumbersByHanger = {};

      for (var i = 0; i < result.length; i++) {
        var aircraft = result[i];
        var tailNumber = aircraft.TailNumber;
        var hangerID = aircraft.HangerID;

        if (!tailNumbersByHanger[hangerID]) {
          tailNumbersByHanger[hangerID] = [tailNumber];
        } else {
          tailNumbersByHanger[hangerID].push(tailNumber);
        }
      }

      var maxHangerID = Math.max(...Object.keys(tailNumbersByHanger));
      var sqlTable = [];

      // Build the 2D array
      for (var j = 0; j <= maxHangerID; j++) {
        if (tailNumbersByHanger[j]) {
          sqlTable.push(tailNumbersByHanger[j]);
        } else {
          sqlTable.push([]);
        }
      }

      // Sort tail numbers within each hanger
      for (var k = 0; k < sqlTable.length; k++) {
        sqlTable[k].sort();
      }

      // Create a JSON object
      const json = { sqlTable };

      console.log(`Server Table Requested - ${getTime()}`);

      // Respond with the JSON object
      res.json(json);
    });
  });
});

//handles the single aircraft add to hanger
app.put('/singleAdd',(req,res) =>{
  //retrive data
  var newData = req.body;

  //parces data (this is hard coded but it shouldnt cause problems)
  var toHanger = newData[0];
  var newTail = newData[1];

  //adds aircraft to selected hanger in sql table
  con.connect(function(err) {
    if (err) throw err;

    var sql = "INSERT INTO aircraftmovements (tailnumber, hangerid, blockin) VALUES ('"+ newTail +"', "+toHanger+", '"+ getTime() +"')";
    
    con.query(sql, function (err, result) {
      if (err) throw err;
    });
  });


  //required to avoid hanging client processes (maybe implement in the future)
  res.send("Put request received");

  //console output
  console.log(`Server compleated Add function - `+ getTime());
  if(fullDebug){console.log("\tServer added " + newTail + " to hanger " + toHanger);}
});


app.delete('/singleRemove',(req,res) =>{
  //retrive data
  var newData = req.body;

  //parces data (this is hard coded but it shouldnt cause problems)
  var toHanger = newData[0];
  var newTail = newData[1];

  con.connect(function(err) {
    if (err) throw err;

    var sql = "UPDATE aircraftmovements SET BlockOut = '"+ getTime() +"' WHERE TailNumber = '"+ 
      newTail +"' AND BlockOut IS NULL AND HangerID = " + toHanger;

    con.query(sql, function (err, result) {
      if (err) throw err;
    });
  });

  //required to avoid hanging client processes (maybe implement in the future)
  res.send("Remove request received");

  //console output
  console.log(`Server compleated Remove function - `+ getTime());
  if(fullDebug){console.log("\tServer removed " + newTail + " from hanger " + toHanger);}

});


//handles new data being given to the server from the audit table menu
app.post('/auditData', (req, res) =>{

  var newData = req.body;

  //retrive data
  var selectHanger = newData[0];
  var addList = newData[1];
  var removeList = newData[2];

  console.log("Server Table Updated (audit) - " + getTime());

  for (tail of addList){
    if (fullDebug){console.log("\tAdded '" + tail + "' to hanger " + selectHanger);}

    //adds aircraft to selected hanger in sql table
    con.connect(function(err) {
      if (err) throw err;

      var sql = "INSERT INTO aircraftmovements (tailnumber, hangerid, blockin) VALUES ('"+ tail +"', "+selectHanger+", '"+ getTime() +"')";
      
      con.query(sql, function (err, result) {
        if (err) throw err;
      });
    });
  }

  for (tail of removeList){
    if (fullDebug){console.log("\tRemoved '" + tail + "' from hanger " + selectHanger);}

    con.connect(function(err) {
      if (err) throw err;
  
      var sql = "UPDATE aircraftmovements SET BlockOut = '"+ getTime() +"' WHERE TailNumber = '"+ 
        tail +"' AND BlockOut IS NULL AND HangerID = " + selectHanger;
  
      con.query(sql, function (err, result) {
        if (err) throw err;
      });
    });
  }


  //prevents hanging processes
  res.send("audit info received");
});


//handle the search functionallity
app.post('/search', (req, res) =>{
  var timeSelect = req.body.timeSelect;
  var tailNumber = req.body.tailInput;
  var dateRange = "";

  if(timeSelect == 1){//Week
    const now = new Date();
    now.setDate(now.getDate() - 7);
    dateRange = now.toISOString().slice(0, 19).replace('T', ' ');
  }
  if(timeSelect == 2){//Month
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    dateRange = now.toISOString().slice(0, 19).replace('T', ' ');
  }
  if(timeSelect == 3){//3 Month
    const now = new Date();
    now.setMonth(now.getMonth() - 3);
    dateRange = now.toISOString().slice(0, 19).replace('T', ' ');
  }
  if(timeSelect == 4){//6 Month
    const now = new Date();
    now.setMonth(now.getMonth() - 6);
    dateRange = now.toISOString().slice(0, 19).replace('T', ' ');
  }
  if(timeSelect == 5){//Year
    const now = new Date();
    now.setFullYear(now.getFullYear() - 1);
    dateRange = now.toISOString().slice(0, 19).replace('T', ' ');
  }

  con.connect(function(err){
    if (err) throw err;

    var sql;

    if (timeSelect == 6){
      sql = "SELECT TailNumber, HangerID, BlockIn, BlockOut FROM aircraftmovements WHERE TailNumber = '"+
        tailNumber+"'"; //you wouldn't beleve the bug I found here
    } else {
      sql = "SELECT TailNumber, HangerID, BlockIn, BlockOut FROM aircraftmovements WHERE TailNumber = '"+
        tailNumber +"' AND BlockIn > '"+ dateRange +"'";
    }

    con.query(sql, function (err, result) {
      if (err) throw err;

      res.send({result});
    });
  });

  console.log("Server asked for search results - " + getTime());
  if (fullDebug){console.log("Tail - '" + tailNumber + "' TimeZone - '"+timeSelect+"'")}
});


app.post('/billing', (req, res) =>{
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;
  var showTennents = req.body.showTennents;

  con.connect(function(err){
    if (err) throw err;

    sql = "SELECT am1.TailNumber, am1.HangerID, am1.BlockIn, am1.BlockOut FROM aircraftmovements AS am1 WHERE"+
    " am1.BlockOut > '"+ startDate +"' AND am1.BlockOut < '"+ endDate +"'AND NOT EXISTS (SELECT 1 FROM aircraftmovements AS"+
    " am2 WHERE am2.TailNumber = am1.TailNumber AND am2.BlockIn > DATE_SUB(am1.BlockOut, INTERVAL 2 HOUR)AND"+
    " am2.BlockIn < DATE_ADD(am1.BlockOut, INTERVAL 2 HOUR))";

    con.query(sql, function (err, result) {
      if (err) throw err;

      console.log(result);
    });
  });





  /* psudocode

    for aircraft of leftAircraft
      check if returned values have been blocked back in within an two hours of blockout time
        if aircraft has blocked back in remove it from the list

      //retrieve the history of the aircraft
      while sql finds another entry
        ask sql to find blockOut times within two hours of current oldest blockIn time
          if another is returned add it to the history, set it as the oldest blockIn time, and loop again

    return the results
  */


  //this is temporary because i needed to build the client side first
  var results = [
    [
      {"TailNumber": "N115FJ","HangerID": 2,"BlockIn": "2023-06-23T02:33:48.000Z","BlockOut": "2023-06-24T06:04:01.000Z"},
      {"TailNumber": "N115FJ","HangerID": 4,"BlockIn": "2023-06-24T06:09:01.000Z","BlockOut": "2023-06-25T08:34:33.000Z"},
      {"TailNumber": "N115FJ","HangerID": 2,"BlockIn": "2023-06-25T07:00:32.000Z","BlockOut": "2023-06-27T08:59:44.000Z"},
      {"TailNumber": "N115FJ", "HangerID": 4,"BlockIn": "2023-06-27T09:04:31.000Z","BlockOut": "2023-06-28T08:59:44.000Z"}
    ],
    [
      {"TailNumber": "N1231B","HangerID": 0,"BlockIn": "2023-06-23T02:33:48.000Z","BlockOut": "2023-06-23T10:37:41.000Z"},
      {"TailNumber": "N1231B","HangerID": 4,"BlockIn": "2023-06-23T10:38:19.000Z","BlockOut": "2023-06-23T10:52:15.000Z"},
      {"TailNumber": "N1231B","HangerID": 0,"BlockIn": "2023-06-23T10:52:31.000Z","BlockOut": "2023-06-28T10:52:15.000Z"}
    ]
  ];

  res.send({results});

  console.log("Billing results requested - " + getTime());
  if (fullDebug){console.log("\tStartDate="+startDate +" EndDate="+ endDate +" ShowTennents="+ showTennents);}
});


// Start the server
const port = 3000; //dont ask why just fix it
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
