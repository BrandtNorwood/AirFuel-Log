//change these two as needed
const Url = "http://localhost:3000/" //this will be the data base till i get my shit together
const hangers = ["Ramp","Alpha","Bravo","Charlie","Delta","Echo"]; //when the jet center gets more hangers change this line



//This is for populating the Hanger selection menu in the Audit page
function textBoxListener(){
    var textBox = document.getElementById("tailInput");

    textBox.addEventListener("keydown", function(e){
        if (e.code == "Enter"){addAuditList();}
    });
}

//Populates the Hanger Select menu from the hangers constant
function auditMenu(){
    var hangerMenu = document.getElementById("hangerSelect");

    for (var i=1; i < hangers.length; i++){
        hangerMenu.options[hangerMenu.options.length] = new Option(hangers[i]);
    }

    hangerMenu.onchange = function(){auditTable();}
}

//get tail numbers that have been green flaged
function getGreenList(){
    currentHTMLGreen = document.getElementsByClassName("green");
    var currentGreen = new Array();

    for(element of currentHTMLGreen){
        currentGreen.push(element.innerText);
    }

    return currentGreen;
}

//gets tail numbers that have been yellow flaged
function getYellowList(){
    currentHTMLYellow = document.getElementsByClassName("yellow");
    var currentYellow = new Array();

    for(element of currentHTMLYellow){
        currentYellow.push(element.innerText);
    }

    return currentYellow;
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

// Example POST method implementation: (stolen from ChatGPT)
async function postData(url = "", sendData = {}) {
    await fetch(url, {
        method: "POST", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(sendData)
    });
}

function resetTable(){
    var yellowList = new Array();
    var greenList = new Array();

    auditTable();
}


function greenListAll(){
    var tableList = getAllList();
    var yellowList = getYellowList();
    var greenList = new Array();

    for (element of tableList){
        greenList.push(element);
    }

    auditTable(greenList,yellowList);
}

//adds aircraft to the left column (yellow or green flaged)
function addAuditList(){
    //retrives green and yellow lists
    var greenList = getGreenList();
    var yellowList = getYellowList();
    var tableList = getAllList();

    //defines and reads text box for future use
    var inputTail = document.getElementById("tailInput");
    var inputTailValue = document.getElementById("tailInput").value.trim();

    if (inputTailValue != "N" && inputTailValue != ""){

        var isOnTable = false;
        for(element of greenList){if (inputTailValue.toUpperCase() == element){ isOnTable = true;}}
        for(element of tableList){if (inputTailValue.toUpperCase() == element){ isOnTable = true;}}

        if (!isOnTable){
            yellowList.push(inputTailValue.toUpperCase());
        }
        else {
            //adds to greenlist
            greenList.push(inputTailValue.toUpperCase());
        }

        //clears the text box
        inputTail.value = "N";

        auditTable(greenList, yellowList);
    }
}

function sendHangerList(){
    fetch(Url+"hangerData")
    .then(function(response){
        if(response.ok){
            return response.json();
        }
        throw new Error('"fetch" threw Json Formating error - ' + response.status + ' ' + response.statusText);
    })
    .then(function(data){
        //seperate the table from the JSON object
        hangerSelect = document.getElementById("hangerSelect");

        var selectedHanger = 0;

        for (var i=0; i < hangers.length; i++){
            if (hangers[i] == hangerSelect.value){
                selectedHanger = i;
            }
        }

        var inputHanger= getGreenList().concat(getYellowList());

        var sendData = [selectedHanger,inputHanger];

        postData(Url + "auditData", sendData)
        .then(() => {
            resetTable();
        });

    })
      .catch(function(error) {
        // Handle any errors that occurred during the request
        console.log(error)
      });
}


//Defines the Left side audit table
function auditTable(greenList,yellowList){
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

        if(yellowList != undefined){
            for (var i=0; i < yellowList.length; i++){
                tableData[selectedHanger].push(yellowList[i]);
            }
        }

        tableData[selectedHanger].sort();

        tableData[selectedHanger].forEach(element => {
            var cell = document.createElement('ul');
            cell.appendChild(document.createTextNode(element))

            if (greenList == undefined && yellowList == undefined){cell.setAttribute("class","blue")}

            if(greenList != undefined){
                for (var i=0; i < greenList.length; i++){
                    if (greenList[i] == element){
                        cell.setAttribute("class","green");
                    }
                }
            }

            if(yellowList != undefined){
                for (var i=0; i < yellowList.length; i++){
                    if (yellowList[i] == element){
                        cell.setAttribute("class","yellow");
                    }
                }
            }

            if (cell.getAttribute("class") != null){
                cell.setAttribute("class",cell.getAttribute("class") + " list")
            }else {
                cell.setAttribute("class","list");
            }

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