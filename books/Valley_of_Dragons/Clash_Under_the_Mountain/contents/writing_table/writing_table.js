const vowels = ['A', 'E', 'I', 'O', 'U'];
const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

document.addEventListener('DOMContentLoaded', () => {
    buildWorkbench();
    
    document.getElementById('clear-all').addEventListener('click', clearAll);
});

function buildWorkbench() {
    const grid = document.getElementById('workbench');
    grid.innerHTML = '';
    
    // Header
    const headers = ['Source', '1', '2', '3', '4', '5', 'Target Word'];
    headers.forEach(h => {
        const div = document.createElement('div');
        div.className = 'header-cell';
        div.textContent = h;
        grid.appendChild(div);
    });

    // Trash row? No, let's put trash inside each row source or as a global tool.
    // Let's stick to the letters + vowels.
    
    // Row 0: Trash & Vowels
    const trash = document.createElement('div');
    trash.className = 'trash-cell';
    trash.textContent = '🗑️';
    trash.draggable = true;
    trash.ondragstart = (e) => e.dataTransfer.setData('type', 'trash');
    grid.appendChild(trash);
    
    vowels.forEach((v, i) => {
        const cell = document.createElement('div');
        cell.className = 'letter-source';
        cell.textContent = v;
        cell.draggable = true;
        cell.ondragstart = (e) => e.dataTransfer.setData('letter', v);
        grid.appendChild(cell);
    });
    // Placeholder for target word in vowel row
    const emptyHeader = document.createElement('div');
    emptyHeader.className = 'header-cell';
    emptyHeader.textContent = "Vowels";
    grid.appendChild(emptyHeader);

    // Consonant Rows
    consonants.forEach(c => {
        // Source
        const source = document.createElement('div');
        source.className = 'letter-source';
        source.textContent = c;
        source.draggable = true;
        source.ondragstart = (e) => e.dataTransfer.setData('letter', c);
        grid.appendChild(source);
        
        // 5 Droppable slots
        for(let i=0; i<5; i++) {
            const slot = document.createElement('div');
            slot.className = 'droppable';
            setupDroppable(slot);
            grid.appendChild(slot);
        }
        
        // Target Input
        const inputCell = document.createElement('div');
        inputCell.className = 'word-input-cell';
        inputCell.textContent = "-";
        grid.appendChild(inputCell);
    });
}

function setupDroppable(slot) {
    slot.ondragover = (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
    };
    
    slot.ondragleave = () => slot.classList.remove('drag-over');
    
    slot.ondrop = (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        
        const letter = e.dataTransfer.getData('letter');
        const isTrash = e.dataTransfer.getData('type') === 'trash';
        
        if (isTrash) {
            slot.textContent = '';
            slot.classList.remove('filled');
        } else if (letter) {
            slot.textContent = letter;
            slot.classList.add('filled');
            if (document.getElementById('checkSpeakLettersWhenDropped').checked) {
                speak(letter);
            }
            checkAllRows();
        }
    };

    slot.ondblclick = () => {
        slot.textContent = '';
        slot.classList.remove('filled');
    };
}

function checkRow(grid) {
    // This logic is tricky with the grid layout. 
    // In our new grid, each row (7 cells) starting from index 7 (after header) is a "word attempt"
    // Wait, let's rethink. Consonants start after 7 (header) + 7 (vowels row) = 14.
}

// SIMPLER check: just check all rows every time
function checkAllRows() {
    const slots = document.querySelectorAll('.droppable');
    const rows = consonants.length; 
    for(let r=0; r<rows; r++) {
        let word = "";
        for(let c=0; c<5; c++) {
            word += slots[r*5 + c].textContent;
        }
        if (word.length > 1) {
            const targetCell = document.querySelectorAll('.word-input-cell')[r];
            validateWord(word, targetCell);
        }
    }
}

async function validateWord(word, targetCell) {
    // This is where we'd check against interactive_book_word_count.json
    // For now, let's just show the word formed.
    targetCell.textContent = word;
}

function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(msg);
}

function clearAll() {
    document.querySelectorAll('.droppable').forEach(slot => {
        slot.textContent = '';
        slot.classList.remove('filled');
    });
    document.querySelectorAll('.word-input-cell').forEach(cell => cell.textContent = '-');
}
