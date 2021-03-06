$(function(){
  $('#fb-login-bt').click(function(){
    FB.init({
      appId      : '1805953083025948',
      cookie     : true,  // enable cookies to allow the server to access
                          // the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v2.8' // use graph api version 2.8
    });
    FB.login(function(response) {
      // handle the response
      FB.api('/me?fields=email,name', function(response) {
        if(response.error != null){
          alert("You need to authorize first!");
        } else{
        var fbID = response.id;
        var name = response.name;
        var email = response.email;

        console.log(response);
        var fullName = name.split(" ");
        var firstname = fullName[0];
        var lastname = fullName[1];

        var user = {
          firstname: firstname,
          lastname: lastname,
          email: email,
          fbid: fbID
        }

        FB.api("/me/friends", function (response) {
          if(response.error) { console.log(response.error)}
          user.friends = response.data;

          $.post("/signupfb", user, function(resp){
            console.log(JSON.stringify(resp));
            if(resp.error == null || resp.error.length== 0){
                        $.get("/getuser/" + resp.userID, function(resp){
                          if(resp.level == "user")
                            {
                              var form = document.createElement("form");

                              form.method = "POST";
                              form.action = "/main";

                              document.body.appendChild(form);
                              form.submit();
                            }
                            else
                                {
                                var form = document.createElement("form");

                              form.method = "POST";
                              form.action = "/admin";

                              document.body.appendChild(form);
                              form.submit();
                                }
                      });
            }
            else
              alert("Error occurred!");
          })

        });
      }
      });

    }, {scope: 'public_profile, email, user_friends'});
  })

  $("#login-link").click(function(e){
    e.preventDefault();
    if($("#signup-link").hasClass("active")){
      $("#signup-link").removeClass("active");
      $("#login-link").addClass("active");
      //+150
      $("#login-nav .selected").animate({
        left: "-=150"
      }, 700, function(){
        //if this is not active, hide this and show other one
        $(".sign-up-box").fadeOut("slow", function(){
          $(".login-box").fadeIn("slow");
        });
      });
    }
  })

  $("#signup-link").click(function(e){
    e.preventDefault();
    if($("#login-link").hasClass("active")){
      $("#login-link").removeClass("active");
      $("#signup-link").addClass("active");

      $("#login-nav .selected").animate({
        left: "+=150"
      }, 700, function(){
        //if this is not active, hide this and show other one
        $(".login-box").fadeOut("slow", function(){
          $(".sign-up-box").fadeIn("slow");
        });
      });
    }
  })

  //form validation of login
  $("#login-bt").click(function(){
    //remove login box color outline
    $(".login-box .text-field").removeClass("error");

    var email = $(".login-box #email").val();
    var password = $(".login-box #password").val();

    console.log(email);
    console.log(password);

    //post request to login
    $.post("/login", {
      email: email,
      password: password
    }, function(data){
      console.log(data);
      $(".login-box .text-field").removeClass("error");
      $(".error.msg").remove();
      if(data.errors != "done"){
        $(".login-box .text-field").addClass("error");
        $(".login-box .text-field").effect("shake");
        $(".login-box").append("<div class='error msg'>" + data.errors + "</div>");
      } else {
        //check if current user is verified if not send to verified
        $.get("/session", function(data){
          if(!data.emailverified){
            //send to dashboard
            window.location.href = "/email";
          } else {
            $.get("/getuser/" + data.userid, function(resp){
              if(resp.level == "user") {
                  var form = document.createElement("form");

                  form.method = "POST";
                  form.action = "/main";

                  document.body.appendChild(form);
                  form.submit();
                } else {
                    var form = document.createElement("form");

                  form.method = "POST";
                  form.action = "/admin";

                  document.body.appendChild(form);
                  form.submit();
                }
          });

          }

          })

        } //parent else
    });

  })

  $("#signup-bt").click(function(){
    $(".sign-up-box .text-field").removeClass("error");

    var firstname = $(".sign-up-box #firstname").val();
    var lastname = $(".sign-up-box #lastname").val();
    var email = $(".sign-up-box #signup-email").val();
    var password = $(".sign-up-box #pwd").val();
    var confirmpwd = $(".sign-up-box #confirmpwd").val();

    //post request to signup
    $.post("/signup", {
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password,
      confirmpwd: confirmpwd
    }, function(data){
      console.log(data);
      console.log(data.errors.length);
      if(data.errors == null || data.errors.length == 0){
        window.location.href = "/email";
      }

      //remove errors from all text fields
      $(".sign-up-box .text-field").removeClass("error");
      $(".sign-up-box .error.msg").remove();

      for(var i = 0; i < data.errors.length; i++){
        if(typeof data.errors[i].field == "object"){
          for(var j = 0; j < data.errors[i].field.length; j++){
            $(".sign-up-box #" + data.errors[i].field[j]).addClass("error");
            $(".sign-up-box #" + data.errors[i].field[j]).effect("shake");
            $(".sign-up-box #" + data.errors[i].field[j]).after("<div class='error msg'>" + data.errors[i].msg + "</div>");
          }

        } else {
          $(".sign-up-box #" + data.errors[i].field).addClass("error");
          $(".sign-up-box #" + data.errors[i].field).effect("shake");

          $(".sign-up-box #" + data.errors[i].field).after("<div class='error msg'>" + data.errors[i].msg + "</div>");
        }

      }
    })

  })

})
