// Routing - show correct section
function showPage() {
  let hash = window.location.hash || "#home";
  document.querySelectorAll(".page").forEach(sec => sec.style.display = "none");
  document.querySelector(hash).style.display = "block";
}
window.addEventListener("hashchange", showPage);
window.addEventListener("load", showPage);

// Live Preview
document.getElementById("name").addEventListener("input", e => {
  document.getElementById("previewName").textContent = e.target.value;
});
document.getElementById("email").addEventListener("input", e => {
  document.getElementById("previewEmail").textContent = e.target.value;
});

// Form Validation & Save to Profile
document.getElementById("regForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let pass = document.getElementById("password").value;
  let confirmPass = document.getElementById("confirmPassword").value;

  // Validation
  if (name.length < 3) {
    alert("Name must be at least 3 characters long");
    return;
  }
  if (!email.includes("@")) {
    alert("Enter a valid email");
    return;
  }
  if (pass.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  }
  if (pass !== confirmPass) {
    alert("Passwords do not match");
    return;
  }

  // Save to Profile
  document.getElementById("profileName").textContent = name;
  document.getElementById("profileEmail").textContent = email;

  // Redirect to Profile
  window.location.hash = "#profile";
  alert("Registration successful! Check Profile page.");
});