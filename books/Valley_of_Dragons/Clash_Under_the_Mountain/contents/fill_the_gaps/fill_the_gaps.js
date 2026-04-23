let paragraphs = [];
let currentPara = "";
let gaps = [];
let numGaps = 3;

async function fetchParagraphs() {
    try {
        const response = await fetch('./../../interactive_book_parapragh_texts.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        paragraphs = await response.json();
        // Filter out very short paragraphs
        paragraphs = paragraphs.filter(p => p.split(' ').length > 15);
    } catch (error) {
        console.error("Error fetching paragraphs:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('gap-slider');
    const gapCount = document.getElementById('gap-count');
    
    slider.addEventListener('input', () => {
        numGaps = parseInt(slider.value, 10);
        gapCount.textContent = numGaps;
        initGame();
    });

    document.getElementById('tab-gaps').addEventListener('click', () => switchTab('gaps'));
    document.getElementById('tab-solution').addEventListener('click', () => switchTab('solution'));
    
    document.getElementById('next-button').addEventListener('click', initGame);

    fetchParagraphs().then(initGame);
});

function initGame() {
    if (paragraphs.length === 0) return;
    
    // Reset buttons
    const nextBtn = document.getElementById('next-button');
    nextBtn.classList.remove('solved');
    nextBtn.textContent = "Next Story";

    currentPara = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    createGaps();
    switchTab('gaps');
}

function createGaps() {
    const rawWords = currentPara.split(' ');
    gaps = [];
    
    // Logic: find words at least 4 chars long to hide
    const eligibleIndices = [];
    rawWords.forEach((w, i) => {
        if (w.length >= 4 && !w.includes('<')) eligibleIndices.push(i);
    });
    
    // Pick random indices
    const selectedIndices = [];
    const available = [...eligibleIndices];
    for (let i = 0; i < Math.min(numGaps, available.length); i++) {
        const randIdx = Math.floor(Math.random() * available.length);
        selectedIndices.push(available.splice(randIdx, 1)[0]);
    }
    
    selectedIndices.sort((a,b) => a - b);
    
    let displayPara = "";
    let solutionPara = "";
    
    rawWords.forEach((w, i) => {
        if (selectedIndices.includes(i)) {
            const cleanWord = w.replace(/[.,!?;:]/g, "");
            const punct = w.substring(cleanWord.length);
            gaps.push(cleanWord.toLowerCase());
            
            // Build the input for the puzzle
            displayPara += `<input type="text" class="gap-input" data-index="${gaps.length - 1}" data-answer="${cleanWord.toLowerCase()}" style="width: ${cleanWord.length + 1}ch">${punct} `;
            
            // Build the highlighted span for the solution
            solutionPara += `<span class="snippet-reveal">${cleanWord}</span>${punct} `;
        } else {
            displayPara += w + " ";
            solutionPara += w + " ";
        }
    });
    
    document.getElementById('paragraph').innerHTML = displayPara;
    document.getElementById('full-paragraph').innerHTML = solutionPara;

    // Add real-time feedback
    const inputs = document.querySelectorAll('.gap-input');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            const answer = e.target.dataset.answer;
            if (val === "") {
                e.target.className = "gap-input";
            } else if (val === answer) {
                e.target.classList.add('correct');
                e.target.classList.remove('wrong');
            } else if (answer.startsWith(val)) {
                e.target.className = "gap-input";
            } else {
                e.target.classList.add('wrong');
                e.target.classList.remove('correct');
            }
            checkProgress();
        });
    });

    // Focus on the first word
    if (inputs[0]) inputs[0].focus();
}

function checkProgress() {
    const inputs = document.querySelectorAll('.gap-input');
    let allCorrect = true;
    
    inputs.forEach(input => {
        if (input.value.trim().toLowerCase() !== input.dataset.answer) {
            allCorrect = false;
        }
    });
    
    if (allCorrect) {
        const nextBtn = document.getElementById('next-button');
        nextBtn.classList.add('solved');
        nextBtn.textContent = "Victory! Next Story";
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.id === `tab-${tabId}`);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}-content`);
    });
}