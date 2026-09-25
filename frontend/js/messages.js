 document.addEventListener("DOMContentLoaded", () => {

    if (
        localStorage.getItem("sakanLoggedIn") !==
        "true"
    ) {
        window.location.href =
            "../index.html";

        return;
    }


    const demoMembers = [

        {
            id: 101,
            gender: "female",
            name: "عضوة جديدة",
            avatar: "👩"
        },

        {
            id: 102,
            gender: "female",
            name: "عضوة جديدة",
            avatar: "👩🏻"
        },

        {
            id: 201,
            gender: "male",
            name: "عضو جديد",
            avatar: "👨"
        },

        {
            id: 202,
            gender: "male",
            name: "عضو جديد",
            avatar: "👨🏻"
        }

    ];


    let conversations = [];


    try {

        conversations =
            JSON.parse(
                localStorage.getItem(
                    "sakanMessages"
                ) || "[]"
            );

    } catch {

        conversations = [];

    }


    const currentProfile =
        JSON.parse(
            localStorage.getItem(
                "sakanProfileData"
            ) || "{}"
        );


    function normalizeGender(value) {

        const valueText =
            String(value || "")
                .trim()
                .toLowerCase();

        if (
            ["male","man","ذكر","رجل"]
                .includes(valueText)
        ) {
            return "male";
        }

        if (
            ["female","woman","أنثى","امرأة","بنت","فتاة"]
                .includes(valueText)
        ) {
            return "female";
        }

        return null;
    }


    const currentGender =
        normalizeGender(
            currentProfile.gender
        );


    const oppositeGender =
        currentGender === "male"
            ? "female"
            : currentGender === "female"
                ? "male"
                : null;


    const availableMembers =
        demoMembers.filter(
            (member) =>
                member.gender ===
                oppositeGender
        );


    const conversationList =
        document.getElementById(
            "conversationList"
        );

    const chatEmpty =
        document.getElementById(
            "chatEmpty"
        );

    const chatArea =
        document.getElementById(
            "chatArea"
        );

    const chatHeader =
        document.getElementById(
            "chatHeader"
        );

    const messagesBox =
        document.getElementById(
            "messagesBox"
        );

    const messageForm =
        document.getElementById(
            "messageForm"
        );

    const messageInput =
        document.getElementById(
            "messageInput"
        );


    let activeMemberId = null;


    function saveMessages() {

        localStorage.setItem(
            "sakanMessages",
            JSON.stringify(
                conversations
            )
        );

    }


    function getConversation(
        memberId
    ) {

        return conversations.find(
            (item) =>
                Number(item.memberId) ===
                Number(memberId)
        );

    }


    function renderConversationList() {

        conversationList.innerHTML = "";


        const membersWithMessages =
            availableMembers.filter(
                (member) =>
                    getConversation(
                        member.id
                    )
            );


        const list =
            membersWithMessages.length
                ? membersWithMessages
                : availableMembers;


        list.forEach(
            (member) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "conversation-item";


                if (
                    member.id ===
                    activeMemberId
                ) {
                    item.classList.add(
                        "active"
                    );
                }


                const conversation =
                    getConversation(
                        member.id
                    );


                const last =
                    conversation?.messages
                        ?.slice(-1)[0];


                item.innerHTML = `

                    <div class="avatar">

                        ${member.avatar}

                    </div>

                    <div>

                        <div class="conversation-name">

                            ${member.name}

                        </div>

                        <div class="conversation-preview">

                            ${
                                last
                                    ? last.text
                                    : "بدء محادثة"
                            }

                        </div>

                    </div>

                `;


                item.addEventListener(
                    "click",
                    () => {

                        openChat(
                            member.id
                        );

                        renderConversationList();

                    }
                );


                conversationList.appendChild(
                    item
                );

            }
        );

    }


    function openChat(
        memberId
    ) {

        const member =
            availableMembers.find(
                (item) =>
                    item.id ===
                    Number(memberId)
            );


        if (!member) {
            return;
        }


        activeMemberId =
            member.id;


        chatEmpty.style.display =
            "none";

        chatArea.style.display =
            "block";


        chatHeader.textContent =
            `المحادثة مع ${member.name}`;


        renderMessages();

    }


    function renderMessages() {

        messagesBox.innerHTML = "";


        const conversation =
            getConversation(
                activeMemberId
            );


        const messages =
            conversation?.messages || [];


        messages.forEach(
            (message) => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "message-row " +
                    (
                        message.mine
                            ? "mine"
                            : "theirs"
                    );


                const bubble =
                    document.createElement(
                        "div"
                    );

                bubble.className =
                    "message";

                bubble.textContent =
                    message.text;


                row.appendChild(
                    bubble
                );


                messagesBox.appendChild(
                    row
                );

            }
        );


        messagesBox.scrollTop =
            messagesBox.scrollHeight;

    }


    messageForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const text =
                messageInput.value.trim();


            if (
                !text ||
                !activeMemberId
            ) {
                return;
            }


            let conversation =
                getConversation(
                    activeMemberId
                );


            if (!conversation) {

                conversation = {

                    memberId:
                        activeMemberId,

                    messages: []

                };


                conversations.push(
                    conversation
                );

            }


            conversation.messages.push({

                text: text,

                mine: true,

                createdAt:
                    new Date()
                        .toISOString()

            });


            /*
             * رد تجريبي مؤقت.
             * لاحقًا سيكون الرد من العضو الحقيقي.
             */

            conversation.messages.push({

                text:
                    "شكرًا لرسالتك 🌷",

                mine: false,

                createdAt:
                    new Date()
                        .toISOString()

            });


            saveMessages();

            messageInput.value = "";

            renderMessages();

            renderConversationList();

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


    renderConversationList();

});
