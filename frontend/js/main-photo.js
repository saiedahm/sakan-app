document.addEventListener("DOMContentLoaded", () => {
  const photosGrid = document.getElementById("photosGrid");
  const emptyState = document.getElementById("emptyState");
  const photoCount = document.getElementById("photoCount");
  const selectedInfo = document.getElementById("selectedInfo");
  const selectedText = document.getElementById("selectedText");
  const continueBtn = document.getElementById("continueBtn");
  const backBtn = document.getElementById("backBtn");
  const backToPhotosBtn = document.getElementById("backToPhotosBtn");
  const message = document.getElementById("message");

  let photos = [];
  let selectedIndex = null;

  function showMessage(text) {
    message.textContent = text;

    setTimeout(() => {
      if (message.textContent === text) {
        message.textContent = "";
      }
    }, 3500);
  }

  function loadPhotos() {
    try {
      const saved = localStorage.getItem("sakanPhotosPreview");

      if (!saved) {
        photos = [];
        renderPhotos();
        return;
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        photos = [];
      } else {
        photos = parsed;
      }

      const savedMain = localStorage.getItem("sakanMainPhotoIndex");

      if (
        savedMain !== null &&
        Number.isInteger(Number(savedMain)) &&
        Number(savedMain) >= 0 &&
        Number(savedMain) < photos.length
      ) {
        selectedIndex = Number(savedMain);
      }

      renderPhotos();

    } catch (error) {
      console.error("Error loading photos:", error);
      photos = [];
      renderPhotos();
    }
  }

  function renderPhotos() {
    photosGrid.innerHTML = "";

    photoCount.textContent = photos.length;

    if (photos.length === 0) {
      emptyState.classList.remove("hidden");
      selectedInfo.classList.add("hidden");
      continueBtn.disabled = true;
      continueBtn.style.opacity = "0.5";
      return;
    }

    emptyState.classList.add("hidden");
    continueBtn.disabled = false;
    continueBtn.style.opacity = "1";

    photos.forEach((photo, index) => {
      const item = document.createElement("div");

      item.className = "photo-item";

      if (index === selectedIndex) {
        item.classList.add("selected");
      }

      const image = document.createElement("img");

      /*
       * إذا كانت صفحة الصور تحفظ رابط المعاينة، نستخدمه.
       * وإذا كان الحقل مختلفًا، نجرب الحقول الشائعة.
       */
      const imageSource =
        photo.preview ||
        photo.dataUrl ||
        photo.url ||
        photo.src ||
        photo.image ||
        "";

      if (imageSource) {
        image.src = imageSource;
        image.alt = `الصورة ${index + 1}`;
      } else {
        image.alt = `الصورة ${index + 1}`;
        image.style.background = "#111d2c";
      }

      const overlay = document.createElement("div");
      overlay.className = "photo-overlay";

      const status = document.createElement("span");
      status.className = "photo-status";
      status.textContent = "بانتظار المراجعة";

      overlay.appendChild(status);

      const mainBadge = document.createElement("div");
      mainBadge.className = "main-badge";
      mainBadge.textContent = "الصورة الرئيسية";

      const selectIcon = document.createElement("div");
      selectIcon.className = "select-icon";
      selectIcon.textContent = index === selectedIndex ? "✓" : "";

      item.appendChild(image);
      item.appendChild(overlay);
      item.appendChild(mainBadge);
      item.appendChild(selectIcon);

      item.addEventListener("click", () => {
        selectMainPhoto(index);
      });

      photosGrid.appendChild(item);
    });

    if (selectedIndex !== null) {
      selectedInfo.classList.remove("hidden");

      selectedText.textContent =
        `تم اختيار الصورة رقم ${selectedIndex + 1} كصورة رئيسية. ` +
        `ستظهر كصورة رئيسية بعد الموافقة عليها.`;
    } else {
      selectedInfo.classList.add("hidden");
    }
  }

  function selectMainPhoto(index) {
    if (index < 0 || index >= photos.length) {
      return;
    }

    selectedIndex = index;

    localStorage.setItem(
      "sakanMainPhotoIndex",
      String(selectedIndex)
    );

    localStorage.setItem(
      "sakanMainPhoto",
      JSON.stringify({
        index: selectedIndex,
        selectedAt: new Date().toISOString(),
        status: "pending_review"
      })
    );

    renderPhotos();

    showMessage("تم اختيار الصورة الرئيسية بنجاح.");
  }

  continueBtn.addEventListener("click", () => {
    if (photos.length === 0) {
      showMessage("يرجى اختيار صورة واحدة على الأقل أولًا.");
      return;
    }

    if (selectedIndex === null) {
      showMessage("يرجى اختيار صورة رئيسية قبل المتابعة.");
      return;
    }

    localStorage.setItem(
      "sakanProfileSetupCompleted",
      "true"
    );

    localStorage.setItem(
      "sakanOnboardingStep",
      "completed"
    );

    showMessage("تم حفظ الصورة الرئيسية. جارٍ الانتقال...");

    continueBtn.disabled = true;

    setTimeout(() => {
      window.location.href = "home.html";
    }, 900);
  });

  backBtn.addEventListener("click", () => {
    window.location.href = "photos.html";
  });

  backToPhotosBtn.addEventListener("click", () => {
    window.location.href = "photos.html";
  });

  loadPhotos();
}); 
