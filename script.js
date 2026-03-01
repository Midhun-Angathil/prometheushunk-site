/* CONFIG */
const CHANNEL_ID = "UCtEKLjhUJ8ssiyOGT6WZW3A";
const MAX_RESULTS = 3;

/* -------------------------------
   FETCH LATEST VIDEOS
--------------------------------*/
async function loadLatestVideos() {
    const container = document.getElementById("video-container");
    container.innerHTML = "<p style='opacity:0.7;'>Loading videos...</p>";

    try {
        const response = await fetch(
            `${BACKEND_URL}?channel_id=${CHANNEL_ID}&max=${MAX_RESULTS}&t=${Date.now()}`
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

/* -------------------------------
   SLIDE BUTTON LOGIC
--------------------------------*/
function slideCarousel(direction) {
    const container = document.getElementById("video-container");
    const cardWidth = 342; // 320px thumbnail + 22px gap

    container.scrollBy({
        left: direction * cardWidth,
        behavior: "smooth"
    });
}

document.getElementById("carousel-left").addEventListener("click", () => slideCarousel(-1));
document.getElementById("carousel-right").addEventListener("click", () => slideCarousel(1));

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
    loadLatestVideos();
});
