async function fetchwWordCount() {
    try {
        const response = await fetch('./../../interactive_book_word_count.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        wordCount = await response.json();
        console.log("Word counts fetched:", wordCount);
        words = Object.keys(wordCount);

    } catch (error) {
        console.error("Error fetching word counts:", error);
    }
}


const charsToIgnore = [" ", ",", "-", "—", ";", ".", "'", "`", "´"];
let wordCount
let words
let currentWord = "";
let anagramWord = "";
let successTimeout = null;


document.addEventListener('DOMContentLoaded', () => {
    fetchwWordCount().then(createAnagram);
});


function createAnagram() {
    const input = document.getElementById('guess');
    const nextBtn = document.getElementById('next');
    const reshuffleBtn = document.getElementById('reshuffle');
    
    // Event listeners
    input.addEventListener('input', checkGuess);
    
    nextBtn.addEventListener('click', (e) => {
        if (e.pointerType === "" && !e.detail && e.screenX === 0) return; 
        selectNewWord();
    });

    if (reshuffleBtn) {
        reshuffleBtn.addEventListener('click', () => {
            reshuffleCurrentWord();
        });
    }

    // QOL: Enter for next, and autofocus keys
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            selectNewWord();
        } else if (e.key.toLowerCase() === 'r' && document.activeElement !== input) {
            reshuffleCurrentWord();
        } else if (document.activeElement !== input && e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
            input.focus();
        }
    });

    // Check for persisted word
    const saved = sessionStorage.getItem('anagram_current');
    const savedAnagram = sessionStorage.getItem('anagram_shuffled');
    
    if (saved && savedAnagram && words.includes(saved)) {
        currentWord = saved;
        anagramWord = savedAnagram;
        document.getElementById('anagram').textContent = anagramWord;
        input.focus();
    } else {
        // Initialize the first word
        selectNewWord();
    }
}


// Function to shuffle letters to create an anagram
function shuffle(word) {
    if (!word) return "";
    let shuffled = word.split('').sort(() => 0.5 - Math.random()).join('');
    if (shuffled === word && word.length > 1) return shuffle(word);
    return shuffled;
}

// Function to reshuffle the current word
function reshuffleCurrentWord() {
    if (!currentWord) return;
    anagramWord = shuffle(currentWord);
    sessionStorage.setItem('anagram_shuffled', anagramWord); // persist reshuffle
    document.getElementById('anagram').textContent = anagramWord;
    const input = document.getElementById('guess');
    if (!input.disabled) {
        input.focus();
    }
}

// Function to select a new word and create an anagram
function selectNewWord() {
    if (successTimeout) {
        clearTimeout(successTimeout);
        successTimeout = null;
    }

    if (!words || words.length === 0) return;
    
    currentWord = words[Math.floor(Math.random() * words.length)];
    anagramWord = shuffle(currentWord);
    
    // Persist
    sessionStorage.setItem('anagram_current', currentWord);
    sessionStorage.setItem('anagram_shuffled', anagramWord);

    document.getElementById('anagram').textContent = anagramWord;
    
    const input = document.getElementById('guess');
    input.value = "";
    input.className = "";
    input.disabled = false;
    input.focus(); // QOL: Autofocus
}

// Function to check if the user's guess is correct
function checkGuess() {
    const input = document.getElementById('guess');
    const guess = cleanWord(input.value);
    const correct = cleanWord(currentWord);

    if (guess === "") {
        input.className = "";
    } else if (guess === correct) {
        // Clear persistence on success
        sessionStorage.removeItem('anagram_current');
        sessionStorage.removeItem('anagram_shuffled');

        input.className = "correct";
        input.disabled = true;
        successTimeout = setTimeout(selectNewWord, 1500); 
    } else if (correct.startsWith(guess)) {
        input.className = "partial"; 
    } else {
        input.className = "wrong";
    }
}

function cleanWord(word) {
    if (!word) return "";
    return charsToIgnore.reduce((cleanedWord, sep) => {
        return cleanedWord.replace(new RegExp(`\\${sep}`, 'g'), '');
    }, word).toLowerCase().trim();
}
