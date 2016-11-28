
function compare(name1, name2){
//name[0] = name1;
//name[1] = name2;

var passin = {
    a : name1,
    b : name2
};


//$.post('/tempstore', passin);
$.ajax({
  type: 'POST',
  url: '/tempstore',
  data: passin,
  dataType: "json",
  async: false
});

var form = document.createElement("form");

form.method = "POST";
form.action = "/comparePage";
var element1 = document.createElement("input");
form.appendChild(element1);
document.body.appendChild(form);
form.submit();

}

/*function load(){
    myFunction("myTable-1");
    myFunction("myTable-2");
}*/

function show(){
	var name=[];
  var commonCourse;
  var array=[];
	$.get('/tempget', function(data){
			console.log(JSON.stringify(data));
			name[0] = data.name1;
			name[1] = data.name2;
			console.log(name[0]+name[1]);


        $.get('/compare?name=' + name[0] + '&name=' + name[1], function(data){
          if(data == "You need to upload your timetable first before comparison." ||
               data == "Your friend did not uploaded his/her timetable."){
             document.getElementById("demo").innerHTML = data;
            }
          else{
            console.log(JSON.stringify(data));
            common = data;
             myFunction("myTable-1");
              myFunction("myTable-2");
            var string;
            var courses="";
            if(common.count == 0){
              string= "You two have " + common.count + " common courses. "
            }
            else {
              for(var i=0; i< common.commonCourse.length;i++){
                courses= courses+common.commonCourse[i].summary + " , ";
              }
              string= "You two have " + common.count + " common courses. They are: " + courses;
            } 
            document.getElementById("demo").innerHTML = string;

            $.get('/findUser?user='+name[0], function(data){
          
                array.push(data);

                $.get('/findUser?user='+name[1], function(data){
          
                    array.push(data);
                    //console.log(array);
                    showTable(array);
                });  

            });  
          }
        
 			});
		});


}

function myFunction(Id) {
    weekdays = ["time","MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
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

    var table = document.getElementById("myTable");
    for (var i = 0; i<14; i++){
        var row = x.insertRow(-1);
        for (var j = 0; j<6; j++){
            row.insertCell(0);
        }
        var cell1 = x.rows[i].cells[0];
        cell1.innerHTML = i+8 + ":00";
    }
}

function showTable(array){
    weekdays = ["time","MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];    
    console.log(JSON.stringify(array));
    var valueTable_1 = document.getElementById("myTable-1");
    var valueTable_2 = document.getElementById("myTable-2");
    var term = array[0].courseSummary[0].term;

    for(var i=0; i< array.length;i++){
      for(var j=0; j<array[i].courseSummary.length; j++){
        var dayofweek;
        for(var d=1; d<6;d++){
          if(weekdays[d] == array[i].courseSummary[j].day)
            dayofweek = d;
        }
        var time = Number(array[i].courseSummary[j].start) - 9;
        var stoptime =  Number(array[i].courseSummary[j].end) - 9;
        //console.log(time + stoptime);
        
       if(array[i].courseSummary[j].term == term){
          for (time; time < stoptime; time ++){
                if(valueTable_1.rows[time + 1].cells[dayofweek].innerHTML == array[i].courseSummary[j].summary)
                valueTable_1.rows[time + 1].cells[dayofweek].bgColor = "Red";
                else if(!valueTable_1.rows[time + 1].cells[dayofweek].innerHTML.includes(array[i].courseSummary[j].summary))
                  valueTable_1.rows[time + 1].cells[dayofweek].innerHTML += array[i].courseSummary[j].summary;
                
            }
        }
        else{
          for (time; time < stoptime; time ++){
            if(valueTable_2.rows[time + 1].cells[dayofweek].innerHTML == array[i].courseSummary[j].summary)
                valueTable_2.rows[time + 1].cells[dayofweek].bgColor = "Red";
                else if(!valueTable_2.rows[time + 1].cells[dayofweek].innerHTML.includes(array[i].courseSummary[j].summary))
                  valueTable_2.rows[time + 1].cells[dayofweek].innerHTML += array[i].courseSummary[j].summary;
            }
          }

      }
    }

}

