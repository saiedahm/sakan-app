/* SAKAN — REAL MEMBER MESSAGING */
document.addEventListener("DOMContentLoaded", async () => {
    if (localStorage.getItem("sakanLoggedIn") !== "true") {
        window.location.href = "../index.html";
        return;
    }

    const API_BASE = (window.SAKAN_API_BASE || localStorage.getItem("sakanApiBase") || "/api").replace(/\/$/, "");
    const token = localStorage.getItem("sakanAuthToken");
    if (!token) {
        window.location.href = "../index.html";
        return;
    }

    const conversationList = document.getElementById("conversationList");
    const chatEmpty = document.getElementById("chatEmpty");
    const chatArea = document.getElementById("chatArea");
    const chatHeader = document.getElementById("chatHeader");
    const messagesBox = document.getElementById("messagesBox");
    const messageForm = document.getElementById("messageForm");
    const messageInput = document.getElementById("messageInput");
    const backHomeBtn = document.getElementById("backHomeBtn");

    let conversations = [];
    let activeMemberId = null;
    let activeMember = null;

    async function api(path, options = {}) {
        const response = await fetch(API_BASE + path, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
                ...(options.headers || {})
            }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "تعذر الاتصال بالخادم.");
        return data;
    }

    function escapeText(value) {
        return String(value || "");
    }

    function renderConversationList() {
        conversationList.innerHTML = "";
        if (!conversations.length) {
            conversationList.innerHTML = '<div class="conversation-empty">لا توجد محادثات بعد. اختر عضوًا من ملفه لبدء محادثة.</div>';
            return;
        }

        conversations.forEach((conversation) => {
            const member = conversation.member;
            const item = document.createElement("div");
            item.className = "conversation-item" +
                (String(member.id) === String(activeMemberId) ? " active" : "");

            const avatar = member.mainPhotoUrl
                ? '<img src="' + member.mainPhotoUrl + '" alt="">'
                : "👤";

            item.innerHTML =
                '<div class="avatar">' + avatar + '</div>' +
                '<div>' +
                '<div class="conversation-name">' + escapeText(member.displayName) + '</div>' +
                '<div class="conversation-preview">' +
                escapeText(conversation.lastMessage?.text || "بدء محادثة") +
                '</div></div>';

            item.addEventListener("click", () => openChat(member.id));
            conversationList.appendChild(item);
        });
    }

    async function openChat(memberId, suppliedMember = null) {
        try {
            activeMemberId = memberId;
            const data = await api("/messages/" + encodeURIComponent(memberId));
            activeMember = data.member || suppliedMember;

            chatEmpty.style.display = "none";
            chatArea.style.display = "block";
            chatHeader.textContent = "المحادثة مع " + (activeMember?.displayName || "العضو");

            messagesBox.innerHTML = "";
            (data.messages || []).forEach((message) => {
                const row = document.createElement("div");
                row.className = "message-row " + (message.mine ? "mine" : "theirs");

                const bubble = document.createElement("div");
                bubble.className = "message";
                bubble.textContent = message.text || message.originalText || "";
                row.appendChild(bubble);
                messagesBox.appendChild(row);
            });

            messagesBox.scrollTop = messagesBox.scrollHeight;
            renderConversationList();
            messageInput.focus();
        } catch (error) {
            alert(error.message);
        }
    }

    async function loadConversations() {
        try {
            const data = await api("/messages/conversations");
            conversations = data.conversations || [];
            renderConversationList();
        } catch (error) {
            conversationList.innerHTML =
                '<div class="conversation-empty">' + escapeText(error.message) + "</div>";
        }
    }

    messageForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const text = messageInput.value.trim();
        if (!text || !activeMemberId) return;

        const button = messageForm.querySelector("button[type='submit']");
        if (button) button.disabled = true;

        try {
            await api("/messages/" + encodeURIComponent(activeMemberId), {
                method: "POST",
                body: JSON.stringify({ text })
            });

            messageInput.value = "";
            await openChat(activeMemberId, activeMember);
            await loadConversations();
        } catch (error) {
            alert(error.message);
        } finally {
            if (button) button.disabled = false;
        }
    });

    backHomeBtn?.addEventListener("click", () => {
        window.location.href = "home.html";
    });

    await loadConversations();

    try {
        const selected = JSON.parse(
            localStorage.getItem("sakanSelectedMember") || "null"
        );

        if (selected?.id) {
            localStorage.removeItem("sakanSelectedMember");
            await openChat(selected.id, selected);
        }
    } catch (_) {}
});
