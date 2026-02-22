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

    // Toggle navigation buttons
    const prevBtns = document.querySelectorAll('.prev-chap');
    const nextBtns = document.querySelectorAll('.next-chap');

    prevBtns.forEach(btn => {
        btn.style.visibility = index === 0 ? 'hidden' : 'visible';
    });

    nextBtns.forEach(btn => {
        btn.style.visibility = index === tabs.length - 1 ? 'hidden' : 'visible';
    });
}

function navChapter(direction) {
    const select = document.getElementById('tab-select');
    if (!select) return;

    const currentIndex = parseInt(select.value, 10);
    const newIndex = currentIndex + direction;

    const tabs = document.querySelectorAll('.tab');
    if (newIndex >= 0 && newIndex < tabs.length) {
        showTab(newIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
const modalPlayBtn = document.getElementById('modalSongPlayPause')
const songAudio = new Audio(playBtn.getAttribute('data-song'))

function updatePlayPauseBtns(isPlaying) {
    const textMain = isPlaying ? '⏸️ Pause' : '▶️ Play'
    const textModal = isPlaying ? '⏸️' : '▶️'
    const aria = isPlaying ? 'Pause' : 'Play'
    if (playBtn) {
        playBtn.textContent = textMain
        playBtn.setAttribute('aria-label', aria)
    }
    if (modalPlayBtn) {
        modalPlayBtn.textContent = textModal
        modalPlayBtn.setAttribute('aria-label', aria)
    }
}

function playSong() {
    if (songAudio.paused) {
        try {
            songAudio.play()
            updatePlayPauseBtns(true)
            console.log('Play')
        } catch (err) {
            console.error(err)
        }
    } else {
        songAudio.pause()
        updatePlayPauseBtns(false)
        console.log('Pause')
    }
}

// Volume
const volSlider = document.getElementById('songVolume')
const modalVolSlider = document.getElementById('modalSongVolume')

function adjustVolume(volValue) {
    const value = typeof volValue !== 'undefined' ? volValue : (volSlider ? volSlider.value : 0.8)
    songAudio.volume = value
    localStorage.setItem('songVol', value)

    if (volSlider && volSlider.value !== value) volSlider.value = value
    if (modalVolSlider && modalVolSlider.value !== value) modalVolSlider.value = value
}

// Spacebar toggles play/pause while modal open
document.getElementById('poemDialog').addEventListener('keydown', e => {
    if (e.code === 'Space') {
        e.preventDefault()
        playBtn.click()
    }
})


// Click on images to show them full screen
const modal = document.getElementById("fullscreenImgModal");
const modalImg = document.getElementById("modalImg");
const modalInfo = document.getElementById("modalInfo");
const prevBtn = document.getElementById("modalPrev");
const nextBtn = document.getElementById("modalNext");
const prevChapBtn = document.getElementById("modalPrevChap");
const nextChapBtn = document.getElementById("modalNextChap");

const images = Array.from(document.querySelectorAll("img")).filter(img => img.id !== "modalImg");
let currentImgIndex = 0;

function resizeModalImg() {
    if (!modalImg || !modalImg.naturalWidth) return;
    const intrinsicRatio = modalImg.naturalWidth / modalImg.naturalHeight;
    const windowRatio = window.innerWidth / window.innerHeight;

    // Tightly fit the image to the 95vw / 95vh bounds to maintain the precise click box
    if (intrinsicRatio > windowRatio) {
        modalImg.style.width = '95vw';
        modalImg.style.height = 'auto';
    } else {
        modalImg.style.width = 'auto';
        modalImg.style.height = '95vh';
    }
}

if (modalImg) {
    modalImg.addEventListener('load', resizeModalImg);
    window.addEventListener('resize', resizeModalImg);
}

function getChapterIndexForImage(imgIndex) {
    if (imgIndex < 0 || imgIndex >= images.length) return -1;
    const parentTab = images[imgIndex].closest('.tab');
    if (!parentTab) return -1;
    const tabs = Array.from(document.querySelectorAll('.tab'));
    return tabs.indexOf(parentTab);
}

function updateModalImage(index) {
    if (index < 0 || index >= images.length) return;

    // Set actual image
    modalImg.src = images[index].src;
    resizeModalImg();

    // Determine the chapter info
    if (modalInfo) {
        const tabIndex = getChapterIndexForImage(index);
        if (tabIndex !== -1) {
            const selectOptions = document.getElementById('tab-select').options;
            const chapterName = selectOptions[tabIndex] ? selectOptions[tabIndex].text : "Unknown Chapter";
            modalInfo.textContent = `${chapterName} (Image ${index + 1} of ${images.length})`;
        } else {
            modalInfo.textContent = `Image ${index + 1} of ${images.length}`;
        }
    }

    // Toggle Modal Chapter skip buttons visibility
    if (prevChapBtn && nextChapBtn) {
        const currentChapIndex = getChapterIndexForImage(index);

        let hasPrevChapImg = false;
        for (let i = index - 1; i >= 0; i--) {
            if (getChapterIndexForImage(i) < currentChapIndex) {
                hasPrevChapImg = true;
                break;
            }
        }

        let hasNextChapImg = false;
        for (let i = index + 1; i < images.length; i++) {
            if (getChapterIndexForImage(i) > currentChapIndex) {
                hasNextChapImg = true;
                break;
            }
        }

        prevChapBtn.style.visibility = hasPrevChapImg ? "visible" : "hidden";
        nextChapBtn.style.visibility = hasNextChapImg ? "visible" : "hidden";
    }

    // Sync the background DOM silently to exactly where we are
    const targetImg = images[index];
    const parentTab = targetImg.closest('.tab');
    if (parentTab) {
        const tabs = Array.from(document.querySelectorAll('.tab'));
        const tabIndex = tabs.indexOf(parentTab);
        if (tabIndex !== -1) {
            showTab(tabIndex);
        }
    }
    // Small delay to ensure display: block on the tab is processed before scrolling
    setTimeout(() => {
        targetImg.scrollIntoView({ behavior: 'instant', block: 'center' });
    }, 50);
}

function syncAndCloseModal() {
    modal.style.display = "none";
}

images.forEach((img, index) => {
    img.addEventListener("click", () => {
        currentImgIndex = index;
        modal.style.display = "flex";
        updateModalImage(currentImgIndex);
    });
});

if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentImgIndex = (currentImgIndex - 1 + images.length) % images.length;
        updateModalImage(currentImgIndex);
    });

    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentImgIndex = (currentImgIndex + 1) % images.length;
        updateModalImage(currentImgIndex);
    });
}

if (prevChapBtn && nextChapBtn) {
    prevChapBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const currentChapIndex = getChapterIndexForImage(currentImgIndex);
        let targetImgIndex = -1;

        // Search backwards for the FIRST image of the PREVIOUS chapter
        for (let i = currentImgIndex - 1; i >= 0; i--) {
            const lookChapIndex = getChapterIndexForImage(i);
            if (lookChapIndex < currentChapIndex) {
                // Keep walking backward as long as it matches this previous chapter
                targetImgIndex = i;
                for (let j = i - 1; j >= 0; j--) {
                    if (getChapterIndexForImage(j) === lookChapIndex) {
                        targetImgIndex = j;
                    } else {
                        break;
                    }
                }
                break;
            }
        }

        if (targetImgIndex !== -1) {
            currentImgIndex = targetImgIndex;
            updateModalImage(currentImgIndex);
        }
    });

    nextChapBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const currentChapIndex = getChapterIndexForImage(currentImgIndex);
        let targetImgIndex = -1;

        // Search forwards for the FIRST image of the NEXT chapter
        for (let i = currentImgIndex + 1; i < images.length; i++) {
            if (getChapterIndexForImage(i) > currentChapIndex) {
                targetImgIndex = i;
                break;
            }
        }

        if (targetImgIndex !== -1) {
            currentImgIndex = targetImgIndex;
            updateModalImage(currentImgIndex);
        }
    });
}

// Close modal on click anywhere, except the nav buttons
modal.addEventListener("click", (e) => {
    if (e.target !== prevBtn && e.target !== nextBtn &&
        e.target !== prevChapBtn && e.target !== nextChapBtn &&
        e.target !== modalImg &&
        !e.target.closest('.modal-song-banner')) {
        syncAndCloseModal();
    }
});

// Arrow key navigation
document.addEventListener("keydown", (e) => {
    if (modal.style.display === "flex") {
        if (e.key === "ArrowLeft") {
            prevBtn.click();
        } else if (e.key === "ArrowRight") {
            nextBtn.click();
        } else if (e.key === "Escape") {
            syncAndCloseModal();
        }
    }
});
