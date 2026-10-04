/* SAKAN — 20-language site translation system */
(function () {
  "use strict";

  var LANGUAGES = [
    ["ar","العربية"],["en","English"],["de","Deutsch"],["fr","Français"],
    ["es","Español"],["it","Italiano"],["nl","Nederlands"],["pt","Português"],
    ["ru","Русский"],["uk","Українська"],["pl","Polski"],["tr","Türkçe"],
    ["ro","Română"],["el","Ελληνικά"],["sv","Svenska"],["da","Dansk"],
    ["no","Norsk"],["fi","Suomi"],["cs","Čeština"],["hu","Magyar"]
  ];

  var RTL = { ar: true };
  var KEY = "sakanPreferredLanguage";

  function normalize(v) {
    v = String(v || "").trim().toLowerCase();
    var map = {
      العربية:"ar", "العربية / الألمانية":"ar", arabic:"ar",
      english:"en", الإنجليزية:"en", deutsch:"de", german:"de", الألمانية:"de",
      français:"fr", french:"fr", الفرنسية:"fr", español:"es", spanish:"es", الإسبانية:"es",
      italiano:"it", italian:"it", الإيطالية:"it", nederlands:"nl", dutch:"nl", الهولندية:"nl",
      português:"pt", portuguese:"pt", البرتغالية:"pt", русский:"ru", russian:"ru", الروسية:"ru",
      українська:"uk", ukrainian:"uk", الأوكرانية:"uk", polski:"pl", polish:"pl", البولندية:"pl",
      türkçe:"tr", turkish:"tr", التركية:"tr", română:"ro", romanian:"ro", الرومانية:"ro",
      ελληνικά:"el", greek:"el", اليونانية:"el", svenska:"sv", swedish:"sv", السويدية:"sv",
      dansk:"da", danish:"da", الدنماركية:"da", norsk:"no", norwegian:"no", النرويجية:"no",
      suomi:"fi", finnish:"fi", الفنلندية:"fi", čeština:"cs", czech:"cs", التشيكية:"cs",
      magyar:"hu", hungarian:"hu", المجرية:"hu"
    };
    return map[v] || (v.length === 2 ? v : "");
  }

  function memberLanguage() {
    try {
      var user = JSON.parse(localStorage.getItem("sakanCurrentUser") || "{}");
      var profile = JSON.parse(localStorage.getItem("sakanProfileData") || "{}");
      return normalize(
        localStorage.getItem(KEY) ||
        user.preferredLanguage || user.language || user.lang ||
        profile.preferredLanguage || profile.language || profile.lang ||
        navigator.language
      ) || "ar";
    } catch (_) {
      return "ar";
    }
  }

  function setDirection(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL[lang] ? "rtl" : "ltr";
    document.body && document.body.setAttribute("dir", RTL[lang] ? "rtl" : "ltr");
  }

  function googleSelect() {
    return document.querySelector(".goog-te-combo");
  }

  function apply(lang) {
    lang = normalize(lang) || "ar";
    localStorage.setItem(KEY, lang);
    setDirection(lang);

    var select = googleSelect();
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }

    var button = document.getElementById("languageBtn");
    if (button) {
      var label = LANGUAGES.find(function (item) { return item[0] === lang; });
      button.textContent = "🌐 " + (label ? label[1] : lang);
    }

    var ownSelect = document.getElementById("sakanLanguageSelect");
    if (ownSelect) ownSelect.value = lang;
  }

  window.sakanSetLanguage = apply;

  function buildUI() {
    if (document.getElementById("sakanLanguageSwitcher")) return;

    var headerButton = document.getElementById("languageBtn");
    var wrap = document.createElement("div");
    wrap.id = "sakanLanguageSwitcher";
    wrap.className = "notranslate";
    wrap.setAttribute("translate", "no");

    var select = document.createElement("select");
    select.id = "sakanLanguageSelect";
    select.setAttribute("aria-label", "Language");
    LANGUAGES.forEach(function (item) {
      var option = document.createElement("option");
      option.value = item[0];
      option.textContent = item[1];
      select.appendChild(option);
    });

    var googleHost = document.createElement("div");
    googleHost.id = "google_translate_element";
    googleHost.setAttribute("aria-hidden", "true");
    wrap.appendChild(document.createTextNode("🌐"));
    wrap.appendChild(select);
    wrap.appendChild(googleHost);

    if (headerButton && headerButton.parentElement) {
      wrap.classList.add("in-header");
      headerButton.parentElement.insertBefore(wrap, headerButton);
      headerButton.style.display = "none";
    } else {
      wrap.classList.add("floating");
      document.body.appendChild(wrap);
    }

    select.value = memberLanguage();
    select.addEventListener("change", function () {
      apply(select.value);
    });
  }

  function loadGoogle() {
    if (window.google && window.google.translate) {
      try { new google.translate.TranslateElement({
        pageLanguage: "ar",
        includedLanguages: LANGUAGES.map(function (x) { return x[0]; }).join(","),
        autoDisplay: false,
        multilanguagePage: true
      }, "google_translate_element"); } catch (_) {}
      setTimeout(function () { apply(memberLanguage()); }, 600);
      return;
    }

    window.googleTranslateElementInit = function () {
      try { new google.translate.TranslateElement({
        pageLanguage: "ar",
        includedLanguages: LANGUAGES.map(function (x) { return x[0]; }).join(","),
        autoDisplay: false,
        multilanguagePage: true
      }, "google_translate_element"); } catch (_) {}
      setTimeout(function () { apply(memberLanguage()); }, 600);
    };

    var script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);
  }

  function addStyle() {
    if (document.getElementById("sakanLanguageStyle")) return;
    var style = document.createElement("style");
    style.id = "sakanLanguageStyle";
    style.textContent =
      "#sakanLanguageSwitcher{display:flex;align-items:center;gap:6px;direction:ltr;font-family:Arial,sans-serif}" +
      "#sakanLanguageSwitcher.floating{position:fixed;top:14px;right:14px;z-index:2147483647;padding:7px 9px;border:1px solid rgba(212,175,55,.45);border-radius:12px;background:rgba(7,13,21,.94);box-shadow:0 8px 25px rgba(0,0,0,.28)}" +
      "#sakanLanguageSwitcher.in-header{position:relative;z-index:10;padding:0;margin:0}" +
      "#sakanLanguageSwitcher select{border:1px solid rgba(216,179,93,.45);outline:0;background:#111a25;color:#fff;border-radius:9px;padding:8px 28px 8px 10px;font-size:12px;cursor:pointer;min-width:125px}" +
      "#sakanLanguageSwitcher.in-header select{background:transparent;border-color:rgba(216,179,93,.35);min-width:118px}" +
      ".goog-te-banner-frame,.skiptranslate iframe{display:none!important}" +
      "body{top:0!important}" +
      ".goog-logo-link,.goog-te-gadget,.goog-te-gadget-icon,.goog-te-balloon-frame,.goog-te-menu-frame{display:none!important;visibility:hidden!important}" +
      "body>.skiptranslate:not(#sakanLanguageSwitcher){display:none!important;visibility:hidden!important}" +
      "iframe[src*='translate.google'],iframe[src*='translate.googleusercontent']{display:none!important;visibility:hidden!important}" +
      "@media(max-width:700px){#sakanLanguageSwitcher.in-header select{min-width:105px;font-size:11px;padding:7px 22px 7px 7px}#sakanLanguageSwitcher.floating{top:8px;right:8px}}";
    document.head.appendChild(style);
  }

  function removeExtraGoogleTranslateUI() {
    var selectors = [".goog-te-gadget-icon",".goog-te-balloon-frame",".goog-te-menu-frame","body>.skiptranslate:not(#sakanLanguageSwitcher)","iframe[src*='translate.google']","iframe[src*='translate.googleusercontent']"];
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
      });
    });
  }

  function init() {
    if (!document.body) return;
    addStyle();
    buildUI();
    setDirection(memberLanguage());
    loadGoogle();
    removeExtraGoogleTranslateUI();
    setTimeout(removeExtraGoogleTranslateUI, 800);
    setTimeout(removeExtraGoogleTranslateUI, 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
