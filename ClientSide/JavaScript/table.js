//change these two as needed
const Url = "http://localhost:3000/" //"http://10.1.0.52:3000/"//this is the server root url (extensions will be added by other scripts)
const hangers = ["Ramp","Alpha","Bravo","Charlie","Delta","Echo"]; //when the jet center gets more hangers change this line

/* 
    If you found this either you are a curious one, or, I pitty your new job
    Made by Brandt Norwood
    started on a pair of 14 hour shifts (6/7/2023)
*/

//This basiclly just to call the search any time a key is pressed in the search
function textBoxListener(){
    var textBox = document.getElementById("searchBox");

    textBox.addEventListener("input", function(e){
        //if (e.code == "Enter"){searchHighlight();}
        searchHighlight(textBox.value);
    });
}

//handles search and higlighting functionality
function searchHighlight(textBoxValue){
    //clears all currently highlighted
    var clearElements = document.querySelectorAll(".highlight");
    clearElements.forEach(function(clearElements) {
        clearElements.classList.remove("highlight");
    });

    //creates the 'rows' array which is full of the finest tr elements
    var table = document.getElementById("table");
    var rows = table.getElementsByTagName("tr");

    //error checking, and i used this section to tamper down false results
    if (rows.length > 0 && textBoxValue.length > 0 && textBoxValue != "N"){
        for (row of rows){
            var cells = row.getElementsByTagName('td');

            if (cells.length > 0){
                for (cell of cells){
                    if (cell.textContent.includes(textBoxValue.toUpperCase())){
                        cell.setAttribute("class","highlight"); //If this cell includes the result highlight it
                    }
                }
            }
        }               //The Great Curly Brace Cascade
    }
}


//I haven't touched this code since i started the project almost a month ago and now im too scared to enter it
function homeTable() {
    //Start off by sending a request for data (This marks the start of the great CORS war)
    fetch(Url+"hangerData")
        //initial data request and pull
        .then(function(response){
            if(response.ok){
                return response.json();
            }
            throw new Error('"fetch" threw Json Formating error - ' + response.status + ' ' + response.statusText);
        })
        .then(function(data) {
            var outputFeild = document.getElementById("tableSlot");

            outputFeild.replaceChildren();

            //seperate the table from the JSON object
            tableData = data.sqlTable;

            //create the html objects for the table
            var table = document.createElement('table'); table.setAttribute("id","table")
            var tableBody = document.createElement('tbody');

            //defines how long to make the table
            var longestHanger = 0;
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


            //this one is for all the data
            for (var x=0; x < longestHanger; x++){              //rows
                var row = document.createElement('tr');

                for (var y=0; y < hangers.length; y++){         //columns
                    //this is to hide the empty cells (which are still needed for table formatting)
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

            //populate the table and append it to the page
            table.appendChild(tableBody);
            outputFeild.appendChild(table);
        })
        .catch(function(err){
        var outputFeild = document.getElementById("tableSlot");

        outputFeild.replaceChildren();
        outputFeild.appendChild(document.createTextNode(err));
    });
}
