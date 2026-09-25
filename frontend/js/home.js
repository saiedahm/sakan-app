document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("simpleModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");
  const closeModal = document.getElementById("closeModal");
  const modalOk = document.getElementById("modalOk");

  const membersGrid = document.getElementById("membersGrid");
  const membersTitle = document.getElementById("membersTitle");
  const memberCategory = document.getElementById("memberCategory");
  const refreshBtn = document.getElementById("refreshBtn");

  const loggedIn = localStorage.getItem("sakanLoggedIn");

  if (loggedIn !== "true") {
    window.location.href = "../index.html";
    return;
  }

  /*
   * قراءة بيانات العضو الحالي.
   * نتوقع أن profile-data.js حفظ البيانات داخل:
   * sakanProfileData
   */
  function getCurrentProfile() {
    try {
      const saved = localStorage.getItem("sakanProfileData");

      if (!saved) {
        return null;
      }

      return JSON.parse(saved);
    } catch (error) {
      console.error("تعذر قراءة بيانات الملف:", error);
      return null;
    }
  }

  /*
   * تحويل قيمة الجنس إلى male / female
   * حتى لو كانت البيانات محفوظة بالعربية أو الإنجليزية.
   */
  function normalizeGender(value) {
    if (!value) {
      return null;
    }

    const gender = String(value).trim().toLowerCase();

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

  /*
   * بيانات تجريبية فقط.
   * في النظام الحقيقي ستأتي من قاعدة البيانات.
   *
   * ملاحظة:
   * لا نقوم بإخفاء الجنس بعد تحميل القائمة.
   * نحن نختار أصلًا القائمة المناسبة للعضو الحالي.
   */
  const demoMembers = {
    female: [
      {
        id: 101,
        name: "عضوة جديدة",
        age: 29,
        country: "ألمانيا",
        city: "هامبورغ",
        online: true,
        verified: true,
        avatar: "👩"
      },
      {
        id: 102,
        name: "عضوة جديدة",
        age: 34,
        country: "ألمانيا",
        city: "كولن",
        online: true,
        verified: false,
        avatar: "👩🏻"
      },
      {
        id: 103,
        name: "عضوة جديدة",
        age: 31,
        country: "فرنسا",
        city: "باريس",
        online: false,
        verified: true,
        avatar: "👩‍🦰"
      },
      {
        id: 104,
        name: "عضوة جديدة",
        age: 27,
        country: "إسبانيا",
        city: "مدريد",
        online: true,
        verified: false,
        avatar: "👩🏼"
      },
      {
        id: 105,
        name: "عضوة جديدة",
        age: 36,
        country: "ألمانيا",
        city: "برلين",
        online: false,
        verified: true,
        avatar: "👩🏽"
      },
      {
        id: 106,
        name: "عضوة جديدة",
        age: 30,
        country: "النمسا",
        city: "فيينا",
        online: true,
        verified: false,
        avatar: "👩‍🦱"
      }
    ],

    male: [
      {
        id: 201,
        name: "عضو جديد",
        age: 32,
        country: "ألمانيا",
        city: "برلين",
        online: true,
        verified: true,
        avatar: "👨"
      },
      {
        id: 202,
        name: "عضو جديد",
        age: 38,
        country: "ألمانيا",
        city: "هامبورغ",
        online: false,
        verified: false,
        avatar: "👨🏻"
      },
      {
        id: 203,
        name: "عضو جديد",
        age: 29,
        country: "فرنسا",
        city: "ليون",
        online: true,
        verified: true,
        avatar: "👨‍🦰"
      },
      {
        id: 204,
        name: "عضو جديد",
        age: 41,
        country: "إسبانيا",
        city: "مدريد",
        online: true,
        verified: false,
        avatar: "👨🏼"
      },
      {
        id: 205,
        name: "عضو جديد",
        age: 35,
        country: "ألمانيا",
        city: "ميونخ",
        online: false,
        verified: true,
        avatar: "👨🏽"
      },
      {
        id: 206,
        name: "عضو جديد",
        age: 30,
        country: "النمسا",
        city: "سالزبورغ",
        online: true,
        verified: false,
        avatar: "👨‍🦱"
      }
    ]
  };

  function openModal(title, text) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    modal.classList.remove("hidden");
  }

  function closeTheModal() {
    modal.classList.add("hidden");
  }

  closeModal.addEventListener("click", closeTheModal);
  modalOk.addEventListener("click", closeTheModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeTheModal();
    }
  });

  /*
   * معرفة جنس العضو الحالي.
   */
  const currentProfile = getCurrentProfile();

  const currentGender = normalizeGender(
    currentProfile?.gender
  );

  /*
   * إذا كانت البيانات غير مكتملة، نعرض تنبيهًا بدل
   * السماح بعرض قائمة عامة غير منضبطة.
   */
  if (!currentGender) {
    membersGrid.innerHTML = "";

    membersTitle.textContent = "أكمل بياناتك أولًا";
    memberCategory.textContent = "بيانات الملف";

    const warning = document.createElement("div");
    warning.className = "gender-notice";

    warning.innerHTML = `
      <span>⚠️</span>
      <div>
        <strong>لم يتم تحديد الجنس في الملف</strong>
        <p>أكمل بياناتك حتى نعرض لك الأعضاء المناسبين فقط.</p>
      </div>
    `;

    membersGrid.appendChild(warning);
  }

  /*
   * الجنس المقابل فقط.
   */
  function getOppositeGender() {
    if (currentGender === "male") {
      return "female";
    }

    if (currentGender === "female") {
      return "male";
    }

    return null;
  }

  /*
   * رسم البطاقات.
   */
  function renderMembers(list) {
    membersGrid.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
      membersGrid.innerHTML = `
        <div class="gender-notice">
          <span>ℹ️</span>
          <div>
            <strong>لا توجد نتائج حاليًا</strong>
            <p>سيظهر الأعضاء هنا عند توفرهم.</p>
          </div>
        </div>
      `;

      return;
    }

    list.slice(0, 50).forEach((member) => {
      const card = document.createElement("article");
      card.className = "member-card";
      card.dataset.memberId = member.id;

      const verifiedBadge = member.verified
        ? `<span class="verified-badge" title="عضو موثوق">✓</span>`
        : "";

      const onlineBadge = member.online
        ? `<span class="online-badge"></span>`
        : "";

      card.innerHTML = `
        <div class="member-photo">
          <div class="placeholder-avatar">
            ${member.avatar}
          </div>

          ${onlineBadge}

          <button
            class="favorite-btn"
            type="button"
            aria-label="إضافة للمفضلين"
          >
            ☆
          </button>
        </div>

        <div class="member-info">
          <h3>
            ${member.name}
            ${verifiedBadge}
          </h3>

          <p>
            ${member.age} سنة • ${member.country}
          </p>

          <span class="member-status">
            ${member.online ? "متصل الآن" : "غير متصل"}
          </span>
        </div>

        <button
          class="view-profile-btn"
          type="button"
        >
          عرض الملف
        </button>
      `;

      membersGrid.appendChild(card);
    });

    attachMemberEvents();
  }

  function attachMemberEvents() {
    document.querySelectorAll(".favorite-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();

        button.textContent =
          button.textContent.trim() === "☆" ? "★" : "☆";
      });
    });

    document
  .querySelectorAll(".view-profile-btn")
  .forEach((button) => {

    button.addEventListener("click", () => {

      const card =
        button.closest(".member-card");

      const memberId =
        card?.dataset.memberId;

      /*
       * هذه البيانات مؤقتة للنسخة التجريبية.
       * لاحقًا ستأتي من قاعدة البيانات.
       */

      const currentProfile =
        getCurrentProfile();

      const demoProfiles = {

        101: {
          id: 101,
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

        102: {
          id: 102,
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

        103: {
          id: 103,
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

        104: {
          id: 104,
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

        201: {
          id: 201,
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

        202: {
          id: 202,
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

        203: {
          id: 203,
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

        204: {
          id: 204,
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
        }

      };


      let selectedMember =
        demoProfiles[memberId];


      /*
       * حماية إضافية في النسخة التجريبية:
       * العضو لا يفتح ملفًا من الجنس الآخر
       * إلا إذا كان موجودًا أصلًا ضمن قائمة العرض المسموحة.
       */

      if (!selectedMember) {

        openModal(
          "تعذر فتح الملف",
          "لم يتم العثور على بيانات هذا العضو."
        );

        return;
      }


      localStorage.setItem(
        "sakanSelectedMember",
        JSON.stringify(selectedMember)
      );


      window.location.href =
        "member-profile.html";

    });

  });
      button.addEventListener("click", () => {
        openModal(
          "ملف العضو",
          "سيتم فتح الملف الكامل للعضو في المرحلة القادمة عند ربط نظام الملفات وقاعدة البيانات."
        );
      });
    });
  }

  /*
   * أول تحميل للقائمة.
   */
  function loadHomeMembers() {
    const oppositeGender = getOppositeGender();

    if (!oppositeGender) {
      return;
    }

    const members = demoMembers[oppositeGender] || [];

    if (currentGender === "male") {
      membersTitle.textContent = "نساء قد يناسبنك";
      memberCategory.textContent = "عضوات";
    } else {
      membersTitle.textContent = "رجال قد يناسبنك";
      memberCategory.textContent = "أعضاء";
    }

    renderMembers(members);
  }

  if (currentGender) {
    loadHomeMembers();
  }

  /*
   * القائمة الرئيسية.
   */
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      const section = button.dataset.section;

      if (section === "home") {
        loadHomeMembers();
      }

      else if (section === "messages") {
        openModal(
          "الرسائل",
          "سيتم ربط الرسائل والمحادثات الحقيقية بقاعدة البيانات في المرحلة القادمة."
        );
      }

      else if (section === "visitors") {
        openModal(
          "من زار صفحتي",
          "سيظهر هنا الأعضاء الذين زاروا ملفك."
        );
      }

      else if (section === "favorites") {
        openModal(
          "المفضلون",
          "سيتم حفظ الأعضاء المفضلين داخل حسابك."
        );
      }

      else if (section === "latest") {
        const oppositeGender = getOppositeGender();

        if (oppositeGender) {
          memberCategory.textContent = "أحدث الأعضاء";
          membersTitle.textContent =
            currentGender === "male"
              ? "أحدث العضوات"
              : "أحدث الأعضاء";

          renderMembers(demoMembers[oppositeGender]);
        }
      }

      else if (section === "online") {
        const oppositeGender = getOppositeGender();

        if (oppositeGender) {
          const onlineMembers = demoMembers[oppositeGender]
            .filter((member) => member.online);

          memberCategory.textContent = "متصلون الآن";
          membersTitle.textContent =
            currentGender === "male"
              ? "العضوات المتصلات الآن"
              : "الأعضاء المتصلون الآن";

          renderMembers(onlineMembers);
        }
      }
    });
  });

  /*
   * تحديث.
   */
  refreshBtn.addEventListener("click", () => {
    refreshBtn.textContent = "↻ جارٍ التحديث...";

    setTimeout(() => {
      loadHomeMembers();
      refreshBtn.textContent = "↻ تحديث";

      openModal(
        "تم التحديث",
        "تم تحديث قائمة الأعضاء المناسبة لحسابك."
      );
    }, 700);
  });

  /*
   * إعلان تجاري.
   */
  document
    .getElementById("advertiseBtn")
    .addEventListener("click", () => {
      openModal(
        "أعلن معنا",
        "سيتم إنشاء نظام الإعلان التجاري واختيار الباقة ثم الدفع والمراجعة."
      );
    });

  /*
   * الإعلان المميز.
   */
  document
    .getElementById("featuredAdBtn")
    .addEventListener("click", () => {
      openModal(
        "إعلان مميز — €0.99",
        "سيتم اختيار الصورة ثم الدفع، وبعد تأكيد الدفع تدخل الصورة إلى المراجعة قبل النشر."
      );
    });

  /*
   * ملفي.
   */
  document
    .getElementById("profileBtn")
    .addEventListener("click", () => {
      window.location.href = "profile-data.html";
    });

  /*
   * اللغة.
   */
  document
    .getElementById("languageBtn")
    .addEventListener("click", () => {
      openModal(
        "لغة المنصة",
        "العربية هي اللغة الحالية. سيتم إضافة الألمانية والإنجليزية والفرنسية والإسبانية والتركية لاحقًا."
      );
    });

  /*
   * الأدوات.
   */
  document.querySelectorAll(".tool-card").forEach((tool) => {
    tool.addEventListener("click", () => {
      const type = tool.dataset.tool;

      if (type === "edit") {
        window.location.href = "profile-data.html";
        return;
      }

      if (type === "photos" || type === "myPhotos") {
        window.location.href = "photos.html";
        return;
      }

     if (type === "search") {

    window.location.href =
        "member-search.html";

    return;
}
        openModal(
          "البحث عن عضو",
          "سيتم إضافة البحث بالاسم والعمر والبلد واللغة وغيرها مع احترام قاعدة الجنس المقابل."
        );
        return;
      }

      if (type === "settings") {
        openModal(
          "الإعدادات",
          "هنا ستكون إعدادات الخصوصية والإشعارات وكلمة المرور والحساب."
        );
      }
    });
  });

  /*
   * خروج.
   */
  function logout() {
    localStorage.removeItem("sakanLoggedIn");
    window.location.href = "../index.html";
  }

  document
    .getElementById("logoutBtn")
    .addEventListener("click", logout);

  document
    .getElementById("logoutTool")
    .addEventListener("click", logout);
});
