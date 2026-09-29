/* SAKAN home enhancements: continuous member strip, 20-language selector,
   full-page Google Translate bridge, logo fallback, and useful header space. */
(function () {
  "use strict";

  var LANGS = [
    ["ar", "العربية"], ["de", "Deutsch"], ["en", "English"], ["fr", "Français"],
    ["es", "Español"], ["it", "Italiano"], ["nl", "Nederlands"], ["pt", "Português"],
    ["tr", "Türkçe"], ["ru", "Русский"], ["uk", "Українська"], ["pl", "Polski"],
    ["sv", "Svenska"], ["da", "Dansk"], ["no", "Norsk"], ["fi", "Suomi"],
    ["el", "Ελληνικά"], ["ro", "Română"], ["cs", "Čeština"], ["hu", "Magyar"]
  ];

  function addStyle() {
    if (document.getElementById("sakan-home-enhancement-style")) return;
    var style = document.createElement("style");
    style.id = "sakan-home-enhancement-style";
    style.textContent = `
      .sakan-header-promo{flex:1;display:flex;justify-content:center;align-items:center;min-width:180px;padding:10px 18px;border:1px solid rgba(216,179,93,.16);border-radius:12px;background:linear-gradient(90deg,rgba(216,179,93,.08),rgba(255,255,255,.025),rgba(216,179,93,.08));color:#cdb36d;text-align:center;font-size:12px;line-height:1.6;box-shadow:0 5px 22px rgba(0,0,0,.12)}
      .sakan-language-menu{position:absolute;top:100%;right:0;z-index:9999;width:220px;max-height:420px;overflow:auto;padding:8px;border-radius:12px;background:#0b192b;border:1px solid rgba(216,179,93,.28);box-shadow:0 15px 40px rgba(0,0,0,.4);display:none}
      .sakan-language-wrap{position:relative}.sakan-language-menu.open{display:block}.sakan-language-menu button{display:block;width:100%;padding:9px 10px;margin:2px 0;text-align:right;border:0;border-radius:8px;background:transparent;color:#d6dde7;cursor:pointer}.sakan-language-menu button:hover{background:rgba(216,179,93,.1);color:#e2c574}
      #google_translate_element{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;left:-9999px!important;top:-9999px!important}
      .goog-te-banner-frame,.skiptranslate iframe{display:none!important}body{top:0!important}
      .strip-track.sakan-infinite{animation:none!important;transform:none!important}.strip-track.sakan-infinite .sakan-strip-copy{display:flex;gap:18px}
      @media(max-width:800px){.sakan-header-promo{display:none}.sakan-language-menu{right:auto;left:0}.header{gap:10px}.header-actions{flex-wrap:wrap;justify-content:flex-end}}
    `;
    document.head.appendChild(style);
  }

  function fixLogo() {
    document.querySelectorAll(".logo-mark img").forEach(function (img) {
      img.addEventListener("error", function () {
        if (img.dataset.fallback === "1") return;
        img.dataset.fallback = "1";
        img.src = "/assets/sakan-logo.png";
        setTimeout(function () {
          if (!img.complete || img.naturalWidth === 0) {
            img.src = "https://raw.githubusercontent.com/saiedahm/sakan-app/main/frontend/assets/sakan-logo.png";
          }
        }, 500);
      });
    });
  }

  function continuousStrip() {
    var track = document.getElementById("stripTrack");
    if (!track || track.dataset.infiniteReady === "1") return;
    var original = Array.prototype.slice.call(track.children);
    if (!original.length) return;
    var copy = document.createElement("div");
    copy.className = "sakan-strip-copy";
    original.forEach(function (node) { copy.appendChild(node.cloneNode(true)); });
    track.appendChild(copy);
    track.classList.add("sakan-infinite");
    track.dataset.infiniteReady = "1";
    var duration = Math.max(22, original.length * 2.8);
    track.style.animation = "sakanLoop " + duration + "s linear infinite";
    var style = document.createElement("style");
    style.textContent = "@keyframes sakanLoop{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}";
    document.head.appendChild(style);
  }

  function headerSpace() {
    var header = document.querySelector(".header");
    var actions = document.querySelector(".header-actions");
    if (!header || !actions || document.querySelector(".sakan-header-promo")) return;
    var promo = document.createElement("div");
    promo.className = "sakan-header-promo";
    promo.innerHTML = "<strong>سكن</strong> &nbsp; • &nbsp; تعارف جاد باحترام وخصوصية &nbsp; • &nbsp; <span>أعضاء جدد يوميًا</span>";
    header.insertBefore(promo, actions);
  }

  function languageMenu() {
    var button = document.getElementById("languageBtn");
    if (!button || button.dataset.languageReady === "1") return;
    button.dataset.languageReady = "1";
    var wrap = document.createElement("span");
    wrap.className = "sakan-language-wrap";
    button.parentNode.insertBefore(wrap, button);
    wrap.appendChild(button);
    var menu = document.createElement("div");
    menu.className = "sakan-language-menu";
    LANGS.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.lang = item[0];
      b.textContent = item[1];
      b.addEventListener("click", function () {
        setLanguage(item[0]);
        menu.classList.remove("open");
      });
      menu.appendChild(b);
    });
    wrap.appendChild(menu);
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
    document.addEventListener("click", function () { menu.classList.remove("open"); });
  }

  function loadGoogleTranslate() {
    if (window.google && window.google.translate) return;
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement({ pageLanguage: "ar", autoDisplay: false, includedLanguages: LANGS.map(function(x){return x[0];}).join(",") }, "google_translate_element");
    };
    var holder = document.createElement("div");
    holder.id = "google_translate_element";
    document.body.appendChild(holder);
    var script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }

  function setLanguage(lang) {
    localStorage.setItem("sakanLanguage", lang);
    if (lang === "ar") {
      document.cookie = "googtrans=/ar/ar;path=/";
      window.location.reload();
      return;
    }
    document.cookie = "googtrans=/ar/" + lang + ";path=/";
    var select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  }

  function start() {
    addStyle();
    fixLogo();
    continuousStrip();
    headerSpace();
    languageMenu();
    loadGoogleTranslate();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
