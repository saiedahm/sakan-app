document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const modal =
        document.getElementById("simpleModal");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalText =
        document.getElementById("modalText");

    const closeModalBtn =
        document.getElementById("closeModal");

    const modalOkBtn =
        document.getElementById("modalOk");

    const membersGrid =
        document.getElementById("membersGrid");

    const membersTitle =
        document.getElementById("membersTitle");

    const memberCategory =
        document.getElementById("memberCategory");

    const refreshBtn =
        document.getElementById("refreshBtn");

    const stripTrack =
        document.getElementById("stripTrack");


    /* =====================================================
       LOGIN
    ===================================================== */

    if (
        localStorage.getItem("sakanLoggedIn") !==
        "true"
    ) {
        window.location.href = "../index.html";
        return;
    }


    /* =====================================================
       PROFILE
    ===================================================== */

    function getCurrentProfile() {

        try {

            const saved =
                localStorage.getItem(
                    "sakanProfileData"
                );

            return saved
                ? JSON.parse(saved)
                : null;

        } catch {

            return null;

        }

    }


    const currentProfile =
        getCurrentProfile();


    /* =====================================================
       GENDER
    ===================================================== */

    function normalizeGender(value) {

        const gender =
            String(value || "")
                .trim()
                .toLowerCase();

        if (
            [
                "male",
                "man",
                "ذكر",
                "رجل"
            ].includes(gender)
        ) {
            return "male";
        }

        if (
            [
                "female",
                "woman",
                "أنثى",
                "امرأة",
                "بنت",
                "فتاة"
            ].includes(gender)
        ) {
            return "female";
        }

        return null;

    }


    const currentGender =
        normalizeGender(
            currentProfile?.gender
        );


    function getOppositeGender() {

        if (
            currentGender === "male"
        ) {
            return "female";
        }

        if (
            currentGender === "female"
        ) {
            return "male";
        }

        return null;

    }


    /* =====================================================
       DEMO MEMBERS
    ===================================================== */

    const demoMembers = {

        female: [

            {
                id: 101,
                gender: "female",
                name: "عضوة جديدة",
                age: 29,
                country: "ألمانيا",
                city: "هامبورغ",
                maritalStatus: "عزباء",
                language: "العربية",
                education: "جامعي",
                profession: "—",
                online: true,
                verified: true,
                avatar: "👩",
                about:
                    "أبحث عن تعارف جاد قائم على الاحترام والثقة.",
                seeking:
                    "أبحث عن شريك حياة جاد ومحترم."
            },

            {
                id: 102,
                gender: "female",
                name: "عضوة جديدة",
                age: 34,
                country: "ألمانيا",
                city: "كولن",
                maritalStatus: "عزباء",
                language: "الألمانية",
                education: "جامعي",
                profession: "—",
                online: true,
                verified: false,
                avatar: "👩🏻",
                about:
                    "شخصية هادئة وأحب الاستقرار.",
                seeking:
                    "أبحث عن علاقة جادة تنتهي بالزواج."
            },

            {
                id: 103,
                gender: "female",
                name: "عضوة جديدة",
                age: 31,
                country: "فرنسا",
                city: "باريس",
                maritalStatus: "مطلقة",
                language: "الفرنسية",
                education: "جامعي",
                profession: "—",
                online: false,
                verified: true,
                avatar: "👩‍🦰",
                about:
                    "أقدر الصراحة والاحترام والتفاهم.",
                seeking:
                    "أبحث عن شريك حياة جاد."
            },

            {
                id: 104,
                gender: "female",
                name: "عضوة جديدة",
                age: 27,
                country: "إسبانيا",
                city: "مدريد",
                maritalStatus: "عزباء",
                language: "الإسبانية",
                education: "جامعي",
                profession: "—",
                online: true,
                verified: false,
                avatar: "👩🏼",
                about:
                    "أحب الحياة الهادئة والأسرة.",
                seeking:
                    "أبحث عن الزواج والاستقرار."
            },

            {
                id: 105,
                gender: "female",
                name: "عضوة جديدة",
                age: 36,
                country: "ألمانيا",
                city: "برلين",
                maritalStatus: "مطلقة",
                language: "العربية",
                education: "جامعي",
                profession: "—",
                online: false,
                verified: true,
                avatar: "👩🏽",
                about:
                    "أقدر الحياة الأسرية والتفاهم.",
                seeking:
                    "أبحث عن علاقة جادة ومستقرة."
            },

            {
                id: 106,
                gender: "female",
                name: "عضوة جديدة",
                age: 30,
                country: "النمسا",
                city: "فيينا",
                maritalStatus: "عزباء",
                language: "العربية",
                education: "جامعي",
                profession: "—",
                online: true,
                verified: false,
                avatar: "👩‍🦱",
                about:
                    "أحب الاستقرار والصراحة.",
                seeking:
                    "أبحث عن شريك حياة جاد."
            }

        ],


        male: [

            {
                id: 201,
                gender: "male",
                name: "عضو جديد",
                age: 32,
                country: "ألمانيا",
                city: "برلين",
                maritalStatus: "أعزب",
                language: "العربية",
                education: "جامعي",
                profession: "—",
                online: true,
                verified: true,
                avatar: "👨",
                about:
                    "أبحث عن علاقة جادة مبنية على الثقة والاحترام.",
                seeking:
                    "أبحث عن شريكة حياة جادة ومحترمة."
            },

            {
                id: 202,
                gender: "male",
                name: "عضو جديد",
                age: 38,
                country: "ألمانيا",
                city: "هامبورغ",
                maritalStatus: "أعزب",
                language: "الألمانية",
                education: "جامعي",
                profession: "—",
                online: false,
                verified: false,
                avatar: "👨🏻",
                about:
                    "أحب الاستقرار والحياة الأسرية.",
                seeking:
                    "أبحث عن الزواج والاستقرار."
            },

            {
                id: 203,
                gender: "male",
                name: "عضو جديد",
                age: 29,
                country: "فرنسا",
                city: "ليون",
                maritalStatus: "أعزب",
                language: "الفرنسية",
                education: "جامعي",
                profession: "—",
                online: true,
                verified: true,
                avatar: "👨‍🦰",
                about:
                    "أحب الصراحة والتفاهم.",
                seeking:
                    "أبحث عن شريكة حياة جادة."
            },

            {
                id: 204,
                gender: "male",
                name: "عضو جديد",
                age: 41,
                country: "إسبانيا",
                city: "مدريد",
                maritalStatus: "مطلق",
                language: "الإسبانية",
                education: "جامعي",
                profession: "—",
                online: true,
                verified: false,
                avatar: "👨🏼",
                about:
                    "أقدر الاحترام والعائلة.",
                seeking:
                    "أبحث عن علاقة جادة."
            },

            {
                id: 205,
                gender: "male",
                name: "عضو جديد",
                age: 35,
                country: "ألمانيا",
                city: "ميونخ",
                maritalStatus: "أعزب",
                language: "العربية",
                education: "جامعي",
                profession: "—",
                online: false,
                verified: true,
                avatar: "👨🏽",
                about:
                    "أبحث عن الاستقرار والتفاهم.",
                seeking:
                    "أبحث عن الزواج الجاد."
            },

            {
                id: 206,
                gender: "male",
                name: "عضو جديد",
                age: 30,
                country: "النمسا",
                city: "سالزبورغ",
                maritalStatus: "أعزب",
                language: "العربية",
                education: "جامعي",
                profession: "—",
                online: true,
                verified: false,
                avatar: "👨‍🦱",
                about:
                    "أحب الهدوء والاستقرار.",
                seeking:
                    "أبحث عن شريكة حياة."
            }

        ]

    };


    /* =====================================================
       MODAL
    ===================================================== */

    function openModal(
        title,
        text
    ) {

        if (!modal) {
            return;
        }

        if (modalTitle) {
            modalTitle.textContent =
                title;
        }

        if (modalText) {
            modalText.textContent =
                text;
        }

        modal.classList.remove(
            "hidden"
        );

    }


    function closeModal() {

        if (modal) {
            modal.classList.add(
                "hidden"
            );
        }

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
        (event) => {

            if (
                event.target ===
                modal
            ) {
                closeModal();
            }

        }
    );


    /* =====================================================
       FAVORITES
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


    function isFavorite(
        memberId
    ) {

        return getFavorites().some(
            item =>
                Number(item.id) ===
                Number(memberId)
        );

    }


    function toggleFavorite(
        member,
        button
    ) {

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

            button.textContent =
                "☆";

        } else {

            favorites.push({
                ...member,
                photos: []
            });

            button.textContent =
                "★";

        }


        saveFavorites(
            favorites
        );

    }


    /* =====================================================
       MEMBER CARD
    ===================================================== */

    function createMemberCard(
        member
    ) {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "member-card";

        card.dataset.memberId =
            String(member.id);


        const verified =
            member.verified
                ? '<span class="verified-badge">✓</span>'
                : "";


        const online =
            member.online
                ? '<span class="online-badge"></span>'
                : "";


        card.innerHTML = `

            <div class="member-photo">

                <div class="placeholder-avatar">

                    ${member.avatar}

                </div>

                ${online}

                <button
                    type="button"
                    class="favorite-btn">

                    ${
                        isFavorite(member.id)
                            ? "★"
                            : "☆"
                    }

                </button>

            </div>


            <div class="member-info">

                <h3>

                    ${member.name}
                    ${verified}

                </h3>


                <p>

                    ${member.age} سنة
                    •
                    ${member.country}

                </p>


                <span class="member-status">

                    ${
                        member.online
                            ? "متصل الآن"
                            : "غير متصل"
                    }

                </span>

            </div>


            <button
                type="button"
                class="view-profile-btn">

                عرض الملف

            </button>

        `;


        return card;

    }


    /* =====================================================
       OPEN MEMBER PROFILE
    ===================================================== */

    function openMemberProfile(
        member
    ) {

        const opposite =
            getOppositeGender();


        if (
            !member ||
            member.gender !==
            opposite
        ) {

            openModal(
                "غير متاح",
                "هذا الملف ليس ضمن قائمة الأعضاء المسموح بعرضها."
            );

            return;

        }


        localStorage.setItem(
            "sakanSelectedMember",
            JSON.stringify({
                ...member,
                photos: []
            })
        );


        window.location.href =
            "member-profile.html";

    }


    /* =====================================================
       MEMBER EVENTS
    ===================================================== */

    function attachMemberEvents() {

        document
            .querySelectorAll(
                ".favorite-btn"
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        (event) => {

                            event.stopPropagation();


                            const card =
                                button.closest(
                                    ".member-card"
                                );


                            if (!card) {
                                return;
                            }


                            const memberId =
                                Number(
                                    card.dataset.memberId
                                );


                            const opposite =
                                getOppositeGender();


                            const member =
                                demoMembers[
                                    opposite
                                ]?.find(
                                    item =>
                                        Number(
                                            item.id
                                        ) ===
                                        memberId
                                );


                            if (member) {

                                toggleFavorite(
                                    member,
                                    button
                                );

                            }

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                ".view-profile-btn"
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            const card =
                                button.closest(
                                    ".member-card"
                                );


                            if (!card) {
                                return;
                            }


                            const memberId =
                                Number(
                                    card.dataset.memberId
                                );


                            const opposite =
                                getOppositeGender();


                            const member =
                                demoMembers[
                                    opposite
                                ]?.find(
                                    item =>
                                        Number(
                                            item.id
                                        ) ===
                                        memberId
                                );


                            openMemberProfile(
                                member
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       RENDER
    ===================================================== */

    function renderMembers(
        members
    ) {

        if (!membersGrid) {
            return;
        }


        membersGrid.innerHTML =
            "";


        if (
            !Array.isArray(
                members
            ) ||
            members.length === 0
        ) {

            membersGrid.innerHTML = `

                <div class="gender-notice">

                    <span>
                        ℹ️
                    </span>

                    <div>

                        <strong>
                            لا توجد نتائج حاليًا
                        </strong>

                        <p>
                            سيظهر الأعضاء هنا عند توفرهم.
                        </p>

                    </div>

                </div>

            `;

            return;

        }


        members
            .slice(0, 50)
            .forEach(
                member => {

                    membersGrid.appendChild(
                        createMemberCard(
                            member
                        )
                    );

                }
            );


        attachMemberEvents();

    }


    /* =====================================================
       HOME MEMBERS
    ===================================================== */

    function loadHomeMembers() {

        const opposite =
            getOppositeGender();


        if (!opposite) {

            if (membersGrid) {

                membersGrid.innerHTML = `

                    <div class="gender-notice">

                        <span>
                            ⚠️
                        </span>

                        <div>

                            <strong>
                                أكمل بياناتك أولًا
                            </strong>

                            <p>
                                يجب تحديد الجنس في بيانات الحساب.
                            </p>

                        </div>

                    </div>

                `;

            }

            return;

        }


        const members =
            demoMembers[
                opposite
            ] || [];


        if (
            currentGender ===
            "male"
        ) {

            membersTitle.textContent =
                "نساء قد يناسبنك";

            memberCategory.textContent =
                "العضوات";

        } else {

            membersTitle.textContent =
                "رجال قد يناسبنك";

            memberCategory.textContent =
                "الأعضاء";

        }


        renderMembers(
            members
        );

    }


    /* =====================================================
       MOVING TOP STRIP
       10 صور مربعة ثابتة الحجم
       تتكرر مرة ثانية للحركة المستمرة
    ===================================================== */

    function loadMemberStrip() {

        if (!stripTrack) {
            return;
        }


        const opposite =
            getOppositeGender();


        const members =
            demoMembers[
                opposite
            ] || [];


        /*
         * عشر صور مربعة.
         *
         * هذه الصور مؤقتة للعرض.
         * عند ربط صور الأعضاء الحقيقية لاحقًا
         * يمكن استبدال الرابط داخل المصفوفة
         * بدون تغيير التصميم.
         */

        const portraitUrls = [

            "https://i.pravatar.cc/160?img=1",

            "https://i.pravatar.cc/160?img=2",

            "https://i.pravatar.cc/160?img=3",

            "https://i.pravatar.cc/160?img=4",

            "https://i.pravatar.cc/160?img=5",

            "https://i.pravatar.cc/160?img=6",

            "https://i.pravatar.cc/160?img=7",

            "https://i.pravatar.cc/160?img=8",

            "https://i.pravatar.cc/160?img=9",

            "https://i.pravatar.cc/160?img=10"

        ];


        stripTrack.innerHTML =
            "";


        /*
         * أول 10 صور
         */

        const tenMembers =
            portraitUrls.map(
                (url, index) => {

                    return {

                        url,

                        name:
                            members[
                                index %
                                Math.max(
                                    members.length,
                                    1
                                )
                            ]?.name ||
                            "عضو جديد"

                    };

                }
            );


        /*
         * نكرر المجموعة مرة ثانية
         * حتى تكون الحركة مستمرة.
         */

        const movingMembers = [

            ...tenMembers,

            ...tenMembers

        ];


        movingMembers.forEach(
            (member) => {

                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "mini-member";


                element.innerHTML = `

                    <div class="mini-avatar">

                        <img

                            src="${member.url}"

                            alt="${member.name}"

                            loading="lazy"

                            draggable="false">

                    </div>


                    <span>

                        ${member.name}

                    </span>

                `;


                stripTrack.appendChild(
                    element
                );

            }
        );

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".nav-item"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        const section =
                            button.dataset.section;


                        if (
                            section ===
                            "home"
                        ) {

                            loadHomeMembers();

                            return;

                        }


                        if (
                            section ===
                            "messages"
                        ) {

                            window.location.href =
                                "messages.html";

                            return;

                        }


                        if (
                            section ===
                            "visitors"
                        ) {

                            window.location.href =
                                "visitors.html";

                            return;

                        }


                        if (
                            section ===
                            "favorites"
                        ) {

                            window.location.href =
                                "favorites.html";

                            return;

                        }


                        if (
                            section ===
                            "latest"
                        ) {

                            const opposite =
                                getOppositeGender();


                            if (opposite) {

                                memberCategory.textContent =
                                    "أحدث الأعضاء";


                                membersTitle.textContent =
                                    currentGender ===
                                    "male"

                                        ? "أحدث العضوات"

                                        : "أحدث الأعضاء";


                                renderMembers(
                                    demoMembers[
                                        opposite
                                    ]
                                );

                            }

                            return;

                        }


                        if (
                            section ===
                            "online"
                        ) {

                            const opposite =
                                getOppositeGender();


                            if (opposite) {

                                const online =
                                    demoMembers[
                                        opposite
                                    ].filter(
                                        member =>
                                            member.online
                                    );


                                memberCategory.textContent =
                                    "متصلون الآن";


                                membersTitle.textContent =
                                    currentGender ===
                                    "male"

                                        ? "العضوات المتصلات الآن"

                                        : "الأعضاء المتصلون الآن";


                                renderMembers(
                                    online
                                );

                            }

                        }

                    }
                );

            }
        );


    /* =====================================================
       REFRESH
    ===================================================== */

    refreshBtn?.addEventListener(
        "click",
        () => {

            refreshBtn.textContent =
                "↻ جارٍ التحديث...";


            setTimeout(
                () => {

                    loadHomeMembers();

                    loadMemberStrip();


                    refreshBtn.textContent =
                        "↻ تحديث";


                    openModal(
                        "تم التحديث",
                        "تم تحديث قائمة الأعضاء المناسبة لحسابك."
                    );

                },
                500
            );

        }
    );


    /* =====================================================
       TOP BUTTONS
    ===================================================== */

    document
        .getElementById(
            "advertiseBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                openModal(
                    "أعلن معنا",
                    "سيتم إنشاء طلب إعلان تجاري ثم اختيار الباقة والدفع والمراجعة."
                );

            }
        );


    document
        .getElementById(
            "featuredAdBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                openModal(
                    "إعلان مميز — €0.99",
                    "سيتم اختيار الصورة ثم الدفع وبعد المراجعة تدخل إلى قائمة الإعلانات المميزة."
                );

            }
        );


    document
        .getElementById(
            "profileBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "profile-data.html";

            }
        );


    document
        .getElementById(
            "languageBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                openModal(
                    "لغة المنصة",
                    "العربية مفعلة حاليًا. اللغات الأخرى سنضيفها لاحقًا."
                );

            }
        );


    /* =====================================================
       MEMBER TOOLS
    ===================================================== */

    document
        .querySelectorAll(
            ".tool-card"
        )
        .forEach(
            tool => {

                tool.addEventListener(
                    "click",
                    () => {

                        const type =
                            tool.dataset.tool;


                        if (
                            type ===
                            "edit"
                        ) {

                            window.location.href =
                                "profile-data.html";

                            return;

                        }


                        if (
                            type === "photos" ||
                            type === "myPhotos"
                        ) {

                            window.location.href =
                                "photos.html";

                            return;

                        }


                        if (
                            type ===
                            "search"
                        ) {

                            window.location.href =
                                "member-search.html";

                            return;

                        }


                        if (
                            type ===
                            "settings"
                        ) {

                            openModal(
                                "الإعدادات",
                                "سيتم هنا إدارة إعدادات الخصوصية والإشعارات وكلمة المرور."
                            );

                        }

                    }
                );

            }
        );


    /* =====================================================
       LOGOUT
    ===================================================== */

    function logout() {

        localStorage.removeItem(
            "sakanLoggedIn"
        );


        window.location.href =
            "../index.html";

    }


    document
        .getElementById(
            "logoutBtn"
        )
        ?.addEventListener(
            "click",
            logout
        );


    document
        .getElementById(
            "logoutTool"
        )
        ?.addEventListener(
            "click",
            logout
        );


    /* =====================================================
       INITIAL
    ===================================================== */

    loadHomeMembers();

    loadMemberStrip();

});
