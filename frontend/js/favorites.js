 document.addEventListener("DOMContentLoaded", () => {

    const loggedIn =
        localStorage.getItem("sakanLoggedIn");

    if (loggedIn !== "true") {
        window.location.href = "../index.html";
        return;
    }


    const grid =
        document.getElementById("favoritesGrid");

    const emptyBox =
        document.getElementById("emptyBox");

    const clearBtn =
        document.getElementById("clearFavoritesBtn");


    function getFavorites() {

        try {

            const saved =
                localStorage.getItem(
                    "sakanFavorites"
                );

            return saved
                ? JSON.parse(saved)
                : [];

        } catch (error) {

            return [];

        }
    }


    function saveFavorites(items) {

        localStorage.setItem(
            "sakanFavorites",
            JSON.stringify(items)
        );

    }


    function render() {

        const favorites =
            getFavorites();

        grid.innerHTML = "";


        if (favorites.length === 0) {

            emptyBox.style.display =
                "block";

            return;

        }


        emptyBox.style.display =
            "none";


        favorites.forEach((member) => {

            const card =
                document.createElement("article");

            card.className =
                "member-card";


            card.innerHTML = `

                <div class="member-photo">

                    <div class="placeholder-avatar">
                        ${member.avatar || "👤"}
                    </div>

                    ${
                        member.online
                            ? '<span class="online-badge"></span>'
                            : ''
                    }

                </div>


                <div class="member-info">

                    <h3>
                        ${member.name || "عضو جديد"}

                        ${
                            member.verified
                                ? '<span class="verified-badge">✓</span>'
                                : ''
                        }

                    </h3>

                    <p>
                        ${member.age || "—"} سنة
                        •
                        ${member.country || "—"}
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


                <button
                    type="button"
                    class="remove-favorite">

                    إزالة من المفضلة

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
                            JSON.stringify(member)
                        );

                        window.location.href =
                            "member-profile.html";

                    }
                );


            card
                .querySelector(
                    ".remove-favorite"
                )
                .addEventListener(
                    "click",
                    () => {

                        const updated =
                            getFavorites().filter(
                                (item) =>
                                    item.id !==
                                    member.id
                            );

                        saveFavorites(updated);

                        render();

                    }
                );


            grid.appendChild(card);

        });

    }


    clearBtn.addEventListener(
        "click",
        () => {

            if (
                getFavorites().length === 0
            ) {
                return;
            }

            localStorage.removeItem(
                "sakanFavorites"
            );

            render();

        }
    );


    document
        .getElementById("backHomeBtn")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "home.html";

            }
        );


    render();

});
