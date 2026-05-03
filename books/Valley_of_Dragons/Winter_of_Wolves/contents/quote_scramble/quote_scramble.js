let paragraphs = [];
let correctWords = [];
const MIN_WORDS = 6;
const MAX_WORDS = 14;

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
    document.getElementById('check-btn').addEventListener('click', checkOrder);
    document.getElementById('next-btn').addEventListener('click', newRound);
    newRound();
}

function splitIntoWords(text) {
    var words = [];
    var current = "";
    for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (c === ' ' || c === '\t' || c === '\n') {
            if (current !== "") {
                words.push(current);
                current = "";
            }
        } else {
            current += c;
        }
    }
    if (current !== "") words.push(current);
    return words;
}

function pickSentence() {
    // Pick a paragraph, then extract a sentence-like chunk
    if (!paragraphs || paragraphs.length === 0) return null;

    // Filter for substantial paragraphs
    var valid = paragraphs.filter(function(p) {
        return splitIntoWords(p).length >= MIN_WORDS;
    });
    if (valid.length === 0) return null;

    var para = valid[Math.floor(Math.random() * valid.length)];

    // Split into sentences by period
    var sentences = [];
    var current = "";
    for (var i = 0; i < para.length; i++) {
        current += para[i];
        if (para[i] === '.' || para[i] === '!' || para[i] === '?') {
            var trimmed = current.trim();
            if (trimmed) sentences.push(trimmed);
            current = "";
        }
    }
    if (current.trim()) sentences.push(current.trim());

    // Filter to sentences with appropriate word count
    var goodSentences = sentences.filter(function(s) {
        var wc = splitIntoWords(s).length;
        return wc >= MIN_WORDS && wc <= MAX_WORDS;
    });

    if (goodSentences.length === 0) return null;
    return goodSentences[Math.floor(Math.random() * goodSentences.length)];
}

function newRound() {
    document.getElementById('feedback').textContent = "";
    document.getElementById('feedback').className = "feedback";

    var sentence = null;
    var attempts = 0;
    while (!sentence && attempts < 20) {
        sentence = pickSentence();
        attempts++;
    }
    if (!sentence) {
        document.getElementById('feedback').textContent = "Could not find a suitable sentence.";
        return;
    }

    correctWords = splitIntoWords(sentence);

    // Shuffle
    var shuffled = correctWords.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    // Make sure it's actually shuffled
    if (shuffled.join(' ') === correctWords.join(' ') && shuffled.length > 1) {
        var t = shuffled[0];
        shuffled[0] = shuffled[shuffled.length - 1];
        shuffled[shuffled.length - 1] = t;
    }

    renderWordBank(shuffled);
    document.getElementById('drop-zone').innerHTML = "";
    setupDropZone();
}

function createChip(word) {
    var chip = document.createElement('div');
    chip.className = 'word-chip';
    chip.textContent = word;
    chip.draggable = true;

    chip.addEventListener('dragstart', function(e) {
        chip.classList.add('dragging');
        e.dataTransfer.setData('text/plain', '');
    });
    chip.addEventListener('dragend', function() {
        chip.classList.remove('dragging');
    });

    // Click to move between bank and drop zone
    chip.addEventListener('click', function() {
        var bank = document.getElementById('word-bank');
        var zone = document.getElementById('drop-zone');
        if (chip.parentElement === bank) {
            zone.appendChild(chip);
        } else {
            bank.appendChild(chip);
        }
    });

    return chip;
}

function renderWordBank(words) {
    var bank = document.getElementById('word-bank');
    bank.innerHTML = "";
    for (var i = 0; i < words.length; i++) {
        bank.appendChild(createChip(words[i]));
    }
}

function setupDropZone() {
    var zone = document.getElementById('drop-zone');

    zone.addEventListener('dragover', function(e) {
        e.preventDefault();
        zone.classList.add('drag-over');

        var dragging = document.querySelector('.dragging');
        if (!dragging) return;

        var afterEl = getDragAfterElement(zone, e.clientX, e.clientY);
        if (afterEl) {
            zone.insertBefore(dragging, afterEl);
        } else {
            zone.appendChild(dragging);
        }
    });

    zone.addEventListener('dragleave', function() {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function(e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
    });

    // Also allow dragging back to word bank
    var bank = document.getElementById('word-bank');
    bank.addEventListener('dragover', function(e) {
        e.preventDefault();
        var dragging = document.querySelector('.dragging');
        if (dragging) bank.appendChild(dragging);
    });
}

function getDragAfterElement(container, x, y) {
    var children = Array.from(container.querySelectorAll('.word-chip:not(.dragging)'));
    var closest = { distance: Number.POSITIVE_INFINITY, element: null };

    for (var i = 0; i < children.length; i++) {
        var box = children[i].getBoundingClientRect();
        var centerX = box.left + box.width / 2;
        var centerY = box.top + box.height / 2;
        
        // Euclidean distance formula to handle 2D flow correctly
        var distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        if (distance < closest.distance) {
            closest.distance = distance;
            closest.element = children[i];
        }
    }
    
    if (closest.element) {
        var box = closest.element.getBoundingClientRect();
        // If the cursor is past the horizontal midpoint of the closest chip, 
        // we intend to insert AFTER it (which means before its next sibling).
        if (x > box.left + box.width / 2) {
            return closest.element.nextElementSibling;
        }
    }

    return closest.element;
}

function checkOrder() {
    var zone = document.getElementById('drop-zone');
    var chips = zone.querySelectorAll('.word-chip');
    var feedback = document.getElementById('feedback');

    if (chips.length !== correctWords.length) {
        feedback.textContent = "Place all words in the drop zone first!";
        feedback.className = "feedback wrong";
        return;
    }

    var isCorrect = true;
    for (var i = 0; i < chips.length; i++) {
        if (chips[i].textContent !== correctWords[i]) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
        feedback.textContent = "🎉 Perfect! That's the correct order!";
        feedback.className = "feedback correct";
    } else {
        feedback.textContent = "Not quite right. Keep trying!";
        feedback.className = "feedback wrong";
    }
}
