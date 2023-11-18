//change these two as needed
const Url = 'http://'+ window.location.host + ':3000/';//this is the server root url (extensions will be added by other scripts)
var hangers = []; //when the jet center gets more hangers change this line

//This is for populating the Hanger selection menu in the Audit page
function textBoxListener(){
    var textBox = document.getElementById("tailInput");

    textBox.addEventListener("keydown", function(e){
        if (e.code == "Enter"){}
    });
}


//Populates the Hanger Select menu from the hangers constant
function selectMenu(){
    fetch(Url+"hangerData")
    .then(function(response){
        if(response.ok){
            return response.json();
        }
        throw new Error('"fetch" threw Json Formating error - ' + response.status + ' ' + response.statusText);
    })
    .then(function(data){
        hangers = data.hangers;

        var hangerMenu = document.getElementById("hangerSelect");

        for (var i=1; i < hangers.length; i++){
            hangerMenu.options[hangerMenu.options.length] = new Option(hangers[i]);
        }
        hangerMenu.onchange = function(){buildTable();}
    })
    .catch(function(err){
        var outputFeild = document.getElementById("auditTable");

        outputFeild.replaceChildren();
        outputFeild.appendChild(document.createTextNode(err));
    });
}


//get all tail numbers in the left column
//this works in a stupid and rediculous way but... It does work!
function getAllList(){
    currentHTMLList = document.getElementsByClassName("list");
    var currentList = new Array();

    for(element of currentHTMLList){
        currentList.push(element.innerText);
    }

    return currentList;
}


//hanndles the add button
function addAircraft(){
    //defining elements and retreiving input data
    var hangerSelect = document.getElementById("hangerSelect");
    var inputTail = document.getElementById("tailInput");
    var inputTailValue = document.getElementById("tailInput").value.trim().toUpperCase();

    var valueOnTable = false;

    for (item of getAllList()){
        if (item == inputTailValue) {valueOnTable = true;}
    }

    if (inputTailValue != "N" && inputTailValue != "" && !valueOnTable){

        //finds and sets selected hanger
        var selectedHanger = 0;
        for (var i=0; i < hangers.length; i++){
            if (hangers[i] == hangerSelect.value){
                selectedHanger = i;
            }
        }

        //sends selected hanger and tail to server to be added
        fetch(Url + "singleAdd", {
            method: "PUT", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({selectedHanger,inputTailValue})
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

    var valueOnTable = false;

    for (item of getAllList()){
        if (item == inputTailValue) {valueOnTable = true;}
    }

    if (inputTailValue != "N" && inputTailValue != "" && valueOnTable){

        //finds and sets selected hanger
        var selectedHanger = 0;
        for (var i=0; i < hangers.length; i++){
            if (hangers[i] == hangerSelect.value){
                selectedHanger = i;
            }
        }

        //sends selected hanger and tail to server to be added
        //var sendData = {selectedHanger,inputTailValue};
        fetch(Url + "singleRemove", {
            method: "DELETE", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({selectedHanger, inputTailValue})
        })
        .then(() => {
            buildTable(); //refreshes table
        });
    }
    inputTail.value = "N"; //clears input box
}

function setInput(tailNumber){
    var inputTail = document.getElementById("tailInput");

    inputTail.value = tailNumber;
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
        tableData = data.sqlTable;

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
            cell.appendChild(document.createTextNode(element));

            cell.setAttribute("onclick","setInput('"+element+"')");
            cell.setAttribute("class","list");

            table.appendChild(cell);
        });
    
        outputTable.appendChild(table);     

      })
      .catch(function(err){
        var outputFeild = document.getElementById("auditTable");

        outputFeild.replaceChildren();
        outputFeild.appendChild(document.createTextNode(err));
    });
}
