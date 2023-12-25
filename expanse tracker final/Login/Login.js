var users = [
  { username: "jolin", password: "2331140"},
  { username: "ketrick", password: "2331141"},
  { username: "jenifer", password: "2331142"},
  { username: "nanda", password: "2331144" },
  { username: "anggit", password: "2331149" }
];

function validateLogin() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  var ValidUser = false;

  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
      ValidUser = true;
      break;
    }
  }

  if (ValidUser) {
    window.location.href = "../Home Page/index.html";
  } else {
    alert("Login gagal. Periksa Username dan Password Anda.");
  }
}
function togglePassword() {
  var passwordInput = document.getElementById("password");
  var showPasswordImg = document.querySelector(".show-password img");

  if (passwordInput.type === "password") {
      passwordInput.type = "text";
      showPasswordImg.src = "assets/hide.png";
  } else {
      passwordInput.type = "password";
      showPasswordImg.src = "assets/eye-icon.png";
  }
}


