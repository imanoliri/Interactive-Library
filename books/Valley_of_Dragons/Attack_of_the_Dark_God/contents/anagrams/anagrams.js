async function fetchwWordCount() {
    try {
        const response = await fetch('./../../interactive_book_word_count.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        wordCount = await response.json();
        words = Object.keys(wordCount);
    } catch (error) {
        console.error("Error fetching word counts:", error);
    }
}

const charsToIgnore = [" ", ",", "-", "—", ";", ".", "'", "`", "´"];
let wordCount;
let words;
let currentWord = "";
let anagramWord = "";
let score = parseInt(localStorage.getItem('anagram_score') || '0', 10);
let streak = 0;
let hintIndex = 0;
let isAnswered = false;

document.addEventListener('DOMContentLoaded', () => {
    fetchwWordCount().then(init);
});

function init() {
    document.getElementById('guess').addEventListener('input', checkGuess);
    document.getElementById('next').addEventListener('click', selectNewWord);
    document.getElementById('hint').addEventListener('click', giveHint);
    
    // Keyboard shortcuts and Auto-focus
    document.addEventListener('keydown', (e) => {
        const input = document.getElementById('guess');
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        // Enter key always triggers Next
        if (e.key === 'Enter') {
            e.preventDefault();
            selectNewWord();
            return;
        }

        // Auto-focus input when the user types a letter (if not already focused)
        if (
            document.activeElement !== input && 
            e.key.length === 1 &&
            e.key.match(/[a-zA-Z]/)
        ) {
            input.focus();
        }
    });

    // Update score display
    updateStats();
    
    selectNewWord();
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    localStorage.setItem('anagram_score', score);
}

function shuffle(word) {
    const arr = word.split('');
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const result = arr.join('');
    // Ensure we don't return the same word
    if (result === word && word.length > 1) return shuffle(word);
    return result;
}

function selectNewWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    anagramWord = shuffle(currentWord);
    
    const display = document.getElementById('anagram');
    display.textContent = anagramWord;
    display.classList.remove('new-word');
    void display.offsetWidth; // trigger reflow
    display.classList.add('new-word');
    
    document.getElementById('guess').value = "";
    document.getElementById('guess').className = "";
    document.getElementById('guess').disabled = false;
    document.getElementById('guess').focus();
    
    hintIndex = 0;
    isAnswered = false;
}

function checkGuess() {
    if (isAnswered) return;
    
    const guess = document.getElementById('guess').value;
    const input = document.getElementById('guess');
    
    if (cleanWord(guess) === cleanWord(currentWord)) {
        input.className = "correct";
        input.disabled = true;
        isAnswered = true;
        
        // Add points
        const points = Math.max(10, 50 - (hintIndex * 15));
        score += points;
        streak++;
        updateStats();
        
        // Auto-next after a delay
        setTimeout(selectNewWord, 1500);
    } else if (guess.length >= currentWord.length) {
        input.classList.add('wrong');
        streak = 0;
        updateStats();
        setTimeout(() => input.classList.remove('wrong'), 400);
    } else {
        input.classList.remove('wrong', 'correct');
    }
}

function giveHint() {
    if (isAnswered || hintIndex >= currentWord.length - 1) return;
    
    const input = document.getElementById('guess');
    const hintText = currentWord.substring(0, hintIndex + 1);
    input.value = hintText;
    hintIndex++;
    
    // Streak resets on hint
    streak = 0;
    updateStats();
    
    checkGuess();
    input.focus();
}

function cleanWord(word) {
    return charsToIgnore.reduce((cleanedWord, sep) => {
        return cleanedWord.replace(new RegExp(`\\${sep}`, 'g'), '');
    }, word).toLowerCase();
}
