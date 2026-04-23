let grid = [];
let solvedGrid = [];
let initialGrid = [];
let notes = Array.from({ length: 81 }, () => new Set());
let selectedCell = -1;
let isNotesMode = false;

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('empty-cells-slider');
    const sliderValue = document.getElementById('slider-value');
    const notesToggle = document.getElementById('notes-toggle');

    slider.addEventListener('input', () => {
        sliderValue.textContent = slider.value;
    });

    notesToggle.addEventListener('click', () => {
        isNotesMode = !isNotesMode;
        notesToggle.textContent = `Pencil: ${isNotesMode ? 'ON' : 'OFF'}`;
        notesToggle.classList.toggle('active', isNotesMode);
    });

    document.getElementById('reset').addEventListener('click', initGame);
    document.getElementById('check').addEventListener('click', checkSolution);

    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);

    initGame();
});

function initGame() {
    generateSudoku();
    const emptyCount = parseInt(document.getElementById('empty-cells-slider').value, 10);
    initialGrid = createGame(emptyCount);
    grid = [...initialGrid];
    notes = Array.from({ length: 81 }, () => new Set());
    selectedCell = -1;
    renderBoard();
}

function handleKeyPress(e) {
    if (selectedCell === -1 || initialGrid[selectedCell] !== 0) return;

    if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        if (isNotesMode) {
            if (notes[selectedCell].has(num)) notes[selectedCell].delete(num);
            else notes[selectedCell].add(num);
            grid[selectedCell] = 0;
        } else {
            grid[selectedCell] = grid[selectedCell] === num ? 0 : num;
            notes[selectedCell].clear();
        }
        renderBoard();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        grid[selectedCell] = 0;
        notes[selectedCell].clear();
        renderBoard();
    } else if (e.key.startsWith('Arrow')) {
        let row = Math.floor(selectedCell / 9);
        let col = selectedCell % 9;
        if (e.key === 'ArrowUp') row = (row + 8) % 9;
        if (e.key === 'ArrowDown') row = (row + 1) % 9;
        if (e.key === 'ArrowLeft') col = (col + 8) % 9;
        if (e.key === 'ArrowRight') col = (col + 1) % 9;
        selectedCell = row * 9 + col;
        renderBoard();
    }
}

function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if (initialGrid[i] !== 0) cell.classList.add('fixed');
        if (i === selectedCell) cell.classList.add('selected');

        const row = Math.floor(i / 9);
        const col = i % 9;
        const selRow = selectedCell !== -1 ? Math.floor(selectedCell / 9) : -1;
        const selCol = selectedCell !== -1 ? selectedCell % 9 : -1;

        if (selRow === row || selCol === col) {
            cell.classList.add('related');
        }

        if (grid[i] !== 0) {
            cell.textContent = grid[i];
            if (grid[i] !== solvedGrid[i] && !cell.classList.contains('fixed') && grid[i] !== 0) {
                // We don't mark wrong until "Check Solution" is clicked unless we want real-time.
                // Let's do conflict highlighting instead.
                if (hasConflict(i)) cell.classList.add('conflict');
            }
        } else if (notes[i].size > 0) {
            const notesGrid = document.createElement('div');
            notesGrid.className = 'notes-grid';
            for (let n = 1; n <= 9; n++) {
                const note = document.createElement('div');
                note.className = 'note';
                if (notes[i].has(n)) note.textContent = n;
                notesGrid.appendChild(note);
            }
            cell.appendChild(notesGrid);
        }

        cell.addEventListener('click', () => {
            selectedCell = i;
            renderBoard();
        });

        board.appendChild(cell);
    }
}

function hasConflict(idx) {
    const val = grid[idx];
    if (val === 0) return false;
    const row = Math.floor(idx / 9);
    const col = idx % 9;
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 9; i++) {
        if (i !== col && grid[row * 9 + i] === val) return true;
        if (i !== row && grid[i * 9 + col] === val) return true;
        
        const r = startRow + Math.floor(i / 3);
        const c = startCol + (i % 3);
        const innerIdx = r * 9 + c;
        if (innerIdx !== idx && grid[innerIdx] === val) return true;
    }
    return false;
}

function generateSudoku() {
    solvedGrid = Array(81).fill(0);
    fillGrid(solvedGrid);
}

function fillGrid(g) {
    for (let i = 0; i < 81; i++) {
        if (g[i] === 0) {
            const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            for (const num of nums) {
                if (isValid(g, i, num)) {
                    g[i] = num;
                    if (fillGrid(g)) return true;
                    g[i] = 0;
                }
            }
            return false;
        }
    }
    return true;
}

function isValid(g, idx, num) {
    const row = Math.floor(idx / 9);
    const col = idx % 9;
    for (let i = 0; i < 9; i++) {
        if (g[row * 9 + i] === num) return false;
        if (g[i * 9 + col] === num) return false;
        const r = Math.floor(row / 3) * 3 + Math.floor(i / 3);
        const c = Math.floor(col / 3) * 3 + (i % 3);
        if (g[r * 9 + c] === num) return false;
    }
    return true;
}

function createGame(emptyCount) {
    const g = [...solvedGrid];
    let count = 0;
    while (count < emptyCount) {
        const idx = Math.floor(Math.random() * 81);
        if (g[idx] !== 0) {
            g[idx] = 0;
            count++;
        }
    }
    return g;
}

function checkSolution() {
    const isCorrect = grid.every((val, i) => val === solvedGrid[i]);
    if (isCorrect) {
        alert('Perfect! Magical solution found! ✨');
    } else {
        alert('Some numbers are out of place. Keep trying!');
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
