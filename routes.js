var express = require('express');
var util = require("util");
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var md5 = require('js-md5');

// @import url('https://fonts.googleapis.com/css?family=NTR');

// Placeholder that contains all of the user objects to be searched through.

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
        name1 = name[0];
        name2 = name[1];
     }

     //console.log(name1 + name2)
  
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
                    if (returnOBJ['commonCourse'][n].summary == ttObj[1].courseSummary[m].summary){
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

/*  A function to search the database for recommended friends based on schedule similarity.
 *  The function returns a list of users who were 'hits', ranked by how closely the matched the search terms.
 * */
exports.recommendedFriends = function(req, res){

    var uid = req.query.uid;


    // MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    //
    //     uid = db.collection("session").find().toArray()["userid"];
    //
    // });

    var results = [];
    var results_temp = [];

    var userList = [];
    var users = [];

    var temp_user1;
    var temp_user2;


    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){

        userList = db.collection("timetable").find().toArray();

        users = db.collection("users").find().toArray();
    });

    for (var i = 0; i < userList.length; i++){
        if (userList[i].userid == uid) {
            temp_user1 = userList[i];
        }
    }

    for(i = 0; i < userList.length; i++){
        if (userList[i].userid != uid){
            temp_user2 = userList[i];
            results_temp.push([{"user" : userList[i], "count" : compare_users(temp_user1, temp_user2)}]);
        }
    }

    results_temp.sort(comparison);

    // Given the user id from our search, find that user in the users collection, and push the user object to results.
    for(i = 0; i < results_temp.length; i++) {
        for (var j = 0; j < users.length; j++){
            if (results_temp[i]["user"] == users[j]["userid"]){
                results.push(users[j]);
            }
        }
    }

    // Send back a sorted list of user objects to be displayed in recommended friends.
    res.send(results);
};


// /* A function to search the database for classmates based on search queries.
// *  The function returns a list of users who were 'hits', ranked by how closely the matched the search terms.
// *  TODO: Current implementation only searches for classmates in the same COURSE, not the same SECTION
// * */
// exports.searchClassmates = function(req, res){
//
//     // The request contains a search query. Each word in the query is compared to all users. The format of the query is
//     // as follows:
//     // Example: /search?q=Seb+Balda+CSC365
//     // req.query.q: the body of the search, the terms to be searched for.
//
//     var userList = [];
//     var users = [];
//
//     MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
//
//         userList = db.collection("timetable").find().toArray();
//
//         users = db.collection("users").find().toArray();
//     });
//
//
//     if (userList == []){
//         res.send("Failed to connect to the database");
//     }
//
//     // Split the search terms into array elements to be iterated through.
//     var search_terms = req.query.q.split(" ");
//
//     // The array containing the "hits" from the search. Contains a pair of userid and count (number of hits to sort by)
//     var results_obj = [];
//     var results = [];
//
//     // For every search term.
//     for (var i = 0; i < search_terms.length; i++){
//
//         // Compare the term with the user's attributes
//         for(var j = 0; j < userList.length; j++){
//
//             // If the search term matches on of their names.
//             if (search_terms[i] == userList[j].firstname || search_terms[i] == userList[j].lastname){
//                 add_or_inc(userList[j].userid, results_obj);
//             }
//             else if (i < search_terms.length - 1 && is_taking(userList[j].userid, [search_terms[i], search_terms[i+1]])){
//                 add_or_inc(userList[j].userid, results_obj);
//             }
//             // If the search term matches a course that the user is taking.
//             else if (is_taking(userList[j].userid, search_terms[i])){
//                 add_or_inc(userList[j].userid, results_obj);
//             }
//         }
//     }
//
//     // Now we have an array of objects with a uid/count pairing.
//     // Next lets construct a new array that only contains ids, sorted by search relevance
//
//     results_obj.sort(comparison);
//
//     // Given the user id from our search, find that user in the users collection, and push the user object to results.
//     for (i = 0; i < results_obj.length; i++){
//
//         for (j = 0; j < users.length; j++){
//
//             if (results_obj[i]["id"] == users[j]["userid"]){
//                 results.push(users[j]);
//             }
//         }
//     }
//
//     res.send(results)
// };


exports.delUser = function(req, res){
    // Delete a user, specified by userid
}

exports.updateUser = function(req, res){
    // Update a user given a specified field, and new value.

    var tempUser = req.body;

    console.log(req.body);

    var newUser = {
        "userid" : tempUser.updateUseridInput,
        "firstname" : tempUser.updateFirstnameInput,
        "lastname" : tempUser.updateLastnameInput,
        "email" : tempUser.updateEmailInput,
        "password" : md5(tempUser.updatePasswordInput),
        "level" : tempUser.dropDownLevelUpdate,
        "emailverified" : true,
        "fbconnected" : false,
        "fbID" : null
    };

    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
        db.collection("users").updateOne({
            "userid" : tempUser.updateUseridInput,
        },
        { $set:
            {
                "userid" : tempUser.updateUseridInput,
                "firstname" : tempUser.updateFirstnameInput,
                "lastname" : tempUser.updateLastnameInput,
                "email" : tempUser.updateEmailInput,
                "password" : md5(tempUser.updatePasswordInput),
                "level" : tempUser.dropDownLevelUpdate
            }
        })
    });

    console.log(newUser);

    res.send("Success");
}

exports.addUser = function(req, res){
    // Add a user with info delivered in the request body
    var tempUser = req.body;

    console.log(req.body);

    var newUser = {
        "userid" : tempUser.addUseridInput,
        "firstname" : tempUser.addFirstnameInput,
        "lastname" : tempUser.addLastnameInput,
        "email" : tempUser.addEmailInput,
        "password" : md5(tempUser.addPasswordInput),
        "level" : tempUser.dropDownLevel,
        "emailverified" : true,
        "fbconnected" : false,
        "fbID" : null
    };

    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
        db.collection("users").insertOne({
            "userid" : tempUser.addUseridInput,
            "firstname" : tempUser.addFirstnameInput,
            "lastname" : tempUser.addLastnameInput,
            "email" : tempUser.addEmailInput,
            "password" : md5(tempUser.addPasswordInput),
            "level" : tempUser.dropDownLevel,
            "emailverified" : true,
            "fbconnected" : false,
            "fbID" : null
        })
    });

    console.log(newUser);

    res.send("Success");
}

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

// HELPER FUNCTION
// Searches the list of users, checking if each is taking a specified course.
// If they are taking the specified course, return 1, else return 0.
function is_taking(uid, course){

    var temp = 0;

    if (course.length == 1){
        MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){

            db.collection("timetable").findOne({
                userid: uid
            }, function(err, doc){

                if (doc == null){
                    temp = 0;
                }

                else {
                    for (var i = 0; i < doc.courseSummary.length; i++){
                        // If the course code matches the course passed in to is_taking (does not consider section)
                        // TODO: Does not currently consider section
                        if (doc.courseSummary[i].summary.split(" ")[0] == course[0]){
                            temp = 1;
                        }
                    }
                }
            });
        });
    }

    else if (course.length == 2){
        MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){

            db.collection("timetable").findOne({
                userid: uid
            }, function(err, doc){

                if (doc == null){
                    temp = 0;
                }

                else {
                    for (var i = 0; i < doc.courseSummary.length; i++){
                        // If the course code matches the course passed in to is_taking (does not consider section)
                        // TODO: Does not currently consider section
                        if (doc.courseSummary[i].summary.split(" ")[0] == course[0]){
                            temp = 1;
                        }
                    }
                }
            });
        });
    }


    return temp;
}

// HELPER FUNCTION
// Sorts based on number of hits in the search function.
function comparison(a,b) {
    if (a.count < b.count)
        return -1;
    if (a.count > b.count)
        return 1;
    return 0;
}

// HELPER FUNCTION
// Returns the number of courses and sections two users have in common.
function compare_users(user1, user2) {
    var counter = 0;
    var courseList = [];
    for (var i = 0; i < user1.courseSummary.length; i++){

        for (var j = 0; i < user2.courseSummary.length; i++){

            if (user1.courseSummary[i].summary == user2.courseSummary[j].summary
                && courseList.indexOf(user1.courseSummary[i]) == -1){
                counter += 1;
                break;
            }
        }

        courseList.push(user1.courseSummary[i])
    }

    return counter;

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
      userid: user
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
