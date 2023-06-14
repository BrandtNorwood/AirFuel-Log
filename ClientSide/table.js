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

function auditTable(){
    fetch(Url)
    .then(function(response){
        if(response.ok){
            return response.json();
        }
        throw new Error('"fetch" threw Json Formating error - ' + response.status + ' ' + response.statusText);
    })
    .then(function(data) {
        

        //do the shit



      })
      .catch(function(error) {
        // Handle any errors that occurred during the request
        console.log(error)
      });
}

