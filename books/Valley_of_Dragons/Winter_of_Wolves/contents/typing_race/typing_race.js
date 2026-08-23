let paragraphs = [];
let targetText = "";
let startTime = null;
let timerInterval = null;
let finished = false;

async function fetchParagraphs() {
    try {
        var response = await fetch('./../../interactive_book_parapragh_texts.json');
        if (!response.ok) throw new Error("HTTP error: " + response.status);
        paragraphs = await response.json();
    } catch (error) {
        console.error("Error fetching paragraphs:", error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchParagraphs().then(init);
});

function init() {
    document.getElementById('new-text-btn').addEventListener('click', newText);
    document.getElementById('input-area').addEventListener('input', onInput);
    newText();
}

function countWords(text) {
    var count = 0;
    var inWord = false;
    for (var i = 0; i < text.length; i++) {
        var isSpace = (text[i] === ' ' || text[i] === '\n' || text[i] === '\t');
        if (!isSpace && !inWord) { count++; inWord = true; }
        else if (isSpace) { inWord = false; }
    }
    return count;
}

function newText() {
    finished = false;
    startTime = null;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

    document.getElementById('wpm').textContent = "0";
    document.getElementById('accuracy').textContent = "100%";
    document.getElementById('timer').textContent = "0s";
    document.getElementById('feedback').textContent = "";
    document.getElementById('feedback').className = "feedback";

    // Pick a paragraph with 20-60 words
    var valid = paragraphs.filter(function(p) {
        var wc = countWords(p);
        return wc >= 20 && wc <= 60;
    });

    if (valid.length === 0) {
        // Fallback: any paragraph >= 10 words
        valid = paragraphs.filter(function(p) { return countWords(p) >= 10; });
    }

    if (valid.length === 0) {
        document.getElementById('feedback').textContent = "No suitable text found.";
        return;
    }

    targetText = valid[Math.floor(Math.random() * valid.length)];
    renderText("");

    var input = document.getElementById('input-area');
    input.value = "";
    input.disabled = false;
    input.focus();
}

function renderText(typed) {
    var display = document.getElementById('text-display');
    var html = "";

    for (var i = 0; i < targetText.length; i++) {
        var cssClass = "char";
        if (i < typed.length) {
            cssClass += typed[i] === targetText[i] ? " correct" : " wrong";
        } else if (i === typed.length) {
            cssClass += " current";
        } else {
            cssClass += " pending";
        }

        var ch = targetText[i];
        if (ch === ' ') ch = '&nbsp;';
        else if (ch === '<') ch = '&lt;';
        else if (ch === '>') ch = '&gt;';
        else if (ch === '&') ch = '&amp;';

        html += '<span class="' + cssClass + '">' + ch + '</span>';
    }

    display.innerHTML = html;
}

function onInput() {
    if (finished) return;

    var typed = document.getElementById('input-area').value;

    // Start timer on first keystroke
    if (!startTime && typed.length > 0) {
        startTime = Date.now();
        timerInterval = setInterval(updateStats, 200);
    }

    renderText(typed);

    // Check completion
    if (typed.length >= targetText.length) {
        finished = true;
        document.getElementById('input-area').disabled = true;
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        updateStats();
        document.getElementById('feedback').textContent = "🏁 Finished!";
        document.getElementById('feedback').className = "feedback done";
    }
}

function updateStats() {
    if (!startTime) return;

    var typed = document.getElementById('input-area').value;
    var elapsed = (Date.now() - startTime) / 1000;

    document.getElementById('timer').textContent = Math.floor(elapsed) + "s";

    // Calculate WPM (standard: 5 chars = 1 word)
    var wpm = 0;
    if (elapsed > 0) {
        wpm = Math.round((typed.length / 5) / (elapsed / 60));
    }
    document.getElementById('wpm').textContent = wpm;

    // Calculate accuracy
    var correct = 0;
    var compared = Math.min(typed.length, targetText.length);
    for (var i = 0; i < compared; i++) {
        if (typed[i] === targetText[i]) correct++;
    }
    var acc = compared > 0 ? Math.round((correct / compared) * 100) : 100;
    document.getElementById('accuracy').textContent = acc + "%";
}
