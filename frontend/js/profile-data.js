 /* =====================================================
   SAKAN - PROFILE DATA
   Backend-connected onboarding
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* =================================================
           ELEMENTS
        ================================================= */

        const form =
            document.getElementById(
                "profileDataForm"
            );


        const birthDate =
            document.getElementById(
                "birthDate"
            );


        const ageValue =
            document.getElementById(
                "ageValue"
            );


        const aboutMe =
            document.getElementById(
                "aboutMe"
            );


        const lookingFor =
            document.getElementById(
                "lookingFor"
            );


        const aboutCounter =
            document.getElementById(
                "aboutCounter"
            );


        const lookingCounter =
            document.getElementById(
                "lookingCounter"
            );


        const backBtn =
            document.getElementById(
                "backBtn"
            );


        const showRealName =
            document.getElementById(
                "showRealName"
            );


        const messageBox =
            document.getElementById(
                "messageBox"
            );


        /* =================================================
           API
        ================================================= */

        const SAKAN_API_BASE = (
            window.SAKAN_API_BASE ||
            localStorage.getItem(
                "sakanApiBase"
            ) ||
            "http://localhost:5000/api"
        ).replace(
            /\/$/,
            ""
        );


        async function apiRequest(
            path,
            options = {}
        ) {

            const headers = {

                "Content-Type":
                    "application/json",

                ...(options.headers || {})

            };


            const token =
                localStorage.getItem(
                    "sakanAuthToken"
                );


            if (
                token
            ) {

                headers.Authorization =
                    "Bearer " + token;

            }


            const response =
                await fetch(
                    SAKAN_API_BASE + path,
                    {
                        ...options,
                        headers
                    }
                );


            const data =
                await response
                    .json()
                    .catch(
                        function () {
                            return {};
                        }
                    );


            if (
                !response.ok
            ) {

                throw new Error(
                    data.error ||
                    "تعذر الاتصال بالخادم."
                );

            }


            return data;

        }


        /* =================================================
           MESSAGE
        ================================================= */

        function showMessage(
            message,
            type = "info"
        ) {

            if (
                !messageBox
            ) {

                alert(message);

                return;

            }


            messageBox.textContent =
                message;


            messageBox.dataset.type =
                type;


            messageBox.classList.add(
                "show"
            );


            clearTimeout(
                messageBox._timer
            );


            messageBox._timer =
                setTimeout(
                    function () {

                        messageBox.classList.remove(
                            "show"
                        );

                    },
                    4000
                );

        }


        /* =================================================
           AGE
        ================================================= */

        function calculateAge() {

            if (
                !birthDate ||
                !birthDate.value
            ) {

                if (
                    ageValue
                ) {

                    ageValue.textContent =
                        "--";

                }

                return null;

            }


            const birth =
                new Date(
                    birthDate.value
                );


            const today =
                new Date();


            if (
                Number.isNaN(
                    birth.getTime()
                )
            ) {

                if (
                    ageValue
                ) {

                    ageValue.textContent =
                        "--";

                }

                return null;

            }


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
                    today.getDate() <
                    birth.getDate()
                )
            ) {

                age--;

            }


            if (
                ageValue
            ) {

                ageValue.textContent =
                    age >= 18
                        ? age
                        : "--";

            }


            return age;

        }


        if (
            birthDate
        ) {

            birthDate.addEventListener(
                "change",
                calculateAge
            );

        }


        /* =================================================
           MINIMUM AGE
        ================================================= */

        if (
            birthDate
        ) {

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
           TEXT COUNTERS
        ================================================= */

        function updateCounter(
            textarea,
            counter
        ) {

            if (
                !textarea ||
                !counter
            ) {

                return;

            }


            counter.textContent =
                textarea.value.length;

        }


        if (
            aboutMe
        ) {

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


        if (
            lookingFor
        ) {

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
           FILL FORM
        ================================================= */

        function fillForm(
            data
        ) {

            if (
                !data
            ) {

                return;

            }


            const fields = [

                "realName",
                "displayName",
                "gender",
                "birthDate",
                "country",
                "city",
                "maritalStatus",
                "language",
                "education",
                "profession",
                "aboutMe",
                "lookingFor"

            ];


            fields.forEach(
                function (id) {

                    const element =
                        document.getElementById(
                            id
                        );


                    if (
                        element &&
                        data[id] !==
                        undefined &&
                        data[id] !==
                        null
                    ) {

                        element.value =
                            data[id];

                    }

                }
            );


            if (
                showRealName
            ) {

                showRealName.checked =
                    Boolean(
                        data.showRealName
                    );

            }


            calculateAge();


            updateCounter(
                aboutMe,
                aboutCounter
            );


            updateCounter(
                lookingFor,
                lookingCounter
            );

        }


        /* =================================================
           LOAD LOCAL PREVIEW DATA
        ================================================= */

        function loadLocalProfile() {

            const saved =
                localStorage.getItem(
                    "sakanProfileData"
                );


            if (
                !saved
            ) {

                return;

            }


            try {

                fillForm(
                    JSON.parse(
                        saved
                    )
                );

            }

            catch (
                error
            ) {

                console.error(
                    "Local profile error:",
                    error
                );

            }

        }


        /* =================================================
           LOAD BACKEND PROFILE
        ================================================= */

        async function loadBackendProfile() {

            const token =
                localStorage.getItem(
                    "sakanAuthToken"
                );


            if (
                !token
            ) {

                return;

            }


            try {

                const result =
                    await apiRequest(
                        "/me"
                    );


                if (
                    result.user
                ) {

                    /*
                       نستخدم بيانات Backend المتوفرة.
                    */
                    fillForm(
                        result.user
                    );

                }

            }

            catch (
                error
            ) {

                console.warn(
                    "Backend profile load skipped:",
                    error.message
                );

            }

        }


        /*
           نملأ النسخة المحلية أولًا
           ثم نحاول Backend.
        */

        loadLocalProfile();

        loadBackendProfile();


        /* =================================================
           FORM SUBMIT
        ================================================= */

        if (
            form
        ) {

            form.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    /* -----------------------------------------
                       READ VALUES
                    ----------------------------------------- */

                    const realName =
                        document
                            .getElementById(
                                "realName"
                            )
                            .value
                            .trim();


                    const displayName =
                        document
                            .getElementById(
                                "displayName"
                            )
                            .value
                            .trim();


                    const gender =
                        document
                            .getElementById(
                                "gender"
                            )
                            .value;


                    const birthDateValue =
                        birthDate.value;


                    const country =
                        document
                            .getElementById(
                                "country"
                            )
                            .value;


                    const city =
                        document
                            .getElementById(
                                "city"
                            )
                            .value
                            .trim();


                    const maritalStatus =
                        document
                            .getElementById(
                                "maritalStatus"
                            )
                            .value;


                    const language =
                        document
                            .getElementById(
                                "language"
                            )
                            .value;


                    const education =
                        document
                            .getElementById(
                                "education"
                            )
                            .value;


                    const profession =
                        document
                            .getElementById(
                                "profession"
                            )
                            .value;


                    const aboutMeValue =
                        aboutMe.value.trim();


                    const lookingForValue =
                        lookingFor.value.trim();


                    const showRealNameValue =
                        showRealName
                            ? showRealName.checked
                            : false;


                    /* -----------------------------------------
                       REQUIRED VALIDATION
                    ----------------------------------------- */

                    if (
                        !realName
                    ) {

                        showMessage(
                            "من فضلك أدخل اسمك الحقيقي.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !displayName
                    ) {

                        showMessage(
                            "من فضلك أدخل الاسم المستعار.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !gender
                    ) {

                        showMessage(
                            "من فضلك اختر الجنس.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !birthDateValue
                    ) {

                        showMessage(
                            "من فضلك اختر تاريخ الميلاد.",
                            "error"
                        );

                        return;

                    }


                    const age =
                        calculateAge();


                    if (
                        age === null ||
                        age < 18
                    ) {

                        showMessage(
                            "يجب أن يكون عمر العضو 18 عامًا أو أكثر.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !country
                    ) {

                        showMessage(
                            "من فضلك اختر الدولة.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !city
                    ) {

                        showMessage(
                            "من فضلك أدخل المدينة.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !maritalStatus
                    ) {

                        showMessage(
                            "من فضلك اختر الحالة الاجتماعية.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !language
                    ) {

                        showMessage(
                            "من فضلك اختر اللغة.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !education
                    ) {

                        showMessage(
                            "من فضلك اختر مستوى التعليم.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !profession
                    ) {

                        showMessage(
                            "من فضلك اختر المهنة.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !aboutMeValue
                    ) {

                        showMessage(
                            "من فضلك اكتب نبذة بسيطة عن نفسك.",
                            "error"
                        );

                        return;

                    }


                    if (
                        !lookingForValue
                    ) {

                        showMessage(
                            "من فضلك اكتب ما تبحث عنه في شريك الحياة.",
                            "error"
                        );

                        return;

                    }


                    /* =================================================
                       DATA OBJECT
                    ================================================= */

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
                            showRealNameValue,

                        preferredLanguage:
                            language

                    };


                    /* =================================================
                       ALWAYS SAVE LOCAL COPY
                       مفيد للمعاينة والانتقال بين الصفحات
                    ================================================= */

                    localStorage.setItem(
                        "sakanProfileData",
                        JSON.stringify(
                            profileData
                        )
                    );


                    /* =================================================
                       AUTH STATE
                    ================================================= */

                    const authToken =
                        localStorage.getItem(
                            "sakanAuthToken"
                        );


                    const pendingRaw =
                        sessionStorage.getItem(
                            "sakanPendingRegistration"
                        );


                    let pendingRegistration =
                        null;


                    if (
                        pendingRaw
                    ) {

                        try {

                            pendingRegistration =
                                JSON.parse(
                                    pendingRaw
                                );

                        }

                        catch (
                            error
                        ) {

                            console.error(
                                "Pending registration error:",
                                error
                            );

                        }

                    }


                    /* =================================================
                       BACKEND REGISTRATION
                    ================================================= */

                    try {

                        let result;


                        /*
                           الحالة 1:
                           عضو مسجل بالفعل
                           → تحديث الملف.
                        */

                        if (
                            authToken
                        ) {

                            result =
                                await apiRequest(
                                    "/me",
                                    {

                                        method:
                                            "PUT",

                                        body:
                                            JSON.stringify(
                                                profileData
                                            )

                                    }
                                );

                        }


                        /*
                           الحالة 2:
                           عضو جديد
                           → ننشئ الحساب بعد اكتمال
                             البيانات الشخصية.
                        */

                        else if (
                            pendingRegistration &&
                            pendingRegistration.email &&
                            pendingRegistration.password
                        ) {

                            result =
                                await apiRequest(
                                    "/auth/register",
                                    {

                                        method:
                                            "POST",

                                        body:
                                            JSON.stringify({

                                                email:
                                                    pendingRegistration.email,

                                                password:
                                                    pendingRegistration.password,

                                                realName:
                                                    profileData.realName,

                                                displayName:
                                                    profileData.displayName,

                                                gender:
                                                    profileData.gender,

                                                birthDate:
                                                    profileData.birthDate,

                                                country:
                                                    profileData.country,

                                                city:
                                                    profileData.city,

                                                maritalStatus:
                                                    profileData.maritalStatus,

                                                language:
                                                    profileData.language,

                                                education:
                                                    profileData.education,

                                                profession:
                                                    profileData.profession,

                                                aboutMe:
                                                    profileData.aboutMe,

                                                lookingFor:
                                                    profileData.lookingFor,

                                                showRealName:
                                                    profileData.showRealName,

                                                preferredLanguage:
                                                    profileData.preferredLanguage

                                            })

                                    }
                                );


                            /*
                               حفظ Token بعد إنشاء الحساب.
                            */

                            if (
                                result &&
                                result.token
                            ) {

                                localStorage.setItem(
                                    "sakanAuthToken",
                                    result.token
                                );

                            }


                            if (
                                result &&
                                result.user
                            ) {

                                localStorage.setItem(
                                    "sakanCurrentUser",
                                    JSON.stringify(
                                        result.user
                                    )
                                );

                            }


                            localStorage.setItem(
                                "sakanLoggedIn",
                                "true"
                            );


                            sessionStorage.removeItem(
                                "sakanPendingRegistration"
                            );

                        }


                        /*
                           نجاح Backend
                        */

                        showMessage(
                            "تم حفظ بياناتك بنجاح. سيتم الانتقال إلى صفحة الصور.",
                            "success"
                        );


                        setTimeout(
                            function () {

                                window.location.href =
                                    "photos.html";

                            },
                            900
                        );


                        return;

                    }

                    catch (
                        backendError
                    ) {

                        console.warn(
                            "Backend unavailable:",
                            backendError.message
                        );

                    }


                    /* =================================================
                       DEMO FALLBACK
                    ================================================= */

                    if (
                        pendingRegistration &&
                        pendingRegistration.email
                    ) {

                        localStorage.setItem(
                            "sakanDemoAccount",
                            JSON.stringify({

                                email:
                                    pendingRegistration.email,

                                createdAt:
                                    new Date()
                                        .toISOString(),

                                provider:
                                    pendingRegistration.provider ||
                                    "email",

                                registrationCompleted:
                                    true

                            })
                        );


                        sessionStorage.removeItem(
                            "sakanPendingRegistration"
                        );

                    }


                    localStorage.setItem(
                        "sakanLoggedIn",
                        "true"
                    );


                    showMessage(
                        "تم حفظ البيانات في وضع المعاينة. سيتم الانتقال إلى صفحة الصور.",
                        "success"
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "photos.html";

                        },
                        900
                    );

                }
            );

        }


        /* =================================================
           BACK
        ================================================= */

        if (
            backBtn
        ) {

            backBtn.addEventListener(
                "click",
                function () {

                    if (
                        window.history.length >
                        1
                    ) {

                        window.history.back();

                    }

                    else {

                        window.location.href =
                            "../index.html";

                    }

                }
            );

        }

    }
);
