/* -------------------------------
   CONFIG
--------------------------------*/
const CHANNEL_ID = "UCtEKLjhUJ8ssiyOGT6WZW3A";
const MAX_RESULTS = 3;

/* -------------------------------
   DYNAMIC YOUTUBE FETCH
--------------------------------*/
async function loadLatestVideos() {
    const container = document.getElementById("video-container");
    container.innerHTML = "<p style='opacity:0.7;'>Loading videos...</p>";

    try {
        const response = await fetch(
            `https://ph-gaming-system.el.r.appspot.com?channel_id=${CHANNEL_ID}&max=${MAX_RESULTS}&t=${Date.now()}`
        );

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            container.innerHTML = "<p>No videos found.</p>";
            return;
        }

        container.innerHTML = "";

        data.items.forEach((video) => {
            const videoId = video.id.videoId;
            const title = video.snippet.title;
            const thumb = video.snippet.thumbnails.high.url;

            const card = document.createElement("div");
            card.className = "video-card";

            card.innerHTML = `
                <a href="https://www.youtube.com/watch?v=${videoId}"
                   target="_blank">
                    <img src="${thumb}" alt="${title}">
                </a>
                <p class="video-title">${title}</p>
            `;

            container.appendChild(card);
        });

        // Re-init carousel once videos are loaded
        initCarousel();

    } catch (err) {
        console.error("YouTube fetch failed:", err);
        container.innerHTML =
            "<p style='color:#f66;'>Failed to load videos. Try again later.</p>";
    }
}

/* -------------------------------
   CAROUSEL LOGIC
--------------------------------*/
let carousel, isDown = false, startX, scrollLeft;

function initCarousel() {
    carousel = document.querySelector(".video-container");

    if (!carousel) return;

    /* --- Drag to scroll (desktop + mobile) --- */
    carousel.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener("mouseleave", () => (isDown = false));
    carousel.addEventListener("mouseup", () => (isDown = false));

    carousel.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.4;
        carousel.scrollLeft = scrollLeft - walk;
    });

    /* --- Touch Swipe (mobile) --- */
    let touchStartX = 0;

    carousel.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
    });

    carousel.addEventListener("touchend", (e) => {
        const diff = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diff) > 50) {
            slideCarousel(diff > 0 ? -1 : 1);
        }
    });
}

/* -------------------------------
   ARROW BUTTON SLIDE
--------------------------------*/
function slideCarousel(direction) {
    const cardWidth = 330; 
    const amount = direction * cardWidth;
    carousel.scrollBy({ left: amount, behavior: "smooth" });
}

/* -------------------------------
   AUTO-SLIDE (every 5 seconds)
--------------------------------*/
setInterval(() => {
    const totalWidth = carousel.scrollWidth - carousel.clientWidth;
    const nearEnd = carousel.scrollLeft + 10 >= totalWidth;

    if (nearEnd) {
        // return to start
        carousel.scrollTo({ left: 0, behavior: "smooth" });
    } else {
        slideCarousel(1);
    }
}, 5000);

/* -------------------------------
   INIT
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    loadLatestVideos();
});