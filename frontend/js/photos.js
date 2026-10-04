document.addEventListener("DOMContentLoaded", () => {
  const MAX_PHOTOS = 6;
  const MAX_FILE_SIZE = 8 * 1024 * 1024;
  const photoInput = document.getElementById("photoInput");
  const photoGrid = document.getElementById("photoGrid");
  const photoCount = document.getElementById("photoCount");
  const emptyPhotos = document.getElementById("emptyPhotos");
  const cameraBtn = document.getElementById("cameraBtn");
  const cameraArea = document.getElementById("cameraArea");
  const cameraVideo = document.getElementById("cameraVideo");
  const cameraCanvas = document.getElementById("cameraCanvas");
  const takePhotoBtn = document.getElementById("takePhotoBtn");
  const closeCameraBtn = document.getElementById("closeCameraBtn");
  const continueBtn = document.getElementById("continueBtn");
  const backBtn = document.getElementById("backBtn");
  const messageBox = document.getElementById("messageBox");

  const API = (window.SAKAN_API_BASE || localStorage.getItem("sakanApiBase") || "http://localhost:5000/api").replace(/\/$/, "");
  const token = () => localStorage.getItem("sakanAuthToken") || "";
  let photos = [];
  let cameraStream = null;

  function message(text) {
    if (!messageBox) return alert(text);
    messageBox.textContent = text;
    messageBox.classList.add("show");
    clearTimeout(messageBox._timer);
    messageBox._timer = setTimeout(() => messageBox.classList.remove("show"), 3500);
  }

  async function api(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (token()) headers.Authorization = "Bearer " + token();
    const response = await fetch(API + path, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "تعذر الاتصال بالخادم.");
    return data;
  }

  function renderPhotos() {
    photoGrid.innerHTML = "";
    photoCount.textContent = photos.length;
    if (!photos.length) {
      photoGrid.appendChild(emptyPhotos);
      return;
    }
    photos.forEach((photo, index) => {
      const item = document.createElement("div");
      item.className = "photo-item";
      const image = document.createElement("img");
      image.src = photo.url;
      image.alt = "الصورة " + (index + 1);
      const overlay = document.createElement("div");
      overlay.className = "photo-overlay";

      const number = document.createElement("div");
      number.className = "photo-number";
      number.textContent = index + 1;

      const main = document.createElement("button");
      main.type = "button";
      main.className = "main-photo-button";
      const isMain = !!photo.isMain;
      main.textContent = isMain ? "★ صورة الملف الشخصي" : "تعيين كصورة الملف الشخصي";
      if (isMain) main.classList.add("active");
      main.addEventListener("click", async (event) => {
        event.stopPropagation();
        if (isMain) return;
        try {
          const result = await api("/me/photos/main", { method: "PUT", body: JSON.stringify({ url: photo.url }) });
          photos = photos.map(p => ({ ...p, isMain: p.url === result.mainPhotoUrl }));
          localStorage.setItem("sakanMainPhotoUrl", result.mainPhotoUrl || "");
          const user = JSON.parse(localStorage.getItem("sakanCurrentUser") || "null");
          if (user) {
            user.mainPhotoUrl = result.mainPhotoUrl;
            localStorage.setItem("sakanCurrentUser", JSON.stringify(user));
          }
          renderPhotos();
          message("تم تعيين الصورة كصورة الملف الشخصي بنجاح.");
        } catch (error) { message(error.message); }
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-photo";
      remove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      remove.title = "حذف الصورة";
      remove.addEventListener("click", async (event) => {
        event.stopPropagation();
        if (!confirm("هل تريد حذف هذه الصورة؟")) return;
        try {
          const result = await api("/me/photos", { method: "DELETE", body: JSON.stringify({ url: photo.url }) });
          photos = (result.photos || []).map(p => ({ url: p.url, isMain: p.url === result.mainPhotoUrl }));
          localStorage.setItem("sakanMainPhotoUrl", result.mainPhotoUrl || "");
          renderPhotos();
          message("تم حذف الصورة.");
        } catch (error) { message(error.message); }
      });

      item.append(image, overlay, number, main, remove);
      photoGrid.appendChild(item);
    });
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function addFile(file) {
    if (photos.length >= MAX_PHOTOS) return message("يمكنك إضافة 6 صور كحد أقصى.");
    if (!file.type.startsWith("image/")) return message("الملف المحدد ليس صورة.");
    if (file.size > MAX_FILE_SIZE) return message("حجم الصورة يجب ألا يتجاوز 8 ميجابايت.");
    const dataUrl = await fileToDataUrl(file);
    if (photos.some(p => p.url === dataUrl)) return message("هذه الصورة مضافة بالفعل.");

    try {
      if (token()) {
        const result = await api("/me/photos", { method: "POST", body: JSON.stringify({ url: dataUrl }) });
        photos = (result.photos || []).map(p => ({ url: p.url, isMain: p.url === result.mainPhotoUrl }));
        localStorage.setItem("sakanMainPhotoUrl", result.mainPhotoUrl || "");
        const user = JSON.parse(localStorage.getItem("sakanCurrentUser") || "null");
        if (user) {
          user.mainPhotoUrl = result.mainPhotoUrl || user.mainPhotoUrl || "";
          localStorage.setItem("sakanCurrentUser", JSON.stringify(user));
        }
        renderPhotos();
        message("تم حفظ الصورة. يمكنك الآن تعيينها كصورة الملف الشخصي.");
      } else {
        photos.push({ url: dataUrl, isMain: false });
        localStorage.setItem("sakanPhotosPreview", JSON.stringify(photos));
        renderPhotos();
      }
    } catch (error) { message(error.message); }
  }

  if (photoInput) photoInput.addEventListener("change", async event => {
    for (const file of Array.from(event.target.files || [])) {
      if (photos.length >= MAX_PHOTOS) break;
      await addFile(file);
    }
    photoInput.value = "";
  });

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) return message("الكاميرا غير متاحة في هذا المتصفح.");
    if (photos.length >= MAX_PHOTOS) return message("وصلت إلى الحد الأقصى وهو 6 صور.");
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      cameraVideo.srcObject = cameraStream;
      cameraArea.classList.remove("hidden");
    } catch (error) { console.error(error); message("لم نتمكن من تشغيل الكاميرا. يرجى السماح للمتصفح باستخدام الكاميرا."); }
  }

  function closeCamera() {
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
    if (cameraVideo) cameraVideo.srcObject = null;
    if (cameraArea) cameraArea.classList.add("hidden");
  }

  if (cameraBtn) cameraBtn.addEventListener("click", openCamera);
  if (closeCameraBtn) closeCameraBtn.addEventListener("click", closeCamera);
  if (takePhotoBtn) takePhotoBtn.addEventListener("click", () => {
    if (!cameraStream || !cameraVideo.videoWidth) return message("انتظر لحظة حتى تجهز الكاميرا.");
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    cameraCanvas.getContext("2d").drawImage(cameraVideo, 0, 0);
    cameraCanvas.toBlob(blob => {
      if (blob) addFile(new File([blob], "sakan-camera-" + Date.now() + ".jpg", { type: "image/jpeg" }));
      closeCamera();
    }, "image/jpeg", 0.9);
  });

  if (backBtn) backBtn.addEventListener("click", () => {
    closeCamera();
    window.location.href = "profile-data.html";
  });

  if (continueBtn) continueBtn.addEventListener("click", () => {
    if (!photos.length) {
      localStorage.removeItem("sakanPhotosPreview");
      window.location.href = "main-photo.html";
      return;
    }
    if (token()) {
      window.location.href = "main-photo.html";
      return;
    }
    localStorage.setItem("sakanPhotosPreview", JSON.stringify(photos));
    window.location.href = "main-photo.html";
  });

  async function load() {
    try {
      if (token()) {
        const result = await api("/me/photos");
        photos = (result.photos || []).map(p => ({ url: p.url, isMain: p.url === result.mainPhotoUrl }));
        localStorage.setItem("sakanMainPhotoUrl", result.mainPhotoUrl || "");
      } else {
        const saved = JSON.parse(localStorage.getItem("sakanPhotosPreview") || "[]");
        photos = Array.isArray(saved) ? saved : [];
      }
    } catch (error) {
      console.error(error);
      const saved = JSON.parse(localStorage.getItem("sakanPhotosPreview") || "[]");
      photos = Array.isArray(saved) ? saved : [];
    }
    renderPhotos();
  }

  load();
  window.addEventListener("beforeunload", closeCamera);
});