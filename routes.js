var express = require('express');
var util = require("util");
var fs = require("fs");

var ttObj;
fs.readFile('jsonfile.json', 'utf-8', function(err, data) {
    if(err) throw err;
    ttObj = JSON.parse(data);
});

// Placeholder that contains all of the user objects to be searched through.
var userList;

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
    
    console.log(resultCourseSummary);
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

// Note: Until the compare function is modularized, I will assume there is a helper that carries out the
// comparison for us.
/*  A function to search the database for recommended friends based on schedule similarity.
 *  The function returns a list of users who were 'hits', ranked by how closely the matched the search terms.
 *  TODO: A placeholder JSON object is used 'userList'. Also assuming 'compare_users' is a function that returns the
 *  number of common courses two users (specified by user id) have.
 * */
exports.recommendedFriends = function(req, res){

    var uid = req.query.uid;
    var results = [];
    var results_temp = [];

    for(var i = 0; i < userList.length; i++){
        if (userList[i].userid != uid){
            results_temp.push([{"user" : userList[i], "count" : compare_users(userList[i].userid, uid)}]);
        }
    }

    results_temp.sort(comparison);

    for(i = 0; i < results_temp.length; i++) {
        results[i] = results_temp[i]["user"];
    }

    // Send back a sorted list of user objects to be displayed in recommended friends.
    res.send(results);
};


/* A function to search the database for classmates based on search queries.
*  The function returns a list of users who were 'hits', ranked by how closely the matched the search terms.
*  TODO: A placeholder JSON object is used 'userList'
* */
exports.searchClassmates = function(req, res){

    // The request contains a search query. Each word in the query is compared to all users. The format of the query is
    // as follows:
    // Example: /search?q=Seb+Balda+CSC365
    // req.query.q: the body of the search, the terms to be searched for.

    // Split the search terms into array elements to be iterated through.
    var search_terms = req.query.q.split(" ");

    // The array containing the "hits" from the search. Contains a pair of userid and count (number of hits to sort by)
    var results_obj = [];
    var results = [];

    // For every search term.
    for (var i = 0; i < search_terms.length; i++){

        // Compare the term with the user's attributes
        for(var j = 0; j < userList.length; j++){

            // If the search term matches on of their names.
            if (search_terms[i] == userList[j].firstname || search_terms[i] == userList[j].lastname){
                add_or_inc(userList[j].userid, results_obj);
            }

            // If the search term matches a course that the user is taking.
            else if (is_taking(userList[j].userid, search_terms[i])){
                add_or_inc(userList[j].userid, results_obj);
            }
        }
    }

    // Now we have an array of objects with a uid/count pairing.
    // Next lets construct a new array that only contains ids, sorted by search relevance

    results_obj.sort(comparison);

    for (i = 0; i < results_obj.length; i++){
        results.push(results_obj[i]["id"]);
    }



    res.send(results)

};

// HELPER FUNCTION
// Searches the results list. If the user is already there, increment the counter,
// if the user is not there, add the object
function add_or_inc(uid, results){

    var found = 0;

    for (var k = 0; k < results.length; k++){

        if(results[k].id == uid){
            found = 1;
            results[k].count += 1;
            break;
        }
    }

    if (found == 0){
        results.concat([{"id" : uid, "count" : 1}]);
    }

}

// TODO: Implement is_taking, a helper function that checks if a specified uid is taking a specified course.

// HELPER FUNCTION
// Searches the list of users, checking if each is taking a specified course.
// If they are taking the specified course, return 1, else return 0.
function is_taking(uid, course){
    return 1;
}

// Helper function to sort based on number of hits in the search function.
function comparison(a,b) {
    if (a.count < b.count)
        return -1;
    if (a.count > b.count)
        return 1;
    return 0;
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

