 /* =====================================================
   SAKAN - PROFILE DATA
===================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* =================================================
       ELEMENTS
    ================================================= */

    const form =
        document.getElementById("profileDataForm");

    const birthDate =
        document.getElementById("birthDate");

    const ageValue =
        document.getElementById("ageValue");

    const aboutMe =
        document.getElementById("aboutMe");

    const lookingFor =
        document.getElementById("lookingFor");

    const aboutCounter =
        document.getElementById("aboutCounter");

    const lookingCounter =
        document.getElementById("lookingCounter");

    const backBtn =
        document.getElementById("backBtn");

    const showRealName =
        document.getElementById("showRealName");

    const messageBox =
        document.getElementById("messageBox");


    /* =================================================
       MESSAGE
    ================================================= */

    function showMessage(message) {

        if (!messageBox) {
            alert(message);
            return;
        }

        messageBox.textContent = message;

        messageBox.classList.add("show");

        setTimeout(function () {

            messageBox.classList.remove("show");

        }, 3500);
    }


    /* =================================================
       AGE CALCULATION
    ================================================= */

    function calculateAge() {

        if (!birthDate.value) {

            ageValue.textContent = "--";

            return;
        }


        const birth =
            new Date(birthDate.value);

        const today =
            new Date();


        let age =
            today.getFullYear() -
            birth.getFullYear();


        const monthDifference =
            today.getMonth() -
            birth.getMonth();


        if (
            monthDifference < 0 ||
            (
                monthDifference === 0 &&
                today.getDate() < birth.getDate()
            )
        ) {
            age--;
        }


        if (age < 18) {

            ageValue.textContent = "--";

            return;
        }


        ageValue.textContent = age;
    }


    if (birthDate) {

        birthDate.addEventListener(
            "change",
            calculateAge
        );

    }


    /* =================================================
       TEXT COUNTERS
    ================================================= */

    function updateCounter(
        textarea,
        counter
    ) {

        if (!textarea || !counter) {
            return;
        }

        counter.textContent =
            textarea.value.length;
    }


    if (aboutMe) {

        aboutMe.addEventListener(
            "input",
            function () {

                updateCounter(
                    aboutMe,
                    aboutCounter
                );

            }
        );

    }


    if (lookingFor) {

        lookingFor.addEventListener(
            "input",
            function () {

                updateCounter(
                    lookingFor,
                    lookingCounter
                );

            }
        );

    }


    /* =================================================
       DATE LIMIT
       Minimum age = 18
    ================================================= */

    if (birthDate) {

        const today =
            new Date();

        const minimumDate =
            new Date(
                today.getFullYear() - 18,
                today.getMonth(),
                today.getDate()
            );


        birthDate.max =
            minimumDate
                .toISOString()
                .split("T")[0];

    }


    /* =================================================
       FORM SUBMIT
    ================================================= */

    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                /* -----------------------------------------
                   GET VALUES
                ----------------------------------------- */

                const realName =
                    document
                        .getElementById("realName")
                        .value
                        .trim();


                const displayName =
                    document
                        .getElementById("displayName")
                        .value
                        .trim();


                const gender =
                    document
                        .getElementById("gender")
                        .value;


                const country =
                    document
                        .getElementById("country")
                        .value;


                const city =
                    document
                        .getElementById("city")
                        .value
                        .trim();


                const maritalStatus =
                    document
                        .getElementById("maritalStatus")
                        .value;


                const language =
                    document
                        .getElementById("language")
                        .value;


                const education =
                    document
                        .getElementById("education")
                        .value;


                const profession =
                    document
                        .getElementById("profession")
                        .value;


                const birthDateValue =
                    birthDate.value;


                const aboutMeValue =
                    aboutMe.value.trim();


                const lookingForValue =
                    lookingFor.value.trim();


                /* -----------------------------------------
                   REQUIRED CHECKS
                ----------------------------------------- */

                if (!realName) {

                    showMessage(
                        "من فضلك أدخل اسمك الحقيقي."
                    );

                    return;
                }


                if (!displayName) {

                    showMessage(
                        "من فضلك أدخل الاسم المستعار."
                    );

                    return;
                }


                if (!gender) {

                    showMessage(
                        "من فضلك اختر الجنس."
                    );

                    return;
                }


                if (!birthDateValue) {

                    showMessage(
                        "من فضلك اختر تاريخ الميلاد."
                    );

                    return;
                }


                /* -----------------------------------------
                   AGE
                ----------------------------------------- */

                const birth =
                    new Date(birthDateValue);

                const today =
                    new Date();

                let age =
                    today.getFullYear() -
                    birth.getFullYear();


                const monthDifference =
                    today.getMonth() -
                    birth.getMonth();


                if (
                    monthDifference < 0 ||
                    (
                        monthDifference === 0 &&
                        today.getDate() < birth.getDate()
                    )
                ) {
                    age--;
                }


                if (age < 18) {

                    showMessage(
                        "يجب أن يكون عمر العضو 18 عامًا أو أكثر."
                    );

                    return;
                }


                if (!country) {

                    showMessage(
                        "من فضلك اختر الدولة."
                    );

                    return;
                }


                if (!city) {

                    showMessage(
                        "من فضلك أدخل المدينة."
                    );

                    return;
                }


                if (!maritalStatus) {

                    showMessage(
                        "من فضلك اختر الحالة الاجتماعية."
                    );

                    return;
                }


                if (!language) {

                    showMessage(
                        "من فضلك اختر اللغة."
                    );

                    return;
                }


                if (!education) {

                    showMessage(
                        "من فضلك اختر مستوى التعليم."
                    );

                    return;
                }


                if (!profession) {

                    showMessage(
                        "من فضلك اختر المهنة."
                    );

                    return;
                }


                if (!aboutMeValue) {

                    showMessage(
                        "من فضلك اكتب نبذة بسيطة عن نفسك."
                    );

                    return;
                }


                if (!lookingForValue) {

                    showMessage(
                        "من فضلك اكتب ما تبحث عنه في شريك الحياة."
                    );

                    return;
                }


                /* -----------------------------------------
                   SAVE PREVIEW DATA
                   مؤقت للمعاينة فقط
                ----------------------------------------- */

                const profileData = {

                    realName:
                        realName,

                    displayName:
                        displayName,

                    gender:
                        gender,

                    birthDate:
                        birthDateValue,

                    age:
                        age,

                    country:
                        country,

                    city:
                        city,

                    maritalStatus:
                        maritalStatus,

                    language:
                        language,

                    education:
                        education,

                    profession:
                        profession,

                    aboutMe:
                        aboutMeValue,

                    lookingFor:
                        lookingForValue,

                    showRealName:
                        showRealName
                            ? showRealName.checked
                            : false

                };


                localStorage.setItem(
                    "sakanProfileData",
                    JSON.stringify(profileData)
                );


                /* -----------------------------------------
                   NEXT STEP
                ----------------------------------------- */

                showMessage(
                    "تم حفظ بياناتك بنجاح. سيتم الانتقال إلى صفحة الصور."
                );


                setTimeout(function () {

                    /*
                       صفحة الصور سننشئها في الخطوة التالية.
                       حاليًا نرسل المستخدم إليها عندما
                       يصبح الملف موجودًا.
                    */

                    window.location.href =
                        "photos.html";

                }, 1200);

            }
        );

    }


    /* =================================================
       BACK
    ================================================= */

    if (backBtn) {

        backBtn.addEventListener(
            "click",
            function () {

                if (
                    window.history.length > 1
                ) {

                    window.history.back();

                } else {

                    window.location.href =
                        "../index.html";

                }

            }
        );

    }


});
