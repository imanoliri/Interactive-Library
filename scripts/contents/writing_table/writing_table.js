const charsToIgnore = [" ", ",", "-", "—", ";", ".", "'", "`", "´"];
let wordCount = {};
let words = [];
let speakLettersWhenDropped = true;
let speakWhenCorrectSolution = true;
let numberOfColumns = 8;
let selectedLetter = null;

async function fetchwWordCount() {
    try {
        const response = await fetch('./../../interactive_book_word_count.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        wordCount = await response.json();
    } catch (error) {
        console.error("Error fetching word counts:", error);
    }
}

const vowels = ['A', 'E', 'I', 'O', 'U'];
const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

document.addEventListener('DOMContentLoaded', () => {
    fetchwWordCount().then(createTable);
});

function createTable() {
    const grid = document.querySelector(".grid");
    grid.innerHTML = ""; // Clear existing grid

    document.getElementById("checkSpeakLettersWhenDropped").checked = speakLettersWhenDropped;
    document.getElementById("checkSpeakWordsWhenCorrect").checked = speakWhenCorrectSolution;
    
    document.getElementById("checkSpeakLettersWhenDropped").addEventListener('change', (e) => speakLettersWhenDropped = e.target.checked);
    document.getElementById("checkSpeakWordsWhenCorrect").addEventListener('change', (e) => speakWhenCorrectSolution = e.target.checked);

    numberOfColumns = 8;
    words = getWordsForGrid(Object.keys(wordCount).map(cleanWord), 6); // 6 is word area width

    // Render Vowels Row
    const trash = document.createElement("div");
    trash.className = "delete-cell";
    trash.innerHTML = "🗑️";
    trash.draggable = true;
    trash.title = "Drag me to clear content";
    grid.appendChild(trash);

    vowels.forEach(v => {
        const div = document.createElement("div");
        div.className = "letter vowel";
        div.draggable = true;
        div.textContent = v;
        grid.appendChild(div);
    });

    const wordsHeading = document.createElement("div");
    wordsHeading.className = "heading";
    wordsHeading.textContent = "Words";
    grid.appendChild(wordsHeading);

    const empty = document.createElement("div");
    empty.className = "heading"; // Just empty space
    grid.appendChild(empty);

    // Render Consonant Rows
    const backwardConsonants = [...consonants].reverse();
    
    consonants.forEach((c, i) => {
        // Leading Consonant
        const lead = document.createElement("div");
        lead.className = "letter";
        lead.draggable = true;
        lead.textContent = c;
        grid.appendChild(lead);

        // 5 Droppable Cells
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement("div");
            cell.className = "droppable";
            grid.appendChild(cell);
        }

        // Word Input
        const input = document.createElement("input");
        input.type = "text";
        input.className = "word-input";
        input.placeholder = "Type word";
        grid.appendChild(input);

        // Trailing Consonant (Backward)
        const trail = document.createElement("div");
        trail.className = "letter";
        trail.draggable = true;
        trail.textContent = backwardConsonants[i] || "";
        grid.appendChild(trail);
    });

    addListenersAndRender();
}

function addListenersAndRender() {
    const letters = document.querySelectorAll(".letter, .delete-cell");
    letters.forEach(l => {
        l.addEventListener("dragstart", drag);
        l.addEventListener("click", handleClickLetter);
    });

    const droppables = document.querySelectorAll(".droppable");
    droppables.forEach(d => {
        d.addEventListener("dragover", allowDrop);
        d.addEventListener("dragenter", handleDragEnter);
        d.addEventListener("dragleave", handleDragLeave);
        d.addEventListener("drop", drop);
        d.addEventListener("click", handleClickCell);
        d.addEventListener("dblclick", handleDoubleClick);
    });

    const inputs = document.querySelectorAll(".word-input");
    inputs.forEach(input => {
        input.addEventListener("input", (e) => checkMatch(e.target));
    });

    fillTextBoxes();
}

function speak(text) {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Try to find a female voice
    const femaleVoice = voices.find(v => 
        (v.name.toLowerCase().includes('female') || 
         v.name.includes('Samantha') || 
         v.name.includes('Zira') ||
         v.name.includes('Google US English')) && 
        v.lang.startsWith('en')
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    window.speechSynthesis.speak(utterance);
}

// Function to check for matches
function checkMatch(input) {
    input.value = input.value.toUpperCase();
    
    // In the new 8-column grid, we need to find the 5 droppable cells before the input
    let current = input.previousElementSibling;
    const rowCells = [];
    
    for (let i = 0; i < 5; i++) {
        if (current && current.classList.contains("droppable")) {
            rowCells.unshift(current.textContent);
        }
        current = current.previousElementSibling;
    }

    const constructedWord = rowCells.join("");

    if (constructedWord !== "" && constructedWord === input.value) {
        input.classList.add("match");
        if (speakWhenCorrectSolution) speak(constructedWord);
    } else {
        input.classList.remove("match");
    }
}

function fillTextBoxes() {
    const inputs = document.querySelectorAll(".word-input");
    const validWords = words.filter(w => w.length <= 5);
    const shuffled = validWords.sort(() => 0.5 - Math.random()).slice(0, inputs.length);

    shuffled.forEach((word, index) => {
        if (inputs[index]) inputs[index].value = word.toUpperCase();
    });
}

// Rest of the helper functions
function drag(ev) {
    if (ev.target.classList.contains("delete-cell")) {
        ev.dataTransfer.setData("text", "");
    } else {
        ev.dataTransfer.setData("text", ev.target.textContent);
    }
}

function allowDrop(ev) { ev.preventDefault(); }

function handleDragEnter(ev) {
    ev.preventDefault();
    if (ev.target.classList.contains("droppable")) ev.target.classList.add("drag-over");
}

function handleDragLeave(ev) {
    ev.target.classList.remove("drag-over");
}

function drop(ev) {
    ev.preventDefault();
    ev.target.classList.remove("drag-over");
    const data = ev.dataTransfer.getData("text");
    
    if (speakLettersWhenDropped) speak(data);

    ev.target.textContent = data;
    if (data !== "") {
        ev.target.style.transform = "scale(1.1)";
        setTimeout(() => ev.target.style.transform = "scale(1)", 100);
    }

    // Check match for this row
    let input = ev.target.nextElementSibling;
    while (input && !input.classList.contains("word-input")) {
        input = input.nextElementSibling;
    }
    if (input) checkMatch(input);
}

function handleClickLetter(ev) {
    if (selectedLetter) selectedLetter.classList.remove("selected");
    selectedLetter = ev.target;
    selectedLetter.classList.add("selected");
}

function handleClickCell(ev) {
    if (selectedLetter) {
        const text = selectedLetter.classList.contains("delete-cell") ? "" : selectedLetter.textContent;
        ev.target.textContent = text;
        if (speakLettersWhenDropped) speak(text);
        
        selectedLetter.classList.remove("selected");
        selectedLetter = null;

        let input = ev.target.nextElementSibling;
        while (input && !input.classList.contains("word-input")) {
            input = input.nextElementSibling;
        }
        if (input) checkMatch(input);
    }
}

function handleDoubleClick(ev) {
    ev.target.textContent = "";
    let input = ev.target.nextElementSibling;
    while (input && !input.classList.contains("word-input")) {
        input = input.nextElementSibling;
    }
    if (input) checkMatch(input);
}

function clearAllCells() {
    document.querySelectorAll(".droppable").forEach(c => c.textContent = "");
    document.querySelectorAll(".word-input").forEach(i => i.classList.remove("match"));
}

function getWordsForGrid(words, maxLength) {
    return words.filter(word => word.length <= maxLength);
}

function cleanWord(word) {
    return charsToIgnore.reduce((cleanedWord, sep) => {
        return cleanedWord.replace(new RegExp(`\\${sep}`, 'g'), '');
    }, word).toLowerCase();
}
