
    
  function showDate(){
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  const dateTime = date + "<br>"+time
  document.getElementById("date").innerHTML = dateTime;
  }

  setInterval(showDate, 1000);

  
document.addEventListener("DOMContentLoaded", function () {
    function checker(event){
        
        const form = document.getElementById("form1");

        if (!form.querySelector('[name="petType"]:checked')) {
            event.preventDefault();
            alert("Please select a pet type");
        }
        if (!form.querySelector('[name="gender"]:checked')) {
            event.preventDefault();
            alert("Please select a gender preference");
        }
        if (form.querySelectorAll('[name="compatibility"]:checked').length === 0) {
            event.preventDefault();
            alert("Please select at least one compatibility option");
        }
    }
    const form = document.getElementById("form1");
    if (form) {
        form.addEventListener("submit", checker);
        
    }
});
  

document.addEventListener("DOMContentLoaded", function () {
  function checker2(event) {
   
    const form = document.getElementById("form2");
    let pattern = /^[A-Za-z]+$/;

    if (!form.querySelector('[name="petType"]:checked')) {
        event.preventDefault(); 
        alert("Please select a pet type");
    }
    if (!form.querySelector('[name="gender"]:checked')) {
        event.preventDefault(); 
        alert("Please select a gender preference");
    }
    if (form.querySelectorAll('[name="comp"]:checked').length === 0) {
        event.preventDefault(); 
        alert("Please select at least one compatibility option");
    }
    const petDescription = form.querySelector('[name="comments"]').value.trim();
    if (petDescription === "") {
        event.preventDefault(); 
        alert("Please provide a description of your pet");
    }
   
    const firstName = form.querySelector('[name="ownerFirstName"]').value;
    const lastName = form.querySelector('[name="ownerLastName"]').value;
    if (!firstName.match(pattern) || !lastName.match(pattern) || firstName ===""||lastName ==="" ) {
        event.preventDefault(); 
        alert("Name should not contain numbers or be empty");
    }

    const email = form.querySelector('[name="ownerEmail"]').value;
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        event.preventDefault(); 
        alert("Please enter a valid email address");
    }
}
const form = document.getElementById("form2");
    if (form) {
        form.addEventListener("submit", checker2);
    }
});

document.addEventListener("DOMContentLoaded", function () {

});

function validateUserCredentials(form) {
    const usernameInput = form.querySelector('input[name="username"]');
    const passwordInput = form.querySelector('input[name="password"]');
    const username = usernameInput.value;
    const password = passwordInput.value;
  
    if (!username.match(/^[A-Za-z0-9]+$/)) {
      alert("Username can only contain letters and digits.");
      return false;
    }
    if (password.length < 4) {
      alert("Password must be at least 4 characters long.");
      return false;
    }
    if (!password.match(/^[A-Za-z0-9]+$/)) {
      alert("Password can only contain letters and digits.");
      return false;
    }
    if (!password.match(/[A-Za-z]/)) {
      alert("Password must contain at least one letter.");
      return false;
    }
    if (!password.match(/[0-9]/)) {
      alert("Password must contain at least one digit.");
      return false;
    }
    return true;
  }
  
  document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.getElementById("signup");
    const loginForm = document.getElementById("giveawayLoginForm");
    if (signupForm) {
      signupForm.addEventListener("submit", function(event) {
        if (!validateUserCredentials(signupForm)) {
          event.preventDefault();
        }
      });
    }
  
    if (loginForm) {
      loginForm.addEventListener("submit", function(event) {
        if (!validateUserCredentials(loginForm)) {
          event.preventDefault();
        }
      });
    }
  });
  