//change these two as needed
const Url = "http://localhost:3000/" //this will be the data base till i get my shit together
const hangers = ["Ramp","Alpha","Bravo","Charlie","Delta","Echo"]; //when the jet center gets more hangers change this line


//This is for populating the Hanger selection menu in the Audit page
function textBoxListener(){
    var textBox = document.getElementById("tailInput");

    textBox.addEventListener("keydown", function(e){
        if (e.code == "Enter"){}
    });
}


//Populates the Hanger Select menu from the hangers constant
function selectMenu(){
    var hangerMenu = document.getElementById("hangerSelect");

    for (var i=1; i < hangers.length; i++){
        hangerMenu.options[hangerMenu.options.length] = new Option(hangers[i]);
    }

    hangerMenu.onchange = function(){buildTable();}
}


//hanndles the add button
function addAircraft(){
    //defining elements and retreiving input data
    var hangerSelect = document.getElementById("hangerSelect");
    var inputTail = document.getElementById("tailInput");
    var inputTailValue = document.getElementById("tailInput").value.trim().toUpperCase();

    if (inputTailValue != "N" && inputTailValue != ""){

        //finds and sets selected hanger
        var selectedHanger = 0;
        for (var i=0; i < hangers.length; i++){
            if (hangers[i] == hangerSelect.value){
                selectedHanger = i;
            }
        }

        //sends selected hanger and tail to server to be added
        var sendData = [selectedHanger,inputTailValue];
        fetch(Url + "singleAdd", {
            method: "PUT", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(sendData)
        })
        .then(() => {
            buildTable(); //refreshes table
        });
    }
    inputTail.value = "N"; //clears input box
}


function removeAircraft(){
    //defining elements and retreiving input data
    var hangerSelect = document.getElementById("hangerSelect");
    var inputTail = document.getElementById("tailInput");
    var inputTailValue = document.getElementById("tailInput").value.trim().toUpperCase();

    if (inputTailValue != "N" && inputTailValue != ""){

        //finds and sets selected hanger
        var selectedHanger = 0;
        for (var i=0; i < hangers.length; i++){
            if (hangers[i] == hangerSelect.value){
                selectedHanger = i;
            }
        }

        //sends selected hanger and tail to server to be added
        var sendData = [selectedHanger,inputTailValue];
        fetch(Url + "singleRemove", {
            method: "DELETE", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(sendData)
        })
        .then(() => {
            buildTable(); //refreshes table
        });
    }
    inputTail.value = "N"; //clears input box
}

//Defines the Left side audit table
function buildTable(){
    fetch(Url+"hangerData")
    .then(function(response){
        if(response.ok){
            return response.json();
        }
        throw new Error('"fetch" threw Json Formating error - ' + response.status + ' ' + response.statusText);
    })
    .then(function(data){
        //seperate the table from the JSON object
        tableData = data.testTable;
        hangerSelect = document.getElementById("hangerSelect");
        outputTable = document.getElementById("auditTable");

        outputTable.replaceChildren();

        var selectedHanger = 0;

        for (var i=0; i < hangers.length; i++){
            if (hangers[i] == hangerSelect.value){
                selectedHanger = i;
            }
        }

        //create the html objects for the table
        var table = document.createElement('ol');

        tableData[selectedHanger].forEach(element => {
            var cell = document.createElement('ul');
            cell.appendChild(document.createTextNode(element))

            table.appendChild(cell);
        });
    
        table.setAttribute("id","list")
        outputTable.appendChild(table);     

      })
      .catch(function(error) {
        // Handle any errors that occurred during the request
        console.log(error)
      });
}