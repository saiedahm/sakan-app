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
        !localStorage.getItem("sakanAuthToken")
    ) {

        window.location.href =
            "../index.html?returnTo=home";

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
            currentGender ===
            "male"
        ) {

            return "female";

        }

        if (
            currentGender ===
            "female"
        ) {

            return "male";

        }

        return null;

    }


    /* =====================================================
       GENERATE ADDITIONAL MEMBERS
       50 عضوة + 70 عضو
    ===================================================== */

    function generateAdditionalMembers(
        gender,
        count,
        startId
    ) {

        const cities = [

            ["ألمانيا", "برلين"],
            ["ألمانيا", "هامبورغ"],
            ["ألمانيا", "كولن"],
            ["ألمانيا", "ميونخ"],
            ["ألمانيا", "فرانكفورت"],
            ["ألمانيا", "هانوفر"],
            ["ألمانيا", "دوسلدورف"],
            ["ألمانيا", "شتوتغارت"],
            ["فرنسا", "باريس"],
            ["فرنسا", "ليون"],
            ["هولندا", "أمستردام"],
            ["بلجيكا", "بروكسل"],
            ["النمسا", "فيينا"],
            ["إسبانيا", "مدريد"],
            ["إيطاليا", "ميلانو"],
            ["السويد", "ستوكهولم"],
            ["سويسرا", "زيورخ"],
            ["الدنمارك", "كوبنهاغن"]

        ];


        const languages = [

            "العربية",
            "العربية / الألمانية",
            "الألمانية",
            "الفرنسية",
            "الإنجليزية",
            "الإسبانية"

        ];


        const members = [];


        for (
            let index = 0;
            index < count;
            index++
        ) {

            const number =
                String(index + 7)
                    .padStart(2, "0");


            const id =
                startId + index;


            const [country, city] =
                cities[
                    index % cities.length
                ];


            const age =
                24 + (index % 17);


            const online = true;


            const verified =
                index % 5 === 0;


            const maritalStatus =
                gender === "female"

                    ? (
                        index % 4 === 0
                            ? "مطلقة"
                            : "عزباء"
                    )

                    : (
                        index % 5 === 0
                            ? "مطلق"
                            : "أعزب"
                    );


            members.push({

                id,

                gender,

                name:
                    gender === "female"

                        ? `عضوة جديدة ${number}`

                        : `عضو جديد ${number}`,

                age,

                country,

                city,

                maritalStatus,

                language:
                    languages[
                        index %
                        languages.length
                    ],

                education:
                    index % 4 === 0
                        ? "دراسات عليا"
                        : "جامعي",

                profession:
                    [
                        "مهندس", "مبرمج", "طبيب", "محاسب",
                        "مدرس", "مصمم", "موظف إداري", "رجل أعمال"
                    ][index % 8],

                online,

                verified,

                avatar:
                    gender === "female"
                        ? "👩"
                        : "👨",

                about:
                    gender === "female"

                        ? "ملف تجريبي لعضوة جديدة داخل منصة سكن."

                        : "ملف تجريبي لعضو جديد داخل منصة سكن.",

                seeking:
                    "أبحث عن تعارف جاد قائم على الاحترام والتفاهم.",

                photos: []

            });

        }


        return members;

    }


    /* =====================================================
       DEMO MEMBERS
       50 FEMALE
       70 MALE
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
                    "أبحث عن شريك حياة جاد ومحترم.",
                photos: []
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
                    "أبحث عن علاقة جادة تنتهي بالزواج.",
                photos: []
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
                    "أبحث عن شريك حياة جاد.",
                photos: []
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
                    "أبحث عن الزواج والاستقرار.",
                photos: []
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
                    "أبحث عن علاقة جادة ومستقرة.",
                photos: []
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
                    "أبحث عن شريك حياة جاد.",
                photos: []
            },

            ...generateAdditionalMembers(
                "female",
                44,
                107
            )

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
                    "أبحث عن شريكة حياة جادة ومحترمة.",
                photos: []
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
                    "أبحث عن الزواج والاستقرار.",
                photos: []
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
                    "أبحث عن شريكة حياة جادة.",
                photos: []
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
                    "أبحث عن علاقة جادة.",
                photos: []
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
                    "أبحث عن الزواج الجاد.",
                photos: []
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
                    "أبحث عن شريكة حياة.",
                photos: []
            },

            ...generateAdditionalMembers(
                "male",
                64,
                207
            )

        ]

    };


    /* =====================================================
       15-DAY DEMO CAMPAIGN DATA
       50 women + 70 men, all online with a demo portrait.
    ===================================================== */

    const DEMO_CAMPAIGN_START_DATE = "2026-09-28T00:00:00+02:00";
    const DEMO_CAMPAIGN_DURATION_DAYS = 15;

    function demoCampaignIsActive() {
        const start = new Date(DEMO_CAMPAIGN_START_DATE).getTime();
        const end = start + DEMO_CAMPAIGN_DURATION_DAYS * 24 * 60 * 60 * 1000;
        return Date.now() < end;
    }

    function prepareDemoMembers() {
        ["female", "male"].forEach((gender) => {
            demoMembers[gender].forEach((member, index) => {
                const portraitUrl =
                    "https://randomuser.me/api/portraits/" +
                    (gender === "female" ? "women" : "men") +
                    "/" + ((index + 1) % 100) + ".jpg";

                member.online = true;
                member.demo = true;
                member.portraitUrl = member.portraitUrl || portraitUrl;
                member.photos = [{ preview: member.portraitUrl }];
                member.profession =
                    member.profession && member.profession !== "—"
                        ? member.profession
                        : ["مهندس", "مبرمج", "طبيب", "محاسب", "مدرس", "مصمم", "موظف إداري", "رجل أعمال"][index % 8];
                member.about = member.about || "ملف تجريبي داخل منصة سكن للتعريف بطريقة عرض الملف الشخصي.";
                member.seeking = member.seeking || "أبحث عن تعارف جاد قائم على الاحترام والتفاهم.";
            });
        });
    }

    prepareDemoMembers();

    if (!demoCampaignIsActive()) {
        demoMembers.female = [];
        demoMembers.male = [];
    }


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

                photos:
                    member.photos || []

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

                    <img
                        src="${member.portraitUrl || ""}"
                        alt="${member.name}"
                        loading="lazy"
                        style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">

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

    function openMemberProfile(member) {
        if (!member || !member.id) return;
        localStorage.setItem("sakanSelectedMember", JSON.stringify({
            ...member,
            photos: member.photos || []
        }));
        window.location.href = "member-profile.html?memberId=" + encodeURIComponent(member.id);
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

    async function loadHomeMembers() {

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


        const members = demoMembers[opposite] || [];


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
       10 نساء للرجال
       10 رجال للنساء
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
         * صور النساء
         */

        const femalePortraits = [

            "https://randomuser.me/api/portraits/women/1.jpg",
            "https://randomuser.me/api/portraits/women/2.jpg",
            "https://randomuser.me/api/portraits/women/3.jpg",
            "https://randomuser.me/api/portraits/women/4.jpg",
            "https://randomuser.me/api/portraits/women/5.jpg",
            "https://randomuser.me/api/portraits/women/6.jpg",
            "https://randomuser.me/api/portraits/women/7.jpg",
            "https://randomuser.me/api/portraits/women/8.jpg",
            "https://randomuser.me/api/portraits/women/9.jpg",
            "https://randomuser.me/api/portraits/women/10.jpg"

        ];


        /*
         * صور الرجال
         */

        const malePortraits = [

            "https://randomuser.me/api/portraits/men/1.jpg",
            "https://randomuser.me/api/portraits/men/2.jpg",
            "https://randomuser.me/api/portraits/men/3.jpg",
            "https://randomuser.me/api/portraits/men/4.jpg",
            "https://randomuser.me/api/portraits/men/5.jpg",
            "https://randomuser.me/api/portraits/men/6.jpg",
            "https://randomuser.me/api/portraits/men/7.jpg",
            "https://randomuser.me/api/portraits/men/8.jpg",
            "https://randomuser.me/api/portraits/men/9.jpg",
            "https://randomuser.me/api/portraits/men/10.jpg"

        ];


        const portraitUrls =
            opposite === "female"

                ? femalePortraits

                : malePortraits;


        stripTrack.innerHTML =
            "";


        /*
         * إنشاء 10 ملفات للشريط.
         */

        const tenMembers =
            portraitUrls.map(
                (url, index) => {

                    const member =
                        members[
                            index %
                            Math.max(
                                members.length,
                                1
                            )
                        ] || {

                            id:
                                9000 + index,

                            gender:
                                opposite,

                            name:
                                opposite ===
                                "female"

                                    ? `عضوة جديدة ${index + 1}`

                                    : `عضو جديد ${index + 1}`,

                            age:
                                "—",

                            country:
                                "—",

                            city:
                                "—",

                            maritalStatus:
                                "—",

                            language:
                                "—",

                            education:
                                "—",

                            profession:
                                "—",

                            online:
                                true,

                            verified:
                                false,

                            avatar:
                                opposite ===
                                "female"

                                    ? "👩"

                                    : "👨",

                            about:
                                "ملف تجريبي.",

                            seeking:
                                "تعارف جاد.",

                            photos:
                                []

                        };


                    return {

                        ...member,

                        portraitUrl:
                            url

                    };

                }
            );


        /*
         * تكرار المجموعة
         * للحصول على شريط لا نهائي.
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


                element.dataset.memberId =
                    String(
                        member.id
                    );


                element.setAttribute(
                    "role",
                    "button"
                );


                element.setAttribute(
                    "aria-label",
                    `فتح ملف ${member.name}`
                );


                element.tabIndex =
                    0;


                element.innerHTML = `

                    <div
                        class="mini-avatar">

                        <img

                            src="${member.portraitUrl}"

                            alt="${member.name}"

                            loading="lazy"

                            draggable="false">

                    </div>


                    <span>

                        ${member.name}

                    </span>

                `;


                /*
                 * إيقاف الشريط عند الماوس
                 */

                element.addEventListener("pointerenter", () => {
                    stripTrack.style.animationPlayState = "paused";
                });
                element.addEventListener("pointerdown", () => {
                    stripTrack.style.animationPlayState = "paused";
                });


                /*
                 * فتح الملف بالضغط
                 */

                element.addEventListener("click", () => {
                    stripTrack.style.animationPlayState = "paused";
                    openMemberProfile(member);
                });


                /*
                 * دعم لوحة المفاتيح
                 */

                element.addEventListener(
                    "keydown",
                    (event) => {

                        if (
                            event.key ===
                                "Enter" ||

                            event.key ===
                                " "
                        ) {

                            event.preventDefault();

                            element.click();

                        }

                    }
                );


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


    /*
     * الإعلان الداخلي للعضو €0.99
     */

    document
        .getElementById(
            "featuredAdBtn"
        )
        ?.addEventListener(
            "click",
            () => {

                openModal(
                    "ترويج ملف العضو — €0.99",
                    "هذا الإعلان يجعل ملفك يظهر في شريط الأعضاء المميز أعلى المنصة لمدة الإعلان المحددة، لزيادة ظهوره داخل سكن."
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


                        if (type === "photos") {
                            window.location.href = "member-search.html?mode=photos";
                            return;
                        }
                        if (type === "myPhotos") {
                            window.location.href = "photos.html";
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


                        if (type === "settings") {
                            window.location.href = "settings.html";
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
