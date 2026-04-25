// Fetch word counts asynchronously and only then create Grid
async function fetchParagraphs() {
    try {
        const response = await fetch('./../../interactive_book_parapragh_texts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        paragraphs = await response.json();
        console.log("Paragraphs fetched:", paragraphs);

        // Initialize the paragraph
        document.addEventListener('DOMContentLoaded', createParagraph);

    } catch (error) {
        console.error("Error fetching paragraphs:", error);
    }
}

const wordSeparators = [",", "-", "—", ";", "."];
let paragraphs


document.addEventListener('DOMContentLoaded', () => {
    fetchParagraphs().then(createParagraph);
});

function createParagraph() {
    const slider = document.getElementById('gap-slider');
    const gapCountLabel = document.getElementById('gap-count');
    const paragraphContainer = document.getElementById('paragraph');
    const fullParagraphContainer = document.getElementById('full-paragraph');
    const nextButton = document.getElementById('next-button');
    let numGaps = parseInt(slider.value, 10);

    numGaps = parseInt(slider.value, 10);
    gapCountLabel.textContent = numGaps; // Initial number of gaps to display

    showRandomParagraph();

    slider.addEventListener('input', () => {
        numGaps = parseInt(slider.value, 10);
        gapCountLabel.textContent = numGaps;
        showRandomParagraph();
    });

    function showRandomParagraph() {
        if (!paragraphs || paragraphs.length === 0) return;
        
        // QOL: Always go back to the gaps tab before switching
        showTab('gaps');

        const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
        
        // Smart split: keeps the separators as separate tokens for perfect reconstruction
        const tokens = randomParagraph.match(/[\w'´`]+|[.,—-]| +/g) || [];

        // Rules: 
        // 1. Words must be >= 3 chars
        // 2. No two gaps in sequence
        const validIndices = [];
        tokens.forEach((item, idx) => {
            // Rule 1: Only words with length >= 3
            if (item.match(/[\w'´`]+/) && item.length >= 3) {
                validIndices.push(idx);
            }
        });

        // Rule 2: Ensure no sequence. We pick them iteratively.
        const gapIndices = [];
        const potential = [...validIndices].sort(() => 0.5 - Math.random());
        
        for (let idx of potential) {
            if (gapIndices.length >= numGaps) break;
            
            // Check if any nearby word is already a gap
            // We look at the tokens. The previous word is at the next valid index found in descending order.
            const isTooClose = gapIndices.some(existingIdx => {
                // Determine if they are "sequential" words.
                // In our tokens array, words are separated by space/punctuation.
                // If they are sequential, there is only whitespace/punctuation between them.
                // We'll simplify: if the distance between indices is small enough that no other word is between them.
                const min = Math.min(idx, existingIdx);
                const max = Math.max(idx, existingIdx);
                
                // Check if any word exists between these two indices
                let wordBetween = false;
                for (let i = min + 1; i < max; i++) {
                    if (tokens[i].match(/[\w'´`]+/)) {
                        wordBetween = true;
                        break;
                    }
                }
                return !wordBetween; // If no word between, they are sequential
            });

            if (!isTooClose) {
                gapIndices.push(idx);
            }
        }

        gapCountLabel.textContent = gapIndices.length;

        renderParagraph(tokens, gapIndices);

        setupInputValidation();

        const firstInput = paragraphContainer.querySelector('input');
        if (firstInput) firstInput.focus();
    }

    function renderParagraph(tokens, gapIndices) {
        // Challenge View (Editable Inputs)
        paragraphContainer.innerHTML = tokens.map((token, index) => {
            if (gapIndices.includes(index)) {
                return `<input type="text" data-correct="${token.toLowerCase()}" class="gap-input" style="width: ${token.length + 2}ch">`;
            }
            return token;
        }).join('');

        // Solution View (Read-only pre-filled inputs)
        fullParagraphContainer.innerHTML = tokens.map((token, index) => {
            if (gapIndices.includes(index)) {
                return `<input type="text" value="${token}" class="gap-input correct" readonly style="width: ${token.length + 2}ch">`;
            }
            return token;
        }).join('');
    }

    function cleanWord(word) {
        if (!word) return "";
        return wordSeparators.reduce((cleanedWord, sep) => {
            return cleanedWord.replace(new RegExp(`\\${sep}`, 'g'), '');
        }, word).toLowerCase().trim();
    }

    function setupInputValidation() {
        const inputs = paragraphContainer.querySelectorAll('input');
        inputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                const val = cleanWord(input.value);
                const target = cleanWord(input.dataset.correct);

                input.classList.remove('correct', 'incorrect', 'partial');

                if (val === "") {
                    // neutral
                } else if (val === target) {
                    input.classList.add('correct');
                    // Auto-advance to next input with a small delay
                    const nextInput = inputs[index + 1];
                    if (nextInput) {
                        setTimeout(() => nextInput.focus(), 300);
                    }
                } else if (target.startsWith(val)) {
                    input.classList.add('partial');
                } else {
                    input.classList.add('incorrect');
                }
                checkAllCorrect();
            });
        });
    }

    function checkAllCorrect() {
        const inputs = paragraphContainer.querySelectorAll('input');
        const allCorrect = Array.from(inputs).every(input => cleanWord(input.value) === cleanWord(input.dataset.correct));
        
        if (allCorrect) {
            nextButton.style.backgroundColor = "#28a745";
            nextButton.textContent = "Solved! Next Challenge?";
            nextButton.focus(); // Jump to next button
        } else {
            nextButton.style.backgroundColor = "";
            nextButton.textContent = "Next Challenge";
        }
    }

    nextButton.addEventListener('click', showRandomParagraph);
}

function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    
    const clickedButton = Array.from(buttons).find(b => b.getAttribute('onclick').includes(tabName));
    if (clickedButton) clickedButton.classList.add('active');
}