function allApplicants(uid) {

    $.get('recommended', {uid: uid}, function (data) {



    });
}



$(document).ready(function() {

    var uid;
    var users = []

    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){

        users = db.collection("session").find().toArray(function (err, result) {
            if (err) {
                console.log(err);
            }
            db.close();
        });
    });
    uid = users[0]["userid"];

    allApplicants(uid);

});