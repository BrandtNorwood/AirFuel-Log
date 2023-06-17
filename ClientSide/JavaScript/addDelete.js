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



//Defines the Left side audit table
function buildTable(greenList,yellowList){
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

        tableData[selectedHanger].forEach(element => {
            var cell = document.createElement('ul');
            cell.appendChild(document.createTextNode(element))

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