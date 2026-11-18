
/* =================================
   WEDDING ALBUM JAVASCRIPT
================================= */

const eventPhotos = {
    haldi: 10,
    sangeeth: 10,
    engagement: 10,
    marriage: 10,
    reception: 10
};

let selectedPhotos = new Set();
let currentImages = [];
let currentPhotoIndex = 0;


/* =================================
   OPEN CATEGORY GALLERY
================================= */

function openGallery(eventName) {

    const gallery = document.getElementById("gallery-grid");
    const title = document.getElementById("gallery-title");

    title.textContent =
        eventName.charAt(0).toUpperCase() +
        eventName.slice(1) + " Memories";

    gallery.innerHTML = "";

    // Reset selections when opening another category
    selectedPhotos.clear();
    updateSelectionUI();

    const total = eventPhotos[eventName] || 0;

    for (let i = 1; i <= total; i++) {

        const src = `images/${eventName}/${i}.jpeg`;

        const item = document.createElement("div");
        item.className = "gallery-item";

        const img = document.createElement("img");
        img.src = src;
        img.alt = `${eventName} wedding photo ${i}`;
        img.loading = "lazy";

        img.onclick = function () {
            currentImages = Array.from(
                gallery.querySelectorAll(".gallery-item img")
            ).map(image => image.src);

            currentPhotoIndex = currentImages.indexOf(img.src);
            showLightbox(img.src);
        };

        // Selection checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "photo-select";
        checkbox.setAttribute("aria-label", "Select photo");

        checkbox.onchange = function () {

            if (this.checked) {
                selectedPhotos.add(src);
            } else {
                selectedPhotos.delete(src);
            }

            item.classList.toggle("selected", this.checked);
            updateSelectionUI();
        };

        item.appendChild(img);
        item.appendChild(checkbox);

        gallery.appendChild(item);
    }

    document.getElementById("gallery").scrollIntoView({
        behavior: "smooth"
    });
}


/* =================================
   UPDATE SELECTION COUNT
================================= */

function updateSelectionUI() {

    const count = selectedPhotos.size;

    document.getElementById("selected-count").textContent =
        `${count} photo${count === 1 ? "" : "s"} selected`;

    document.getElementById("download-selected").disabled =
        count === 0;
}


/* =================================
   DOWNLOAD SELECTED PHOTOS AS ZIP
================================= */

async function downloadSelectedPhotos() {

    if (selectedPhotos.size === 0) {
        alert("Please select photos first.");
        return;
    }

    if (typeof JSZip === "undefined") {
        alert("ZIP library could not load. Check your internet connection.");
        return;
    }

    const button = document.getElementById("download-selected");
    button.disabled = true;
    button.textContent = "Preparing ZIP...";

    try {

        const zip = new JSZip();
        const folder = zip.folder("Wedding Photos");

        let count = 0;

        for (const src of selectedPhotos) {

            const response = await fetch(src);

            if (!response.ok) {
                throw new Error(`Could not load ${src}`);
            }

            const blob = await response.blob();

            const fileName = src.split("/").pop();

            folder.file(fileName, blob);

            count++;
        }

        const zipBlob = await zip.generateAsync({
            type: "blob"
        });

        const url = URL.createObjectURL(zipBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "Wedding-Photos.zip";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {

        console.error(error);
        alert("Unable to download some photos. Please try again.");

    } finally {

        button.disabled = selectedPhotos.size === 0;
        button.textContent = "↓ Download Selected";
    }
}


/* =================================
   LIGHTBOX
================================= */

function showLightbox(src) {

    const lightbox = document.getElementById("lightbox");
    const image = document.getElementById("lightbox-img");
    const downloadBtn = document.getElementById("download-btn");

    image.src = src;

    downloadBtn.href = src;
    downloadBtn.download = src.split("/").pop();

    lightbox.style.display = "flex";
}


function closeLightbox() {
    document.getElementById("lightbox").style.display = "none";
}


/* =================================
   NEXT / PREVIOUS PHOTO
================================= */

function changePhoto(direction) {

    if (currentImages.length === 0) return;

    currentPhotoIndex += direction;

    if (currentPhotoIndex >= currentImages.length) {
        currentPhotoIndex = 0;
    }

    if (currentPhotoIndex < 0) {
        currentPhotoIndex = currentImages.length - 1;
    }

    showLightbox(currentImages[currentPhotoIndex]);
}


/* =================================
   KEYBOARD CONTROLS
================================= */

document.addEventListener("keydown", function (e) {

    const lightbox = document.getElementById("lightbox");

    if (lightbox.style.display === "flex") {

        if (e.key === "Escape") {
            closeLightbox();
        }

        if (e.key === "ArrowRight") {
            changePhoto(1);
        }

        if (e.key === "ArrowLeft") {
            changePhoto(-1);
        }
    }
});
