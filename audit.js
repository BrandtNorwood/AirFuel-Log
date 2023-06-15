//change these two as needed
const Url = "http://localhost:3000/api/data" //this will be the data base till i get my shit together
const hangers = ["Ramp","Alpha","Bravo","Charlie","Delta","Echo"]; //when the jet center gets more hangers change this line


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

function getYellowList(){
    currentHTMLYellow = document.getElementsByClassName("yellow");
    var currentYellow = new Array();

    for(element of currentHTMLYellow){
        currentYellow.push(element.innerText);
    }

    return currentYellow;
}


function getAllList(){
    currentHTMLList = document.getElementsByClassName("list");
    var currentList = new Array();

    for(element of currentHTMLList){
        currentList.push(element.innerText);
    }

    return currentList;
}



function auditTable(greenList,yellowList){
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