document.addEventListener("DOMContentLoaded", () => {

    const backHomeBtn =
        document.getElementById("backHomeBtn");

    const mainPhoto =
        document.getElementById("mainPhoto");

    const onlineStatus =
        document.getElementById("onlineStatus");

    const memberName =
        document.getElementById("memberName");

    const memberBasicInfo =
        document.getElementById("memberBasicInfo");

    const memberState =
        document.getElementById("memberState");

    const verifiedBadge =
        document.getElementById("verifiedBadge");

    const aboutText =
        document.getElementById("aboutText");

    const seekingText =
        document.getElementById("seekingText");

    const photoCount =
        document.getElementById("photoCount");

    const photosGrid =
        document.getElementById("photosGrid");

    const ageValue =
        document.getElementById("ageValue");

    const countryValue =
        document.getElementById("countryValue");

    const cityValue =
        document.getElementById("cityValue");

    const maritalValue =
        document.getElementById("maritalValue");

    const languageValue =
        document.getElementById("languageValue");

    const educationValue =
        document.getElementById("educationValue");

    const professionValue =
        document.getElementById("professionValue");

    const favoriteBtn =
        document.getElementById("favoriteBtn");

    const messageBtn =
        document.getElementById("messageBtn");

    const moreBtn =
        document.getElementById("moreBtn");

    const reportBtn =
        document.getElementById("reportBtn");

    const blockBtn =
        document.getElementById("blockBtn");


    /* =====================================================
       LOGIN CHECK
    ===================================================== */

    const loggedIn =
        localStorage.getItem("sakanLoggedIn");

    if (loggedIn !== "true") {

        window.location.href =
            "../index.html";

        return;
    }


    /* =====================================================
       MODAL
    ===================================================== */

    const modal =
        document.getElementById("profileModal");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalText =
        document.getElementById("modalText");

    const closeModalBtn =
        document.getElementById("closeModalBtn");

    const modalOkBtn =
        document.getElementById("modalOkBtn");


    function openModal(title, text) {

        modalTitle.textContent = title;

        modalText.textContent = text;

        modal.classList.remove("hidden");
    }


    function closeModal() {

        modal.classList.add("hidden");
    }


    closeModalBtn.addEventListener(
        "click",
        closeModal
    );


    modalOkBtn.addEventListener(
        "click",
        closeModal
    );


    modal.addEventListener(
        "click",
        (event) => {

            if (event.target === modal) {

                closeModal();

            }

        }
    );


    /* =====================================================
       BACK
    ===================================================== */

    backHomeBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "home.html";

        }
    );


    /* =====================================================
       SELECTED MEMBER
    ===================================================== */

    let member = null;


    try {

        const savedMember =
            localStorage.getItem(
                "sakanSelectedMember"
            );


        if (savedMember) {

            member =
                JSON.parse(savedMember);

        }

    } catch (error) {

        console.error(
            "تعذر قراءة بيانات العضو",
            error
        );

    }


    /*
     * في حال فتح الصفحة بدون اختيار عضو،
     * نعرض ملفًا تجريبيًا بدل ترك الصفحة فارغة.
     */

    if (!member) {

        member = {

            id: 999,

            name: "عضو جديد",

            age: "—",

            country: "—",

            city: "—",

            maritalStatus: "—",

            language: "—",

            education: "—",

            profession: "—",

            online: false,

            verified: false,

            avatar: "👤",

            about:
                "لم تتم إضافة نبذة عن هذا العضو بعد.",

            seeking:
                "لم تتم إضافة معلومات عن شريك العمر بعد.",

            photos: []

        };

    }


    /* =====================================================
       FILL PROFILE
    ===================================================== */

    memberName.textContent =
        member.name || "عضو جديد";


    memberBasicInfo.textContent =
        `${member.age || "—"} سنة • ${member.country || "—"}`;


    if (member.online) {

        onlineStatus.classList.remove(
            "hidden"
        );

        memberState.textContent =
            "متصل الآن";

    } else {

        onlineStatus.classList.add(
            "hidden"
        );

        memberState.textContent =
            "غير متصل";

    }


    if (member.verified) {

        verifiedBadge.classList.remove(
            "hidden"
        );

    } else {

        verifiedBadge.classList.add(
            "hidden"
        );

    }


    mainPhoto.textContent =
        member.avatar || "👤";


    aboutText.textContent =
        member.about ||
        "لم تتم إضافة نبذة بعد.";


    seekingText.textContent =
        member.seeking ||
        "لم تتم إضافة معلومات بعد.";


    ageValue.textContent =
        member.age || "—";


    countryValue.textContent =
        member.country || "—";


    cityValue.textContent =
        member.city || "—";


    maritalValue.textContent =
        member.maritalStatus || "—";


    languageValue.textContent =
        member.language || "—";


    educationValue.textContent =
        member.education || "—";


    professionValue.textContent =
        member.profession || "—";


    /* =====================================================
       PHOTOS
    ===================================================== */

    const photos =
        Array.isArray(member.photos)
            ? member.photos
            : [];


    photoCount.textContent =
        photos.length;


    if (photos.length === 0) {

        for (let i = 0; i < 3; i++) {

            const box =
                document.createElement("div");

            box.className =
                "photo-box";

            box.textContent =
                "🖼️";

            photosGrid.appendChild(box);

        }

    } else {

        photos.forEach((photo) => {

            const box =
                document.createElement("div");

            box.className =
                "photo-box";

            if (photo.preview) {

                const image =
                    document.createElement("img");

                image.src =
                    photo.preview;

                image.style.width =
                    "100%";

                image.style.height =
                    "100%";

                image.style.objectFit =
                    "cover";

                image.style.borderRadius =
                    "12px";

                box.innerHTML = "";

                box.appendChild(image);

            } else {

                box.textContent =
                    "🖼️";

            }

            photosGrid.appendChild(box);

        });

    }


    /* =====================================================
       FAVORITE
    ===================================================== */

    favoriteBtn.addEventListener(
        "click",
        () => {

            if (
                favoriteBtn.textContent
                    .includes("☆")
            ) {

                favoriteBtn.textContent =
                    "★ مفضلة";

            } else {

                favoriteBtn.textContent =
                    "☆ مفضلة";

            }

        }
    );


    /* =====================================================
       MESSAGE
    ===================================================== */

    messageBtn.addEventListener(
        "click",
        () => {

            openModal(
                "المراسلة",
                "سيتم تشغيل المحادثة الحقيقية وربطها بقاعدة البيانات والترجمة التلقائية في المرحلة القادمة."
            );

        }
    );


    /* =====================================================
       MORE
    ===================================================== */

    moreBtn.addEventListener(
        "click",
        () => {

            openModal(
                "المزيد",
                "يمكنك لاحقًا الإبلاغ عن العضو أو كتمه أو حظره."
            );

        }
    );


    /* =====================================================
       REPORT
    ===================================================== */

    reportBtn.addEventListener(
        "click",
        () => {

            openModal(
                "الإبلاغ عن العضو",
                "سيتم فتح قائمة أسباب الإبلاغ مثل الاحتيال، طلب الأموال، الإساءة، التحرش، المحتوى غير المناسب أو الحساب المشبوه."
            );

        }
    );


    /* =====================================================
       BLOCK
    ===================================================== */

    blockBtn.addEventListener(
        "click",
        () => {

            openModal(
                "حظر العضو",
                "بعد تشغيل نظام الحظر الحقيقي، لن يتمكن العضو المحظور من مراسلتك أو التواصل معك."
            );

        }
    );

}); 
