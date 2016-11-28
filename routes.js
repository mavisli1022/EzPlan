var express = require('express');
var util = require("util");
var fs = require("fs");

var ttObj;
fs.readFile('jsonfile.json', 'utf-8', function(err, data) {
    if(err) throw err;
    ttObj = JSON.parse(data);
});

var temp = {name1: "", name2: ""};


var weekDay = ["MONDAY","TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
//read file and get the coursecode as well as section from calendar
exports.convertCal= function(filename){
    var fs = require('fs'),
        file = fs.readFileSync(filename, "utf8");
    
    //get data from file save it to json
    //display calendar 
    //DTSTART;TZID=America/Toronto:20160913T130000


    var lines = file.split('\r\n');
    var string = [];
    for(var line = 0; line < lines.length; line++){
        if (lines[line].includes("SUMMARY")){
            string.push(lines[line].replace('SUMMARY:', ''));
        }

        //format data as Date type
        //2016-09-14T1:10:00
        //new Date("2015-03-25T12:00:00");
        
        else if (lines[line].includes("DTSTART")){
            var date = lines[line].replace('DTSTART;TZID=America/Toronto:','');
            var dateFormat = date.slice(0, 4) + '-' + date.slice(4,6) + '-' + date.slice(6,11)
                + ':' + date.slice(11,13) + ':' + date.slice(13,15);
            var dateD = new Date(dateFormat);
            var weekday = dateD.getDay()-1;
            string.push(weekDay[weekday]);
            string.push(date.slice(9,11));

        }

        else if (lines[line].includes("DTEND")){
            var date = lines[line].replace('DTEND;TZID=America/Toronto:','');
            var dateFormat = date.slice(0, 4) + '-' + date.slice(4,6) + '-' + date.slice(6,11)
                + ':' + date.slice(11,13) + ':' + date.slice(13,15);
            string.push(date.slice(9,11));
        }

    };

    return string

}



//process data as json
exports.processCourse= function(courseSummary, name){
    console.log(courseSummary)
    var resultCourseSummary = JSON.parse('[]');
    var index = 0;
    
    for (var i = 0; i<courseSummary.length/4; i++){
        var resultCourse = JSON.parse('{}');
        resultCourse['summary'] = courseSummary[4*i];
        resultCourse['day'] = courseSummary[4*i+1];
        resultCourse['start'] = courseSummary[4*i+2];
        resultCourse['end'] = courseSummary[4*i+3];
        resultCourseSummary[index] = resultCourse;
        index ++;
    }
    
    console.log(resultCourseSummary)
    var personCal = JSON.parse('{}');
    personCal['name'] = name;
    personCal['courseSummary'] = resultCourseSummary;
    return personCal
}

exports.compare= function(req, res){
   // var name1 = '1';   //current user
    //var name2 = '2';    // friend


    if(req.query.name!=null){
        var name = req.query.name;
        name1 = name[0];
        name2 = name[1];
     }
     console.log(name1 + name2)
    var a = null;
    var b = null;    
    var returnOBJ={"commonCourse": [], "count":"" };
    var count=0;
    var exsist = false;
    //console.log("into"+ JSON.stringify(ttObj));
    for(var i=0; i<ttObj.length;i++){
        if(ttObj[i].name == name1)
            a = ttObj[i];
        else if(ttObj[i].name == name2)
            b= ttObj[i];
    }
    if(a == null){
        res.send("You need to upload your timetable first before comparison.");
    }
    else if( b == null){
        res.send("Your friend did not uploaded his/her timetable.");
    }

    

    else{
    for(var j=0; j<a.courseSummary.length;j++){
        for(var m=0; m<b.courseSummary.length;m++){
            //console.log(b.courseSummary[m].summary);
            //console.log(a.courseSummary[j].summary);
            for(var n=0; n<count; n++) {
                //console.log(returnOBJ['commonCourse'][n].summary);
                if (returnOBJ['commonCourse'][n].summary == b.courseSummary[m].summary){
                    exsist=true;
                    break;
                }
            }
            if(exsist == true){
                exsist = false;
            }
            else if(a.courseSummary[j].summary == b.courseSummary[m].summary)
                {
                returnOBJ.commonCourse[count]=a.courseSummary[j];
                count++;
                }

            }
        }
        returnOBJ.count = count;
        console.log(JSON.stringify(returnOBJ));
        res.send(returnOBJ);
    }
}

exports.tempstore= function(req,res){
temp.name1 = req.body.a;
temp.name2 = req.body.b;
//console.log(JSON.stringify(temp));
res.send();
}

exports.tempget = function(req,res){
   console.log(JSON.stringify(temp));
    res.send(temp);
}

