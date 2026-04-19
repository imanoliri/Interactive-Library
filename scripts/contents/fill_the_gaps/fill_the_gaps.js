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
        if (paragraphs.length === 0) return;
        const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
        const wordsAndPunctuation = randomParagraph.match(/[\w']+|[.,—-]/g); // Match words and punctuation

        if (numGaps >= wordsAndPunctuation.length) {
            numGaps = wordsAndPunctuation.length - 1;
            gapCountLabel.textContent = numGaps;
            slider.value = numGaps;
        }

        const gapIndices = getRandomIndices(wordsAndPunctuation.length, numGaps);

        // Show paragraph with gaps
        paragraphContainer.innerHTML = wordsAndPunctuation.map((word, index) => {
            if (gapIndices.includes(index) && !wordSeparators.includes(word)) {
                return `<input type="text" data-correct="${word.toLowerCase()}" class="gap-input">`;
            } else {
                return word;
            }
        }).join(' ');

        // Show full paragraph
        fullParagraphContainer.textContent = randomParagraph;

        setupInputValidation();
    }

    function cleanWord(word) {
        return wordSeparators.reduce((cleanedWord, sep) => {
            return cleanedWord.replace(new RegExp(`\\${sep}`, 'g'), '');
        }, word).toLowerCase();
    }

    function getRandomIndices(max, count) {
        const indices = new Set();
        while (indices.size < count) {
            indices.add(Math.floor(Math.random() * max));
        }
        return Array.from(indices);
    }

    function setupInputValidation() {
        const inputs = paragraphContainer.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (cleanWord(input.value) === cleanWord(input.dataset.correct)) {
                    input.classList.add('correct');
                    input.classList.remove('incorrect');
                } else {
                    input.classList.add('incorrect');
                    input.classList.remove('correct');
                }
                checkAllCorrect();
            });
        });
    }

    function checkAllCorrect() {
        const inputs = paragraphContainer.querySelectorAll('input');
        const allCorrect = Array.from(inputs).every(input => input.value === input.dataset.correct);
        if (allCorrect) {
            paragraphContainer.classList.add('correct');
        } else {
            paragraphContainer.classList.remove('correct');
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
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
}