
/* =========================================================
   SAKAN - ENTRY PAGE
========================================================= */

"use strict";


/* =========================================================
   HELPERS
========================================================= */

function $(id) {
  return document.getElementById(id);
}


function showModal(id) {
  const element = $(id);

  if (element) {
    element.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}


function hideModal(id) {
  const element = $(id);

  if (element) {
    element.classList.add("hidden");
  }

  const anyModalOpen =
    document.querySelector(".modal-overlay:not(.hidden)");

  if (!anyModalOpen) {
    document.body.style.overflow = "";
  }
}


/* =========================================================
   CONTINUE
========================================================= */

const continueBtn = $("continueBtn");

if (continueBtn) {

  continueBtn.addEventListener("click", function () {

    showModal("privacyModal");

  });

}


/* =========================================================
   PRIVACY CHECKBOX
========================================================= */

const privacyConsent = $("privacyConsent");

const acceptPrivacy = $("acceptPrivacy");


if (privacyConsent && acceptPrivacy) {

  privacyConsent.addEventListener(
    "change",
    function () {

      acceptPrivacy.disabled =
        !privacyConsent.checked;

    }
  );

}


/* =========================================================
   ACCEPT PRIVACY
========================================================= */

if (acceptPrivacy) {

  acceptPrivacy.addEventListener(
    "click",
    function () {

      if (!privacyConsent.checked) {
        return;
      }

      /*
       * نحفظ الموافقة محليًا للواجهة التجريبية.
       *
       * في النسخة الحقيقية:
       * ستُحفظ الموافقة أيضًا في حساب العضو
       * على الخادم مع التاريخ والنسخة القانونية.
       */

      localStorage.setItem(
        "sakanPrivacyAccepted",
        "true"
      );

      localStorage.setItem(
        "sakanPrivacyAcceptedAt",
        new Date().toISOString()
      );


      hideModal("privacyModal");

      showModal("authModal");

    }
  );

}


/* =========================================================
   DECLINE
========================================================= */

const declinePrivacy = $("declinePrivacy");


if (declinePrivacy) {

  declinePrivacy.addEventListener(
    "click",
    function () {

      document.body.innerHTML = `
        <main
          style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:30px;
            background:#0b1424;
            color:#fff;
            font-family:Tahoma,Arial,sans-serif;
            text-align:center;
          "
        >

          <div>

            <div
              style="
                font-size:55px;
                color:#f1d48a;
                margin-bottom:15px;
              "
            >
              سكن
            </div>

            <h1>
              تم إيقاف الدخول
            </h1>

            <p
              style="
                color:#aeb8c8;
                line-height:1.9;
              "
            >
              لا يمكن دخول منصة سكن دون الموافقة
              على الخصوصية والأمان وقواعد الاستخدام.
            </p>

          </div>

        </main>
      `;

    }
  );

}


/* =========================================================
   CLOSE BUTTONS
========================================================= */

document
  .querySelectorAll("[data-close]")
  .forEach(function (button) {

    button.addEventListener(
      "click",
      function () {

        hideModal(
          button.getAttribute("data-close")
        );

      }
    );

  });


/* =========================================================
   NEW MEMBER
========================================================= */

const newMemberBtn = $("newMemberBtn");

const newMemberPanel = $("newMemberPanel");

const loginPanel = $("loginPanel");


if (newMemberBtn) {

  newMemberBtn.addEventListener(
    "click",
    function () {

      if (newMemberPanel) {
        newMemberPanel.classList.remove("hidden");
      }

      if (loginPanel) {
        loginPanel.classList.add("hidden");
      }

    }
  );

}


/* =========================================================
   EXISTING MEMBER
========================================================= */

const existingMemberBtn = $("existingMemberBtn");


if (existingMemberBtn) {

  existingMemberBtn.addEventListener(
    "click",
    function () {

      if (loginPanel) {
        loginPanel.classList.remove("hidden");
      }

      if (newMemberPanel) {
        newMemberPanel.classList.add("hidden");
      }

    }
  );

}


/* =========================================================
   DEMO REGISTER
   مؤقت للواجهة فقط
========================================================= */

const registerButton = $("registerButton");


if (registerButton) {

  registerButton.addEventListener(
    "click",
    function () {

      const email =
        $("registerEmail")?.value.trim();

      const password =
        $("registerPassword")?.value;

      const confirmPassword =
        $("registerPasswordConfirm")?.value;


      if (!email) {

        alert("من فضلك أدخل البريد الإلكتروني.");

        return;
      }


      if (!password) {

        alert("من فضلك أدخل كلمة المرور.");

        return;
      }


      if (password.length < 8) {

        alert(
          "كلمة المرور يجب أن تكون 8 أحرف على الأقل."
        );

        return;
      }


      if (password !== confirmPassword) {

        alert(
          "كلمتا المرور غير متطابقتين."
        );

        return;
      }


      /*
       * هذا ليس تسجيلًا حقيقيًا بعد.
       *
       * الخطوة القادمة:
       *
       * POST /api/auth/register
       *
       * ثم:
       * صفحة بياناتي
       */

      alert(
        "تم تجهيز واجهة التسجيل بنجاح.\n\n" +
        "الخطوة التالية ستكون صفحة بياناتي."
      );

    }
  );

}


/* =========================================================
   DEMO LOGIN
========================================================= */

const loginButton = $("loginButton");


if (loginButton) {

  loginButton.addEventListener(
    "click",
    function () {

      const email =
        $("loginEmail")?.value.trim();

      const password =
        $("loginPassword")?.value;


      if (!email || !password) {

        alert(
          "من فضلك أدخل البريد الإلكتروني وكلمة المرور."
        );

        return;
      }


      /*
       * سيتم ربط الدخول الحقيقي بالـBackend لاحقًا.
       */

      alert(
        "واجهة تسجيل الدخول جاهزة.\n\n" +
        "سيتم ربطها بالحسابات الحقيقية في مرحلة الـBackend."
      );

    }
  );

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

const forgotPassword = $("forgotPassword");


if (forgotPassword) {

  forgotPassword.addEventListener(
    "click",
    function () {

      const email =
        $("loginEmail")?.value.trim();


      if (!email) {

        alert(
          "أدخل بريدك الإلكتروني أولًا، ثم اضغط نسيت كلمة المرور."
        );

        return;
      }


      /*
       * سيتم لاحقًا ربط هذا بـ:
       *
       * POST /api/auth/forgot-password
       */

      alert(
        "سيتم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني."
      );

    }
  );

}


/* =========================================================
   CLOSE MODAL BY CLICKING OUTSIDE
========================================================= */

document
  .querySelectorAll(".modal-overlay")
  .forEach(function (modal) {

    modal.addEventListener(
      "click",
      function (event) {

        if (event.target === modal) {

          hideModal(modal.id);

        }

      }
    );

  });


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key !== "Escape") {
      return;
    }

    document
      .querySelectorAll(".modal-overlay:not(.hidden)")
      .forEach(function (modal) {

        hideModal(modal.id);

      });

  }
);
