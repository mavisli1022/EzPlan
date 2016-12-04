$(function(){
  //load data
  $.get('/session', function(data){
    $("#profile-body .name").append(data.firstname + " " + data.lastname);
    $("#profile-body .email.field").append(data.email);
    $("#profile-body .user-id.field").append(data.userid);
    $(".disc-toggle").attr("checked", data.discoverable);

    if(data.fbconnected){
      $("#profile-body .profile-row:nth-child(3)").hide();
    }
  })

  $(".profile-row .edit-toggle").click(function(){
    if($("#profile-body").hasClass("edit")){

      var name = $(".edit-name").val().split(" ");
      var firstname;
      var lastname;
      //for every name, add firstname and lastname
      for(var i = 0; i < name.length; i++){
        if(name[i] != "" && !firstname){
          firstname = name[i];
        } else if(name[i] != "" && firstname){
          lastname = name[i];
        }
      }

      firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
      lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1);

      var change = {
        firstname: firstname,
        lastname: lastname,
        email: $(".edit-email").val()
      }
      $.post("/edit", change, function(data){
        if(data == "done"){
          //change fields back to normal
          $(".edit-name").parent().html("<h2 class='name'>" + firstname + " " + lastname + "</h2>");
          $(".edit-email").parent().removeClass("edit");
          $(".edit-email").parent().html($(".edit-email").val());


          $("#profile-body").removeClass("edit");
          $(".edit-toggle.save").removeClass("save");
          $(".edit-toggle").addClass("edit");
          $(".edit-toggle").text("Edit");
        }
      })

    } else {
      $("#profile-body").addClass("edit");

      //change edit fields to textboxes
      $("#profile-body .name").parent().html("<input class='edit-name' value='" + $("#profile-body .name").text() + "' />");
      $("#profile-body .email.field").parent().addClass("edit");
      $("#profile-body .email.field").html("<input class='edit-email' value='" + $("#profile-body .email.field").text() + "' />");

      $(this).removeClass("edit");
      $(this).addClass("save");
      $(this).text("Save");
    }
  })


  $(".disc-toggle").click(function(){
    console.log($(".disc-toggle").attr("checked"));
    var changed;
    if($(".disc-toggle").attr("checked")){
      changed = false;
      $(".disc-toggle").removeAttr("checked");
    } else {
      changed = true;
      $(".disc-toggle").attr("checked", true);
    }

    $.post("/toggledisc/" + changed, function(data){
      console.log(data);
    })
  })

  $(".change-pwd.form-button").click(function(){
    if($(".change-pwd-dropdown").hasClass("hidden")){
      $(".change-pwd.form-button .fa").removeClass("fa-caret-down");
      $(".change-pwd.form-button .fa").addClass("fa-caret-up");
      $(".change-pwd-dropdown").removeClass("hidden");
      $(".change-pwd-dropdown").show();
    } else {
      $(".change-pwd.form-button .fa").removeClass("fa-caret-up");
      $(".change-pwd.form-button .fa").addClass("fa-caret-down");
      $(".change-pwd-dropdown").addClass("hidden");
      $(".change-pwd-dropdown").hide();
    }
  })

  //change password
  $("#profile-body .change-pwd-dropdown .confirmpwd-bt a").click(function(e){
    var currentPwd = $(".change-pwd-dropdown #prevpass").val();
    var newPwd = $(".change-pwd-dropdown #newpass").val();
    var confnewPwd = $(".change-pwd-dropdown #newpassconf").val();

    var pwds = {
      current: currentPwd,
      newPass: newPwd,
      confPass: confnewPwd
    }

    $.post('/changepwd', pwds, function(data){
      console.log(data);
    })

  })

})
