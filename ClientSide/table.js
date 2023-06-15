/* 
    If you found this either you are dam curious or I pitty you
    Made by Brandt Norwood
    mostly on a pair of 14 hour shifts (about 6/7/2023)
    the comments here are not for professional moments O_o
*/

const Url = "http://localhost:3000/api/data" //this will be the data base till i get my shit together

const hangers = ["Ramp","Alpha","Bravo","Charlie","Delta","Echo"]; //when the jet center gets more hangers change this line


function homeTable() {
    //Start off by sending a request for data (This nearly killed me 0_0)
    fetch(Url)
        //initial request and pull
        .then(function(response){
            if(response.ok){
                return response.json();
            }
            throw new Error('"fetch" threw Json Formating error - ' + response.status + ' ' + response.statusText);
        })
        .then(function(data) {

            //seperate the table from the JSON object
            tableData = data.testTable;

            //create the html objects for the table
            var table = document.createElement('table');
            var tableBody = document.createElement('tbody');

            //variables used to make stuff work
            var longestHanger = 0;

            //defines how long to make the table
            tableData.forEach(function(thisHanger){
                if (thisHanger.length > longestHanger) longestHanger = thisHanger.length;
            })


            // this loop is for the hanger lables at the top
            var i = 0;
            var hangerLabels = document.createElement('tr');
            hangers.forEach(function(hanger) {
                var column = document.createElement('th');
                column.appendChild(document.createTextNode(hanger))
                
                hangerLabels.appendChild(column);
            });
            tableBody.appendChild(hangerLabels);


            //this one is for ALL THE OTHER STUFF
            for (var x=0; x < longestHanger; x++){   //rows
                var row = document.createElement('tr');

                for (var y=0; y < hangers.length; y++){   //columns

                    //this is to hide the empty cells (which are still needed for formatting)
                    if (tableData[y][x] == undefined){
                        var cell = document.createElement('td');
                        cell.setAttribute("id","empty")
                        row.append(cell)
                    }
                    //this one creates the populated cells
                    else{
                        var cell = document.createElement('td');
                        cell.appendChild(document.createTextNode(tableData[y][x]));
                        row.appendChild(cell);
                    }
                }
                tableBody.appendChild(row);
            }

            //once again, stolen 
            table.appendChild(tableBody);
            document.body.appendChild(table);
        })
        .catch(function(error) {
          // Handle any errors that occurred during the request
          console.log(error)
        });
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function dropDownElement() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }




//This is for populating the Hanger selection menu in the Audit page
function textBoxListener(){
    var textBox = document.getElementById("tailInput");

    textBox.addEventListener("keydown", function(e){
        if (e.code == "Enter"){addAuditList();}
    });
}


function auditMenu(){
    var hangerMenu = document.getElementById("hangerSelect");

    for (var i=1; i < hangers.length; i++){
        hangerMenu.options[hangerMenu.options.length] = new Option(hangers[i]);
    }

    hangerMenu.onchange = function(){auditTable();}

}

function addAuditList(){
    var greenList = getGreenList();

    var inputTail = document.getElementById("tailInput");
    var inputTailValue = document.getElementById("tailInput").value;

    greenList.push(inputTailValue.toUpperCase());

    inputTail.value = "N";

    auditTable(greenList);
}


function getGreenList(){
    currentHTMLGreen = document.getElementsByClassName("green");
    var currentGreen = new Array();

    for(element of currentHTMLGreen){
        currentGreen.push(element.innerText);
    }

    return currentGreen;
}


function getAllList(){
    currentHTMLList = document.getElementsByClassName("list");
    var currentList = new Array();

    for(element of currentHTMLList){
        currentList.push(element.innerText);
    }

    console.log(currentList);
}



function auditTable(greenList){
    fetch(Url)
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

            if(greenList != undefined){
                for (var i=0; i < greenList.length; i++){
                    //console.log(greenList[i]);
                    if (greenList[i] == element){
                        cell.setAttribute("class","green");
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

