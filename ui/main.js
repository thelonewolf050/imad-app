alert('working main js');
var submit = document.getElementById('submit_btn');
submit.onClick = function() {
    //create request object
    var request= new XMLHttpRequest();
    
    request.onreadystatechange= function() {
        if(request.readyState === XMLHttpRequest.DONE) {
            
            if(request.status === 200) {
                alert("Logged in successfully");
            }
            else if (request.status === 403) {
                alert("Username or pass incorrect");
            }
            else if(request.status === 500) {
                alert("Something went wrong on the server");
            }
        }
    };
  
    //MAKE a REQUEST
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    console.log(password);
    console.log(username);
    request.open('POST', 'http://nikhilsingh050.imad.hasura-app.io/login', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({username: username, password: password}));
};
