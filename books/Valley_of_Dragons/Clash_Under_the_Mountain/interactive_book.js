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

songAudio.addEventListener('ended', () => {
    updatePlayPauseBtns(false)
})

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

let modalUiTimeout = null;
let lastAwakenTime = 0;
let isHoveringUi = false;

function resetModalHideTimeout() {
    if (modal.classList.contains('hide-ui')) {
        lastAwakenTime = Date.now();
    }
    modal.classList.remove('hide-ui');

    if (modalUiTimeout) {
        clearTimeout(modalUiTimeout);
    }

    if (isHoveringUi) return;

    modalUiTimeout = setTimeout(() => {
        if (!isHoveringUi) {
            modal.classList.add('hide-ui');
        }
    }, 2800);
}

// Ensure hovered controls block the hide timeout
const uiSelectors = [
    '.slideshow-controls',
    '.modal-song-banner',
    '#modalClose',
    '.modal-chap-nav',
    '.modal-nav-btn'
];

const uiElements = document.querySelectorAll(uiSelectors.join(', '));

uiElements.forEach(el => {
    el.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') {
            isHoveringUi = true;
            resetModalHideTimeout();
        }
    });
    el.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse') {
            isHoveringUi = false;
            resetModalHideTimeout();
        }
    });
});

modal.addEventListener('mousemove', resetModalHideTimeout);
modal.addEventListener('click', resetModalHideTimeout);
modal.addEventListener('touchstart', resetModalHideTimeout, { passive: true });

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

    if (typeof hideGameUI === 'function') hideGameUI();

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

    // Game Integration: check if image is an enemy
    const fightBtn = document.getElementById('fightEnemyBtn');
    if (fightBtn && window.enemyMetadata) {
        const imgSrc = images[index].getAttribute('src');
        if (window.enemyMetadata[imgSrc]) {
            fightBtn.style.display = 'block';
            fightBtn.classList.add('start-animation');
            const newEnemy = window.enemyMetadata[imgSrc];
            if (!window.currentEnemy || window.currentEnemy.name !== newEnemy.name) {
                window.currentEnemy = newEnemy;
                window.bossState = {
                    lives: newEnemy.levelBonus ? 2 : 1,
                    usedMagics: []
                };
            }
        } else {
            fightBtn.style.display = 'none';
        }
    }

    if (typeof resetSlideshowTimer === 'function') resetSlideshowTimer();
}

function startMainSlideshow() {
    // 1. Kick off music if it isn't playing
    if (songAudio && songAudio.paused) {
        playSong();
    }

    // 2. Open the modal explicitly on the very first image
    if (images.length > 0) {
        currentImgIndex = 0;
        lastAwakenTime = Date.now();
        updateModalImage(currentImgIndex);
        modal.style.display = "flex";
        resetModalHideTimeout();

        // 3. Force start the auto-advance interval if not active
        if (!slideshowIntervalId) {
            toggleSlideshow();
        }
    }
}

let slideshowIntervalId = null;
let slideshowIntervalSeconds = 12.0;

function changeSlideshowInterval(delta) {
    slideshowIntervalSeconds += delta;
    if (slideshowIntervalSeconds < 1.0) slideshowIntervalSeconds = 1.0; // min 1s
    if (slideshowIntervalSeconds > 60) slideshowIntervalSeconds = 60; // max 60s

    const display = document.getElementById('slideshowIntervalDisplay');
    if (display) {
        display.textContent = slideshowIntervalSeconds.toFixed(1) + 's';
    }

    // If currently running, restart the interval with the new time
    resetSlideshowTimer();
}

function resetSlideshowTimer() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
        slideshowIntervalId = setInterval(() => {
            const nextArrow = document.getElementById("modalNext");
            if (nextArrow) nextArrow.click();
        }, slideshowIntervalSeconds * 1000);
    }
}

function toggleSlideshow() {
    const btn = document.getElementById('modalSlideshowBtn');
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
        slideshowIntervalId = null;
        if (btn) {
            btn.textContent = '📽️';
            btn.title = 'Start Slideshow';
            btn.style.background = ''; // reset to CSS default
        }
    } else {
        slideshowIntervalId = setInterval(() => {
            const nextArrow = document.getElementById("modalNext");
            if (nextArrow) nextArrow.click();
        }, slideshowIntervalSeconds * 1000);

        if (btn) {
            btn.textContent = '⏹️';
            btn.title = 'Stop Slideshow';
            btn.style.background = 'rgba(217, 83, 79, 0.9)'; // Stand out red so user knows it is active
        }
    }
}

function syncAndCloseModal() {
    modal.style.display = "none";
    if (slideshowIntervalId) {
        // Auto-kill the background process so it doesn't leak memory and jump state around
        toggleSlideshow();
    }
    if (typeof hideGameUI === 'function') hideGameUI();
}

images.forEach((img, index) => {
    img.addEventListener("click", () => {
        currentImgIndex = index;
        lastAwakenTime = Date.now();
        modal.style.display = "flex";
        resetModalHideTimeout();
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
    // Prevent immediate close if we just woke up the UI from hiding, or just opened the modal
    if (Date.now() - lastAwakenTime < 500) return;

    if (e.target !== prevBtn && e.target !== nextBtn &&
        e.target !== prevChapBtn && e.target !== nextChapBtn &&
        e.target !== modalImg &&
        e.target !== document.getElementById('fightEnemyBtn') &&
        !e.target.closest('.modal-song-banner') &&
        !e.target.closest('.slideshow-controls') &&
        !e.target.closest('#gameUIContainer')) {
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

/* --- GAME LOGIC --- */
window.enemyMetadata = null;
window.currentEnemy = null;
window.playerAttack = { magic: null, strength: null, strengthPts: 0 };
window.playerEnergy = parseInt(localStorage.getItem('playerEnergy')) || 5;
window.bossState = { lives: 0, usedMagics: [] };

const magicCounters = {
    'Water': ['Fire'],
    'Fire': ['Trees', 'Darkness'],
    'Trees': ['Earth'],
    'Earth': ['Lightning'],
    'Lightning': ['Water'],
    'Sun': ['Wind', 'Undead'],
    'Wind': ['Sun'],
    'Lifeforce': ['Undead', 'Darkness']
};

async function loadEnemyMetadata() {
    try {
        const res = await fetch('enemy_metadata.json');
        if (res.ok) {
            window.enemyMetadata = await res.json();
            console.log("Enemy metadata loaded");
        }
    } catch (e) {
        // No metadata, not a big deal
    }
}
loadEnemyMetadata();

function showGameUI() {
    if (!window.currentEnemy) return;

    if (window.playerEnergy <= 0) {
        alert("You have no energy left to fight! Refresh the page to restore energy.");
        return;
    }

    const pauseBtn = document.getElementById('modalSlideshowBtn');
    if (pauseBtn && pauseBtn.textContent === '⏹️') pauseBtn.click();

    document.getElementById('enemyName').textContent = window.currentEnemy.name;
    const enemyMagics = Array.isArray(window.currentEnemy.magicType) ? window.currentEnemy.magicType : [window.currentEnemy.magicType];
    const defaultConfig = {
        givesBonus: enemyMagics.map(() => true),
        givesWeakness: enemyMagics.map(() => true)
    };
    const config = window.currentEnemy.magicConfig || defaultConfig;
    
    const formattedTypes = enemyMagics.map((type, idx) => {
        const b = config.givesBonus[idx];
        const w = config.givesWeakness[idx];
        if (b && !w) return type + ' (ATK)';
        if (!b && w) return type + ' (VULN)';
        if (!b && !w) return type + ' (PASSIVE)';
        return type;
    });
    
    const magicBadgeContainer = document.getElementById('enemyMagicBadges');
    if (magicBadgeContainer) {
        magicBadgeContainer.innerHTML = '';
        enemyMagics.forEach((type, idx) => {
            const b = config.givesBonus[idx];
            const w = config.givesWeakness[idx];
            let tooltip = "";
            let label = type;

            if (b && w) {
                tooltip = `${type}: Provides offensive counters and is vulnerable to elemental counters.`;
            } else if (b && !w) {
                label += " (ATK)";
                tooltip = `${type}: Provides offensive counters but has NO elemental weakness.`;
            } else if (!b && w) {
                label += " (VULN)";
                tooltip = `${type}: No offensive counters but is vulnerable to elemental counters.`;
            } else {
                label += " (PASSIVE)";
                tooltip = `${type}: Purely passive element with no combat modifiers.`;
            }

            const span = document.createElement('span');
            span.className = 'stat-badge magic-badge';
            span.textContent = label;
            span.title = tooltip;
            magicBadgeContainer.appendChild(span);
        });
    }
    document.getElementById('enemyPhysicality').textContent = window.currentEnemy.physicality;

    const bossBadge = document.getElementById('enemyLevelBadge');
    if (bossBadge) {
        if (window.currentEnemy.levelBonus) {
            bossBadge.style.display = 'inline-block';
            let hearts = '';
            if (window.bossState) {
                for(let i=0; i<window.bossState.lives; i++) hearts +='♥️';
            }
            bossBadge.textContent = 'Boss (+' + window.currentEnemy.levelBonus + ') ' + hearts;
        } else {
            bossBadge.style.display = 'none';
        }
    }

    document.getElementById('playerEnergyCount').textContent = `🧡 ${window.playerEnergy}`;

    document.querySelectorAll('.magic-btn').forEach(btn => {
        btn.classList.remove('selected', 'is-counter', 'is-threatened');
        const magicType = btn.dataset.magic;
        
        // Strategic Highlighting: highlight if this magic counters the enemy's weakness (Blue Pulse)
        let isStrategic = false;
        if (config.givesWeakness) {
            for (let i = 0; i < enemyMagics.length; i++) {
                if (config.givesWeakness[i] && magicCounters[magicType] && magicCounters[magicType].includes(enemyMagics[i])) {
                    btn.classList.add('is-counter');
                    isStrategic = true;
                    break;
                }
            }
        }

        // Threat Highlighting: highlight if this magic is countered by the enemy's bonus (Red Pulse)
        // Only mark as threatened if it wasn't already marked as strategic (to avoid animation conflicts)
        if (!isStrategic && config.givesBonus) {
            for (let i = 0; i < enemyMagics.length; i++) {
                if (config.givesBonus[i] && magicCounters[enemyMagics[i]] && magicCounters[enemyMagics[i]].includes(magicType)) {
                    btn.classList.add('is-threatened');
                    break;
                }
            }
        }

        // Handle used magics for bosses
        if (window.bossState && window.bossState.usedMagics && window.bossState.usedMagics.includes(magicType)) {
            btn.disabled = true;
            btn.style.opacity = '0.3';
            btn.style.cursor = 'not-allowed';
            btn.title = "Magic exhausted against this boss!";
        } else {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.title = "";
        }
    });

    document.querySelectorAll('.strength-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('executeAttackBtn').disabled = true;

    document.querySelector('.game-ui-panel').style.display = 'flex';
    document.getElementById('battleResult').style.display = 'none';
    document.getElementById('gameUIContainer').style.display = 'flex';
}

function hideGameUI() {
    document.getElementById('gameUIContainer').style.display = 'none';
    document.getElementById('battleResult').style.display = 'none';
    const guide = document.getElementById('matchupGuideOverlay');
    if (guide) guide.style.display = 'none';
    const info = document.getElementById('enemyInfoOverlay');
    if (info) info.style.display = 'none';
}

function selectMagic(magicType, btnEl) {
    window.playerAttack.magic = magicType;
    document.querySelectorAll('.magic-btn').forEach(btn => btn.classList.remove('selected'));
    btnEl.classList.add('selected');
    checkAttackReady();
}

function selectStrength(strengthStr, btnEl) {
    window.playerAttack.strength = strengthStr;
    if (strengthStr === 'Light') window.playerAttack.strengthPts = 1;
    if (strengthStr === 'Medium') window.playerAttack.strengthPts = 2;
    if (strengthStr === 'Heavy') window.playerAttack.strengthPts = 3;

    document.querySelectorAll('.strength-btn').forEach(btn => btn.classList.remove('selected'));
    btnEl.classList.add('selected');
    checkAttackReady();
}

function checkAttackReady() {
    if (window.playerAttack.magic && window.playerAttack.strength) {
        document.getElementById('executeAttackBtn').disabled = false;
    }
}

function executeAttack() {
    const enemy = window.currentEnemy;
    const player = window.playerAttack;

    let heavyCostText = '';
    if (player.strength === 'Heavy') {
        window.playerEnergy = Math.max(0, window.playerEnergy - 1);
        heavyCostText = ' (Cost 1 energy for Heavy)';
    }

    let enemyPts = 0;
    if (enemy.physicality === 'Light') enemyPts = 1;
    else if (enemy.physicality === 'Medium') enemyPts = 2;
    else if (enemy.physicality === 'Heavy') enemyPts = 3;

    if (enemy.levelBonus) enemyPts += enemy.levelBonus;

    let playerPts = player.strengthPts;

    // Check type advantages
    const enemyMagics = Array.isArray(enemy.magicType) ? enemy.magicType : [enemy.magicType];
    const defaultConfig = {
        strengthsCompound: true,
        weaknessesCompound: true,
        givesBonus: enemyMagics.map(() => true),
        givesWeakness: enemyMagics.map(() => true)
    };
    const config = enemy.magicConfig || defaultConfig;

    if (magicCounters[player.magic]) {
        for (let i = 0; i < enemyMagics.length; i++) {
            if (config.givesWeakness[i] && magicCounters[player.magic].includes(enemyMagics[i])) {
                playerPts += 2;
                if (!config.weaknessesCompound) break;
            }
        }
    }
    
    for (let i = 0; i < enemyMagics.length; i++) {
        const em = enemyMagics[i];
        if (config.givesBonus[i] && magicCounters[em] && magicCounters[em].includes(player.magic)) {
            enemyPts += 2;
            if (!config.strengthsCompound) break;
        }
    }

    const resOver = document.getElementById('battleResult');
    const title = document.getElementById('resultTitle');
    const details = document.getElementById('resultDetails');

    document.querySelector('.game-ui-panel').style.display = 'none';
    resOver.style.display = 'flex';
    title.classList.remove('victory', 'defeat');

    // Record the used magic if fighting a boss
    if (window.bossState && window.bossState.lives > 0) {
        if (!window.bossState.usedMagics.includes(player.magic)) {
            window.bossState.usedMagics.push(player.magic);
        }
    }

    if (playerPts > enemyPts) {
        if (window.bossState && window.bossState.lives > 1) {
            window.bossState.lives -= 1;
            title.textContent = 'Hit!';
            title.classList.add('victory');
            details.textContent = `Your ${player.strength} ${player.magic} attack (${playerPts} pts) weakened the ${enemy.name}! It has 1 life remaining!${heavyCostText}`;
        } else {
            const energyReward = 1 + ((enemy.levelBonus || 0) * 2);
            window.playerEnergy += energyReward;
            title.textContent = 'Victory!';
            title.classList.add('victory');
            details.textContent = `Your ${player.strength} ${player.magic} attack (${playerPts} pts) overpowered the ${enemy.name}'s defense (${enemyPts} pts)! You gained ${energyReward} energy!${heavyCostText}`;
            if (window.bossState) window.bossState.lives = 0;
        }
    } else if (playerPts === enemyPts) {
        title.textContent = 'Draw.';
        title.classList.add('victory');
        details.textContent = `Your ${player.strength} ${player.magic} attack (${playerPts} pts) matched the ${enemy.name}'s defense (${enemyPts} pts). You escaped unharmed.${heavyCostText}`;
    } else {
        const diff = enemyPts - playerPts;
        const energyLost = diff >= 2 ? 2 : 1;
        window.playerEnergy = Math.max(0, window.playerEnergy - energyLost);

        title.textContent = 'Defeat!';
        title.classList.add('defeat');
        details.textContent = `Your ${player.strength} ${player.magic} attack (${playerPts} pts) wasn't strong enough against the ${enemy.name}'s defense (${enemyPts} pts)! You lost ${energyLost} energy point(s).${heavyCostText}`;
        
        // Reset the boss fight on defeat
        if (window.bossState) {
            window.bossState.lives = enemy.levelBonus ? 2 : 1;
            window.bossState.usedMagics = [];
        }
    }

    document.getElementById('playerEnergyCount').textContent = `🧡 ${window.playerEnergy}`;
    localStorage.setItem('playerEnergy', window.playerEnergy);
}

function continueBossFight() {
    if (window.bossState && window.bossState.lives > 0) {
        showGameUI();
    } else {
        hideGameUI();
        document.getElementById('fightEnemyBtn').style.display = 'none';
        window.currentEnemy = null;
    }
}

let magicCircleInitialized = false;

function toggleMatchupGuide() {
    const guideOverlay = document.getElementById('matchupGuideOverlay');
    if (!guideOverlay) return;
    
    const isShowing = (guideOverlay.style.display === 'none' || !guideOverlay.style.display);
    
    if (isShowing) {
        guideOverlay.style.display = 'flex';
        if (!magicCircleInitialized) {
            initMagicCircle();
            magicCircleInitialized = true;
        }
    } else {
        guideOverlay.style.display = 'none';
    }
}

function initMagicCircle() {
    const container = document.getElementById('magicNodesContainer');
    const svg = document.getElementById('magicCircleSvg');
    if (!container || !svg) return;

    const nodes = [
        { id: 'Water', label: 'Water', emoji: '💧' },
        { id: 'Fire', label: 'Fire', emoji: '🔥' },
        { id: 'Trees', label: 'Trees', emoji: '🌳' },
        { id: 'Earth', label: 'Earth', emoji: '⛰️' },
        { id: 'Lightning', label: 'Storm', emoji: '⚡' },
        { id: 'Sun', label: 'Sun', emoji: '☀️' },
        { id: 'Wind', label: 'Wind', emoji: '💨' },
        { id: 'Lifeforce', label: 'Life', emoji: '✨' },
        { id: 'Darkness', label: 'Shadow', emoji: '🌑' },
        { id: 'Undead', label: 'Undead', emoji: '💀' }
    ];

    const centerX = 50, centerY = 50, radius = 35;
    const nodeElements = {};

    // Create markers for arrows
    svg.innerHTML = `
        <defs>
            <marker id="arrowhead-default" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="rgba(255, 255, 255, 1.0)" />
            </marker>
            <marker id="arrowhead-out" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#22c55e" />
            </marker>
            <marker id="arrowhead-in" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#ef4444" />
            </marker>
        </defs>
    `;

    // Position nodes
    nodes.forEach((node, i) => {
        const angle = (i * (360 / nodes.length) - 90) * (Math.PI / 180);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const el = document.createElement('div');
        el.className = 'magic-node';
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.dataset.id = node.id;
        el.innerHTML = `<span class="node-emoji">${node.emoji}</span><span class="node-label">${node.label}</span>`;
        
        container.appendChild(el);
        nodeElements[node.id] = { x, y, el };
    });

    // Calculate points with a slight offset from center to end perfectly at node edge
    // Since we use a 100x100 viewBox, we need the node radius in percentage units
    const nodeEl = container.querySelector('.magic-node');
    const containerWidth = container.offsetWidth || 500;
    const nodeWidth = nodeEl ? nodeEl.offsetWidth : 60;
    const dynamicOffset = (nodeWidth / 2 / containerWidth) * 100;
    const arrowMargin = 0.5; // Small gap so arrow doesn't touch the circle border
    const offset = dynamicOffset + arrowMargin;

    // Draw lines
    const arrows = [];
    Object.entries(magicCounters).forEach(([sourceId, targets]) => {
        const source = nodeElements[sourceId];
        if (!source) return;

        targets.forEach(targetId => {
            const target = nodeElements[targetId];
            if (!target) return;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'matchup-arrow');
            path.dataset.source = sourceId;
            path.dataset.target = targetId;
            
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            const x1 = source.x + (dx * offset / dist);
            const y1 = source.y + (dy * offset / dist);
            const x2 = target.x - (dx * offset / dist);
            const y2 = target.y - (dy * (offset + 1.2) / dist); // slightly more offset for arrowhead tip

            path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
            svg.appendChild(path);
            arrows.push(path);
        });
    });

    // Handle responsiveness on orientation change
    window.addEventListener('resize', () => {
        if (document.getElementById('matchupGuideOverlay').style.display === 'flex') {
            // Recalculate offsets on significant resize
            const newContainerWidth = container.offsetWidth;
            const newNodeWidth = nodeEl.offsetWidth;
            const newOffset = (newNodeWidth / 2 / newContainerWidth) * 100 + arrowMargin;
            
            arrows.forEach(arrow => {
                const s = nodeElements[arrow.dataset.source];
                const t = nodeElements[arrow.dataset.target];
                const dxx = t.x - s.x;
                const dyy = t.y - s.y;
                const d = Math.sqrt(dxx*dxx + dyy*dyy);
                
                const nx1 = s.x + (dxx * newOffset / d);
                const ny1 = s.y + (dyy * newOffset / d);
                const nx2 = t.x - (dxx * newOffset / d);
                const ny2 = t.y - (dyy * (newOffset + 1.2) / d);
                
                arrow.setAttribute('d', `M ${nx1} ${ny1} L ${nx2} ${ny2}`);
            });
        }
    }, { passive: true });

    // Interaction
    const circleContainer = document.getElementById('magicCircleContainer');
    
    Object.values(nodeElements).forEach(nodeData => {
        const el = nodeData.el;
        const id = el.dataset.id;

        el.addEventListener('mouseenter', () => {
            circleContainer.classList.add('has-active');
            el.classList.add('active');
            
            const targetsOut = magicCounters[id] || [];
            const targetsIn = Object.entries(magicCounters)
                .filter(([s, t]) => t.includes(id))
                .map(([s, t]) => s);

            arrows.forEach(arrow => {
                if (arrow.dataset.source === id) {
                    arrow.classList.add('is-outgoing');
                    nodeElements[arrow.dataset.target].el.classList.add('is-target-out');
                } else if (arrow.dataset.target === id) {
                    arrow.classList.add('is-incoming');
                    nodeElements[arrow.dataset.source].el.classList.add('is-target-in');
                } else {
                    arrow.classList.add('dimmed');
                }
            });
        });

        el.addEventListener('mouseleave', () => {
            circleContainer.classList.remove('has-active');
            el.classList.remove('active');
            
            arrows.forEach(arrow => {
                arrow.classList.remove('is-outgoing', 'is-incoming', 'dimmed');
            });
            
            Object.values(nodeElements).forEach(n => {
                n.el.classList.remove('is-target-out', 'is-target-in');
            });
        });
    });
}

function toggleEnemyInfo(show) {
    const overlay = document.getElementById('enemyInfoOverlay');
    if (!overlay) return;
    
    if (show) {
        const enemy = window.currentEnemy;
        const infoTitle = document.getElementById('infoEnemyName');
        const infoContent = document.getElementById('enemyInfoContent');
        
        infoTitle.textContent = enemy.name;
        
        const enemyMagics = Array.isArray(enemy.magicType) ? enemy.magicType : [enemy.magicType];
        const defaultConfig = {
            strengthsCompound: true,
            weaknessesCompound: true,
            givesBonus: enemyMagics.map(() => true),
            givesWeakness: enemyMagics.map(() => true)
        };
        const config = enemy.magicConfig || defaultConfig;

        let html = '';

        if (enemy.description) {
            html += `<div class="dossier-lore">${enemy.description}</div>`;
        }

        // Stats Grid
        html += `<div class="dossier-grid">
            <div class="dossier-stat-card">
                <span class="dossier-label">🛡️ Physicality</span>
                <span class="dossier-value">${enemy.physicality}</span>
            </div>
            <div class="dossier-stat-card">
                <span class="dossier-label">⭐ Power Level</span>
                <span class="dossier-value">${enemy.levelBonus ? `Boss (Lvl +${enemy.levelBonus})` : 'Normal'}</span>
            </div>
        </div>`;

        // Magical Nature section
        html += `<div class="dossier-section">
            <div class="dossier-section-title">Elemental Types</div>
            <div class="dossier-badges-list">`;
        
        enemyMagics.forEach((type, idx) => {
            const b = config.givesBonus[idx];
            const w = config.givesWeakness[idx];
            let roles = [];
            if (b) roles.push("Offense");
            if (w) roles.push("Weakness");
            if (!b && !w) roles.push("None");
            
            html += `<div class="dossier-badge-row">
                <span class="stat-badge magic-badge">${type}</span>
                <span class="dossier-badge-role">${roles.join(" & ")}</span>
            </div>`;
        });
        html += `</div></div>`;

        // Combat Rules section
        html += `<div class="dossier-section">
            <div class="dossier-section-title">Interaction Rules</div>
            <div class="dossier-rules-box">
                <div class="rule-pill ${config.weaknessesCompound ? 'active' : 'inactive'}">
                    <span>Stacking Weakness</span>
                    <span class="rule-toggle">${config.weaknessesCompound ? 'YES' : 'NO'}</span>
                </div>
                <div class="rule-pill ${config.strengthsCompound ? 'active' : 'inactive'}">
                    <span>Stacking Offense</span>
                    <span class="rule-toggle">${config.strengthsCompound ? 'YES' : 'NO'}</span>
                </div>
            </div>
        </div>`;

        infoContent.innerHTML = html;
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}
