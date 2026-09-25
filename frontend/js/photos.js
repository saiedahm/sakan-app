 /* =====================================================
   SAKAN - PHOTOS
===================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* =================================================
       SETTINGS
    ================================================= */

    const MAX_PHOTOS = 6;

    const MAX_FILE_SIZE =
        8 * 1024 * 1024;


    /* =================================================
       ELEMENTS
    ================================================= */

    const photoInput =
        document.getElementById("photoInput");

    const photoGrid =
        document.getElementById("photoGrid");

    const photoCount =
        document.getElementById("photoCount");

    const emptyPhotos =
        document.getElementById("emptyPhotos");

    const cameraBtn =
        document.getElementById("cameraBtn");

    const cameraArea =
        document.getElementById("cameraArea");

    const cameraVideo =
        document.getElementById("cameraVideo");

    const cameraCanvas =
        document.getElementById("cameraCanvas");

    const takePhotoBtn =
        document.getElementById("takePhotoBtn");

    const closeCameraBtn =
        document.getElementById("closeCameraBtn");

    const continueBtn =
        document.getElementById("continueBtn");

    const backBtn =
        document.getElementById("backBtn");

    const messageBox =
        document.getElementById("messageBox");


    /* =================================================
       DATA
    ================================================= */

    let photos = [];

    let cameraStream = null;


    /* =================================================
       MESSAGE
    ================================================= */

    function showMessage(message) {

        if (!messageBox) {

            alert(message);

            return;
        }


        messageBox.textContent =
            message;


        messageBox.classList.add(
            "show"
        );


        setTimeout(function () {

            messageBox.classList.remove(
                "show"
            );

        }, 3500);
    }


    /* =================================================
       RENDER
    ================================================= */

    function renderPhotos() {

        photoGrid.innerHTML = "";


        if (photos.length === 0) {

            photoGrid.appendChild(
                emptyPhotos
            );

            photoCount.textContent =
                "0";

            return;
        }


        photos.forEach(
            function (photo, index) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "photo-item";


                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    photo.url;


                image.alt =
                    "الصورة " +
                    (index + 1);


                const overlay =
                    document.createElement(
                        "div"
                    );


                overlay.className =
                    "photo-overlay";


                const number =
                    document.createElement(
                        "div"
                    );


                number.className =
                    "photo-number";


                number.textContent =
                    index + 1;


                const remove =
                    document.createElement(
                        "button"
                    );


                remove.type =
                    "button";


                remove.className =
                    "remove-photo";


                remove.innerHTML =
                    '<i class="fa-solid fa-xmark"></i>';


                remove.title =
                    "حذف الصورة";


                remove.addEventListener(
                    "click",
                    function () {

                        removePhoto(index);

                    }
                );


                const status =
                    document.createElement(
                        "div"
                    );


                status.className =
                    "photo-status";


                status.textContent =
                    "بانتظار المراجعة";


                item.appendChild(image);

                item.appendChild(overlay);

                item.appendChild(number);

                item.appendChild(remove);

                item.appendChild(status);


                photoGrid.appendChild(item);

            }
        );


        photoCount.textContent =
            photos.length;
    }


    /* =================================================
       REMOVE PHOTO
    ================================================= */

    function removePhoto(index) {

        if (
            !photos[index]
        ) {
            return;
        }


        /*
           تحرير رابط المعاينة
           لتجنب استهلاك الذاكرة.
        */

        if (
            photos[index].url
        ) {

            URL.revokeObjectURL(
                photos[index].url
            );

        }


        photos.splice(
            index,
            1
        );


        renderPhotos();
    }


    /* =================================================
       ADD FILE
    ================================================= */

    function addFile(file) {

        if (
            photos.length >=
            MAX_PHOTOS
        ) {

            showMessage(
                "يمكنك إضافة 6 صور كحد أقصى."
            );

            return;
        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            showMessage(
                "الملف المحدد ليس صورة."
            );

            return;
        }


        if (
            file.size >
            MAX_FILE_SIZE
        ) {

            showMessage(
                "حجم الصورة يجب ألا يتجاوز 8 ميجابايت."
            );

            return;
        }


        const exists =
            photos.some(
                function (photo) {

                    return (
                        photo.name ===
                        file.name &&
                        photo.size ===
                        file.size
                    );

                }
            );


        if (exists) {

            showMessage(
                "هذه الصورة مضافة بالفعل."
            );

            return;
        }


        const url =
            URL.createObjectURL(
                file
            );


        photos.push({

            file: file,

            url: url,

            name: file.name,

            size: file.size,

            source: "upload",

            status: "pending"

        });


        renderPhotos();
    }


    /* =================================================
       FILE INPUT
    ================================================= */

    if (photoInput) {

        photoInput.addEventListener(
            "change",
            function (event) {

                const files =
                    Array.from(
                        event.target.files
                    );


                if (
                    files.length === 0
                ) {
                    return;
                }


                for (
                    const file of files
                ) {

                    if (
                        photos.length >=
                        MAX_PHOTOS
                    ) {

                        break;
                    }


                    addFile(file);
                }


                /*
                   السماح باختيار نفس الملف
                   مرة أخرى بعد الحذف.
                */

                photoInput.value = "";

            }
        );

    }


    /* =================================================
       CAMERA
    ================================================= */

    if (cameraBtn) {

        cameraBtn.addEventListener(
            "click",
            async function () {

                if (
                    !navigator.mediaDevices ||
                    !navigator.mediaDevices.getUserMedia
                ) {

                    showMessage(
                        "الكاميرا غير متاحة في هذا المتصفح."
                    );

                    return;
                }


                if (
                    photos.length >=
                    MAX_PHOTOS
                ) {

                    showMessage(
                        "وصلت إلى الحد الأقصى وهو 6 صور."
                    );

                    return;
                }


                try {

                    cameraStream =
                        await navigator
                            .mediaDevices
                            .getUserMedia({

                                video: {
                                    facingMode:
                                        "user"
                                },

                                audio: false

                            });


                    cameraVideo.srcObject =
                        cameraStream;


                    cameraArea.classList.remove(
                        "hidden"
                    );

                }

                catch (error) {

                    console.error(
                        error
                    );


                    showMessage(
                        "لم نتمكن من تشغيل الكاميرا. يرجى السماح للمتصفح باستخدام الكاميرا."
                    );

                }

            }
        );

    }


    /* =================================================
       TAKE PHOTO
    ================================================= */

    if (takePhotoBtn) {

        takePhotoBtn.addEventListener(
            "click",
            function () {

                if (
                    !cameraStream
                ) {

                    showMessage(
                        "الكاميرا غير مفتوحة."
                    );

                    return;
                }


                if (
                    photos.length >=
                    MAX_PHOTOS
                ) {

                    showMessage(
                        "وصلت إلى الحد الأقصى وهو 6 صور."
                    );

                    return;
                }


                const videoWidth =
                    cameraVideo.videoWidth;


                const videoHeight =
                    cameraVideo.videoHeight;


                if (
                    !videoWidth ||
                    !videoHeight
                ) {

                    showMessage(
                        "انتظر لحظة حتى تجهز الكاميرا."
                    );

                    return;
                }


                cameraCanvas.width =
                    videoWidth;


                cameraCanvas.height =
                    videoHeight;


                const context =
                    cameraCanvas.getContext(
                        "2d"
                    );


                context.drawImage(
                    cameraVideo,
                    0,
                    0,
                    videoWidth,
                    videoHeight
                );


                cameraCanvas.toBlob(
                    function (blob) {

                        if (!blob) {

                            showMessage(
                                "تعذر التقاط الصورة."
                            );

                            return;
                        }


                        const file =
                            new File(
                                [blob],
                                "sakan-camera-" +
                                Date.now() +
                                ".jpg",
                                {
                                    type:
                                        "image/jpeg"
                                }
                            );


                        addFile(file);


                        closeCamera();

                    },
                    "image/jpeg",
                    0.9
                );

            }
        );

    }


    /* =================================================
       CLOSE CAMERA
    ================================================= */

    function closeCamera() {

        if (
            cameraStream
        ) {

            cameraStream
                .getTracks()
                .forEach(
                    function (track) {

                        track.stop();

                    }
                );

            cameraStream = null;
        }


        if (cameraVideo) {

            cameraVideo.srcObject =
                null;
        }


        if (cameraArea) {

            cameraArea.classList.add(
                "hidden"
            );
        }

    }


    if (closeCameraBtn) {

        closeCameraBtn.addEventListener(
            "click",
            function () {

                closeCamera();

            }
        );

    }


    /* =================================================
       BACK
    ================================================= */

    if (backBtn) {

        backBtn.addEventListener(
            "click",
            function () {

                closeCamera();


                if (
                    window.history.length > 1
                ) {

                    window.history.back();

                }

                else {

                    window.location.href =
                        "profile-data.html";

                }

            }
        );

    }


    /* =================================================
       CONTINUE
    ================================================= */

    if (continueBtn) {

        continueBtn.addEventListener(
            "click",
            function () {

                if (
                    photos.length === 0
                ) {

                    showMessage(
                        "يرجى إضافة صورة واحدة على الأقل للمتابعة."
                    );

                    return;
                }


                /*
                   نحفظ بيانات المعاينة فقط.
                   الملفات الحقيقية ستُرفع إلى السيرفر
                   بعد ربط الـBackend.
                */

                const photoInfo =
                    photos.map(
                        function (photo) {

                            return {

                                name:
                                    photo.name,

                                size:
                                    photo.size,

                                source:
                                    photo.source,

                                status:
                                    "pending"

                            };

                        }
                    );


                localStorage.setItem(
                    "sakanPhotosPreview",
                    JSON.stringify(
                        photoInfo
                    )
                );


                showMessage(
                    "تم تجهيز الصور للمراجعة."
                );


                setTimeout(
                    function () {

                        /*
                           الصفحة التالية سنبنيها
                           لاختيار الصورة الرئيسية.
                        */

                        window.location.href =
                            "main-photo.html";

                    },
                    1200
                );

            }
        );

    }


    /* =================================================
       INITIAL RENDER
    ================================================= */

    renderPhotos();


    /* =================================================
       PAGE EXIT
    ================================================= */

    window.addEventListener(
        "beforeunload",
        function () {

            closeCamera();

        }
    );

});
