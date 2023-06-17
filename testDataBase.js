/*I broke down and stop learning php. This will have to do instead

This script is the server for this project. It is intended to be run within NodeJS

- Brandt Norwood
*/

const express = require('express');
const http = require('http');

const app = express();

var testTable = [
  ["N76NB", "N510AF"],
  ["N446BY", "N988C", "N71TB", "N101BK"],
  ["N602PM", "N113SW", "N6053S", "N706WL", "N701FJ", "N813KS", "N41XP", "N555DS", "N686PC"],
  ["N700WK", "N303RR", "N525BB", "N524BB", "N773SW", "N604BB", "N6597", "N382CP"],
  ["N791CD","N110CA", "N216N", "N810KS", "N89KT", "N115FJ", "N6342B", "N1231B", "N811KS", "N726KR", "N449BY", "N447BY", "N725LK", "N227PG", "N814KS", "N5226D", "N98MV", "N305KM"],
  ["N701FC", "N232RJ", "N48LT", "N643RT", "N448BY", "N404CM", "N351LS", "N21DP"]
];

// I got most of this off the internet

//slay the god forsaken CORS dragon
//ALL HAIL CHAT GPT for this solution
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//this one is for troubleshooting. Just contact the server in the browser and see if its up
app.get("/", (req,res) => {res.json("Im Awake!" + Date.now()); console.log("Contacted in browser");});
app.use(express.json());


// Handle GET hanger data request
app.get('/hangerData', (req, res) => {

  // Create a JSON object
  const json = {testTable};

  // Respond with the JSON object
  res.json(json);

  console.log(`Server Contacted - ` + Date.now());
});

//handles new data being given to the server from the audit table menu
app.put('/auditData', (req, res) =>{

  var newData = req.body;

  var printData = "";

  for (var i = 0; i < newData.length; i++){
    printData += ("\n[" + newData[i] + "]");
  }

  testTable = newData;

  console.log("Server Given Table! - " + printData)

  res.send("Put request received");
});



// Start the server
const port = 3000; //dont ask just change
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
