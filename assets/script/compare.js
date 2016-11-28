
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


function show(){
	document.getElementById("demo").innerHTML = "HELLO WORLD";
		var name=[];

		$.get('/tempget', function(data){
			console.log(JSON.stringify(data));
			name[0] = data.name1;
			name[1] = data.name2;
					console.log(name[0]+name[1]);

        $.get('/compare?name=' + name[0] + '&name=' + name[1], function(data){
        	console.log(JSON.stringify(data));

        /*if(data == "Does not exsist"){
            document.getElementById("TAlist").innerHTML = "<h2>Does not exsist</h2>";
        }
        else{
        let taArray = data.tas;
        let firstRow= "<table border=1><tr><td>Family Name</td><td>Given Name</td><td>Student Number</td><td>Status</td><td>Year</td></tr>";
    let ret = firstRow;
            for (let i = 0; i < taArray.length; i++) {
                console.log(taArray[i].familyname);
            let tmp = '<tr><td>'+ taArray[i].familyname + '</td>' +
                                      '<td>'+ taArray[i].givenname + '</td>' +
                                      '<td>'+ taArray[i].stunum + '</td>' +
                                      '<td>'+ taArray[i].status + '</td>' +
                                      '<td>'+ taArray[i].year + '</td></tr>' ;

                ret = ret + tmp;
        }
        ret = ret + "</table>";
        document.getElementById("TAlist").innerHTML = ret;
        }*/
 			});
		});


}




