(function () {
  function bind() {
    var google = document.getElementById('googleBtn');
    var facebook = document.getElementById('facebookBtn');
    function start(provider) {
      return function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.assign('/api/auth/oauth/' + provider + '/start');
      };
    }
    if (google) google.addEventListener('click', start('google'), true);
    if (facebook) facebook.addEventListener('click', start('facebook'), true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
