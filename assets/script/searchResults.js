function displaySearchResults(query) {

    $.get('recommended', {q: query}, function (data) {

        var resultsArray = data;

        // TODO: resultsPlaceholder
        var parent = document.getElementById("resultsPlaceholder");

    });
}


$(document).ready(function() {


    $('#searchUsers').submit(function (e) {
    e.preventDefault();
    let temp = $('#searchUsers').serializeArray();
    displaySearchResults(temp);

    });

});