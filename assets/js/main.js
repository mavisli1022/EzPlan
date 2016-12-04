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
        }
        else{
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
            if(resp.error == null || resp.error.length== 0){
              var form = document.createElement("form");

              form.method = "POST";
              form.action = "/main";
     
              document.body.appendChild(form);
              form.submit();

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

    //post request to login
    $.post("/login", {
      email: email,
      password: password
    }, function(data){
      for(var i = 0; i < data.errors.length; i++){
        $(".login-box #" + data.errors[i].field).addClass("error");
        $(".login-box #" + data.errors[i].field).effect("shake");
      }
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
    })

  })

})
