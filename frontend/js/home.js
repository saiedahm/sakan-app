 document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("simpleModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");

  const closeModal = document.getElementById("closeModal");
  const modalOk = document.getElementById("modalOk");

  const membersTitle = document.getElementById("membersTitle");
  const memberCategory = document.getElementById("memberCategory");

  const refreshBtn = document.getElementById("refreshBtn");

  /*
   * نتحقق أن العضو أكمل التسجيل التجريبي.
   */
  const loggedIn = localStorage.getItem("sakanLoggedIn");

  if (loggedIn !== "true") {
    window.location.href = "../index.html";
    return;
  }


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
   * أزرار القائمة الرئيسية
   */
  document.querySelectorAll(".nav-item").forEach((button) => {

    button.addEventListener("click", () => {

      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      const section = button.dataset.section;

      if (section === "home") {

        membersTitle.textContent = "أشخاص قد يناسبونك";
        memberCategory.textContent = "أعضاء مقترحون";

      }

      else if (section === "messages") {

        membersTitle.textContent = "الرسائل";
        memberCategory.textContent = "تواصلك مع الأعضاء";

        openModal(
          "الرسائل",
          "قسم الرسائل سيتم ربطه بنظام المحادثات وقاعدة البيانات في المرحلة القادمة."
        );

      }

      else if (section === "visitors") {

        membersTitle.textContent = "من زار صفحتي";
        memberCategory.textContent = "زيارات الملف";

        openModal(
          "من زار صفحتي",
          "سيظهر هنا الأعضاء الذين قاموا بزيارة ملفك بعد تشغيل نظام الحسابات الحقيقي."
        );

      }

      else if (section === "favorites") {

        membersTitle.textContent = "المفضلون";
        memberCategory.textContent = "الأعضاء الذين اخترتهم";

        openModal(
          "المفضلون",
          "سيتم حفظ المفضلين في حسابك عند ربط قاعدة البيانات."
        );

      }

      else if (section === "latest") {

        membersTitle.textContent = "أحدث الأعضاء";
        memberCategory.textContent = "أعضاء انضموا حديثًا";

      }

      else if (section === "online") {

        membersTitle.textContent = "أعضاء أونلاين";
        memberCategory.textContent = "متصلون الآن";

      }

    });

  });


  /*
   * زر تحديث الصفحة الرئيسية
   */
  refreshBtn.addEventListener("click", () => {

    refreshBtn.textContent = "↻ جارٍ التحديث...";

    setTimeout(() => {

      refreshBtn.textContent = "↻ تحديث";

      openModal(
        "تم التحديث",
        "تم تحديث قائمة الأعضاء المعروضة."
      );

    }, 700);

  });


  /*
   * زر أعلن معنا
   */
  document.getElementById("advertiseBtn")
    .addEventListener("click", () => {

      openModal(
        "أعلن معنا",
        "سيتم هنا إنشاء طلب إعلان تجاري واختيار الباقة المناسبة ثم الانتقال إلى الدفع."
      );

    });


  /*
   * إعلان العضو المميز
   */
  document.getElementById("featuredAdBtn")
    .addEventListener("click", () => {

      openModal(
        "إعلان مميز — €0.99",
        "سيتم اختيار الصورة ثم الدفع. بعد تأكيد الدفع تخضع الصورة للمراجعة قبل دخولها إلى قائمة الإعلانات المميزة."
      );

    });


  /*
   * ملفي
   */
  document.getElementById("profileBtn")
    .addEventListener("click", () => {

      window.location.href = "profile-data.html";

    });


  /*
   * اللغة
   */
  document.getElementById("languageBtn")
    .addEventListener("click", () => {

      openModal(
        "لغة المنصة",
        "اختيار اللغة العربية مفعل حاليًا. سيتم إضافة الألمانية والإنجليزية والفرنسية والإسبانية والتركية لاحقًا."
      );

    });


  /*
   * بطاقات الأعضاء
   */
  document.querySelectorAll(".favorite-btn").forEach((button) => {

    button.addEventListener("click", (event) => {

      event.stopPropagation();

      if (button.textContent.trim() === "☆") {

        button.textContent = "★";

      } else {

        button.textContent = "☆";

      }

    });

  });


  document.querySelectorAll(".view-profile-btn").forEach((button) => {

    button.addEventListener("click", () => {

      openModal(
        "ملف العضو",
        "سيتم فتح الملف الكامل للعضو عند تشغيل قاعدة البيانات ونظام الملفات الشخصية."
      );

    });

  });


  /*
   * أدوات العضو
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

        openModal(
          "البحث عن عضو",
          "سيتم إضافة البحث بالاسم والفلترة حسب العمر والبلد واللغة والحالة الاجتماعية."
        );

        return;

      }

      if (type === "settings") {

        openModal(
          "الإعدادات",
          "سيتم هنا إدارة الخصوصية والإشعارات وكلمة المرور والحساب."
        );

        return;

      }

    });

  });


  /*
   * خروج
   */
  function logout() {

    localStorage.removeItem("sakanLoggedIn");

    window.location.href = "../index.html";

  }


  document.getElementById("logoutBtn")
    .addEventListener("click", logout);


  document.getElementById("logoutTool")
    .addEventListener("click", logout);


});
