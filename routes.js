var express = require('express');
var util = require("util");
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;


var temp = {name1: "", name2: ""};


var weekDay = ["MONDAY","TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
//read file and get the coursecode as well as section from calendar
exports.convertCal= function(filename){
    var fs = require('fs'),
        file = fs.readFileSync(filename, "utf8");

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

        else if (lines[line].includes("UNTIL")){
            var untilDate = lines[line].replace('RRULE:FREQ=WEEKLY;WKST=MO;UNTIL=','');
            var untilDate = untilDate.slice(0,4);
            string.push(untilDate);
        }

    };

    return string

}



//process data as json
exports.processCourse= function(courseSummary, name){
    //console.log(courseSummary)
    var resultCourseSummary = JSON.parse('[]');
    var index = 0;
    //var term = courseSummary[4];

    for (var i = 0; i<courseSummary.length/5; i++){
        var resultCourse = JSON.parse('{}');
        resultCourse['summary'] = courseSummary[5*i];
        resultCourse['day'] = courseSummary[5*i+1];
        resultCourse['start'] = courseSummary[5*i+2];
        resultCourse['end'] = courseSummary[5*i+3];
        resultCourse['term'] = courseSummary[5*i+4];
        resultCourseSummary[index] = resultCourse;
        index ++;
    }
    
    var personCal = JSON.parse('{}');
    personCal['name'] = name;
    personCal['courseSummary'] = resultCourseSummary;
    return personCal
}

exports.compare= function(req, res){
    var name1;
    var name2;

    if(req.query.name!=null){
        var name = req.query.name;
        name1 = Number(name[0]);
        name2 = Number(name[1]);
     }
     console.log(name1 + name2)
  
    var returnOBJ={"commonCourse": [], "count":"" };
    var count=0;
    var exsist = false;

    var ttObj=[];
    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    db.collection("timetable").findOne({
      userid: name1
    }, function(err, doc){
        if(doc == null){
        res.send("You need to upload your timetable first before comparison.");
         }
       else {
            ttObj.push(doc);
            db.collection("timetable").findOne({
             userid: name2
            }, function(err, doc){
                if( doc == null){
                    res.send("Your friend did not uploaded his/her timetable.");
                }
                else{
                ttObj.push(doc);
                console.log(JSON.stringify(ttObj));

                for(var j=0; j<ttObj[0].courseSummary.length;j++){
                 for(var m=0; m<ttObj[1].courseSummary.length;m++){

                    for(var n=0; n<count; n++) {
                    //console.log(returnOBJ['commonCourse'][n].summary);
                    if (returnOBJ.commonCourse[n].summary == ttObj[1].courseSummary[m].summary){
                        exsist=true;
                        break;
                    }
                }  
                    if(exsist == true){
                        exsist = false;
                    }
                    else if(ttObj[0].courseSummary[j].summary == ttObj[1].courseSummary[m].summary && 
                    ttObj[0].courseSummary[j].term == ttObj[1].courseSummary[m].term)
                    {
                        returnOBJ.commonCourse[count]=ttObj[0].courseSummary[j];
                        count++;
                    }

            }
        }
            returnOBJ.count = count;
            console.log(JSON.stringify(returnOBJ));
            res.send(returnOBJ);
        }


             });
        }
    });
});
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

exports.findOne = function(req,res){
    var user;
    //var ttObj;
    if(req.query.user!=null){
        user  = req.query.user;
     }
    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    db.collection("timetable").findOne({
      userid: Number(user)
    }, function(err, doc){
        if(doc == null) {
            res.send("No such user: " + user);
        }
        else{
            console.log(JSON.stringify(doc));
           res.send(doc); 
        }
      
    })
  });


}
