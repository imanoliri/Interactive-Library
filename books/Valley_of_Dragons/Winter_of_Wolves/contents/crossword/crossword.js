let wordCount = {};
let allWords = [];

async function fetchWords() {
    try {
        var response = await fetch('./../../interactive_book_word_count.json');
        if (!response.ok) throw new Error("HTTP error: " + response.status);
        wordCount = await response.json();
        allWords = Object.keys(wordCount).filter(function(w) { return w.length >= 3 && w.length <= 10; });
    } catch (error) {
        console.error("Error fetching words:", error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchWords().then(init);
});

function init() {
    var slider = document.getElementById('word-count-slider');
    var label = document.getElementById('word-count-label');
    slider.addEventListener('input', function() { label.textContent = slider.value; });
    document.getElementById('new-puzzle-btn').addEventListener('click', generatePuzzle);
    document.getElementById('reveal-btn').addEventListener('click', revealAll);
    generatePuzzle();
}

// --- Grid Placement Engine ---

function generatePuzzle() {
    var numWords = parseInt(document.getElementById('word-count-slider').value, 10);
    var shuffled = allWords.slice().sort(function() { return 0.5 - Math.random(); });
    var selected = shuffled.slice(0, Math.min(numWords * 3, shuffled.length)); // grab more to try fitting
    selected.sort(function(a, b) { return b.length - a.length; }); // place longest first

    var gridSize = 15;
    var grid = [];
    for (var i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (var j = 0; j < gridSize; j++) {
            grid[i][j] = '';
        }
    }

    var placements = [];

    for (var w = 0; w < selected.length && placements.length < numWords; w++) {
        var word = selected[w].toUpperCase();
        if (placements.length === 0) {
            // Place first word horizontally in the middle
            var startRow = Math.floor(gridSize / 2);
            var startCol = Math.floor((gridSize - word.length) / 2);
            placeWord(grid, word, startRow, startCol, 'across');
            placements.push({ word: word, row: startRow, col: startCol, dir: 'across' });
        } else {
            var placed = tryPlaceWord(grid, word, placements, gridSize);
            if (placed) {
                placements.push(placed);
            }
        }
    }

    renderGrid(grid, placements, gridSize);
}

function tryPlaceWord(grid, word, existingPlacements, gridSize) {
    // Try to find an intersection with an existing placed word
    var candidates = [];

    for (var p = 0; p < existingPlacements.length; p++) {
        var existing = existingPlacements[p];
        for (var ei = 0; ei < existing.word.length; ei++) {
            for (var wi = 0; wi < word.length; wi++) {
                if (existing.word[ei] === word[wi]) {
                    // Calculate position for the new word
                    var newDir = existing.dir === 'across' ? 'down' : 'across';
                    var newRow, newCol;
                    if (newDir === 'down') {
                        newRow = existing.row - wi;
                        newCol = existing.col + ei;
                    } else {
                        newRow = existing.row + ei;
                        newCol = existing.col - wi;
                    }
                    if (canPlace(grid, word, newRow, newCol, newDir, gridSize)) {
                        candidates.push({ word: word, row: newRow, col: newCol, dir: newDir });
                    }
                }
            }
        }
    }

    if (candidates.length === 0) return null;
    var pick = candidates[Math.floor(Math.random() * candidates.length)];
    placeWord(grid, pick.word, pick.row, pick.col, pick.dir);
    return pick;
}

function canPlace(grid, word, row, col, dir, gridSize) {
    var dr = dir === 'down' ? 1 : 0;
    var dc = dir === 'across' ? 1 : 0;

    // Check bounds
    if (row < 0 || col < 0) return false;
    if (row + dr * (word.length - 1) >= gridSize) return false;
    if (col + dc * (word.length - 1) >= gridSize) return false;

    // Check cell before the word (should be empty)
    var beforeR = row - dr;
    var beforeC = col - dc;
    if (beforeR >= 0 && beforeC >= 0 && grid[beforeR][beforeC] !== '') return false;

    // Check cell after the word (should be empty)
    var afterR = row + dr * word.length;
    var afterC = col + dc * word.length;
    if (afterR < gridSize && afterC < gridSize && grid[afterR][afterC] !== '') return false;

    var intersections = 0;
    for (var i = 0; i < word.length; i++) {
        var r = row + dr * i;
        var c = col + dc * i;
        var existing = grid[r][c];

        if (existing !== '') {
            if (existing !== word[i]) return false; // Conflict
            intersections++;
        } else {
            // Check perpendicular neighbors (shouldn't have adjacent parallel words)
            var sideA_r = r + dc; // perpendicular
            var sideA_c = c + dr;
            var sideB_r = r - dc;
            var sideB_c = c - dr;
            if (sideA_r >= 0 && sideA_r < gridSize && sideA_c >= 0 && sideA_c < gridSize && grid[sideA_r][sideA_c] !== '') return false;
            if (sideB_r >= 0 && sideB_r < gridSize && sideB_c >= 0 && sideB_c < gridSize && grid[sideB_r][sideB_c] !== '') return false;
        }
    }

    return intersections > 0; // Must intersect at least once
}

function placeWord(grid, word, row, col, dir) {
    var dr = dir === 'down' ? 1 : 0;
    var dc = dir === 'across' ? 1 : 0;
    for (var i = 0; i < word.length; i++) {
        grid[row + dr * i][col + dc * i] = word[i];
    }
}

// --- Rendering ---

function renderGrid(grid, placements, gridSize) {
    // Find bounding box of used cells
    var minR = gridSize, maxR = 0, minC = gridSize, maxC = 0;
    for (var r = 0; r < gridSize; r++) {
        for (var c = 0; c < gridSize; c++) {
            if (grid[r][c] !== '') {
                if (r < minR) minR = r;
                if (r > maxR) maxR = r;
                if (c < minC) minC = c;
                if (c > maxC) maxC = c;
            }
        }
    }

    // Add 1-cell padding
    minR = Math.max(0, minR - 1);
    minC = Math.max(0, minC - 1);
    maxR = Math.min(gridSize - 1, maxR + 1);
    maxC = Math.min(gridSize - 1, maxC + 1);

    var rows = maxR - minR + 1;
    var cols = maxC - minC + 1;

    // Number the start cells
    var numberMap = {};
    var num = 1;
    // Sort placements by position (top-to-bottom, left-to-right)
    var sortedPlacements = placements.slice().sort(function(a, b) {
        return a.row !== b.row ? a.row - b.row : a.col - b.col;
    });

    for (var i = 0; i < sortedPlacements.length; i++) {
        var key = sortedPlacements[i].row + ',' + sortedPlacements[i].col;
        if (!numberMap[key]) {
            numberMap[key] = num++;
        }
    }

    var container = document.getElementById('grid-container');
    container.style.gridTemplateColumns = "repeat(" + cols + ", 2.2rem)";
    var html = "";

    for (var r = minR; r <= maxR; r++) {
        for (var c = minC; c <= maxC; c++) {
            var letter = grid[r][c];
            var cellKey = r + ',' + c;
            var cellNum = numberMap[cellKey] || '';
            if (letter === '') {
                html += '<div class="cell empty"></div>';
            } else {
                html += '<div class="cell active">';
                if (cellNum) html += '<span class="cell-number">' + cellNum + '</span>';
                html += '<input type="text" maxlength="1" data-answer="' + letter + '" data-row="' + r + '" data-col="' + c + '">';
                html += '</div>';
            }
        }
    }
    container.innerHTML = html;

    // Wire up input navigation
    var inputs = container.querySelectorAll('input');
    inputs.forEach(function(inp, idx) {
        inp.addEventListener('input', function() {
            inp.value = inp.value.toUpperCase();
            if (inp.value === inp.dataset.answer) {
                inp.parentElement.classList.add('correct-cell');
            } else {
                inp.parentElement.classList.remove('correct-cell');
            }
            // Auto-advance to next input
            if (inp.value.length === 1 && idx + 1 < inputs.length) {
                inputs[idx + 1].focus();
            }
        });
        inp.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && inp.value === '' && idx > 0) {
                inputs[idx - 1].focus();
            }
        });
    });

    // Render clues
    renderClues(sortedPlacements, numberMap);
}

function renderClues(placements, numberMap) {
    var acrossHTML = '<h3>Across</h3>';
    var downHTML = '<h3>Down</h3>';

    for (var i = 0; i < placements.length; i++) {
        var p = placements[i];
        var key = p.row + ',' + p.col;
        var num = numberMap[key];
        var clueText = '<div class="clue"><span>' + num + '.</span> ' + p.word.length + ' letters</div>';
        if (p.dir === 'across') {
            acrossHTML += clueText;
        } else {
            downHTML += clueText;
        }
    }

    document.getElementById('across-clues').innerHTML = acrossHTML;
    document.getElementById('down-clues').innerHTML = downHTML;
}

function revealAll() {
    var inputs = document.querySelectorAll('#grid-container input');
    inputs.forEach(function(inp) {
        inp.value = inp.dataset.answer;
        inp.parentElement.classList.add('correct-cell');
    });
}
