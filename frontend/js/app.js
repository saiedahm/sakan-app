/* =====================================================
   SAKAN ENTRY SYSTEM
===================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* =================================================
       SCREENS
    ================================================= */

    const screens = {

        privacy:
            document.getElementById(
                "privacyScreen"
            ),

        welcome:
            document.getElementById(
                "welcomeScreen"
            ),

        account:
            document.getElementById(
                "accountScreen"
            ),

        newMember:
            document.getElementById(
                "newMemberScreen"
            ),

        existingMember:
            document.getElementById(
                "existingMemberScreen"
            )

    };


    /* =================================================
       BUTTONS
    ================================================= */

    const acceptPrivacyBtn =
        document.getElementById(
            "acceptPrivacyBtn"
        );

    const rejectPrivacyBtn =
        document.getElementById(
            "rejectPrivacyBtn"
        );

    const startBtn =
        document.getElementById(
            "startBtn"
        );

    const newMemberBtn =
        document.getElementById(
            "newMemberBtn"
        );

    const existingMemberBtn =
        document.getElementById(
            "existingMemberBtn"
        );

    const backToWelcomeBtn =
        document.getElementById(
            "backToWelcomeBtn"
        );

    const backToAccountBtn =
        document.getElementById(
            "backToAccountBtn"
        );

    const backFromLoginBtn =
        document.getElementById(
            "backFromLoginBtn"
        );


    /* =================================================
       REGISTRATION
    ================================================= */

    const registerForm =
        document.getElementById(
            "registerForm"
        );

    const registerEmail =
        document.getElementById(
            "registerEmail"
        );

    const registerPassword =
        document.getElementById(
            "registerPassword"
        );

    const registerPasswordConfirm =
        document.getElementById(
            "registerPasswordConfirm"
        );

    const registerAgreement =
        document.getElementById(
            "registerAgreement"
        );

    const togglePassword =
        document.getElementById(
            "togglePassword"
        );


    /* =================================================
       LOGIN
    ================================================= */

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    const forgotPasswordBtn =
        document.getElementById(
            "forgotPasswordBtn"
        );


    /* =================================================
       SCREEN FUNCTION
    ================================================= */

    function showScreen(name) {

        Object.keys(screens).forEach(
            function (key) {

                if (
                    screens[key]
                ) {

                    screens[key]
                        .classList.remove(
                            "active"
                        );

                }

            }
        );


        if (
            screens[name]
        ) {

            screens[name]
                .classList.add(
                    "active"
                );

        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =================================================
       PRIVACY
    ================================================= */

    function privacyAccepted() {

        return (
            localStorage.getItem(
                "sakanPrivacyAccepted"
            ) === "true"
        );

    }


    /*
       مهم:
       أول زيارة يجب أن تمر بالخصوصية.
    */

    if (
        !privacyAccepted()
    ) {

        showScreen("privacy");

    }

    else {

        showScreen("welcome");

    }


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


                showScreen(
                    "welcome"
                );

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

                const message =
                    document.getElementById(
                        "privacyMessage"
                    );


                if (message) {

                    message.textContent =
                        "يجب الموافقة على الخصوصية والأمان للدخول إلى منصة سكن.";

                }


                showScreen(
                    "privacy"
                );

            }
        );

    }


    /* =================================================
       WELCOME
    ================================================= */

    if (startBtn) {

        startBtn.addEventListener(
            "click",
            function () {

                if (
                    !privacyAccepted()
                ) {

                    showScreen(
                        "privacy"
                    );

                    return;
                }


                showScreen(
                    "account"
                );

            }
        );

    }


    /* =================================================
       NEW MEMBER
    ================================================= */

    if (newMemberBtn) {

        newMemberBtn.addEventListener(
            "click",
            function () {

                showScreen(
                    "newMember"
                );

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

                showScreen(
                    "existingMember"
                );

            }
        );

    }


    /* =================================================
       BACK
    ================================================= */

    if (backToWelcomeBtn) {

        backToWelcomeBtn.addEventListener(
            "click",
            function () {

                showScreen(
                    "welcome"
                );

            }
        );

    }


    if (backToAccountBtn) {

        backToAccountBtn.addEventListener(
            "click",
            function () {

                showScreen(
                    "account"
                );

            }
        );

    }


    if (backFromLoginBtn) {

        backFromLoginBtn.addEventListener(
            "click",
            function () {

                showScreen(
                    "account"
                );

            }
        );

    }


    /* =================================================
       GOOGLE / FACEBOOK DEMO
    ================================================= */

    const googleBtn =
        document.getElementById(
            "googleBtn"
        );


    const facebookBtn =
        document.getElementById(
            "facebookBtn"
        );


    if (googleBtn) {

        googleBtn.addEventListener(
            "click",
            function () {

                showRegisterMessage(
                    "تسجيل Google سيتم ربطه لاحقًا بالحساب الحقيقي. يمكنك حاليًا استخدام البريد الإلكتروني للمتابعة.",
                    "error"
                );

            }
        );

    }


    if (facebookBtn) {

        facebookBtn.addEventListener(
            "click",
            function () {

                showRegisterMessage(
                    "تسجيل Facebook سيتم ربطه لاحقًا بالحساب الحقيقي. يمكنك حاليًا استخدام البريد الإلكتروني للمتابعة.",
                    "error"
                );

            }
        );

    }


    /* =================================================
       PASSWORD SHOW / HIDE
    ================================================= */

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            function () {

                if (
                    registerPassword.type ===
                    "password"
                ) {

                    registerPassword.type =
                        "text";

                    togglePassword.innerHTML =
                        '<i class="fa-solid fa-eye-slash"></i>';

                }

                else {

                    registerPassword.type =
                        "password";

                    togglePassword.innerHTML =
                        '<i class="fa-solid fa-eye"></i>';

                }

            }
        );

    }


    /* =================================================
       REGISTER MESSAGE
    ================================================= */

    function showRegisterMessage(
        message,
        type
    ) {

        const box =
            document.getElementById(
                "registerMessage"
            );


        if (!box) {
            return;
        }


        box.textContent =
            message;


        box.className =
            "form-message " +
            type;

    }


    /* =================================================
       CLEAR ERRORS
    ================================================= */

    function clearRegisterErrors() {

        const ids = [

            "emailError",
            "passwordError",
            "confirmError",
            "agreementError"

        ];


        ids.forEach(
            function (id) {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.textContent =
                        "";

                }

            }
        );


        showRegisterMessage(
            "",
            ""
        );

    }


    /* =================================================
       REGISTER
    ================================================= */

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                clearRegisterErrors();


                const email =
                    registerEmail.value
                        .trim();


                const password =
                    registerPassword.value;


                const confirmPassword =
                    registerPasswordConfirm.value;


                const agreement =
                    registerAgreement.checked;


                let valid = true;


                /* EMAIL */

                if (
                    !email
                ) {

                    document.getElementById(
                        "emailError"
                    ).textContent =
                        "يرجى كتابة البريد الإلكتروني.";

                    valid = false;

                }

                else if (
                    !isValidEmail(email)
                ) {

                    document.getElementById(
                        "emailError"
                    ).textContent =
                        "يرجى إدخال بريد إلكتروني صحيح.";

                    valid = false;

                }


                /* PASSWORD */

                if (
                    !password
                ) {

                    document.getElementById(
                        "passwordError"
                    ).textContent =
                        "يرجى كتابة كلمة المرور.";

                    valid = false;

                }

                else if (
                    password.length < 6
                ) {

                    document.getElementById(
                        "passwordError"
                    ).textContent =
                        "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";

                    valid = false;

                }


                /* CONFIRM */

                if (
                    !confirmPassword
                ) {

                    document.getElementById(
                        "confirmError"
                    ).textContent =
                        "يرجى تأكيد كلمة المرور.";

                    valid = false;

                }

                else if (
                    password !==
                    confirmPassword
                ) {

                    document.getElementById(
                        "confirmError"
                    ).textContent =
                        "كلمتا المرور غير متطابقتين.";

                    valid = false;

                }


                /* AGREEMENT */

                if (
                    !agreement
                ) {

                    document.getElementById(
                        "agreementError"
                    ).textContent =
                        "يجب الموافقة على شروط الاستخدام والخصوصية.";

                    valid = false;

                }


                if (
                    !valid
                ) {

                    showRegisterMessage(
                        "يرجى تصحيح البيانات المطلوبة.",
                        "error"
                    );

                    return;

                }


                /*
                   ========================================
                   تسجيل تجريبي
                   ========================================
                */

                const account = {

                    email: email,

                    createdAt:
                        new Date()
                            .toISOString(),

                    provider:
                        "email",

                    registrationCompleted:
                        true

                };


                localStorage.setItem(
                    "sakanDemoAccount",
                    JSON.stringify(
                        account
                    )
                );


                localStorage.setItem(
                    "sakanLoggedIn",
                    "true"
                );


                showRegisterMessage(
                    "تم إنشاء الحساب بنجاح. جاري الانتقال إلى بياناتي...",
                    "success"
                );


                /*
                   الانتقال إلى صفحة بياناتي
                */

                setTimeout(
                    function () {

                        window.location.href =
                            "pages/profile-data.html";

                    },
                    900
                );

            }
        );

    }


    /* =================================================
       EMAIL VALIDATION
    ================================================= */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /* =================================================
       LOGIN
    ================================================= */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const email =
                    document.getElementById(
                        "loginEmail"
                    ).value
                        .trim();


                const password =
                    document.getElementById(
                        "loginPassword"
                    ).value;


                const message =
                    document.getElementById(
                        "loginMessage"
                    );


                if (
                    !email ||
                    !isValidEmail(email)
                ) {

                    message.textContent =
                        "يرجى إدخال بريد إلكتروني صحيح.";

                    message.className =
                        "form-message error";

                    return;

                }


                if (
                    !password
                ) {

                    message.textContent =
                        "يرجى إدخال كلمة المرور.";

                    message.className =
                        "form-message error";

                    return;

                }


                /*
                   في نسخة المعاينة:
                   إذا كان الحساب التجريبي موجودًا
                   نسمح بالدخول.
                */

                const savedAccount =
                    localStorage.getItem(
                        "sakanDemoAccount"
                    );


                if (
                    savedAccount
                ) {

                    const account =
                        JSON.parse(
                            savedAccount
                        );


                    if (
                        account.email ===
                        email
                    ) {

                        localStorage.setItem(
                            "sakanLoggedIn",
                            "true"
                        );


                        message.textContent =
                            "تم تسجيل الدخول بنجاح.";

                        message.className =
                            "form-message success";


                        setTimeout(
                            function () {

                                window.location.href =
                                    "pages/profile-data.html";

                            },
                            800
                        );


                        return;

                    }

                }


                /*
                   لا يوجد Backend حقيقي بعد.
                */

                message.textContent =
                    "هذا الحساب غير موجود في نسخة المعاينة. يمكنك إنشاء حساب جديد.";

                message.className =
                    "form-message error";

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

                const email =
                    document.getElementById(
                        "loginEmail"
                    ).value
                        .trim();


                const message =
                    document.getElementById(
                        "loginMessage"
                    );


                if (
                    !email ||
                    !isValidEmail(email)
                ) {

                    message.textContent =
                        "اكتب بريدك الإلكتروني أولًا.";

                    message.className =
                        "form-message error";

                    return;

                }


                message.textContent =
                    "في النظام الحقيقي سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.";

                message.className =
                    "form-message success";

            }
        );

    }

}); 
