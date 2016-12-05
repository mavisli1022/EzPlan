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
     console.log(name1 + name2);

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
                //console.log(JSON.stringify(ttObj));

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
            //console.log(JSON.stringify(returnOBJ));
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

    var uid = req.query.userid;

    var results = [];
    var results_temp = [];

    var userList;
    var users;

    var temp_user1;
    var temp_user2;
    var count;
    var ind;

    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){

        db.collection("timetable").find().toArray(function(err, doc) {
            userList = doc;

            db.collection("users").find().toArray(function(err, doc) {
                users = doc;


                for (var i = 0; i < userList.length; i++){
                    if (userList[i]["userid"] == uid) {
                        ind = i;
                    }
                }

                for(i = 0; i < userList.length; i++){
                    if (userList[i]["userid"] != uid){
                        temp_user2 = userList[i];

                        count = compare_users(userList[ind], userList[i]);
                        results_temp.push({"user" : userList[i].userid, "count" : count});
                    }
                }

                results_temp.sort(comparison);

                // Given the user id from our search, find that user in the users collection, and push the user object to results.
                for(i = 0; i < results_temp.length; i++) {
                    for (var j = 0; j < users.length; j++){
                        if (results_temp[i]["user"] == users[j]["userid"]){
                            results.push({user: users[j], common: results_temp[i]["count"]});
                        }
                    }
                }

                // Send back a sorted list of user objects to be displayed in recommended friends.
                res.send(results);
            });
        });
    });



};


/* A function to search the database for classmates based on search queries.
*  The function returns a list of users who were 'hits', ranked by how closely the matched the search terms.
* */
exports.searchClassmates = function(req, res){



    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
        var userList;
        var users;


        db.collection("timetable").find().toArray(function(err, doc) {
            userList = doc;

            db.collection("users").find().toArray(function(err, doc) {
                users = doc;

                if (userList == []){
                    res.send("Failed to connect to the database");
                }

                var course = req.query.courseCodeInput;
                var section = req.query.sectionCodeInput;

                var results_obj = [];
                var results = [];

                // For every user with a timetable.
                for(var j = 0; j < userList.length; j++){

                    // If the search term matches a course that the user is taking, add them to the results array.
                    if (is_taking(userList[j], course, section)){
                        results_obj.push(userList[j].userid);
                    }
                }

                // Given the user id from our search, find that user in the users collection, and push the user object to results.
                for (var i = 0; i < results_obj.length; i++){

                    for (var j = 0; j < users.length; j++){
                        if (results_obj[i] == users[j]["userid"]){

                            results.push(users[j]);
                        }
                    }
                }
                res.send(results);

                //db.close();

            });

        });

    });

};


exports.delUser = function(req, res){
    // Delete a user, specified by userid

    var tempUser = req.body;
    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
        db.collection("users").removeOne({
            "userid" : parseInt(tempUser.removeuid)
        });
    });


}

exports.updateUser = function(req, res){

    var tempUser = req.body;
    console.log(tempUser.updateFirstnameInput);
    console.log(tempUser.updateUseridInput);
    console.log(tempUser.dropDownLevelUpdate);

    if (tempUser.updateFirstnameInput != ''){

        MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
            db.collection("users").updateOne({
                    "userid" : parseInt(tempUser.updateUseridInput)
                },
                { $set:
                    {
                        "firstname" : tempUser.updateFirstnameInput
                    }
                });
        });
    }

    if (tempUser.updateLastnameInput != ''){
        MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
            db.collection("users").updateOne({
                    "userid" : parseInt(tempUser.updateUseridInput)
                },
                { $set:
                    {
                        "lastname" : tempUser.updateLastnameInput
                    }
                });
        });
    }

    if (tempUser.updateEmailInput != ''){
        MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
            db.collection("users").updateOne({
                    "userid" : parseInt(tempUser.updateUseridInput)
                },
                { $set:
                    {
                        "email" : tempUser.updateEmailInput
                    }
                });
        });
    }

    if (tempUser.updatePasswordInput != ''){
        MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
            db.collection("users").updateOne({
                    "userid" : parseInt(tempUser.updateUseridInput)
                },
                { $set:
                    {

                        "password" : md5(tempUser.updatePasswordInput)
                    }
                });
        });
    }

    if (tempUser.dropDownLevelUpdate != null){
        MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
            db.collection("users").updateOne({
                    "userid" : parseInt(tempUser.updateUseridInput)
                },
                { $set:
                    {
                        "level" : tempUser.dropDownLevelUpdate
                    }
                });
        });
    }
    if (tempUser.dropDownDiscoverableUpdate != null){
        MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
            db.collection("users").updateOne({
                    "userid" : parseInt(tempUser.updateUseridInput)
                },
                { $set:
                {
                    "discoverable" : tempUser.dropDownDiscoverableUpdate
                }
                });
        });
    }
    res.send("Success");



    // if (newUser.level != 'null'){
    //     MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    //
    //         db.collection("users").updateOne({
    //                 "userid" : tempUser.updateUseridInput
    //             },
    //             { $set:
    //             {
    //                 "userid" : parseInt(new_obj.updateUseridInput),
    //                 "firstname" : new_obj.updateFirstnameInput,
    //                 "lastname" : new_obj.updateLastnameInput,
    //                 "email" : new_obj.updateEmailInput,
    //                 "password" : md5(new_obj.updatePasswordInput),
    //                 "level" : new_obj.dropDownLevelUpdate,
    //                 "discoverable": new_obj.updateDiscoverable
    //             }
    //             })
    //     });
    // }
    // else {
    //     MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){
    //         db.collection("users").updateOne({
    //                 "userid" : tempUser.updateUseridInput
    //             },
    //             { $set:
    //             {
    //                 "userid" : new_obj.updateUseridInput,
    //                 "firstname" : new_obj.updateFirstnameInput,
    //                 "lastname" : new_obj.updateLastnameInput,
    //                 "email" : new_obj.updateEmailInput,
    //                 "password" : md5(new_obj.updatePasswordInput),
    //                 "discoverable": new_obj.updateDiscoverable
    //
    //             }
    //         });
    //     });
    // }

}


exports.allUsers = function(req,res){

    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db) {
        var users;

        db.collection("users").find().toArray(function (err, doc) {
            users = doc;
            res.send(users);
        });
    });
}

exports.addUser = function(req, res){
    // Add a user with info delivered in the request body
    var tempUser = req.body;

    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){

        var newid;

        db.collection("users").find().sort({"userid":-1}).limit(1).forEach(function(doc) {
            newid = doc.userid + 1;
            try {
                db.collection("users").insertOne({
                    "userid" : newid,
                    "firstname" : tempUser.addFirstnameInput,
                    "lastname" : tempUser.addLastnameInput,
                    "email" : tempUser.addEmailInput,
                    "password" : md5(tempUser.addPasswordInput),
                    "level" : tempUser.dropDownLevel,
                    "emailverified" : true,
                    "discoverable" : true,
                    "fbconnected" : false,
                    "fbID" : null
                }, function(err, doc){
                    userID = newid;
                    //db.close();
                })
            } catch(e){
                console.log(e);
            }
        });

    });


    res.send("Success");
}

// HELPER FUNCTION
// Searches the results list. If the user is already there, increment the counter,
// if the user is not there, add the object
// function add_or_inc(uid, results){
//
//     var found = 0;
//
//     for (var k = 0; k < results.length; k++){
//
//         if(results[k].id == uid){
//             found = 1;
//             results[k].count += 1;
//             break;
//         }
//     }
//
//     if (found == 0){
//         results.concat([{"id" : uid, "count" : 1}]);
//     }
//
// }

// HELPER FUNCTION
// Searches the list of users, checking if each is taking a specified course.
// If they are taking the specified course, return 1, else return 0.
function is_taking(uid, course, section){

    for (var i = 0; i < uid.courseSummary.length; i++){
        // If the course code matches the course passed in to is_taking
        if (uid.courseSummary[i].summary.split(" ")[0] == course && uid.courseSummary[i].summary.split(" ")[1] == section){
            return 1;
        }
    }

    return 0;
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
function compare_users(usera, userb) {
    var counter = 0;
    var courseList = [];
    // console.log(usera["courseSummary"]);
    // console.log(userb["courseSummary"]);
    for (var i = 0; i < usera["courseSummary"].length; i++){

        for (var j = 0; j < userb["courseSummary"].length; j++){

            if (usera["courseSummary"][i]["summary"] == userb["courseSummary"][j]["summary"] && courseList.indexOf(usera["courseSummary"][i]) == -1){
                counter += 1;
                break;
            }
        }

        courseList.push(usera["courseSummary"][i])
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
