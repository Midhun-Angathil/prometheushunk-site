/* -----------------------------------
   RANDOM BACKGROUND VIDEO LOADER
----------------------------------- */
let currentVideoIndex = -1;

function pickRandomVideo() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * BACKGROUND_VIDEOS.length);
    } while (newIndex === currentVideoIndex);

    currentVideoIndex = newIndex;
    return BACKGROUND_VIDEOS[newIndex];
}

function setBackgroundVideo(src) {
    const bgVideo = document.getElementById("bg-video");
    if (!bgVideo) return;

    // Fade out  
    bgVideo.style.opacity = "0";

    setTimeout(() => {
        bgVideo.innerHTML = `<source src="${src}" type="video/mp4">`;
        bgVideo.load();

        bgVideo.play().catch(err => console.warn("Autoplay blocked:", err));

        // Fade in
        bgVideo.style.opacity = "1";
    }, 600); // duration of fade transition
}

function startBackgroundRotation() {
    // Initial load
    const firstVideo = pickRandomVideo();
    setBackgroundVideo(firstVideo);

    // Rotate every 2 minutes
    setInterval(() => {
        const nextVideo = pickRandomVideo();
        setBackgroundVideo(nextVideo);
    }, 120000); // 120 sec = 2 min
}

/* -----------------------------------
   LOAD YOUTUBE VIDEOS
----------------------------------- */
async function loadLatestVideos() {
    const container = document.getElementById("video-container");
    container.innerHTML = "<p style='opacity:0.7;'>Loading videos...</p>";

    try {
        const url =
            `${API_ENDPOINT}/?channel_id=${CHANNEL_ID}&max=${MAX_RESULTS}&t=${Date.now()}`;

        const response = await fetch(url);
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
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
                    <img src="${thumb}" alt="${title}">
                </a>
                <p class="video-title">${title}</p>
            `;

            container.appendChild(card);
        });

        // Initialize carousel after videos are loaded
        initCarousel();

    } catch (err) {
        console.error("YouTube fetch failed:", err);
        container.innerHTML =
            "<p style='color:#f66;'>Failed to load videos. Try again later.</p>";
    }
}

/* -----------------------------------
   CAROUSEL LOGIC
----------------------------------- */
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

/* -----------------------------------
   CAROUSEL ARROWS
----------------------------------- */
function slideCarousel(direction) {
    if (!carousel) return;

    // Get actual card width dynamically for better desktop/mobile compatibility
    const firstCard = carousel.querySelector('.video-card');
    const cardWidth = firstCard ? firstCard.offsetWidth + 25 : 345; // card width + gap
    
    const amount = direction * cardWidth;
    carousel.scrollBy({ left: amount, behavior: "smooth" });
}

/* -----------------------------------
   AUTO-SLIDE (every 5 seconds)
----------------------------------- */
setInterval(() => {
    if (!carousel) return;
    
    const totalWidth = carousel.scrollWidth - carousel.clientWidth;
    const nearEnd = carousel.scrollLeft + 10 >= totalWidth;

    if (nearEnd) {
        // return to start
        carousel.scrollTo({ left: 0, behavior: "smooth" });
    } else {
        slideCarousel(1);
    }
}, 5000);

/* -----------------------------------
   INIT
----------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    startBackgroundRotation();
    loadLatestVideos();
});