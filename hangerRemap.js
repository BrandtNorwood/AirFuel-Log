/*  Developed Because FJC decided to flip hangers from east->west to west->east
    Developed on Nov 30th 2023 by Brandt Norwood (on my last week lol)


    Position of in array defines what should be replaced by what
    For example [1,0,3,2] would turn 0s into 1s, 1s into 0s, 2s into 3s, and 3s into 2s*/
const renameMatrix= [0,1,2,3,4,5] //Currently won't make changes (defaults)



//start of code here
var mysql = require('mysql2')

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
    });

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "6ceyxhuv",
    database: "FJCHangerLog",
    insecureAuth: true
});

console.log("Hanger ID Remaping tool for FJC Hanger Log -- made by Brandt Norwood \n")
console.log("It is recomended that you confirm a backup is avalible before running this script\n\n")

//check rename matrix
if (renameMatrix.length == 0){throw Error(`EXIT CODE 11 - RENAME MATRIX IS IMPROPERLY DEFINED`,{cause:`The 'renameMatrix' object should have a length of 1 or more but found ${renameMatrix.length}`})};
for (element of renameMatrix){
    if (!(typeof element === 'number')){
        throw Error(`EXIT CODE 12 - RENAME MATRIX IS IMPROPERLY DEFINED`,{cause:`'renameMatrix' should only include numbers but found ${element}`});
    }
}

//connect to server and grab entire database
con.connect(function(err) {
    var aircraft =  new Array();
    const query = "SELECT `Index`, TailNumber, HangerID FROM aircraftmovements;";
    con.query(query, function (err, result) {
      if (err) throw err;
        aircraft = result;

        //thow error if nothing was returned
        if (result.length == 0){throw Error(`ERROR 20 - Query Result Length was 0`)}
        for (entry of result){
            if (entry.HangerID > renameMatrix.length || entry.HangerID < 0 || entry.HangerID == null){
                throw Error(`EXIT CODE 21 - RESULTS ARE NOT COMPATIBLE WITH REMAPING`,{cause:`rename Matrix only contains entries up till ${renameMatrix.length-1} however entry (${entry.Index}) contained ${entry.HangerID}`});
            }
        }

        console.log(result.length + " entries ready!\n");

        //display the renameMatrix
        console.log("Rename mappings are");
        for (i = 0; i < renameMatrix.length; i++){
            console.log(i + '->' + renameMatrix[i])
        } console.log(); //newline

        var changeCounter = 0
        for (entry of result){
            if (renameMatrix[entry.HangerID] != entry.HangerID){
                changeCounter++;
            }
        }

        console.log("Program will make " + changeCounter + " changes")

        //ask user y/n
        readline.question('Continue with Opperation? (y/n)', answer => {
            if (answer.toUpperCase().trim() == "Y"){doOperation(result);}
            else if (answer.toUpperCase().trim() == "N"){console.log("Exiting Program");process.exit();}
            readline.close();
          });
    });
});

//function to actualy compleate operation
function doOperation(result){
    var changeCounter = 0;
    var compleatedChanges = 0;

    console.log("Starting Operation! \n");

    //loop through results (async i think)
    for (entry of result){
        if (renameMatrix[entry.HangerID] != entry.HangerID){    //Check if operation is actually needed
            changeCounter++;

            con.connect(function(err){
                if (err) console.log(err);
                const query = `UPDATE AircraftMovements SET HangerID = ${renameMatrix[entry.HangerID]} WHERE \`Index\` = ${entry.Index}`;
                con.query(query,function(err){
                    if (err){console.log("ERROR UPDATING " + entry.Index + "\n" + err);}

                    consoleLog = `Changed entry ${entry.Index} from HangerID ${entry.HangerID} to `;
                    entry.HangerID = renameMatrix[entry.HangerID];
                    console.log(consoleLog + entry.HangerID);
                    compleatedChanges++;
                });
            });
        }   
    }

    console.log(`Making ${changeCounter} Changes!`)

    //Jank but simple way of waiting for changes to be compleated and then exiting the program
    function endProgram(){
        if (changeCounter == compleatedChanges){
            console.log("\n" + changeCounter + " Changes Were Made!")
            console.log("Exiting program...")

            process.exit();
        }
        setTimeout(endProgram,1000);
    }
    endProgram();
}