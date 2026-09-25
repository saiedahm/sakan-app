document.addEventListener("DOMContentLoaded", () => {

    const loggedIn =
        localStorage.getItem("sakanLoggedIn");

    if (loggedIn !== "true") {
        window.location.href = "../index.html";
        return;
    }


    const resultsGrid =
        document.getElementById("resultsGrid");

    const noResults =
        document.getElementById("noResults");

    const resultsCount =
        document.getElementById("resultsCount");

    const resultsTitle =
        document.getElementById("resultsTitle");

    const genderNotice =
        document.getElementById("genderNotice");


    const nameSearch =
        document.getElementById("nameSearch");

    const countrySearch =
        document.getElementById("countrySearch");

    const maritalSearch =
        document.getElementById("maritalSearch");

    const minAge =
        document.getElementById("minAge");

    const maxAge =
        document.getElementById("maxAge");

    const searchBtn =
        document.getElementById("searchBtn");

    const resetBtn =
        document.getElementById("resetBtn");

    const backHomeBtn =
        document.getElementById("backHomeBtn");


    /* =====================================================
       MODAL
    ===================================================== */

    const modal =
        document.getElementById("searchModal");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalText =
        document.getElementById("modalText");

    const closeModalBtn =
        document.getElementById("closeModal");

    const modalOkBtn =
        document.getElementById("modalOk");


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
       CURRENT PROFILE
    ===================================================== */

    let currentProfile = null;

    try {

        const saved =
            localStorage.getItem(
                "sakanProfileData"
            );

        if (saved) {
            currentProfile =
                JSON.parse(saved);
        }

    } catch (error) {

        console.error(
            "تعذر قراءة بيانات العضو",
            error
        );

    }


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


    if (currentGender === "male") {

        resultsTitle.textContent =
            "ابحث عن العضوات";

        genderNotice.textContent =
            "سيظهر لك هنا الأعضاء من النساء فقط.";

    }
    else if (currentGender === "female") {

        resultsTitle.textContent =
            "ابحث عن الأعضاء";

        genderNotice.textContent =
            "سيظهر لك هنا الأعضاء من الرجال فقط.";

    }
    else {

        resultsTitle.textContent =
            "أكمل بياناتك أولًا";

        genderNotice.textContent =
            "يجب تحديد الجنس في بيانات الحساب قبل استخدام البحث.";

    }


    /* =====================================================
       DEMO MEMBERS
       هذه القائمة مؤقتة للواجهة فقط.
    ===================================================== */

    const demoMembers = [

        {
            id: 101,
            gender: "female",
            name: "عضوة جديدة",
            age: 29,
            country: "ألمانيا",
            city: "هامبورغ",
            maritalStatus: "عزباء",
            online: true,
            verified: true,
            avatar: "👩"
        },

        {
            id: 102,
            gender: "female",
            name: "عضوة جديدة",
            age: 34,
            country: "ألمانيا",
            city: "كولن",
            maritalStatus: "عزباء",
            online: true,
            verified: false,
            avatar: "👩🏻"
        },

        {
            id: 103,
            gender: "female",
            name: "عضوة جديدة",
            age: 31,
            country: "فرنسا",
            city: "باريس",
            maritalStatus: "مطلقة",
            online: false,
            verified: true,
            avatar: "👩‍🦰"
        },

        {
            id: 104,
            gender: "female",
            name: "عضوة جديدة",
            age: 27,
            country: "إسبانيا",
            city: "مدريد",
            maritalStatus: "عزباء",
            online: true,
            verified: false,
            avatar: "👩🏼"
        },

        {
            id: 201,
            gender: "male",
            name: "عضو جديد",
            age: 32,
            country: "ألمانيا",
            city: "برلين",
            maritalStatus: "أعزب",
            online: true,
            verified: true,
            avatar: "👨"
        },

        {
            id: 202,
            gender: "male",
            name: "عضو جديد",
            age: 38,
            country: "ألمانيا",
            city: "هامبورغ",
            maritalStatus: "أعزب",
            online: false,
            verified: false,
            avatar: "👨🏻"
        },

        {
            id: 203,
            gender: "male",
            name: "عضو جديد",
            age: 29,
            country: "فرنسا",
            city: "ليون",
            maritalStatus: "أعزب",
            online: true,
            verified: true,
            avatar: "👨‍🦰"
        },

        {
            id: 204,
            gender: "male",
            name: "عضو جديد",
            age: 41,
            country: "إسبانيا",
            city: "مدريد",
            maritalStatus: "مطلق",
            online: true,
            verified: false,
            avatar: "👨🏼"
        }

    ];


    /* =====================================================
       OPPOSITE GENDER ONLY
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
       RENDER
    ===================================================== */

    function renderMembers(list) {

        resultsGrid.innerHTML = "";

        resultsCount.textContent =
            `${list.length} نتيجة`;


        if (list.length === 0) {

            noResults.classList.remove(
                "hidden"
            );

            return;
        }


        noResults.classList.add(
            "hidden"
        );


        list.forEach((member) => {

            const card =
                document.createElement("article");

            card.className =
                "member-card";

            card.dataset.memberId =
                member.id;


            const verified =
                member.verified
                    ? `<span class="verified-badge">✓</span>`
                    : "";


            const online =
                member.online
                    ? `<span class="online-badge"></span>`
                    : "";


            card.innerHTML = `

                <div class="member-photo">

                    <div class="placeholder-avatar">
                        ${member.avatar}
                    </div>

                    ${online}

                </div>


                <div class="member-info">

                    <h3>
                        ${member.name}
                        ${verified}
                    </h3>

                    <p>
                        ${member.age} سنة •
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


            resultsGrid.appendChild(card);

        });


        attachProfileButtons();
    }


    /* =====================================================
       PROFILE BUTTONS
    ===================================================== */

    function attachProfileButtons() {

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


                        const memberId =
                            Number(
                                card.dataset.memberId
                            );


                        const member =
                            demoMembers.find(
                                (item) =>
                                    item.id === memberId
                            );


                        if (!member) {

                            openModal(
                                "تعذر فتح الملف",
                                "لم يتم العثور على بيانات هذا العضو."
                            );

                            return;
                        }


                        /*
                         * حماية إضافية:
                         * الملف الذي نفتحُه يجب أن يكون
                         * من الجنس المقابل.
                         */

                        if (
                            member.gender !==
                            getOppositeGender()
                        ) {

                            openModal(
                                "غير متاح",
                                "هذا الملف ليس ضمن قائمة الأعضاء المسموح بعرضها."
                            );

                            return;
                        }


                        localStorage.setItem(
                            "sakanSelectedMember",
                            JSON.stringify(
                                member
                            )
                        );


                        window.location.href =
                            "member-profile.html";

                    }
                );

            });

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function performSearch() {

        const oppositeGender =
            getOppositeGender();


        if (!oppositeGender) {

            renderMembers([]);

            openModal(
                "بيانات غير مكتملة",
                "أكمل بيانات الحساب وحدد الجنس قبل استخدام البحث."
            );

            return;
        }


        const name =
            nameSearch.value
                .trim()
                .toLowerCase();


        const country =
            countrySearch.value;


        const marital =
            maritalSearch.value;


        const min =
            Number(
                minAge.value
            ) || 18;


        const max =
            Number(
                maxAge.value
            ) || 100;


        if (min > max) {

            openModal(
                "العمر غير صحيح",
                "العمر الأدنى يجب أن يكون أقل من أو مساويًا للعمر الأعلى."
            );

            return;
        }


        /*
         * مهم:
         * نختار الجنس المقابل أولًا.
         */

        let results =
            demoMembers.filter(
                (member) =>
                    member.gender ===
                    oppositeGender
            );


        if (name) {

            results =
                results.filter(
                    (member) =>
                        member.name
                            .toLowerCase()
                            .includes(name)
                );

        }


        if (country) {

            results =
                results.filter(
                    (member) =>
                        member.country ===
                        country
                );

        }


        if (marital) {

            results =
                results.filter(
                    (member) =>
                        member.maritalStatus ===
                        marital
                );

        }


        results =
            results.filter(
                (member) =>
                    member.age >= min &&
                    member.age <= max
            );


        renderMembers(results);

    }


    /* =====================================================
       BUTTONS
    ===================================================== */

    searchBtn.addEventListener(
        "click",
        performSearch
    );


    resetBtn.addEventListener(
        "click",
        () => {

            nameSearch.value = "";

            countrySearch.value = "";

            maritalSearch.value = "";

            minAge.value = "";

            maxAge.value = "";

            performSearch();

        }
    );


    backHomeBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "home.html";

        }
    );


    /* =====================================================
       ENTER KEY
    ===================================================== */

    document
        .querySelectorAll(
            "input"
        )
        .forEach((input) => {

            input.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        performSearch();

                    }

                }
            );

        });


    /* =====================================================
       INITIAL RESULTS
    ===================================================== */

    performSearch();

}); 
