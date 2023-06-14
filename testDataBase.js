/*I broke down and stop learning php. This will have to do instead

This script is the server for this project. It is intended to be run within NodeJS

- Brandt Norwood
*/

const express = require('express');
const http = require('http');

const app = express();

const testTable = [
  ["N76NB", "N510AF"],
  ["N446BY", "N988C", "N71TB", "N101BK"],
  ["N602PM", "N113SW", "N6053S", "N706WL", "N701FJ", "N813KS", "N41XP", "N555DS", "N686PC"],
  ["N700WK", "N303RR", "N525BB", "N524BB", "N773SW", "N604BB", "N6597", "N382CP"],
  ["N791CD","N110CA", "N216N", "N810KS", "N89KT", "N115FJ", "N6342B", "N1231B", "N811KS", "N726KR", "N449BY", "N447BY", "N725LK", "N227PG", "N814KS", "N5226D", "N98MV", "N305KM"],
  ["N701FC", "N232RJ", "N48LT", "N643RT", "N448BY", "N404CM", "N351LS", "N21DP"]
];

// I got this off the internet
// Handle GET request
app.get('/api/data', (req, res) => {
  //f**k CORS (For now)
  res.set('Access-Control-Allow-Origin', '*');

  // Create a JSON object
  const json = {testTable};

  // Respond with the JSON object
  res.json(json);
  console.log(`Server Contacted - ` + Date.now());
});


// Start the server
const port = 3000; //dont ask just change
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
