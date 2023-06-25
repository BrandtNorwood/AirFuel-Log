//change these two as needed
const Url = "http://localhost:3000/" //this is the server root url (extensions will be added by other scripts)
const hangers = ["Ramp","Alpha","Bravo","Charlie","Delta","Echo"]; //when the jet center gets more hangers change this line


//This is for detecting the enter key and handling it properly
function textBoxListener(){
    var textBox = document.getElementById("tailInput");

    textBox.addEventListener("keydown", function(e){
        if (e.code == "Enter"){addAuditList();}
    });
}

//Populates the Hanger Select menu from the hangers constant
function hangerSelectMenu(){
    var hangerMenu = document.getElementById("hangerSelect");

    for (var i=1; i < hangers.length; i++){
        hangerMenu.options[hangerMenu.options.length] = new Option(hangers[i]);
    }
    hangerMenu.onchange = function(){clearChanges();}
}

//this is for highlighting tails on click
function setInput(tailNumber){
    var inputTail = document.getElementById("tailInput");

    inputTail.value = tailNumber;

    addAuditList();
}

//defined these here so they have persistance
var submittedList = new Array();
var originalList = new Array();

//querys the server for a hanger table
function retreiveOG(){
    var hangerSelect = document.getElementById("hangerSelect");

    fetch(Url+"hangerData")
    .then(function(response){
        if(response.ok){
            return response.json();
        }
        throw new Error('"fetch" threw Json Formating error - ' + response.status + ' ' + response.statusText);
    })
    .then(function(data){
        tableData = data.sqlTable;

        var selectedHanger = 0;

        for (var i=0; i < hangers.length; i++){
            if (hangers[i] == hangerSelect.value){
                selectedHanger = i;
            }
        }

        originalList = tableData[selectedHanger];

        buildTable();
    });
}

//adds item in submit box into submit list while blocking duplicate and empty entries
function addAuditList(){
    var inputTail = document.getElementById("tailInput");
    var inputTailValue = document.getElementById("tailInput").value.trim();

    inputTailValue = inputTailValue.toUpperCase();

    if (inputTailValue != "N" && inputTailValue != ""){
        var alreadyEntered = false;

        for(element of submittedList){
            if (element == inputTailValue){alreadyEntered = true;}
        }

        if(!alreadyEntered){
            submittedList.push(inputTailValue);
        }
    }
    inputTail.value ="N";

    buildTable();
}

//returns items to be added, removed, and kept
function compareLists(){
    var addList = new Array();
    var removeList = new Array();
    var confirmedList = new Array();

    for (element of originalList){
        if (!submittedList.includes(element)){
            removeList.push(element);
        } else {
            confirmedList.push(element);
        }
    }

    for (element of submittedList){
        if (!originalList.includes(element)){
            addList.push(element);
        }
    }

    return {addList,removeList,confirmedList};
}

//handles undo button (which is super easy because im a genius)
function undoSubmit(){
    submittedList.pop();
    buildTable();
}

//resets table to what is currently in the hanger
function clearChanges(){
    submittedList = new Array();
    retreiveOG();
}

//based on the name you should hopefully be able to guess what this does
function buildTable(){
    //this spits out 3 arrays that corospond to color
    var compareThingamajig = compareLists();
        var addList = compareThingamajig.addList;
        var removeList = compareThingamajig.removeList;
        var confirmedList = compareThingamajig.confirmedList;

    //this combine the
    var displayList = [...new Set(originalList.concat(submittedList))];
    outputTable = document.getElementById("auditTable");

    outputTable.replaceChildren();

    displayList.sort();

    //create the html objects for the table
    var table = document.createElement('ol');

    //adding the elements to te table
    for (element of displayList){
        var cell = document.createElement('ul');
        cell.appendChild(document.createTextNode(element));
        cell.setAttribute("onclick","setInput('"+element+"')");

        //this is for setting colors
        if (submittedList.length > 0){
            if (addList.includes(element)){cell.setAttribute("class","yellow");}
            if (removeList.includes(element)){cell.setAttribute("class","red");}
            if (confirmedList.includes(element)){cell.setAttribute("class","green");}
        }

        table.appendChild(cell);
    }

    //writing the table to the html doc
    outputTable.appendChild(table);
}

//Sends the changes off to the NodeJS server
function submitChanges(){
    var hangerSelect = document.getElementById("hangerSelect");

    //this spits out the arrays that are going to be passed to the server
    var compareThingamajig = compareLists();
        var addList = compareThingamajig.addList;
        var removeList = compareThingamajig.removeList;

    var selectedHanger = 0;

    for (var i=0; i < hangers.length; i++){
        if (hangers[i] == hangerSelect.value){
            selectedHanger = i;
        }
    }

    var sendData = [selectedHanger, addList,removeList];

    console.log(sendData);

    fetch(Url + "auditData", {
        method: "POST", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify([selectedHanger,addList,removeList])
    })
    .then(() => {
        clearChanges();
    });
}
