function chooseFile(){
    var x = document.getElementById("myFile");
    var txt = "";
    if ('files' in x) {
        if (x.files.length == 0) {
            txt = "Please import your calendar and rename it as calendar.ics";
        } else {
            var file = x.files[0];
            txt += "Please click button to submit: "
            txt += file.name + "<br>";
        }
    }
    document.getElementById("show_file_info").innerHTML = txt;
}
