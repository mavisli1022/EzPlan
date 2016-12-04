
function mergeTimetable(Id){
    var valueTable_1 = document.getElementById(Id);
    var check1="";
    for(var d=1; d<6;d++){
        for(var t=0; t<14; t++){
            if(valueTable_1.rows[t].cells[d].innerHTML == "")
                check1 = "";
            else if(valueTable_1.rows[t].cells[d].innerHTML == check1){
                valueTable_1.rows[t-1].cells[d].style.borderBottom= 'none';
                valueTable_1.rows[t].cells[d].style.borderTop = 'none';
                valueTable_1.rows[t].cells[d].innerHTML ="";
            } else{
                check1 = valueTable_1.rows[t].cells[d].innerHTML;
            }
        }
    }
}


function color_table(Id){
    var x = document.getElementById(Id);
    for(var d=1; d<6;d++){
        for(var t=0; t<14; t++){
            if(x.rows[t].cells[d].innerHTML != ""){
                x.rows[t].cells[d].style.backgroundColor = '#FFB6C1'
            }
        }
    }
}

function createTable(Id) {
    weekdays = ["TIME","MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    var x = document.getElementById(Id);
    for (var i = 0; i<6; i++){
        var y = document.createElement("TD");
        y.setAttribute("id", i+Id);
        x.appendChild(y);

        var z = document.createElement("TH");
        var t = document.createTextNode(weekdays[i]);
        z.appendChild(t);
        document.getElementById(i+Id).appendChild(z);
    }

    var table = document.getElementById(Id);
    for (var i = 0; i<14; i++){
        var row = x.insertRow(-1);
        for (var j = 0; j<6; j++){
            row.insertCell(0);
        }
        var cell1 = x.rows[i].cells[0];
        cell1.innerHTML = i+8 + ":00";
    }
}

function displayTable(Id){
    weekdays = ["time","MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];    
    var table = document.getElementById("hiddenTable");
    var valueTable_1 = document.getElementById(Id);

    var array = [];

    for (var i = 0; i<table.rows.length; i++){
        array.push(table.rows[i].cells[0].innerHTML);
    }
    
    var term = array[4];

    for (var i =0; i<table.rows.length/5; i++){
        //console.log(i)
        //weekday
        var dayofweek;
        for (var j = 1; j<6; j++){
            if (('"'+weekdays[j]+'"') == array[5*i+1]){
                dayofweek = j;
            }
        }
        console.log(dayofweek)
        //start time
        var time = Number(array[5*i+2].substr(1,2)) - 8;
        var stoptime = Number(array[5*i+3].substr(1,2)) - 8;

        if (Id == "myTable-1"){
            if (array[5*i+4] == term){
                for (var k = time; k < stoptime; k++){
                    valueTable_1.rows[k].cells[dayofweek].innerHTML = array[5*i];
                }
            }
        }
        else{
            if (array[5*i+4] != term){
                for (var k = time; k < stoptime; k++){
                    valueTable_1.rows[k].cells[dayofweek].innerHTML = array[5*i];
                }
            }

        }
    }
}

function show(Id){
    createTable(Id);
    displayTable(Id);
    color_table(Id);
    mergeTimetable(Id);
}

function back(){
    var form = document.createElement("form");
    form.method = "POST";
    form.action = "/main";
    document.body.appendChild(form);
    form.submit();
}
