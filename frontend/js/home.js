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
       CURRENT PROFILE
    ===================================================== */

    function getCurrentProfile() {

        try {

            const saved =
                localStorage.getItem(
                    "sakanProfileData"
                );

            if (!saved) {
                return null;
            }

            return JSON.parse(saved);

        } catch (error) {

            console.error(
                "تعذر قراءة بيانات الملف:",
                error
            );

            return null;
        }
    }


    const currentProfile =
        getCurrentProfile();


    /* =====================================================
       NORMALIZE GENDER
    ===================================================== */

    function normalizeGender(value) {

        if (!value) {
            return null;
        }

        const gender =
            String(value)
                .trim()
                .toLowerCase();

        if (
            gender === "male" ||
            gender === "man" ||
            gender === "ذكر" ||
            gender === "رجل"
        ) {
            return "male";
        }

        if (
            gender === "female" ||
            gender === "woman" ||
            gender === "أنثى" ||
            gender === "امرأة" ||
            gender === "بنت" ||
            gender === "فتاة"
        ) {
            return "female";
        }

        return null;
    }


    const currentGender =
        normalizeGender(
            currentProfile?.gender
        );


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

    function openModal(title, text) {

        if (!modal) {
            return;
        }

        modalTitle.textContent =
            title;

        modalText.textContent =
            text;

        modal.classList.remove(
            "hidden"
        );
    }


    function closeModal() {

        if (!modal) {
            return;
        }

        modal.classList.add(
            "hidden"
        );
    }


    if (closeModalBtn) {

        closeModalBtn.addEventListener(
            "click",
            closeModal
        );

    }


    if (modalOkBtn) {

        modalOkBtn.addEventListener(
            "click",
            closeModal
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === modal
                ) {
                    closeModal();
                }

            }
        );

    }


    /* =====================================================
       OPPOSITE GENDER
    ===================================================== */

    function getOppositeGender() {

        if (currentGender === "male") {
            return "female";
        }

        if (currentGender === "female") {
            return "male";
        }

        return null;
    }


    /* =====================================================
       MEMBER CARD
    ===================================================== */

    function createMemberCard(member) {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "member-card";

        card.dataset.memberId =
            member.id;


        const verifiedBadge =
            member.verified

                ? `<span class="verified-badge">✓</span>`

                : "";


        const onlineBadge =
            member.online

                ? `<span class="online-badge"></span>`

                : "";


        card.innerHTML = `

            <div class="member-photo">

                <div class="placeholder-avatar">

                    ${member.avatar}

                </div>

                ${onlineBadge}

                <button
                    type="button"
                    class="favorite-btn"
                    aria-label="إضافة للمفضلين">

                    ☆

                </button>

            </div>


            <div class="member-info">

                <h3>

                    ${member.name}

                    ${verifiedBadge}

                </h3>


                <p>

                    ${member.age}
                    سنة
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
       RENDER MEMBERS
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
            !Array.isArray(members) ||
            members.length === 0
        ) {

            membersGrid.innerHTML = `

                <div class="gender-notice">

                    <span>ℹ️</span>

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
            .forEach((member) => {

                membersGrid.appendChild(
                    createMemberCard(member)
                );

            });


        attachMemberEvents();
    }


    /* =====================================================
       MEMBER EVENTS
    ===================================================== */

    function attachMemberEvents() {

        document
            .querySelectorAll(
                ".favorite-btn"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    (event) => {

                        event.stopPropagation();

                        button.textContent =
                            button.textContent.trim() === "☆"
                                ? "★"
                                : "☆";

                    }
                );

            });


        document
            .querySelectorAll(
                ".view-profile-btn"
            )
            .forEach((button) => {

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


                        const oppositeGender =
                            getOppositeGender();


                        let member =
                            null;


                        if (
                            oppositeGender &&
                            demoMembers[
                                oppositeGender
                            ]
                        ) {

                            member =
                                demoMembers[
                                    oppositeGender
                                ].find(
                                    (item) =>
                                        item.id ===
                                        memberId
                                );

                        }


                        if (!member) {

                            openModal(
                                "تعذر فتح الملف",
                                "لم يتم العثور على بيانات هذا العضو."
                            );

                            return;
                        }


                        /*
                         * حماية إضافية:
                         * لا نفتح ملفًا من الجنس غير المسموح.
                         */

                        if (
                            member.gender !==
                            oppositeGender
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
                                id:
                                    member.id,

                                name:
                                    member.name,

                                age:
                                    member.age,

                                country:
                                    member.country,

                                city:
                                    member.city,

                                maritalStatus:
                                    member.maritalStatus,

                                language:
                                    member.language,

                                education:
                                    member.education,

                                profession:
                                    member.profession,

                                online:
                                    member.online,

                                verified:
                                    member.verified,

                                avatar:
                                    member.avatar,

                                about:
                                    member.about,

                                seeking:
                                    member.seeking,

                                photos:
                                    []
                            })
                        );


                        window.location.href =
                            "member-profile.html";

                    }
                );

            });

    }


    /* =====================================================
       MAIN LOAD
    ===================================================== */

    function loadHomeMembers() {

        const oppositeGender =
            getOppositeGender();


        if (!oppositeGender) {

            if (membersGrid) {

                membersGrid.innerHTML = `

                    <div class="gender-notice">

                        <span>⚠️</span>

                        <div>

                            <strong>
                                أكمل بياناتك أولًا
                            </strong>

                            <p>
                                يجب تحديد الجنس في بيانات الحساب
                                لعرض الأعضاء المناسبين.
                            </p>

                        </div>

                    </div>

                `;

            }

            return;
        }


        const members =
            demoMembers[
                oppositeGender
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
       MOVING MEMBER STRIP
       ALSO OPPOSITE GENDER ONLY
    ===================================================== */

    function loadMemberStrip() {

        if (!stripTrack) {
            return;
        }


        const oppositeGender =
            getOppositeGender();


        if (!oppositeGender) {
            return;
        }


        const members =
            demoMembers[
                oppositeGender
            ] || [];


        stripTrack.innerHTML =
            "";


        const repeated =
            [
                ...members,
                ...members
            ];


        repeated.forEach(
            (member) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "mini-member";


                item.innerHTML = `

                    <div class="mini-avatar">

                        ${member.avatar}

                    </div>

                    <span>

                        ${member.name}

                    </span>

                `;


                stripTrack.appendChild(
                    item
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
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(
                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }
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

                        openModal(
                            "الرسائل",
                            "قسم الرسائل سيتم ربطه بنظام المحادثات وقاعدة البيانات في المرحلة القادمة."
                        );

                        return;
                    }


                    if (
                        section ===
                        "visitors"
                    ) {

                        openModal(
                            "من زار صفحتي",
                            "سيظهر هنا الأعضاء الذين قاموا بزيارة ملفك."
                        );

                        return;
                    }


                    if (
                        section ===
                        "favorites"
                    ) {

                        openModal(
                            "المفضلون",
                            "سيتم حفظ الأعضاء المفضلين داخل حسابك."
                        );

                        return;
                    }


                    if (
                        section ===
                        "latest"
                    ) {

                        const oppositeGender =
                            getOppositeGender();


                        if (
                            oppositeGender
                        ) {

                            memberCategory.textContent =
                                "أحدث الأعضاء";


                            membersTitle.textContent =
                                currentGender ===
                                "male"

                                    ? "أحدث العضوات"

                                    : "أحدث الأعضاء";


                            renderMembers(
                                demoMembers[
                                    oppositeGender
                                ]
                            );

                        }

                        return;
                    }


                    if (
                        section ===
                        "online"
                    ) {

                        const oppositeGender =
                            getOppositeGender();


                        if (
                            oppositeGender
                        ) {

                            const onlineMembers =
                                demoMembers[
                                    oppositeGender
                                ].filter(
                                    (member) =>
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
                                onlineMembers
                            );

                        }

                    }

                }
            );

        });


    /* =====================================================
       REFRESH
    ===================================================== */

    if (refreshBtn) {

        refreshBtn.addEventListener(
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

    }


    /* =====================================================
       COMMERCIAL AD
    ===================================================== */

    const advertiseBtn =
        document.getElementById(
            "advertiseBtn"
        );


    if (advertiseBtn) {

        advertiseBtn.addEventListener(
            "click",
            () => {

                openModal(
                    "أعلن معنا",
                    "سيتم إنشاء طلب الإعلان التجاري واختيار الباقة ثم الدفع والمراجعة."
                );

            }
        );

    }


    /* =====================================================
       FEATURED MEMBER AD
    ===================================================== */

    const featuredAdBtn =
        document.getElementById(
            "featuredAdBtn"
        );


    if (featuredAdBtn) {

        featuredAdBtn.addEventListener(
            "click",
            () => {

                openModal(
                    "إعلان مميز — €0.99",
                    "سيتم اختيار الصورة ثم الدفع، وبعد تأكيد الدفع تدخل الصورة إلى المراجعة قبل النشر."
                );

            }
        );

    }


    /* =====================================================
       PROFILE BUTTON
    ===================================================== */

    const profileBtn =
        document.getElementById(
            "profileBtn"
        );


    if (profileBtn) {

        profileBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "profile-data.html";

            }
        );

    }


    /* =====================================================
       LANGUAGE
    ===================================================== */

    const languageBtn =
        document.getElementById(
            "languageBtn"
        );


    if (languageBtn) {

        languageBtn.addEventListener(
            "click",
            () => {

                openModal(
                    "لغة المنصة",
                    "العربية مفعلة حاليًا. سيتم إضافة الألمانية والإنجليزية والفرنسية والإسبانية والتركية لاحقًا."
                );

            }
        );

    }


    /* =====================================================
       MEMBER TOOLS
    ===================================================== */

    document
        .querySelectorAll(
            ".tool-card"
        )
        .forEach((tool) => {

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
                        type ===
                        "photos" ||
                        type ===
                        "myPhotos"
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
                            "سيتم هنا إدارة الخصوصية والإشعارات وكلمة المرور والحساب."
                        );

                    }

                }
            );

        });


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


    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );

    }


    const logoutTool =
        document.getElementById(
            "logoutTool"
        );


    if (logoutTool) {

        logoutTool.addEventListener(
            "click",
            logout
        );

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadHomeMembers();

    loadMemberStrip();

});
