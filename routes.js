var express = require('express');
var util = require("util");

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
exports.processCourse= function(courseSummary){
    console.log(courseSummary)
    var personCal = JSON.parse('{}');
    personCal['name'] = "--";
    personCal['courseSummary'] = courseSummary;
    return personCal
}


