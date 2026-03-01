/* -------------------------------
   CONFIG
--------------------------------*/
const CHANNEL_ID = "UCtEKLjhUJ8ssiyOGT6WZW3A";
const MAX_RESULTS = 3;
const BACKEND_URL = "https://ph-gaming-system.el.r.appspot.com/";

/* -------------------------------
   DYNAMIC YOUTUBE FETCH
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
                <a href="https://www.youtube.com/watch?v=${videoId}"
                   target="_blank"
                   rel="noopener noreferrer">
                    <img src="${thumb}" alt="${title}" loading="lazy">
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
let autoSlideInterval;

function initCarousel() {
    carousel = document.querySelector(".video-container");

    if (!carousel) return;

    // Clear any existing auto-slide
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }

    /* --- Drag to scroll (desktop) --- */
    carousel.addEventListener("mousedown", (e) => {
        isDown = true;
        carousel.style.cursor = "grabbing";
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener("mouseleave", () => {
        isDown = false;
        carousel.style.cursor = "grab";
    });
    
    carousel.addEventListener("mouseup", () => {
        isDown = false;
        carousel.style.cursor = "grab";
    });

    carousel.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1.5;
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

    // Set cursor style
    carousel.style.cursor = "grab";

    // Start auto-slide
    startAutoSlide();
}

/* -------------------------------
   ARROW BUTTON SLIDE - DYNAMIC CALCULATION
--------------------------------*/
function slideCarousel(direction) {
    if (!carousel) return;

    // Get the first video card to calculate its width
    const firstCard = carousel.querySelector('.video-card');
    if (!firstCard) return;

    // Calculate scroll amount: card width + gap
    const cardWidth = firstCard.offsetWidth;
    const gap = 25; // This matches the CSS gap
    const scrollAmount = cardWidth + gap;

    // Scroll by the calculated amount
    carousel.scrollBy({ 
        left: direction * scrollAmount, 
        behavior: "smooth" 
    });
}

/* -------------------------------
   AUTO-SLIDE (every 5 seconds)
--------------------------------*/
function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        if (!carousel) return;

        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        const currentScroll = carousel.scrollLeft;
        
        // Check if we're at or near the end (within 10px)
        if (currentScroll + 10 >= maxScroll) {
            // Return to start
            carousel.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            // Slide to next
            slideCarousel(1);
        }
    }, 5000);
}

/* -------------------------------
   ARROW BUTTON VISIBILITY
--------------------------------*/
function updateArrowVisibility() {
    if (!carousel) return;

    const leftBtn = document.getElementById('carousel-left');
    const rightBtn = document.getElementById('carousel-right');
    
    if (!leftBtn || !rightBtn) return;

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const currentScroll = carousel.scrollLeft;

    // Hide left arrow at start
    if (currentScroll <= 5) {
        leftBtn.style.opacity = '0.3';
        leftBtn.style.pointerEvents = 'none';
    } else {
        leftBtn.style.opacity = '1';
        leftBtn.style.pointerEvents = 'auto';
    }

    // Hide right arrow at end
    if (currentScroll + 5 >= maxScroll) {
        rightBtn.style.opacity = '0.3';
        rightBtn.style.pointerEvents = 'none';
    } else {
        rightBtn.style.opacity = '1';
        rightBtn.style.pointerEvents = 'auto';
    }
}

/* -------------------------------
   INIT
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    loadLatestVideos();
    
    // Update arrow visibility on scroll
    const container = document.getElementById("video-container");
    if (container) {
        container.addEventListener('scroll', updateArrowVisibility);
        
        // Initial check after a brief delay to ensure content is loaded
        setTimeout(updateArrowVisibility, 500);
    }
});

// Update arrow visibility on window resize
window.addEventListener('resize', () => {
    if (carousel) {
        updateArrowVisibility();
    }
});