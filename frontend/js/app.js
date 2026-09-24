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
