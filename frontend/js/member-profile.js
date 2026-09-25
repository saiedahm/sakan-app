document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

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
       LOGIN
    ===================================================== */

    if (
        localStorage.getItem("sakanLoggedIn") !==
        "true"
    ) {

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


    function openModal(
        title,
        text
    ) {

        modalTitle.textContent =
            title;

        modalText.textContent =
            text;

        modal.classList.remove(
            "hidden"
        );

    }


    function closeModal() {

        modal.classList.add(
            "hidden"
        );

    }


    closeModalBtn?.addEventListener(
        "click",
        closeModal
    );


    modalOkBtn?.addEventListener(
        "click",
        closeModal
    );


    modal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }
    );


    /* =====================================================
       BACK
    ===================================================== */

    backHomeBtn?.addEventListener(
        "click",
        () => {

            window.location.href =
                "home.html";

        }
    );


    /* =====================================================
       LOAD MEMBER
    ===================================================== */

    let member = null;


    try {

        const saved =
            localStorage.getItem(
                "sakanSelectedMember"
            );


        if (saved) {

            member =
                JSON.parse(saved);

        }

    } catch (error) {

        console.error(
            "تعذر قراءة بيانات العضو:",
            error
        );

    }


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
       RECORD VISIT
    ===================================================== */

    function recordVisit(
        profile
    ) {

        if (
            !profile ||
            !profile.id ||
            profile.id === 999
        ) {

            return;

        }


        try {

            const visitors =
                JSON.parse(
                    localStorage.getItem(
                        "sakanVisitors"
                    ) || "[]"
                );


            const visitor = {

                id:
                    profile.id,

                name:
                    profile.name,

                age:
                    profile.age,

                country:
                    profile.country,

                city:
                    profile.city,

                online:
                    profile.online,

                verified:
                    profile.verified,

                avatar:
                    profile.avatar,

                about:
                    profile.about,

                seeking:
                    profile.seeking,

                photos:
                    profile.photos || [],

                visitedAt:
                    new Date().toISOString()

            };


            const filtered =
                visitors.filter(
                    item =>
                        Number(item.id) !==
                        Number(profile.id)
                );


            filtered.unshift(
                visitor
            );


            localStorage.setItem(
                "sakanVisitors",
                JSON.stringify(
                    filtered.slice(
                        0,
                        50
                    )
                )
            );

        } catch (error) {

            console.error(
                "تعذر تسجيل الزيارة:",
                error
            );

        }

    }


    recordVisit(
        member
    );


    /* =====================================================
       FILL PROFILE
    ===================================================== */

    memberName.textContent =
        member.name ||
        "عضو جديد";


    memberBasicInfo.textContent =
        `${member.age || "—"} سنة • ${member.country || "—"}`;


    if (
        member.online
    ) {

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


    if (
        member.verified
    ) {

        verifiedBadge.classList.remove(
            "hidden"
        );

    } else {

        verifiedBadge.classList.add(
            "hidden"
        );

    }


    mainPhoto.textContent =
        member.avatar ||
        "👤";


    aboutText.textContent =
        member.about ||
        "لم تتم إضافة نبذة بعد.";


    seekingText.textContent =
        member.seeking ||
        "لم تتم إضافة معلومات بعد.";


    ageValue.textContent =
        member.age ||
        "—";


    countryValue.textContent =
        member.country ||
        "—";


    cityValue.textContent =
        member.city ||
        "—";


    maritalValue.textContent =
        member.maritalStatus ||
        "—";


    languageValue.textContent =
        member.language ||
        "—";


    educationValue.textContent =
        member.education ||
        "—";


    professionValue.textContent =
        member.profession ||
        "—";


    /* =====================================================
       PHOTOS
    ===================================================== */

    const photos =
        Array.isArray(
            member.photos
        )
            ? member.photos
            : [];


    photoCount.textContent =
        photos.length;


    if (
        photos.length ===
        0
    ) {

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            const box =
                document.createElement(
                    "div"
                );

            box.className =
                "photo-box";

            box.textContent =
                "🖼️";

            photosGrid.appendChild(
                box
            );

        }

    } else {

        photos.forEach(
            photo => {

                const box =
                    document.createElement(
                        "div"
                    );

                box.className =
                    "photo-box";


                if (
                    photo &&
                    photo.preview
                ) {

                    const image =
                        document.createElement(
                            "img"
                        );

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

                    box.appendChild(
                        image
                    );

                } else {

                    box.textContent =
                        "🖼️";

                }


                photosGrid.appendChild(
                    box
                );

            }
        );

    }


    /* =====================================================
       FAVORITE
    ===================================================== */

    function getFavorites() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "sakanFavorites"
                ) || "[]"
            );

        } catch {

            return [];

        }

    }


    function saveFavorites(
        favorites
    ) {

        localStorage.setItem(
            "sakanFavorites",
            JSON.stringify(
                favorites
            )
        );

    }


    function updateFavoriteButton() {

        if (!favoriteBtn) {
            return;
        }


        const exists =
            getFavorites().some(
                item =>
                    Number(item.id) ===
                    Number(member.id)
            );


        favoriteBtn.textContent =
            exists
                ? "★ مفضلة"
                : "☆ مفضلة";

    }


    favoriteBtn?.addEventListener(
        "click",
        () => {

            let favorites =
                getFavorites();


            const exists =
                favorites.some(
                    item =>
                        Number(item.id) ===
                        Number(member.id)
                );


            if (exists) {

                favorites =
                    favorites.filter(
                        item =>
                            Number(item.id) !==
                            Number(member.id)
                    );

            } else {

                favorites.push({
                    ...member,
                    photos: []
                });

            }


            saveFavorites(
                favorites
            );


            updateFavoriteButton();

        }
    );


    updateFavoriteButton();


    /* =====================================================
       MESSAGE
    ===================================================== */

    messageBtn?.addEventListener(
        "click",
        () => {

            if (!member.id) {
                return;
            }


            let conversations = [];


            try {

                conversations =
                    JSON.parse(
                        localStorage.getItem(
                            "sakanMessages"
                        ) || "[]"
                    );

            } catch {

                conversations =
                    [];

            }


            const exists =
                conversations.some(
                    item =>
                        Number(
                            item.memberId
                        ) ===
                        Number(
                            member.id
                        )
                );


            if (!exists) {

                conversations.push({

                    memberId:
                        member.id,

                    messages: []

                });


                localStorage.setItem(
                    "sakanMessages",
                    JSON.stringify(
                        conversations
                    )
                );

            }


            window.location.href =
                "messages.html";

        }
    );


    /* =====================================================
       MORE
    ===================================================== */

    moreBtn?.addEventListener(
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

    reportBtn?.addEventListener(
        "click",
        () => {

            openModal(
                "الإبلاغ عن العضو",
                "سيتم لاحقًا فتح أسباب الإبلاغ مثل طلب الأموال أو الاحتيال أو الإساءة أو التحرش أو المحتوى غير المناسب."
            );

        }
    );


    /* =====================================================
       BLOCK
    ===================================================== */

    blockBtn?.addEventListener(
        "click",
        () => {

            openModal(
                "حظر العضو",
                "سيتم لاحقًا تشغيل نظام الحظر الحقيقي لمنع التواصل بين الحسابين."
            );

        }
    );

});
