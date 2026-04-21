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


document.addEventListener('DOMContentLoaded', () => {
    fetchwWordCount().then(createAnagram);
});


function createAnagram() {
    // Event listeners
    document.getElementById('guess').addEventListener('input', checkGuess);
    document.getElementById('next').addEventListener('click', selectNewWord);

    // Initialize the first word
    selectNewWord();
}


// Function to shuffle letters to create an anagram
function shuffle(word) {
    return word.split('').sort(() => 0.5 - Math.random()).join('');
}

// Function to select a new word and create an anagram
function selectNewWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    anagramWord = shuffle(currentWord);
    document.getElementById('anagram').textContent = anagramWord;
    document.getElementById('guess').value = "";
    document.getElementById('guess').className = "";
}

// Function to check if the user's guess is correct
function checkGuess() {
    const guess = document.getElementById('guess').value;
    if (cleanWord(guess) === cleanWord(currentWord)) {
        document.getElementById('guess').className = "correct";
    } else {
        document.getElementById('guess').className = "wrong";
    }
}

function cleanWord(word) {
    return charsToIgnore.reduce((cleanedWord, sep) => {
        return cleanedWord.replace(new RegExp(`\\${sep}`, 'g'), '');
    }, word).toLowerCase();
}


