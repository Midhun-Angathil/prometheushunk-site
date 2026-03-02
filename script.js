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

    } catch (err) {
        console.error("YouTube fetch failed:", err);
        container.innerHTML =
            "<p style='color:#f66;'>Failed to load videos. Try again later.</p>";
    }
}

/* -----------------------------------
   CAROUSEL ARROWS
----------------------------------- */
function slideCarousel(direction) {
    const carousel = document.querySelector(".video-container");
    if (!carousel) return;

    const amount = 350 * direction;

    carousel.scrollBy({ left: amount, behavior: "smooth" });
}

/* -----------------------------------
   INIT
----------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    startBackgroundRotation();
    loadLatestVideos();
});
