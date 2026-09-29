/* SAKAN home UI fixes: reliable standalone logo, stable language menu, continuous member strip. */
(function () {
  "use strict";
  var LANGS = [["ar","العربية"],["de","Deutsch"],["en","English"],["fr","Français"],["es","Español"],["it","Italiano"],["nl","Nederlands"],["pt","Português"],["tr","Türkçe"],["ru","Русский"],["uk","Українська"],["pl","Polski"],["sv","Svenska"],["da","Dansk"],["no","Norsk"],["fi","Suomi"],["el","Ελληνικά"],["ro","Română"],["cs","Čeština"],["hu","Magyar"]];

  function css(){
    if(document.getElementById("sakan-ui-fix")) return;
    var s=document.createElement("style"); s.id="sakan-ui-fix";
    s.textContent=`
      .sakan-lang-wrap{position:fixed!important;right:18px;bottom:18px;z-index:10050}
      .sakan-lang-menu{position:absolute;right:0;bottom:52px;width:210px;max-height:330px;overflow:auto;padding:7px;background:#102033;border:1px solid rgba(216,179,93,.35);border-radius:12px;box-shadow:0 15px 35px rgba(0,0,0,.35);display:none}
      .sakan-lang-menu.open{display:block}.sakan-lang-menu button{display:block;width:100%;padding:8px 10px;margin:2px 0;border:0;border-radius:7px;background:transparent;color:#fff;text-align:right;cursor:pointer}.sakan-lang-menu button:hover{background:rgba(216,179,93,.16)}
      .sakan-lang-wrap>#languageBtn{border-radius:999px!important;box-shadow:0 5px 18px rgba(0,0,0,.22)}
      .sakan-header-promo{flex:1;display:flex;justify-content:center;align-items:center;min-width:180px;padding:8px 16px;border-radius:12px;background:rgba(216,179,93,.07);border:1px solid rgba(216,179,93,.14);color:#d8bd72;font-size:12px;text-align:center}
      .sakan-strip-window{overflow:hidden!important;width:100%!important;position:relative!important}
      .sakan-strip-marquee{display:flex!important;width:max-content!important;animation:sakanMarquee 34s linear infinite!important;will-change:transform;direction:ltr!important}
      .sakan-strip-group{display:flex!important;gap:18px;padding-inline:9px;flex-shrink:0!important}
      .sakan-strip-marquee .mini-member{flex-shrink:0!important}
      .sakan-strip-marquee .mini-avatar{width:80px;height:80px}
      .sakan-strip-marquee img{display:block;user-select:none;-webkit-user-drag:none}
      @keyframes sakanMarquee{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
      @media(max-width:800px){.sakan-header-promo{display:none}.sakan-lang-wrap{right:12px;bottom:12px}.sakan-lang-menu{right:0;bottom:48px}}
    `; document.head.appendChild(s);
  }

  function logo(){
    document.querySelectorAll(".logo-mark img").forEach(function(img){
      var candidates=["../assets/sakan-logo.png","/frontend/assets/sakan-logo.png","/assets/sakan-logo.png","https://raw.githubusercontent.com/saiedahm/sakan-app/main/frontend/assets/sakan-logo.png"];
      var i=0;
      function next(){if(i>=candidates.length)return;img.src=candidates[i++];}
      img.addEventListener("error",next);
      var current=img.getAttribute("src")||"";
      if(!current || current.indexOf("/assets/logo/")>=0) next();
    });
  }

  function language(){
    var b=document.getElementById("languageBtn"); if(!b||b.dataset.ready) return;
    b.dataset.ready="1"; var wrap=document.createElement("span"); wrap.className="sakan-lang-wrap"; b.parentNode.insertBefore(wrap,b); wrap.appendChild(b);
    var menu=document.createElement("div"); menu.className="sakan-lang-menu";
    LANGS.forEach(function(x){var q=document.createElement("button");q.type="button";q.textContent=x[1];q.onclick=function(){localStorage.setItem("sakanLanguage",x[0]);setLang(x[0]);menu.classList.remove("open")};menu.appendChild(q)});
    wrap.appendChild(menu); b.onclick=function(e){e.stopPropagation();menu.classList.toggle("open")}; document.addEventListener("click",function(){menu.classList.remove("open")});
    var holder=document.createElement("div");holder.id="google_translate_element";document.body.appendChild(holder);
    var sc=document.createElement("script");sc.src="https://translate.google.com/translate_a/element.js?cb=sakanTranslateInit";sc.async=true;document.body.appendChild(sc);
  }
  window.sakanTranslateInit=function(){if(window.google&&google.translate)new google.translate.TranslateElement({pageLanguage:"ar",autoDisplay:false,includedLanguages:LANGS.map(x=>x[0]).join(",")},"google_translate_element")};
  function setLang(l){document.cookie="googtrans=/ar/"+l+";path=/";var s=document.querySelector(".goog-te-combo");if(s){s.value=l;s.dispatchEvent(new Event("change"))}else location.reload()}

  function strip(){
    var old=document.getElementById("stripTrack"); if(!old||old.dataset.fixed) return;
    var items=Array.from(old.children); if(!items.length)return;
    old.dataset.fixed="1";
    var windowEl=old.parentElement; windowEl.classList.add("sakan-strip-window");
    var marquee=document.createElement("div"); marquee.className="sakan-strip-marquee";
    var g1=document.createElement("div"),g2=document.createElement("div"); g1.className=g2.className="sakan-strip-group";
    var target=Math.max(windowEl.clientWidth*1.25,1100), safety=0;
    while(g1.scrollWidth < target && safety < 12){items.forEach(function(n){g1.appendChild(n.cloneNode(true));});safety++;}
    Array.from(g1.children).forEach(function(n){g2.appendChild(n.cloneNode(true));});
    marquee.append(g1,g2); old.replaceWith(marquee);
  }

  function promo(){var h=document.querySelector(".header"),a=document.querySelector(".header-actions");if(!h||!a||document.querySelector(".sakan-header-promo"))return;var p=document.createElement("div");p.className="sakan-header-promo";p.textContent="سكن • تعارف جاد باحترام وخصوصية • أعضاء جدد يوميًا";h.insertBefore(p,a)}
  function start(){css();logo();language();strip();promo()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
