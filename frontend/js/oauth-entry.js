(function () {
  function bind() {
    var google = document.getElementById('googleBtn');
    var facebook = document.getElementById('facebookBtn');
    if (google) google.onclick = function () { window.location.assign('/api/auth/oauth/google/start'); };
    if (facebook) facebook.onclick = function () { window.location.assign('/api/auth/oauth/facebook/start'); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
