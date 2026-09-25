
/* =====================================================
   SAKAN - MAIN APP
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =================================================
       ELEMENTS
    ================================================= */

    const privacyScreen =
        document.getElementById("privacyScreen");

    const welcomeScreen =
        document.getElementById("welcomeScreen");

    const accountScreen =
        document.getElementById("accountScreen");

    const acceptPrivacyBtn =
        document.getElementById("acceptPrivacyBtn");

    const rejectPrivacyBtn =
        document.getElementById("rejectPrivacyBtn");

    const continueBtn =
        document.getElementById("continueBtn");

    const newMemberBtn =
        document.getElementById("newMemberBtn");

    const existingMemberBtn =
        document.getElementById("existingMemberBtn");

    const registerBox =
        document.getElementById("registerBox");

    const loginBox =
        document.getElementById("loginBox");

    const accountChoice =
        document.getElementById("accountChoice");

    const backFromRegister =
        document.getElementById("backFromRegister");

    const backFromLogin =
        document.getElementById("backFromLogin");

    const registerBtn =
        document.getElementById("registerBtn");

    const loginBtn =
        document.getElementById("loginBtn");

    const forgotPasswordBtn =
        document.getElementById("forgotPasswordBtn");

    const googleRegisterBtn =
        document.getElementById("googleRegisterBtn");

    const facebookRegisterBtn =
        document.getElementById("facebookRegisterBtn");


    /* =================================================
       MESSAGE
    ================================================= */

    function showMessage(message) {

        const box =
            document.getElementById("messageBox");

        if (!box) return;

        box.textContent = message;

        box.classList.add("show");

        setTimeout(function () {
            box.classList.remove("show");
        }, 3500);
    }


    /* =================================================
       SCREEN FUNCTIONS
    ================================================= */

    function showScreen(screen) {

        document
            .querySelectorAll(".screen")
            .forEach(function (item) {

                item.classList.remove("active");

            });

        if (screen) {
            screen.classList.add("active");
        }
    }


    /* =================================================
       INITIAL SCREEN
    ================================================= */

    /*
       الخصوصية يجب أن تظهر أولاً دائمًا
       في نسخة المعاينة.
    */

    showScreen(privacyScreen);


    /* =================================================
       ACCEPT PRIVACY
    ================================================= */

    if (acceptPrivacyBtn) {

        acceptPrivacyBtn.addEventListener(
            "click",
            function () {

                localStorage.setItem(
                    "sakanPrivacyAccepted",
                    "true"
                );

                showScreen(welcomeScreen);

            }
        );

    }


    /* =================================================
       REJECT PRIVACY
    ================================================= */

    if (rejectPrivacyBtn) {

        rejectPrivacyBtn.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "sakanPrivacyAccepted"
                );

                showMessage(
                    "يجب الموافقة على الخصوصية والأمان للدخول إلى منصة سكن."
                );

                showScreen(privacyScreen);

            }
        );

    }


    /* =================================================
       CONTINUE
    ================================================= */

    if (continueBtn) {

        continueBtn.addEventListener(
            "click",
            function () {

                showScreen(accountScreen);

                showAccountChoice();

            }
        );

    }


    /* =================================================
       ACCOUNT CHOICE
    ================================================= */

    function showAccountChoice() {

        if (accountChoice) {
            accountChoice.classList.remove("hidden");
        }

        if (registerBox) {
            registerBox.classList.add("hidden");
        }

        if (loginBox) {
            loginBox.classList.add("hidden");
        }

    }


    /* =================================================
       NEW MEMBER
    ================================================= */

    if (newMemberBtn) {

        newMemberBtn.addEventListener(
            "click",
            function () {

                if (accountChoice) {
                    accountChoice.classList.add("hidden");
                }

                if (registerBox) {
                    registerBox.classList.remove("hidden");
                }

                if (loginBox) {
                    loginBox.classList.add("hidden");
                }

            }
        );

    }


    /* =================================================
       EXISTING MEMBER
    ================================================= */

    if (existingMemberBtn) {

        existingMemberBtn.addEventListener(
            "click",
            function () {

                if (accountChoice) {
                    accountChoice.classList.add("hidden");
                }

                if (loginBox) {
                    loginBox.classList.remove("hidden");
                }

                if (registerBox) {
                    registerBox.classList.add("hidden");
                }

            }
        );

    }


    /* =================================================
       BACK FROM REGISTER
    ================================================= */

    if (backFromRegister) {

        backFromRegister.addEventListener(
            "click",
            function () {

                showAccountChoice();

            }
        );

    }


    /* =================================================
       BACK FROM LOGIN
    ================================================= */

    if (backFromLogin) {

        backFromLogin.addEventListener(
            "click",
            function () {

                showAccountChoice();

            }
        );

    }


    /* =================================================
       REGISTER
    ================================================= */

    if (registerBtn) {

        registerBtn.addEventListener(
            "click",
            function () {

                const email =
                    document.getElementById(
                        "registerEmail"
                    ).value.trim();

                const password =
                    document.getElementById(
                        "registerPassword"
                    ).value.trim();


                if (!email) {

                    showMessage(
                        "من فضلك أدخل البريد الإلكتروني."
                    );

                    return;
                }


                if (!password) {

                    showMessage(
                        "من فضلك أدخل كلمة المرور."
                    );

                    return;
                }


                if (password.length < 6) {

                    showMessage(
                        "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
                    );

                    return;
                }


                /*
                   هذه نسخة الواجهة فقط.
                   الربط الحقيقي مع الحسابات سيتم لاحقًا
                   مع الـ Backend.
                */

                showMessage(
                    "تم استلام بيانات التسجيل. سيتم ربط التسجيل الحقيقي بالمنصة في الخطوة التالية."
                );

            }
        );

    }


    /* =================================================
       LOGIN
    ================================================= */

    if (loginBtn) {

        loginBtn.addEventListener(
            "click",
            function () {

                const email =
                    document.getElementById(
                        "loginEmail"
                    ).value.trim();

                const password =
                    document.getElementById(
                        "loginPassword"
                    ).value.trim();


                if (!email) {

                    showMessage(
                        "من فضلك أدخل البريد الإلكتروني."
                    );

                    return;
                }


                if (!password) {

                    showMessage(
                        "من فضلك أدخل كلمة المرور."
                    );

                    return;
                }


                /*
                   تسجيل الدخول الحقيقي سيتم ربطه
                   بالـ Backend لاحقًا.
                */

                showMessage(
                    "تم إدخال البيانات. سيتم ربط تسجيل الدخول الحقيقي بالمنصة في الخطوة التالية."
                );

            }
        );

    }


    /* =================================================
       FORGOT PASSWORD
    ================================================= */

    if (forgotPasswordBtn) {

        forgotPasswordBtn.addEventListener(
            "click",
            function () {

                showMessage(
                    "استعادة كلمة المرور ستكون عن طريق البريد الإلكتروني بعد ربط نظام الحسابات."
                );

            }
        );

    }


    /* =================================================
       GOOGLE
    ================================================= */

    if (googleRegisterBtn) {

        googleRegisterBtn.addEventListener(
            "click",
            function () {

                showMessage(
                    "سيتم تفعيل التسجيل بواسطة Google بعد ربط نظام الحسابات."
                );

            }
        );

    }


    /* =================================================
       FACEBOOK
    ================================================= */

    if (facebookRegisterBtn) {

        facebookRegisterBtn.addEventListener(
            "click",
            function () {

                showMessage(
                    "سيتم تفعيل التسجيل بواسطة Facebook بعد ربط نظام الحسابات."
                );

            }
        );

    }

});
