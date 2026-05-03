let wordCount = {};
let allWords = [];
var GRID_SIZE = 12;
var NUM_WORDS = 8;
var grid = [];
var placedWords = [];
var selecting = false;
var selectedCells = [];
var foundWords = [];

// Directions: right, down, diagonal-down-right, diagonal-down-left
var DIRECTIONS = [
    [0, 1], [1, 0], [1, 1], [1, -1],
    [0, -1], [-1, 0], [-1, -1], [-1, 1]
];

async function fetchWords() {
    try {
        var response = await fetch('./../../interactive_book_word_count.json');
        if (!response.ok) throw new Error("HTTP error: " + response.status);
        wordCount = await response.json();
        allWords = Object.keys(wordCount).filter(function(w) {
            return w.length >= 3 && w.length <= GRID_SIZE;
        });
    } catch (error) {
        console.error("Error fetching words:", error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchWords().then(init);
});

function init() {
    document.getElementById('new-grid-btn').addEventListener('click', newGrid);
    newGrid();
}

function newGrid() {
    foundWords = [];
    placedWords = [];

    // Initialize empty grid
    grid = [];
    for (var r = 0; r < GRID_SIZE; r++) {
        grid[r] = [];
        for (var c = 0; c < GRID_SIZE; c++) {
            grid[r][c] = '';
        }
    }

    // Pick and place words
    var shuffled = allWords.slice().sort(function() { return 0.5 - Math.random(); });
    var count = 0;

    for (var w = 0; w < shuffled.length && count < NUM_WORDS; w++) {
        var word = shuffled[w].toUpperCase();
        if (tryPlaceWord(word)) {
            placedWords.push(word);
            count++;
        }
    }

    // Fill remaining cells with random letters
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var r = 0; r < GRID_SIZE; r++) {
        for (var c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }

    renderGrid();
    renderWordList();
}

function tryPlaceWord(word) {
    // Shuffle directions
    var dirs = DIRECTIONS.slice();
    for (var i = dirs.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = dirs[i]; dirs[i] = dirs[j]; dirs[j] = t;
    }

    // Try random positions
    var positions = [];
    for (var r = 0; r < GRID_SIZE; r++) {
        for (var c = 0; c < GRID_SIZE; c++) {
            positions.push([r, c]);
        }
    }
    for (var i = positions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = positions[i]; positions[i] = positions[j]; positions[j] = t;
    }

    for (var d = 0; d < dirs.length; d++) {
        var dr = dirs[d][0];
        var dc = dirs[d][1];
        for (var p = 0; p < positions.length; p++) {
            var startR = positions[p][0];
            var startC = positions[p][1];
            if (canPlaceAt(word, startR, startC, dr, dc)) {
                for (var k = 0; k < word.length; k++) {
                    grid[startR + dr * k][startC + dc * k] = word[k];
                }
                return true;
            }
        }
    }
    return false;
}

function canPlaceAt(word, r, c, dr, dc) {
    for (var k = 0; k < word.length; k++) {
        var nr = r + dr * k;
        var nc = c + dc * k;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return false;
        if (grid[nr][nc] !== '' && grid[nr][nc] !== word[k]) return false;
    }
    return true;
}

function renderGrid() {
    var container = document.getElementById('ws-grid');
    container.style.gridTemplateColumns = "repeat(" + GRID_SIZE + ", 2.2rem)";
    var html = "";

    for (var r = 0; r < GRID_SIZE; r++) {
        for (var c = 0; c < GRID_SIZE; c++) {
            html += '<div class="ws-cell" data-row="' + r + '" data-col="' + c + '">' + grid[r][c] + '</div>';
        }
    }
    container.innerHTML = html;

    // Setup mouse/touch selection
    var cells = container.querySelectorAll('.ws-cell');
    cells.forEach(function(cell) {
        cell.addEventListener('mousedown', function(e) {
            e.preventDefault();
            selecting = true;
            selectedCells = [cell];
            cell.classList.add('selecting');
        });
        cell.addEventListener('mouseenter', function() {
            if (!selecting) return;
            // Only allow straight lines
            var start = selectedCells[0];
            var sr = parseInt(start.dataset.row);
            var sc = parseInt(start.dataset.col);
            var cr = parseInt(cell.dataset.row);
            var cc = parseInt(cell.dataset.col);
            var dr = cr - sr;
            var dc = cc - sc;

            // Must be in a valid direction
            if (dr === 0 && dc === 0) return;
            var len = Math.max(Math.abs(dr), Math.abs(dc));
            if (Math.abs(dr) !== 0 && Math.abs(dc) !== 0 && Math.abs(dr) !== Math.abs(dc)) return;

            var stepR = dr === 0 ? 0 : (dr > 0 ? 1 : -1);
            var stepC = dc === 0 ? 0 : (dc > 0 ? 1 : -1);

            // Clear old selection
            selectedCells.forEach(function(c) { c.classList.remove('selecting'); });
            selectedCells = [];

            for (var i = 0; i <= len; i++) {
                var tr = sr + stepR * i;
                var tc = sc + stepC * i;
                var target = container.querySelector('[data-row="' + tr + '"][data-col="' + tc + '"]');
                if (target) {
                    selectedCells.push(target);
                    target.classList.add('selecting');
                }
            }
        });
    });

    document.addEventListener('mouseup', function() {
        if (!selecting) return;
        selecting = false;
        checkSelection();
        selectedCells.forEach(function(c) { c.classList.remove('selecting'); });
        selectedCells = [];
    });
}

function checkSelection() {
    var word = "";
    for (var i = 0; i < selectedCells.length; i++) {
        word += selectedCells[i].textContent;
    }

    // Check forward and reverse
    var wordRev = word.split('').reverse().join('');

    for (var p = 0; p < placedWords.length; p++) {
        if ((word === placedWords[p] || wordRev === placedWords[p]) && foundWords.indexOf(placedWords[p]) === -1) {
            foundWords.push(placedWords[p]);
            selectedCells.forEach(function(c) { c.classList.add('found'); });
            renderWordList();
            break;
        }
    }
}

function renderWordList() {
    var container = document.getElementById('ws-word-list');
    var html = "<h3>Words to Find</h3>";
    for (var i = 0; i < placedWords.length; i++) {
        var found = foundWords.indexOf(placedWords[i]) !== -1;
        html += '<div class="ws-word' + (found ? ' found' : '') + '">' + placedWords[i] + '</div>';
    }
    if (foundWords.length === placedWords.length && placedWords.length > 0) {
        html += '<div style="margin-top: 1rem; color: var(--correct-color); font-weight: 700;">🎉 All found!</div>';
    }
    container.innerHTML = html;
}
