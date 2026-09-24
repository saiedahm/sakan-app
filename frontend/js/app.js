 // script.js - التفاعلات والوظائف الخاصة بالواجهة

// 1. فتح النوافذ القانونية والبصمة الرسمية (Impressum)
function openLegalModal(type) {
  const modal = document.getElementById('legal-modal');
  const content = document.getElementById('modal-legal-content');

  if (type === 'impressum') {
    content.innerHTML = `
      <h3>🏛️ البصمة القانونية (Impressum) - § 5 TMG</h3>
      <p><strong>اسم المالك / Owner:</strong> Ahmed Ismail Saed</p>
      <p><strong>العنوان / Address:</strong> Ehndorfer Str. 130, 24537 / 24534 Neumünster, Germany</p>
      <p><strong>الهاتف / Telefon:</strong> 015123937937</p>
      <p><strong>الموقع الرسمي:</strong> www.sakanapp.net</p>
      <p><strong>البريد الإلكتروني:</strong> info@sakanapp.net | service@sakanapp.net</p>
      <hr style="margin:10px 0; border-color:#334155;">
      <p style="font-size:11px; color:#94a3b8;">خاضع لقوانين جمهورية ألمانيا الاتحادية والاتحاد الأوروبي.</p>
    `;
  } else if (type === 'privacy') {
    content.innerHTML = `
      <h3>🔒 سياسة الخصوصية وحماية البيانات (GDPR)</h3>
      <p>تلتزم منصة سكن (www.sakanapp.net) بإدارة Ahmed Ismail Saed بحماية كامل بيانات الأعضاء وفقاً للائحة حماية البيانات العامة الأوروبية (DSGVO).</p>
      <ul style="padding-right:20px; margin-top:10px;">
        <li>تشفير كامل للمحادثات والبيانات الحساسة.</li>
        <li>عدم مشاركة بياناتك مع أي طرف ثالث تجاري.</li>
        <li>حق طلب حذف الحساب والبيانات نهائياً عبر التواصل مع: service@sakanapp.net</li>
      </ul>
    `;
  } else if (type === 'security') {
    content.innerHTML = `
      <h3>🛡️ الأمان والسلامة</h3>
      <p>تطبق منصة سكن رقابة ذكية متطورة بواسطة 5 مدراء ذكاء اصطناعي (AI Managers) لكشف المحتوى غير اللائق وضمان مجتمع تعارف آمن 24/7.</p>
    `;
  }

  modal.classList.add('active');
}

// 2. إغلاق النوافذ باستخدام زر الإكس ✖️
function closeLegalModal() {
  document.getElementById('legal-modal').classList.remove('active');
}

function toggleLangModal() {
  document.getElementById('lang-modal').classList.toggle('active');
}

function closeLangModal() {
  document.getElementById('lang-modal').classList.remove('active');
}

// 3. دفع الـ 0.99$ للاعلان الفوري في الشريط الدوار
function pay99CentsForAd() {
  const confirmPayment = confirm("هل ترغب في وضع صورتك في شريط الإعلانات العلوي لمدة 5 دقائق مقابل 0.99$؟");
  if (confirmPayment) {
    alert("جارِ تحويلك لبوابة الدفع الآمنة... بعد التأكيد ستظهر صورتك فوراً في الشريط الدوار لمدة 5 دقائق!");
  }
} 
// ==========================================
// أعضاء منصة سكن 2026
// ==========================================

const members = [
  { name: "أحمد", city: "برلين", type: "يبحث عن سكن", age: 29 },
  { name: "محمد", city: "هامبورغ", type: "يبحث عن سكن", age: 34 },
  { name: "علي", city: "ميونخ", type: "يعرض غرفة", age: 27 },
  { name: "عمر", city: "كولونيا", type: "يبحث عن سكن", age: 31 },
  { name: "يوسف", city: "فرانكفورت", type: "يعرض شقة", age: 36 },
  { name: "خالد", city: "هانوفر", type: "يبحث عن سكن", age: 28 },
  { name: "سامر", city: "دوسلدورف", type: "يعرض غرفة", age: 32 },
  { name: "رامي", city: "شتوتغارت", type: "يبحث عن سكن", age: 30 },
  { name: "محمود", city: "بريمن", type: "يبحث عن سكن", age: 35 },
  { name: "سامي", city: "لايبزيغ", type: "يعرض غرفة", age: 26 },

  { name: "نور", city: "برلين", type: "تبحث عن سكن", age: 27 },
  { name: "سارة", city: "هامبورغ", type: "تبحث عن سكن", age: 30 },
  { name: "ليان", city: "ميونخ", type: "تعرض غرفة", age: 25 },
  { name: "ريم", city: "كولونيا", type: "تبحث عن سكن", age: 29 },
  { name: "مريم", city: "فرانكفورت", type: "تعرض شقة", age: 34 },
  { name: "دانا", city: "هانوفر", type: "تبحث عن سكن", age: 28 },
  { name: "رنا", city: "دوسلدورف", type: "تعرض غرفة", age: 31 },
  { name: "هبة", city: "شتوتغارت", type: "تبحث عن سكن", age: 26 },
  { name: "آية", city: "بريمن", type: "تبحث عن سكن", age: 24 },
  { name: "جنى", city: "لايبزيغ", type: "تعرض غرفة", age: 28 },

  { name: "كريم", city: "برلين", type: "يبحث عن سكن", age: 33 },
  { name: "حسن", city: "هامبورغ", type: "يعرض غرفة", age: 38 },
  { name: "إبراهيم", city: "ميونخ", type: "يبحث عن سكن", age: 30 },
  { name: "طارق", city: "كولونيا", type: "يعرض شقة", age: 41 },
  { name: "ياسر", city: "فرانكفورت", type: "يبحث عن سكن", age: 29 },
  { name: "فادي", city: "هانوفر", type: "يعرض غرفة", age: 35 },
  { name: "زياد", city: "دوسلدورف", type: "يبحث عن سكن", age: 27 },
  { name: "مازن", city: "شتوتغارت", type: "يعرض غرفة", age: 32 },
  { name: "باسل", city: "بريمن", type: "يبحث عن سكن", age: 36 },
  { name: "أنس", city: "لايبزيغ", type: "يعرض شقة", age: 30 },

  { name: "ندى", city: "برلين", type: "تبحث عن سكن", age: 29 },
  { name: "رؤى", city: "هامبورغ", type: "تعرض غرفة", age: 26 },
  { name: "تالا", city: "ميونخ", type: "تبحث عن سكن", age: 31 },
  { name: "لارا", city: "كولونيا", type: "تعرض غرفة", age: 28 },
  { name: "سلمى", city: "فرانكفورت", type: "تبحث عن سكن", age: 33 },
  { name: "شهد", city: "هانوفر", type: "تعرض شقة", age: 30 },
  { name: "جود", city: "دوسلدورف", type: "تبحث عن سكن", age: 25 },
  { name: "ملك", city: "شتوتغارت", type: "تعرض غرفة", age: 27 },
  { name: "يارا", city: "بريمن", type: "تبحث عن سكن", age: 29 },
  { name: "فرح", city: "لايبزيغ", type: "تعرض غرفة", age: 32 },

  { name: "سيف", city: "برلين", type: "يبحث عن سكن", age: 28 },
  { name: "جاد", city: "هامبورغ", type: "يعرض غرفة", age: 31 },
  { name: "رامز", city: "ميونخ", type: "يبحث عن سكن", age: 37 },
  { name: "وائل", city: "كولونيا", type: "يعرض شقة", age: 34 },
  { name: "حسام", city: "فرانكفورت", type: "يبحث عن سكن", age: 30 },
  { name: "نبيل", city: "هانوفر", type: "يعرض غرفة", age: 39 },
  { name: "وليد", city: "دوسلدورف", type: "يبحث عن سكن", age: 33 },
  { name: "عدنان", city: "شتوتغارت", type: "يعرض غرفة", age: 36 },
  { name: "مراد", city: "بريمن", type: "يبحث عن سكن", age: 29 },
  { name: "أيمن", city: "لايبزيغ", type: "يعرض شقة", age: 35 }
];

function renderMembers() {
  const container = document.getElementById("members-container");

  if (!container) return;

  container.innerHTML = "";

  members.forEach((member, index) => {
    const card = document.createElement("div");

    card.className = "member-card";

    card.innerHTML = `
      <div class="member-avatar">
        <img
          src="https://i.pravatar.cc/150?img=${(index % 50) + 1}"
          alt="${member.name}"
          loading="lazy"
        >
      </div>

      <div class="member-info">
        <h3>${member.name}</h3>

        <p>
          <strong>العمر:</strong>
          ${member.age}
        </p>

        <p>
          <strong>المدينة:</strong>
          ${member.city}
        </p>

        <p class="member-type">
          ${member.type}
        </p>

        <span class="online-status">
          ● متصل الآن
        </span>
      </div>
    `;

    container.appendChild(card);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderMembers);
} else {
  renderMembers();
}
