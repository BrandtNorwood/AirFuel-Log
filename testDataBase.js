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

/*this better not be in prod
Old table
var testTable = [
  ["N76NB", "N510AF"],
  ["N446BY", "N988C", "N71TB", "N101BK"],
  ["N602PM", "N113SW", "N6053S", "N706WL", "N701FJ", "N813KS", "N41XP", "N555DS", "N686PC"],
  ["N700WK", "N303RR", "N525BB", "N524BB", "N773SW", "N604BB", "N6597", "N382CP"],
  ["N791CD","N110CA", "N216N", "N810KS", "N89KT", "N115FJ", "N6342B", "N1231B", "N811KS", "N726KR", "N449BY", "N447BY", "N725LK", "N227PG", "N814KS", "N5226D", "N98MV", "N305KM"],
  ["N701FC", "N232RJ", "N48LT", "N643RT", "N448BY", "N404CM", "N351LS", "N21DP"]
];

var testTable = [
  ['N8858Z'],
  ['N101BK','N446BY','N510AF','N555DS'],
  ['N41XP','N529AB','N602FJ','N6053S','N701FJ','N773SW','N810KS','N811KS','N813KS','N814KS','N98MV'],
  ['N113SW','N115FJ','N250AW','N303RR','N521BB','N604BB','N6342B','N700WK','N701FC','N706WL','N79SG','N817PA','N871RF'],
  ['N1231B','N305KM','N382CP','N447BY','N449BY','N5226D','N5256S','N726KR','N770LE','N791CD'],
  ['N110CA','N232RJ','N269LS','N351LS','N404CM','N448BY','N48LT','N524BB','N643RT','N686PC']
];

var testTable = [
  ['N115FJ','N444AM','N6342B','N709EA','N895CA','N995KT'],
  ['N101BK','N446BY','N5256S','N555DS','N83CC'],
  ['N113SW','N41XP','N584ST','N602FJ','N6053S','N686PC','N701FJ','N79SG','N814KS','N98MV'],
  ['N269LS','N303RR','N525BB','N550LG','N604BB','N643RT','N700WK','N701FC','N706WL','N810KS','N813KS','N871RF'],
  ['N1231B','N1RF','N216N','N227PG','N305KM','N382CP','N447BY','N449BY','N521BB','N725LK','N726KR','N791CD','N811KS','N817PA'],
  ['N110CA','N232RJ','N351LS','N404CM','N448BY','N48LT','N524BB','N189VT','N26QL','N510AF','N773SW']
];*/

var testTable = [
  ['N521QS','N6342B'],
  ['N101BK','N446BY','N5256S','N555DS','N83CC'],
  ['N113SW','N115FJ','N41XP','N5226D','N602FJ','N6053S','N686PC','N701FJ','N79SG','N98MV'],
  ['N303RR','N521BB','N525BB','N604BB','N700WK','N701FC','N706WL','N770LE','N810KS','N811KS','N813KS','N817PA','N871RF'],
  ['N1231B','N216N','N227PG','N305KM','N382CP','N447BY','N449BY','N510AF','N550LG','N725LK','N726KR','N791CD','N895CA','N918SA'],
  ['N110CA','N232RJ','N26QL','N351LS','N404CM','N448BY','N48LT','N524BB','N773SW','N643RT']
];

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

      var sqlTable = Object.values(tailNumbersByHanger);

      // Sort tail numbers within each hanger
      for (var j = 0; j < sqlTable.length; j++) {
        sqlTable[j].sort();
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
    console.log("Connected!");

    var sql = "INSERT INTO aircraftmovements (tailnumber, hangerid, blockin) VALUES ('"+ newTail +"', "+toHanger+", '"+ getTime() +"')";
    
    con.query(sql, function (err, result) {
      if (err) throw err;
    });
  });


  //required to avoid hanging client processes (maybe implement in the future)
  res.send("Put request received");

  //console output
  console.log(`Server compleated Add function - `+ getTime());
  if(fullDebug){console.log("Server added " + newTail + " to hanger " + toHanger);}
});


app.delete('/singleRemove',(req,res) =>{
  //retrive data
  var newData = req.body;

  //parces data (this is hard coded but it shouldnt cause problems)
  var toHanger = newData[0];
  var newTail = newData[1];

  con.connect(function(err) {
    if (err) throw err;

    var sql = "UPDATE aircraftmovements SET BlockOut = '"+ getTime() +"' WHERE TailNumber = '"+ newTail +"' AND BlockOut IS NULL AND HangerID = " + toHanger;

    con.query(sql, function (err, result) {
      if (err) throw err;
    });
  });

  testTable[toHanger].splice(testTable[toHanger].indexOf(newTail),1);

  //required to avoid hanging client processes (maybe implement in the future)
  res.send("Remove request received");

  //console output
  console.log(`Server compleated Remove function - `+ getTime());
  if(fullDebug){console.log("Server removed " + newTail + " from hanger " + toHanger);}

});


//handles new data being given to the server from the audit table menu
app.post('/auditData', (req, res) =>{

  var newData = req.body;

  //retrive data
  var selectHanger = newData[0];
  var addList = newData[1];
  var removeList = newData[2];

  //TODO perform functions on hanger

  console.log("Server Table Updated - " + getTime());

  /*debuggin!
  if (fullDebug){
    var printData = "";
    for (hanger of testTable){

      printData += ("['");

      for (plane of hanger){
        printData += (plane + "','");
      }

      printData += ("'],\n")
    }
    console.log(printData)
  }*/

  //this is required to avoid hanging processes on client side
  res.send("POST request received");
});



// Start the server
const port = 3000; //dont ask why just fix it
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
