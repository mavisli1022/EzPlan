$(document).ready(function() {
    var allRowsCount = 0;

    $.get('/allUsers', {}, function (data) {
        console.log(data);

        var table = document.getElementById("list-of-users");
        for (var i = 0; i < allRowsCount; i++) {
            table.deleteRow(0);
        }
        var parent = document.getElementById("list-of-users");
        allRowsCount = 1;
        var row = parent.insertRow();
        row.insertCell(0).innerHTML = "userid";
        row.insertCell(1).innerHTML = "firstname";
        row.insertCell(2).innerHTML = "lastname";
        row.insertCell(3).innerHTML = "email";
        row.insertCell(4).innerHTML = "password";
        row.insertCell(5).innerHTML = "level";
        row.insertCell(6).innerHTML = "emailverified";
        row.insertCell(7).innerHTML = "discoverable";
        row.insertCell(8).innerHTML = "fbconnected";
        row.insertCell(9).innerHTML = "fbid";

        for (var i = 0; i < data.length; i++) {
            row = parent.insertRow();
            allRowsCount++;
            row.insertCell(0).innerHTML = data[i].userid;
            row.insertCell(1).innerHTML = data[i].firstname;
            row.insertCell(2).innerHTML = data[i].lastname;
            row.insertCell(3).innerHTML = data[i].email;
            row.insertCell(4).innerHTML = data[i].password;
            row.insertCell(5).innerHTML = data[i].level;
            row.insertCell(6).innerHTML = data[i].emailverified.toString();
            row.insertCell(7).innerHTML = data[i].discoverable;
            row.insertCell(8).innerHTML = data[i].fbconnected.toString();
            row.insertCell(9).innerHTML = data[i].fbid;

        }


    });

});

function back(){
    var form = document.createElement("form");

    form.method = "GET";
    form.action = "/dashboard/admin";
    document.body.appendChild(form);
    form.submit();
}