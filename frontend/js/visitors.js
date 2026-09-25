 document.addEventListener("DOMContentLoaded", () => {

    if (
        localStorage.getItem("sakanLoggedIn") !==
        "true"
    ) {

        window.location.href =
            "../index.html";

        return;
    }


    const grid =
        document.getElementById(
            "visitorsGrid"
        );

    const empty =
        document.getElementById(
            "emptyVisitors"
        );


    function getVisitors() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "sakanVisitors"
                ) || "[]"
            );

        } catch {

            return [];

        }

    }


    function saveVisitors(
        visitors
    ) {

        localStorage.setItem(
            "sakanVisitors",
            JSON.stringify(
                visitors
            )
        );

    }


    function render() {

        const visitors =
            getVisitors();


        grid.innerHTML = "";


        if (
            visitors.length === 0
        ) {

            empty.style.display =
                "block";

            return;

        }


        empty.style.display =
            "none";


        visitors.forEach(
            (visitor) => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "member-card";


                const date =
                    visitor.visitedAt
                        ? new Date(
                            visitor.visitedAt
                        ).toLocaleString(
                            "ar"
                        )
                        : "";


                card.innerHTML = `

                    <div class="member-photo">

                        <div class="placeholder-avatar">

                            ${visitor.avatar || "👤"}

                        </div>

                    </div>


                    <div class="member-info">

                        <h3>

                            ${visitor.name || "عضو جديد"}

                            ${
                                visitor.verified
                                    ? '<span class="verified-badge">✓</span>'
                                    : ''
                            }

                        </h3>


                        <p>

                            ${visitor.age || "—"}
                            سنة
                            •
                            ${visitor.country || "—"}

                        </p>


                        <span class="visitor-time">

                            آخر زيارة:
                            ${date}

                        </span>

                    </div>


                    <button
                        type="button"
                        class="view-profile-btn">

                        عرض الملف

                    </button>

                `;


                card
                    .querySelector(
                        ".view-profile-btn"
                    )
                    .addEventListener(
                        "click",
                        () => {

                            localStorage.setItem(
                                "sakanSelectedMember",
                                JSON.stringify(
                                    visitor
                                )
                            );

                            window.location.href =
                                "member-profile.html";

                        }
                    );


                grid.appendChild(card);

            }
        );

    }


    document
        .getElementById(
            "clearVisitorsBtn"
        )
        .addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "sakanVisitors"
                );

                render();

            }
        );


    document
        .getElementById(
            "backHomeBtn"
        )
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "home.html";

            }
        );


    render();

});
