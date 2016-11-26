var express = require('express');
var util = require("util");
var fs = require("fs");

    var ttObj;
    fs.readFile('jsonfile.JSON', 'utf-8', function(err, data) {
    if(err) throw err;
    ttObj = JSON.parse(data);
    });

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
    };

    return string

}

//process data as json
exports.processCourse= function(courseSummary, name){
    console.log(courseSummary)
    var personCal = JSON.parse('{}');
    personCal['name'] = name;
    personCal['courseSummary'] = courseSummary;
    return personCal
}


exports.compare= function(req, res){
    var name1 = '1';
    var name2 = '2';

    var a;
    var b;    

    //console.log("into"+ JSON.stringify(ttObj));
    for(var i=0; i<ttObj.length;i++){
        if(ttObj[i].name == name1)
            a = ttObj[i];
        else if(ttObj[i].name == name2)
            b= ttObj[i];
    }

    var returnOBJ=[];
    var count=0;

    for(var j=0; j<a.courseSummary.length;j++){
        for(var m=0; m<b.courseSummary.length;m++){
            if(a.courseSummary[j] == b.courseSummary[m])
                {
                returnOBJ[count]=a.courseSummary[j];
                count++;
                }

            }
        }

        res.send(returnOBJ);

}


