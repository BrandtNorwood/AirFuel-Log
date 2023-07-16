//change these two as needed
const Url = "http://localhost:3000/" //"http://10.1.0.52:3000/"//this is the server root url (extensions will be added by other scripts)
const hangers = ["Ramp","Alpha","Bravo","Charlie","Delta","Echo"]; //when the jet center gets more hangers change this line


const topLabels = ["Tail Number","Hanger","Time In","Time Out"];

//This is for detecting the enter key and handling it properly
function textBoxListener(){
    var textBox = document.getElementById("tailInput");

    textBox.addEventListener("keydown", function(e){
        if (e.code == "Enter"){runSearch();}
    });
}

//Big Boi function that handles... the page
function runSearch() {
    var timeSelect = document.getElementById("hangerSelect").value;
    var tailInput = document.getElementById("tailInput").value;
    var tailTextBox = document.getElementById("tailInput")
    var table = document.getElementById("resultTable");

    fetch(Url + "search", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeSelect, tailInput })
    })
    .then(function(response) {
        return response.json(); // Parse the JSON response
    })
    .then(function(data) {
        var results = data.result;


        table.replaceChildren();

        var tableResults = document.createElement('table');

        //This builds the labels at the top
        var labels = document.createElement('tr')
        for (label of topLabels){
            var thisLabel = document.createElement('td');
            thisLabel.appendChild(document.createTextNode(label));
            labels.appendChild(thisLabel);
        }
        tableResults.appendChild(labels);

        for (let i = results.length - 1; i >= 0; i--) {
            const entry = results[i];
          
            var entryDisplay = document.createElement('tr')

            var TailNumber = document.createElement('th');
                TailNumber.appendChild(document.createTextNode(entry.TailNumber));
            var HangerID = document.createElement('th');
                HangerID.appendChild(document.createTextNode(hangers[entry.HangerID]));
            var BlockIn = document.createElement('th');
                var BlockInTimeElemet = new Date(entry.BlockIn);
                BlockInTimeElemet.setHours(BlockInTimeElemet.getHours() - 5);
                var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'America/Chicago' };
                var formattedInDate = BlockInTimeElemet.toLocaleString('en-US', options);
                BlockIn.appendChild(document.createTextNode(formattedInDate));
            var BlockOut = document.createElement('th');
                if(entry.BlockOut != null){
                    var BlockOutTimeElemet = new Date(entry.BlockOut);
                    BlockOutTimeElemet.setHours(BlockOutTimeElemet.getHours() - 5);
                    var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'America/Chicago'};
                    var formattedOutDate = BlockOutTimeElemet.toLocaleString('en-US', options);
                    BlockOut.appendChild(document.createTextNode(formattedOutDate));
                }


            entryDisplay.appendChild(TailNumber);
            entryDisplay.appendChild(HangerID);
            entryDisplay.appendChild(BlockIn);
            entryDisplay.appendChild(BlockOut);

            tableResults.appendChild(entryDisplay);
        }

        table.appendChild(tableResults);

        tailTextBox.value = "N";

    })
    .catch(function(error) {
        console.log("Error:", error);
    });
}

