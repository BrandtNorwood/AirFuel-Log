/*I broke down and stop learning php. This will have to do instead

This script is the server for this project. It is intended to be run within NodeJS

I got most of this off the internet - Brandt Norwood
*/


const express = require('express');
var mysql = require('mysql2');
const app = express();

/*var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "6ceyxhuv",
  database: "FJCHangerLog",
  insecureAuth: true 
});*/

var con = mysql.createPool({
  connectionLimit:2,
  host: "localhost",
  user: "root",
  password: "6ceyxhuv",
  database: "FJCHangerLog",
  insecureAuth: true
});

con.getConnection((err,connection)=> {
  if(err){consoleLog("Database connection failed!"); throw err;}
  consoleLog('Database connected successfully');
  connection.release();
});

var fullDebug = true;
var consoleList = new Array();

//get sql formatted datetime (used for debug too)
function getTime(){
  const now = new Date(Date.now());
  const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ');

  return formattedDateTime;
}

//keeps an array for the remote debug console
function consoleLog(output){
  console.log(output);

  if (consoleList.length > 100){
    consoleList.splice(0);
  }
  consoleList.push(output);
}

//slay the god forsaken CORS dragon
//ALL HAIL CHAT GPT for this solution
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//this one is for troubleshooting. Just contact the server in the browser on port 3000
app.get("/", (req,res) => {
  //consoleLog("Contacted in browser - "+ getTime());       Don't think i need this for now

  //takes the consoleLog array and makes it into a displatable format
  var output = ["Hanger Log Server<br>----------  Im Awake! - " + getTime() + "  ----------"];
  for (entry of consoleList){
    output.push("\n" + entry.replace('\t','&emsp;'));
  }
  var outputString = output.join('<br>');

  res.send(outputString);
});
app.use(express.json());

//toggles the debug feature if you go to - host:3000/toggleDebug
app.get("/toggleDebug", (req,res) => {
  fullDebug = !fullDebug;
  res.json("Toggled Debug to " + fullDebug)
  consoleLog("Debug toggled to - " + fullDebug + " - " + getTime());
})


//Handle GET hanger data request
//Had chat GPT rewrite this to fix a bug with empty hangers
app.get('/hangerData', (req, res) => {
  const query = "SELECT TailNumber, HangerID FROM AircraftMovements WHERE BlockOut IS NULL;";
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

    consoleLog(`Server Table Requested - ${getTime()}`);

    // Respond with the JSON object
    res.json(json);
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
  var sql = "UPDATE AircraftMovements SET BlockOut = '"+ getTime() +"' WHERE TailNumber = '"+ 
    newTail +"' AND BlockOut IS NULL";

  con.query(sql, function (err, result) {
    if (err) throw err;

    var sql = "INSERT INTO AircraftMovements (tailnumber, hangerid, blockin) VALUES ('"+ newTail +"', "+toHanger+", '"+ getTime() +"')";
  
    con.query(sql, function (err, result) {
      if (err) throw err;
    });

  });


  //required to avoid hanging client processes (maybe implement in the future)
  res.send("Put request received");

  //console output
  consoleLog(`Server compleated Add function - `+ getTime());
  if(fullDebug){consoleLog("\t-Server added " + newTail + " to hanger " + toHanger);}
});


app.delete('/singleRemove',(req,res) =>{
  //retrive data
  var newData = req.body;

  //parces data (this is hard coded but it shouldnt cause problems)
  var toHanger = newData[0];
  var newTail = newData[1];

  var sql = "UPDATE AircraftMovements SET BlockOut = '"+ getTime() +"' WHERE TailNumber = '"+ 
    newTail +"' AND BlockOut IS NULL AND HangerID = " + toHanger;

  con.query(sql, function (err, result) {
    if (err) throw err;
  });

  //required to avoid hanging client processes (maybe implement in the future)
  res.send("Remove request received");

  //console output
  consoleLog(`Server compleated Remove function - `+ getTime());
  if(fullDebug){consoleLog("\t-Server removed " + newTail + " from hanger " + toHanger);}

});


//handles new data being given to the server from the audit table menu
app.post('/auditData', (req, res) =>{

  var newData = req.body;

  //retrive data
  var selectHanger = newData.selectedHanger;
  var addList = newData.addList;
  var removeList = newData.removeList;
  var confirmationData = newData.confirmKey;

  consoleLog("Server Table Updated (audit) - " + getTime());

  if (JSON.stringify(confirmationData) === JSON.stringify(["821393","3162010","2272358"])){

    //builds the sql query for removing aircraft from other hangers that are being added to this one
    if (addList.length > 0){
      var Updatesql = "UPDATE AircraftMovements SET BlockOut = '" + getTime() + "' WHERE ";
      var tailClauses = addList.map(tail => "TailNumber = '" + tail + "'");
      Updatesql += tailClauses.join(" OR ");
      Updatesql += " AND BlockOut IS NULL";

      //builds sql query for adding aircraft
      var Insertsql = "INSERT INTO AircraftMovements (tailnumber, hangerid, blockin) VALUES ";
      tailClauses = addList.map(tail => "('"+ tail + "', " + selectHanger + ", '" + getTime() + "')");
      Insertsql += tailClauses.join(" , ");
    }

    if (removeList.length > 0){
      //builds sql query for removing aircraft
      var Removesql = "UPDATE AircraftMovements SET BlockOut = '" + getTime() + "' WHERE ";
      tailClauses = removeList.map(tail => "TailNumber = '" + tail + "'");
      Removesql += tailClauses.join(" OR ");
      Removesql += " AND BlockOut IS NULL";
    }

    //does the actual query
    if (Updatesql != null && Insertsql != null){
      con.query(Updatesql, function (err) {
        if (err) throw err;
        con.query(Insertsql, function(err){
          if (err) throw err;

          if(fullDebug){    //some console stuff
            for (tail of addList){
              consoleLog("\tAdded " + tail + " to Hanger " + selectHanger);
            }
          }
          if (Removesql != null){   //remove query
            con.query(Removesql, function(err){
              if (err) throw err;

              if(fullDebug){    //some console stuff
                for (tail of removeList){
                  consoleLog("\t-Removed " + tail + " from Hanger " + selectHanger);
                }
              }
            })
          }
        })
      });
    } else if (Removesql != null){  //remove query if add list is empty
      con.query(Removesql, function(err){
        if (err) throw err;

        if(fullDebug){    //some console stuff
          for (tail of removeList){
            consoleLog("\t-Removed " + tail + " from Hanger " + selectHanger);
          }
        }
      });
    }
  }else {
    consoleLog("bad Audit data received!");
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
  var sql;

  if (timeSelect == 6){
    sql = "SELECT TailNumber, HangerID, BlockIn, BlockOut FROM AircraftMovements WHERE TailNumber = '"+
      tailNumber+"'"; //you wouldn't beleve the bug I found here
  } else {
    sql = "SELECT TailNumber, HangerID, BlockIn, BlockOut FROM AircraftMovements WHERE TailNumber = '"+
      tailNumber +"' AND BlockIn > '"+ dateRange +"'";
  }

  con.query(sql, function (err, result) {
    if (err) throw err;

    res.send({result});
  });

  consoleLog("Server asked for search results - " + getTime());
  if (fullDebug){consoleLog("\tTail - '" + tailNumber + "' TimeZone - '"+timeSelect+"'")}
});

function queryHistory(entry) {
  return new Promise((resolve, reject) => {
    var newArray = new Array();

    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    dateRange = now.toISOString().slice(0, 19).replace('T', ' ');
    sql = "SELECT TailNumber, HangerID, BlockIn, BlockOut FROM AircraftMovements WHERE TailNumber = '" +
      entry.TailNumber + "' AND BlockIn > '" + dateRange + "'";

    con.query(sql, function (err, results) {
      if (err) {
        reject(err);
      } else {
        for (result of results) {
          newArray.push(result);
        }
        resolve(newArray);
      }
    });
  });
}

app.post('/billing', (req, res) => {
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;
  var showTennents = req.body.showTennents;

  sql = "SELECT am1.TailNumber, am1.HangerID, am1.BlockIn, am1.BlockOut FROM AircraftMovements AS am1 WHERE" +
    " am1.BlockOut > '" + startDate + "' AND am1.BlockOut < '" + endDate + "'AND NOT EXISTS (SELECT 1 FROM AircraftMovements AS" +
    " am2 WHERE am2.TailNumber = am1.TailNumber AND am2.BlockIn > DATE_SUB(am1.BlockOut, INTERVAL 2 HOUR)AND" +
    " am2.BlockIn < DATE_ADD(am1.BlockOut, INTERVAL 2 HOUR))";

  con.query(sql, function (err, result) {
    if (err) throw err;

    var promises = result.map(entry => queryHistory(entry));

    Promise.all(promises)
      .then(returnedResults => {
        res.send({ result: returnedResults });
      })
      .catch(err => {
        // Handle any error that occurred during the queries
        console.error(err);
        res.status(500).send('An error occurred');
      });
  });

  consoleLog("Billing results requested - " + getTime());
  if (fullDebug) { consoleLog("\tStartDate=" + startDate + " EndDate=" + endDate + " ShowTennents=" + showTennents); }
});


// Start the server
const port = 3000; //dont ask why just fix it
app.listen(port, () => {
  consoleLog(`Server is running on port ${port}`);
});
