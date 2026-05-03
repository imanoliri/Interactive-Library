let chapters = {};
let chapterNames = [];
let score = 0;
let total = 0;

async function fetchChapters() {
    try {
        var response = await fetch('./../../story_by_chapters.json');
        if (!response.ok) throw new Error("HTTP error: " + response.status);
        chapters = await response.json();
        chapterNames = Object.keys(chapters);
    } catch (error) {
        console.error("Error fetching chapters:", error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchChapters().then(init);
});

function init() {
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') nextQuestion();
    });
    nextQuestion();
}

function extractTextFromHTML(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

function splitIntoSentences(text) {
    var sentences = [];
    var current = "";
    for (var i = 0; i < text.length; i++) {
        current += text[i];
        if (text[i] === '.' || text[i] === '!' || text[i] === '?') {
            var trimmed = current.trim();
            if (trimmed.length > 30) sentences.push(trimmed);
            current = "";
        }
    }
    return sentences;
}

function nextQuestion() {
    if (chapterNames.length < 2) {
        document.getElementById('feedback').textContent = "Need at least 2 chapters.";
        return;
    }

    document.getElementById('feedback').textContent = "";
    document.getElementById('feedback').className = "feedback";

    // Pick a random chapter for the correct answer
    var correctIdx = Math.floor(Math.random() * chapterNames.length);
    var correctName = chapterNames[correctIdx];
    var chapterHTML = chapters[correctName];
    var text = extractTextFromHTML(chapterHTML);
    var sentences = splitIntoSentences(text);

    if (sentences.length === 0) {
        // Try again
        nextQuestion();
        return;
    }

    // Pick a snippet (1-2 sentences)
    var startIdx = Math.floor(Math.random() * sentences.length);
    var snippet = sentences[startIdx];
    if (startIdx + 1 < sentences.length && snippet.length < 80) {
        snippet += " " + sentences[startIdx + 1];
    }

    // Truncate if too long
    if (snippet.length > 300) {
        snippet = snippet.substring(0, 297) + "...";
    }

    document.getElementById('passage').textContent = snippet;

    // Build choices: correct + 3 random wrong
    var wrongChoices = [];
    var available = chapterNames.filter(function(n) { return n !== correctName; });
    // Shuffle
    for (var i = available.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = available[i]; available[i] = available[j]; available[j] = t;
    }
    wrongChoices = available.slice(0, 3);

    var allChoices = wrongChoices.concat([correctName]);
    // Shuffle all choices
    for (var i = allChoices.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = allChoices[i]; allChoices[i] = allChoices[j]; allChoices[j] = t;
    }

    renderChoices(allChoices, correctName);
}

function renderChoices(choices, correctName) {
    var container = document.getElementById('choices');
    container.innerHTML = "";

    for (var i = 0; i < choices.length; i++) {
        (function(choice) {
            var btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice;
            btn.addEventListener('click', function() {
                handleAnswer(choice, correctName);
            });
            container.appendChild(btn);
        })(choices[i]);
    }
}

function handleAnswer(chosen, correct) {
    var feedback = document.getElementById('feedback');
    var buttons = document.querySelectorAll('.choice-btn');
    total++;

    buttons.forEach(function(btn) {
        btn.classList.add('disabled');
        if (btn.textContent === correct) {
            btn.classList.add('correct');
        }
        if (btn.textContent === chosen && chosen !== correct) {
            btn.classList.add('wrong');
        }
    });

    if (chosen === correct) {
        score++;
        feedback.textContent = "🎉 Correct!";
        feedback.className = "feedback correct";
    } else {
        feedback.textContent = "Wrong! It was: " + correct;
        feedback.className = "feedback wrong";
    }

    document.getElementById('score').textContent = score;
    document.getElementById('total').textContent = total;
}
