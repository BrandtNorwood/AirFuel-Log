// JavaScript code to handle form submission or perform other actions
document.addEventListener("DOMContentLoaded", function() {
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    var year = today.getFullYear();
    var month = today.getMonth() + 1; // Months are zero-based, so add 1
    var day = today.getDate();

    var formattedMonth = month < 10 ? "0" + month : month;
    var formattedDay = day < 10 ? "0" + day : day;

    var formattedYesterdayMonth = yesterday.getMonth() + 1;
    var formattedYesterdayDay = yesterday.getDate();

    formattedYesterdayMonth = formattedYesterdayMonth < 10 ? "0" + formattedYesterdayMonth : formattedYesterdayMonth;
    formattedYesterdayDay = formattedYesterdayDay < 10 ? "0" + formattedYesterdayDay : formattedYesterdayDay;

    var beginningDateField = document.getElementById("beginningDate");
    beginningDateField.value = yesterday.getFullYear() + "-" + formattedYesterdayMonth + "-" + formattedYesterdayDay;

    var endDateField = document.getElementById("endDate");
    endDateField.value = year + "-" + formattedMonth + "-" + formattedDay;
});


function generateBilling(){
    var x = document.getElementById("billingTable");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
} 

// Rest of the code remains messed up
