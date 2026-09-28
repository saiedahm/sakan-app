/* SAKAN social login client */
(function () {
  "use strict";

  function apiBase() {
    return (window.SAKAN_API_BASE || localStorage.getItem("sakanApiBase") || "/api").replace(/\/$/, "");
  }

  function start(provider) {
    window.location.assign(apiBase() + "/auth/oauth/" + provider + "/start");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var google = document.getElementById("googleBtn");
    var facebook = document.getElementById("facebookBtn");
    if (google) google.addEventListener("click", function () { start("google"); });
    if (facebook) facebook.addEventListener("click", function () { start("facebook"); });

    var params = new URLSearchParams(window.location.search);
    var token = params.get("oauth_token");
    if (token) {
      localStorage.setItem("sakanAuthToken", token);
      params.delete("oauth_token");
      params.delete("oauth_error");
      params.delete("message");
      var clean = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
      window.history.replaceState({}, document.title, clean);
      window.location.assign("/");
      return;
    }

    var error = params.get("oauth_error");
    if (error) {
      var message = document.getElementById("registerMessage");
      if (message) {
        message.textContent = params.get("message") || "تعذر تسجيل الدخول. حاول مرة أخرى.";
        message.className = "form-message error";
      }
    }
  });
})();
