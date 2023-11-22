/* Hello! This script is the server for this project. 
It is intended to be run within NodeJS with several dependencies including express

If you've made it here I trust you have some skills. 
This code is poorly documented so if you have any questions contact me at brandtnorwood@gmail.com

I got most of this off the internet - Brandt Norwood
*/

const hangers = ["Ramp","Alpha","Bravo","Charlie","Delta","Echo"];

const express = require('express');
const app = express();
var mysql = require('mysql2');
var fs = require("fs");

var con = mysql.createPool({
  connectionLimit:2,
  host: "localhost",
  user : "hangerLogServer",
  password: "6ceyxhuv",
  database: "FJCHangerLog",
  insecureAuth: true,
  multipleStatements: true
});

let errorState = false;
let retryCount = 0;

/*  This seams weird but it was a cleaver way to prevent the program from crashing if it either comes 
    online before SQL or if SQL drops out for a short time while the server is online. */
function establishConnection() {
  con.getConnection((err, connection) => {
    if (err) {
      if (retryCount < 100) {
        errorState = false;
        retryCount++;
        consoleLog(`(Attempt ${retryCount}) Database connection failed! Retrying in 5 seconds - ` + getTime());
        setTimeout(establishConnection, 5000); // Retry after 5 seconds
      } else {
        console.log(`Maximum retry count reached! Unable to establish database connection. Please Relaunch this Program when SQL Server issue has been resolved`);
      }
      return;
    }
    errorState = true;
    consoleLog('Database connected successfully - ' + getTime());
    connection.release();
  });
}
establishConnection(); //actually run the connection



var fullDebug = true;
var consoleList = new Array();

//get sql formatted datetime (used for debug outputs too)
function getTime(){
  const now = new Date(Date.now());
  const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ');

  return formattedDateTime;
}

//keeps an array for the remote debug console
function consoleLog(output){
  console.log(output);

  if (consoleList.length > 300){
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



//this one is for remote troubleshooting. Just contact the server in the browser on port 3000
app.get("/", (req,res) => {
  //takes the consoleLog array and makes it into a displatable format
  var output = ["Hanger Log Server<br>"];
    if (errorState){output[0] += "----------  Im Awake! - " + getTime() + "  ----------";}
    else {output[0] += "!---------  ERROR STATE! - " + getTime() + "  ---------!";}
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
//Had chatGPT rewrite this to fix a bug with empty hangers lol
app.get('/hangerData', (req, res) => {
  const query = "SELECT TailNumber, HangerID FROM AircraftMovements WHERE BlockOut IS NULL;";
  con.query(query, function (err, result) {
    if (err){res.status(500).send('An Internal Database Error Occurred'); 
      consoleLog("!-Internal SQL Error (Check SQL Server)! (HangerData) - "+getTime()); 
      errorState = false;
      return;
    }

    errorState = true;
    
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

    var maxHangerID = hangers.length;
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
    const json = { sqlTable , hangers};

    consoleLog(`Table Requested - ${getTime()}`);

    // Respond with the JSON object
    res.json(json);
  });
});

//handles the single aircraft add to hanger
app.put('/singleAdd',(req,res) =>{
  //retrive data
  var toHanger = req.body.selectedHanger;
  var newTail = req.body.inputTailValue;

  //adds aircraft to selected hanger in sql table
  var sql = "UPDATE AircraftMovements SET BlockOut = '"+ getTime() +"' WHERE TailNumber = '"+ 
    newTail +"' AND BlockOut IS NULL;";

  con.query(sql, function (err, result) {
    if (err){res.status(500).send('An Internal Database Error Occurred While Updating SQL');
      consoleLog("!-Internal SQL Error (Check SQL Server)! (Add) - "+getTime());
      errorState = false;
      return;
    }

    var sql = "INSERT INTO AircraftMovements (tailnumber, hangerid, blockin) VALUES ('"+ newTail +"', "+toHanger+", '"+ getTime() +"');";
  
    con.query(sql, function (err, result) {
      if (err){res.status(500).send('An Internal Database Error Occurred While Inserting SQL');
        consoleLog("!-Internal SQL Error (Check SQL Server)! (Add) - "+getTime());
        errorState = false;
        return;
      }
    });

  });


  //required to avoid hanging client processes (maybe implement in the future)
  res.send("Put request received");

  //console output
  consoleLog(`(Add/Remove) compleated Add function - `+ getTime());
  if(fullDebug){consoleLog("\t+Added " + newTail + " to hanger " + toHanger);}
});


app.delete('/singleRemove',(req,res) =>{
  //retrive data
  var toHanger = req.body.selectedHanger;
  var newTail = req.body.inputTailValue;

  var sql = "UPDATE AircraftMovements SET BlockOut = '"+ getTime() +"' WHERE TailNumber = '"+ 
    newTail +"' AND BlockOut IS NULL AND HangerID = " + toHanger + ";";

  con.query(sql, function (err, result) {
    if (err){res.status(500).send('An Internal Database Error Occurred While Updating SQL'); 
      consoleLog("!-Internal SQL Error (Check SQL Server)! (Remove) - "+getTime());
      errorState = false;

      //required to avoid hanging client processes (maybe implement in the future)
      res.send("Remove request received");

      return;
    }
  });

  //console output
  consoleLog(`(Add/Remove) compleated Remove function - `+ getTime());
  if(fullDebug){consoleLog("\t-Removed " + newTail + " from hanger " + toHanger);}
});


app.post('/auditData', (req,res) => {

  var newData = req.body;

  var selectHanger = newData.selectedHanger;
  var addList = newData.addList;
  var removeList = newData.removeList;
  var confirmationData = newData.confirmKey;

  //Basiclly just a check digit (for some fun google these numbers ;)
  if (JSON.stringify(confirmationData) === JSON.stringify(["821393","3162010","2272358"])){
    var sql = "";

    //builds the sql query for removing aircraft from other hangers that are being added to this one
    if (addList.length > 0){
      var Updatesql = "UPDATE AircraftMovements SET BlockOut = '" + getTime() + "' WHERE (";
      var tailClauses = addList.map(tail => "TailNumber = '" + tail + "'");
      Updatesql += tailClauses.join(" OR ");
      Updatesql += ") AND BlockOut IS NULL;";

      //builds sql query for adding aircraft
      var Insertsql = "INSERT INTO AircraftMovements (tailnumber, hangerid, blockin) VALUES ";
      tailClauses = addList.map(tail => "('"+ tail + "', " + selectHanger + ", '" + getTime() + "')");
      Insertsql += tailClauses.join(" , ");
      Insertsql += ";"

      sql += Updatesql;
      sql += Insertsql;
    }

    if (removeList.length > 0){
      //builds sql query for removing aircraft
      var Removesql = "UPDATE AircraftMovements SET BlockOut = '" + getTime() + "' WHERE (";
      tailClauses = removeList.map(tail => "TailNumber = '" + tail + "'");
      Removesql += tailClauses.join(" OR ");
      Removesql += ") AND BlockOut IS NULL;";

      sql += Removesql;
    }

    if (sql.length > 0){
      con.query(sql, function (err) {
        if (err){res.status(500).send('An Internal Database Error Occurred While Updating SQL'); 
          consoleLog("!-Internal SQL Error (Check SQL Server)! (Audit) - "+getTime());
          if(fullDebug){consoleLog("\t"+err);consoleLog("\t"+sql);}
          errorState = false;
          return;
        }
        consoleLog("(Audit) Updated Hanger "+selectHanger+" (audit) - " + getTime());

        res.send("audit info received");

        if(fullDebug){    //some console stuff
          for (tail of addList){
            consoleLog("\t+Added " + tail + " to Hanger " + selectHanger);
          }
          for (tail of removeList){
            consoleLog("\t-Removed " + tail + " from Hanger " + selectHanger);
          }
        }
      })
    } else {
      res.send("audit info received (empty)");
      consoleLog("(Audit) Empty update for Hanger "+selectHanger+" (audit) - " + getTime());
    }
  }
  else {
    consoleLog("--Corrupted Audit data received!--");
    res.status(400);
  }
});


//handle the search functionallity
app.post('/search', (req, res) =>{
  var timeSelect = req.body.timeSelect;
  var tailNumber = req.body.tailInput;
  var dateRange = "";

  const now = new Date();
  if(timeSelect == 1){now.setDate(now.getDate() - 7);}//Week
  if(timeSelect == 2){now.setMonth(now.getMonth() - 1);}//Month
  if(timeSelect == 3){now.setMonth(now.getMonth() - 3);}//3 Month
  if(timeSelect == 4){now.setMonth(now.getMonth() - 6);}//6 Month
  if(timeSelect == 5){now.setFullYear(now.getFullYear() - 1);} //Year
  dateRange = now.toISOString().slice(0, 19).replace('T', ' ');

  var sql;

  if (timeSelect == 6){
    sql = "SELECT TailNumber, HangerID, BlockIn, BlockOut FROM AircraftMovements WHERE TailNumber = '"+
      tailNumber+"';"; //you wouldn't beleve the bug I found here
  } else {
    sql = "SELECT TailNumber, HangerID, BlockIn, BlockOut FROM AircraftMovements WHERE TailNumber = '"+
      tailNumber +"' AND BlockIn > '"+ dateRange +"';";
  }

  con.query(sql, function (err, result) {
    if (err){res.status(500).send('An Internal Database Error Occurred'); 
      consoleLog("!-Internal SQL Error (Check SQL Server)! (Search) - "+getTime());
      errorState = false;
      return;
    }
    errorState = true;

    res.send({result , hangers});
  });

  consoleLog("(Search) - " + getTime());
  if (fullDebug){consoleLog("\tTail - '" + tailNumber + "' TimeZone - '"+timeSelect+"'")}
});



//function to tame the async nature of js
function queryHistory(entry) {
  return new Promise((resolve, reject) => {
    const unformatedTime = new Date(entry.BlockOut);
    unformatedTime.setHours(unformatedTime.getHours() - 5);
    dateRange = unformatedTime.toISOString().slice(0, 19).replace('T', ' ');

    sql = `WITH RECURSIVE CTE AS (
      SELECT TailNumber, HangerID, BlockIn, BlockOut 
      FROM AircraftMovements 
      WHERE TailNumber = '${entry.TailNumber}' 
          AND BlockOut BETWEEN DATE_SUB('${dateRange}', INTERVAL 2 HOUR) AND DATE_ADD('${dateRange}', INTERVAL 2 HOUR) 
      UNION ALL 
      SELECT am.TailNumber, am.HangerID, am.BlockIn, am.BlockOut 
      FROM CTE c 
      JOIN AircraftMovements am ON c.TailNumber = am.TailNumber 
      WHERE am.BlockOut BETWEEN DATE_SUB(c.BlockIn, INTERVAL 2 HOUR) AND DATE_ADD(c.BlockIn, INTERVAL 2 HOUR)
        AND am.BlockOut > c.BlockIn -- Additional condition to prevent infinite loops
      ) 
      SELECT * FROM CTE;`;
    con.query(sql, function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

//Handles the billing page
app.post('/billing', (req, res) => {
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;
  var showTennents = req.body.showTennents;

  sql = "SELECT am1.TailNumber, am1.HangerID, am1.BlockIn, am1.BlockOut FROM AircraftMovements AS am1 WHERE" +
    " am1.BlockOut > '" + startDate + "' AND am1.BlockOut < '" + endDate + "'AND NOT EXISTS (SELECT 1 FROM AircraftMovements AS" +
    " am2 WHERE am2.TailNumber = am1.TailNumber AND am2.BlockIn > DATE_SUB(am1.BlockOut, INTERVAL 2 HOUR)AND" +
    " am2.BlockIn < DATE_ADD(am1.BlockOut, INTERVAL 2 HOUR));";

  con.query(sql, function (err, result) {
    if (err) {
      res.status(500).send('An Internal Database Error Occurred');
      consoleLog("!-Internal SQL Error (Check SQL Server)! (BillingReport) - " + getTime());
      errorState = false;
      return;
    }
    errorState = true;

    if (showTennents == false && result.length > 0) {
      fs.readFile('baseTennents.txt', function (err, data) {
        if (err) {
          consoleLog("!-Internal Error (Missing baseTennents File) (BillingReport) - " + getTime());
          console.log(err);
          return;
        }
    
        var baseTennents = data.toString().split("\n");

        var filteredResult = new Array();

        for (entry of result){
          if (!baseTennents.includes(entry.TailNumber)){
              filteredResult.push(entry);
          }
        }

        result = filteredResult;

        Promise.all(result.map(entry => queryHistory(entry)))
        .then(returnedResults => {
          // Convert the array of objects to a 2D array
          const tailRecordsArray = returnedResults.map(results => results.flat());
          res.send({ result: tailRecordsArray , hangers});
        })
        .catch(err => {
          console.error(err);
        });
      });
    } else{

      Promise.all(result.map(entry => queryHistory(entry)))
        .then(returnedResults => {
          // Convert the array of objects to a 2D array
          const tailRecordsArray = returnedResults.map(results => results.flat());
          res.send({ result: tailRecordsArray , hangers});
        })
        .catch(err => {
          console.error(err);
        });
      }
  });

  consoleLog("(Billing) requested - " + getTime());
  if (fullDebug) { consoleLog("\tStartDate=" + startDate + " EndDate=" + endDate + " ShowTennents=" + showTennents); }
});





// Start the server
const port = 3000; //dont ask why just fix it
app.listen(port, () => {
  consoleLog(`Server is running on port ${port} - ` + getTime());
});
