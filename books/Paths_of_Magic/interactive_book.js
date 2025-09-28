document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('tab-select')
    if (select) {
        select.addEventListener('change', e => {
            const idx = parseInt(e.target.value, 10)
            if (!Number.isNaN(idx)) showTab(idx)
        })
        // Show first tab by default
        showTab(0)
    }
})

function showTab(index) {
    const tabs = document.querySelectorAll('.tab')
    tabs.forEach((tab, i) => {
        tab.style.display = i === index ? 'block' : 'none'
    })

    // keep dropdown in sync
    const select = document.getElementById('tab-select')
    if (select && select.value !== String(index)) {
        select.value = String(index)
    }
}

async function openPoem(url) {
    const dlg = document.getElementById('poemDialog')
    const box = document.getElementById('poemContent')

    // Fetch as text (since your poem.html is just text)
    const txt = await fetch(url, { cache: 'no-store' }).then(r => r.text())

    // If it's plain text: show with line breaks preserved.
    // If you actually store real HTML in poem.html, replace the next line with: box.innerHTML = txt;
    box.innerHTML = txt

    dlg.showModal()

    // Optional: click outside to close
    dlg.addEventListener(
        'click',
        e => {
            const rect = dlg.getBoundingClientRect()
            const inDialog =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            if (!inDialog) dlg.close()
        },
        { once: true }
    )
}

// Wire up any poem buttons on the page
document.addEventListener('click', e => {
    const btn = e.target.closest('.poem-btn')
    if (!btn) return
    const url = btn.getAttribute('data-poem') // e.g., "poem.html" or "./contents/poem.html"
    openPoem(url)
})


document.querySelector('.poem-close').addEventListener('click', () => {
    document.getElementById('poemDialog').close()
})

// Play/Pause toggle
const playBtn = document.getElementById('songPlayPause')
const songAudio = new Audio(playBtn.getAttribute('data-song'))
function playSong() {
    if (songAudio.paused) {
        try {
            songAudio.play()
            playBtn.textContent = '⏸️ Pause'
            playBtn.setAttribute('aria-label', 'Pause')
            console.log('Play')
        } catch (err) {
            console.error(err)
        }
    } else {
        songAudio.pause()
        playBtn.textContent = '▶️ Play'
        playBtn.setAttribute('aria-label', 'Play')
        console.log('Pause')
    }
}

// Volume
const volSlider = document.getElementById('songVolume')
function adjustVolume() {
    songAudio.volume = volSlider.value
    localStorage.setItem('songVol', volSlider.value)
}

// Spacebar toggles play/pause while modal open
document.getElementById('poemDialog').addEventListener('keydown', e => {
    if (e.code === 'Space') {
        e.preventDefault()
        playBtn.click()
    }
})

// Slideshow modal
const JSON_URL = 'interactive_book_images.json';

let images = [];
let index = 0;

const openBtn = document.getElementById('openSlideshow');
const slideshow = document.getElementById('slideshow');
const slideImg = document.getElementById('slide');
const counter = document.getElementById('counter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const closeBtn = document.getElementById('closeBtn');

// Load images from JSON
async function loadImages() {
    try {
        const res = await fetch(JSON_URL);
        images = await res.json();
    } catch (err) {
        console.error('Error loading images.json', err);
        images = [];
    }
}

// Show current image
function show(idx) {
    if (!images.length) return;
    index = (idx + images.length) % images.length; // wrap around
    slideImg.src = images[index];
    counter.textContent = `${index + 1} / ${images.length}`;
}

// Open slideshow
function openSlideshow() {
    if (!images.length) return;
    slideshow.setAttribute('aria-hidden', 'false');
    show(index);
    document.addEventListener('keydown', onKey);
}

// Close slideshow
function closeSlideshow() {
    slideshow.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKey);
}

// Keyboard navigation
function onKey(e) {
    if (e.key === 'Escape') closeSlideshow();
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
}

// Event bindings
openBtn.addEventListener('click', openSlideshow);
closeBtn.addEventListener('click', closeSlideshow);
prevBtn.addEventListener('click', () => show(index - 1));
nextBtn.addEventListener('click', () => show(index + 1));
slideshow.addEventListener('click', e => {
    if (e.target === slideshow) closeSlideshow(); // click outside image to close
});

// Initialize
loadImages();


// Click on images to show them full screen
const modal = document.getElementById("fullscreenImgModal");
const modalImg = document.getElementById("modalImg");

// Get all images in the document
document.querySelectorAll("img").forEach(img => {
    img.addEventListener("click", () => {
        modal.style.display = "flex";
        modalImg.src = img.src;  // show the clicked image in the modal
    });
});

// Close modal on click anywhere
modal.addEventListener("click", () => {
    modal.style.display = "none";
});
