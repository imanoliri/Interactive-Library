let wordCount = {};
let words = [];
let currentWord = "";
let guessedLetters = [];
let maxLives = 6;
let livesLeft = 6;

async function fetchWords() {
    try {
        const response = await fetch('./../../interactive_book_word_count.json');
        if (!response.ok) throw new Error("HTTP error: " + response.status);
        wordCount = await response.json();
        words = Object.keys(wordCount).filter(function(w) { return w.length >= 4; });
    } catch (error) {
        console.error("Error fetching words:", error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchWords().then(init);
});

function init() {
    document.getElementById('new-word-btn').addEventListener('click', newGame);
    document.addEventListener('keydown', function(e) {
        if (e.key.length === 1 && isAlpha(e.key)) {
            guessLetter(e.key.toUpperCase());
        } else if (e.key === 'Enter') {
            newGame();
        }
    });
    newGame();
}

function isAlpha(c) {
    var code = c.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function newGame() {
    if (words.length === 0) return;
    currentWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
    guessedLetters = [];
    livesLeft = maxLives;
    renderWord();
    renderKeyboard();
    renderEnergy();
    document.getElementById('hint-text').textContent = "Guess the word from the book!";
}

function guessLetter(letter) {
    if (guessedLetters.indexOf(letter) !== -1) return;
    if (livesLeft <= 0) return;

    // Check if all letters already revealed
    var allRevealed = true;
    for (var i = 0; i < currentWord.length; i++) {
        if (guessedLetters.indexOf(currentWord[i]) === -1) {
            allRevealed = false;
            break;
        }
    }
    if (allRevealed) return;

    guessedLetters.push(letter);

    if (currentWord.indexOf(letter) === -1) {
        livesLeft--;
    }

    renderWord();
    renderKeyboard();
    renderEnergy();
    checkGameState();
}

function renderWord() {
    var display = document.getElementById('word-display');
    var html = "";
    for (var i = 0; i < currentWord.length; i++) {
        var letter = currentWord[i];
        var revealed = guessedLetters.indexOf(letter) !== -1;
        var cssClass = "letter-slot";
        if (revealed) cssClass += " revealed";
        html += '<div class="' + cssClass + '">' + (revealed ? letter : '') + '</div>';
    }
    display.innerHTML = html;
}

function renderKeyboard() {
    var keyboard = document.getElementById('keyboard');
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var html = "";
    for (var i = 0; i < letters.length; i++) {
        var l = letters[i];
        var used = guessedLetters.indexOf(l) !== -1;
        var cssClass = "key";
        if (used) {
            cssClass += currentWord.indexOf(l) !== -1 ? " correct" : " wrong";
        }
        html += '<button class="' + cssClass + '" onclick="guessLetter(\'' + l + '\')">' + l + '</button>';
    }
    keyboard.innerHTML = html;
}

function renderEnergy() {
    var pct = (livesLeft / maxLives) * 100;
    document.getElementById('energy-fill').style.width = pct + "%";
    document.getElementById('energy-label').textContent = "✨ " + livesLeft + " / " + maxLives;
}

function checkGameState() {
    // Check win
    var won = true;
    for (var i = 0; i < currentWord.length; i++) {
        if (guessedLetters.indexOf(currentWord[i]) === -1) {
            won = false;
            break;
        }
    }

    if (won) {
        document.getElementById('hint-text').textContent = "🎉 You got it! The word was: " + currentWord;
        return;
    }

    if (livesLeft <= 0) {
        document.getElementById('hint-text').textContent = "💀 Out of energy! The word was: " + currentWord;
        // Reveal remaining letters
        var display = document.getElementById('word-display');
        var slots = display.querySelectorAll('.letter-slot');
        for (var i = 0; i < currentWord.length; i++) {
            if (guessedLetters.indexOf(currentWord[i]) === -1) {
                slots[i].textContent = currentWord[i];
                slots[i].classList.add('wrong-reveal');
            }
        }
    }
}
