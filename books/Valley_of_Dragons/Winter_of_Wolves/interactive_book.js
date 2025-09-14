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
    box.textContent = txt

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
