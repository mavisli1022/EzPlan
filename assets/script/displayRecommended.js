function allApplicants(uid) {

    $.get('recommended', {uid: 0}, function (data) {

        var resultsArray = data;
        var parent = document.getElementById("recommendedDiv");

        for (var i = 0; i < resultsArray.length; i++){
            name = "result" + i.toString();
            tempNode = document.createElement(name);

            text = resultsArray[i]["firstname"] + " " + resultsArray[i]["lastname"] + "\n";

            textContents = document.createTextNode(text);
            tempNode.appendChild(textContents);

            parent.appendChild(tempNode)
        }

    });
}



$(document).ready(function() {

    var uid;
    var user = [];

    MongoClient.connect("mongodb://ezplan:12ezplan34@ds013916.mlab.com:13916/ezplan", function(err, db){

        user = db.collection("session").find().toArray(function (err, result) {
            if (err) {
                console.log(err);
            }
            db.close();
        });
    });
    uid = user[0]["userid"];
    allApplicants(uid);

});