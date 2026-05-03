const wordSeparators = [",", "-", "—", ";", ".", "'", "`", "´"];
const MIN_PARAGRAPH_WORDS = 15;
let paragraphs;

async function fetchParagraphs() {
    try {
        const response = await fetch('./../../interactive_book_parapragh_texts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        paragraphs = await response.json();
    } catch (error) {
        console.error("Error fetching paragraphs:", error);
    }
}

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
    gapCountLabel.textContent = numGaps;

    showRandomParagraph();

    slider.addEventListener('input', () => {
        numGaps = parseInt(slider.value, 10);
        gapCountLabel.textContent = numGaps;
        showRandomParagraph();
    });

    // --- Tokenization Helpers ---

    /**
     * Splits a paragraph into tokens that preserve all original characters.
     * First splits on whitespace boundaries, then further splits hyphenated
     * words (e.g. "bow-shaped") into ["bow", "-", "shaped"] so each part
     * can independently become a gap.
     * Examples:
     *   "Hello, world!"  => ["Hello,", " ", "world!"]
     *   "bow-shaped"     => ["bow", "-", "shaped"]
     *   "didn\u2019t"         => ["didn\u2019t"]   (no hyphen, stays as one token)
     */
    function tokenize(text) {
        if (!text) return [];
        const roughTokens = [];
        let currentToken = "";
        let isCurrentWhite = null;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const isWhite = (char === ' ' || char === '\t' || char === '\n' || char === '\r');

            if (isCurrentWhite === null) {
                isCurrentWhite = isWhite;
                currentToken = char;
            } else if (isCurrentWhite !== isWhite) {
                roughTokens.push(currentToken);
                isCurrentWhite = isWhite;
                currentToken = char;
            } else {
                currentToken += char;
            }
        }
        if (currentToken !== "") roughTokens.push(currentToken);

        const tokens = [];
        for (const token of roughTokens) {
            // If it's whitespace, keep as is
            if (token.length > 0 && (token[0] === ' ' || token[0] === '\t' || token[0] === '\n' || token[0] === '\r')) {
                tokens.push(token);
            } else {
                // Split on hyphens and dashes manually
                let part = "";
                for (let j = 0; j < token.length; j++) {
                    const c = token[j];
                    if (c === '-' || c === '—') {
                        if (part !== "") tokens.push(part);
                        tokens.push(c);
                        part = "";
                    } else {
                        part += c;
                    }
                }
                if (part !== "") tokens.push(part);
            }
        }
        return tokens;
    }

    /**
     * Extracts the "core word" from a token by stripping leading/trailing punctuation.
     * Examples:
     *   "village."   => "village"
     *   "\"Hello,"   => "Hello"
     *   "didn\u2019t"    => "didn\u2019t"
     *   "(magic)"    => "magic"
     */
    function isAlpha(c) {
        const code = c.charCodeAt(0);
        return (code >= 65 && code <= 90) || // A-Z
               (code >= 97 && code <= 122) || // a-z
               (code >= 192 && code <= 591);  // Latin-1 Supplement and extensions (À-ǿ)
    }

    function extractWord(token) {
        let start = 0;
        while (start < token.length && !isAlpha(token[start])) {
            start++;
        }
        let end = token.length - 1;
        while (end >= start && !isAlpha(token[end])) {
            end--;
        }
        return token.slice(start, end + 1);
    }

    /**
     * Returns true if a token is primarily a "word" (contains >= 3 alpha chars).
     */
    function isWordToken(token) {
        const word = extractWord(token);
        return word.length >= 3;
    }

    /**
     * Checks if a token is pure whitespace.
     */
    function isWhitespace(token) {
        for (let i = 0; i < token.length; i++) {
            const char = token[i];
            if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
                return false;
            }
        }
        return token.length > 0;
    }

    // --- Core Logic ---

    function getValidParagraphs() {
        if (!paragraphs || paragraphs.length === 0) return [];
        return paragraphs.filter(p => {
            let count = 0;
            let inWord = false;
            for (let i = 0; i < p.length; i++) {
                const isWhite = (p[i] === ' ' || p[i] === '\t' || p[i] === '\n' || p[i] === '\r');
                if (!isWhite && !inWord) {
                    count++;
                    inWord = true;
                } else if (isWhite) {
                    inWord = false;
                }
            }
            return count >= MIN_PARAGRAPH_WORDS;
        });
    }

    function showRandomParagraph() {
        const validParagraphs = getValidParagraphs();
        if (validParagraphs.length === 0) return;

        // QOL: Always go back to the gaps tab before switching
        showTab('gaps');

        const randomParagraph = validParagraphs[Math.floor(Math.random() * validParagraphs.length)];
        const tokens = tokenize(randomParagraph);

        // Build list of indices that are valid gap candidates (word tokens with >= 3 alpha chars)
        const validIndices = [];
        tokens.forEach((token, idx) => {
            if (!isWhitespace(token) && isWordToken(token)) {
                validIndices.push(idx);
            }
        });

        // Select gap indices, ensuring no two gaps are adjacent words
        const gapIndices = selectGapIndices(tokens, validIndices, numGaps);

        gapCountLabel.textContent = gapIndices.length;

        renderParagraph(tokens, gapIndices);
        setupInputValidation();

        const firstInput = paragraphContainer.querySelector('input');
        if (firstInput) firstInput.focus();

        // Reset next button state
        nextButton.classList.remove("button-success");
        nextButton.textContent = "Next Challenge";
    }

    /**
     * Selects up to `maxGaps` indices from `validIndices`, ensuring
     * no two selected indices are adjacent words (only whitespace/punctuation between them).
     */
    function selectGapIndices(tokens, validIndices, maxGaps) {
        const gapIndices = [];
        const shuffled = [...validIndices].sort(() => 0.5 - Math.random());

        for (const idx of shuffled) {
            if (gapIndices.length >= maxGaps) break;

            const isTooClose = gapIndices.some(existingIdx => {
                const min = Math.min(idx, existingIdx);
                const max = Math.max(idx, existingIdx);

                // Check if any word-token exists between these two indices
                for (let i = min + 1; i < max; i++) {
                    if (!isWhitespace(tokens[i]) && isWordToken(tokens[i])) {
                        return false; // A word exists between them, so they are NOT adjacent
                    }
                }
                return true; // No word between them — they are adjacent
            });

            if (!isTooClose) {
                gapIndices.push(idx);
            }
        }

        return gapIndices;
    }

    function renderParagraph(tokens, gapIndices) {
        // Challenge View (Editable Inputs)
        paragraphContainer.innerHTML = tokens.map((token, index) => {
            if (gapIndices.includes(index)) {
                const word = extractWord(token);
                const prefix = token.slice(0, token.indexOf(word));
                const suffix = token.slice(token.indexOf(word) + word.length);
                return `${prefix}<input type="text" data-correct="${word.toLowerCase()}" class="gap-input" style="width: ${word.length + 2}ch">${suffix}`;
            }
            return token;
        }).join('');

        // Solution View (Read-only pre-filled inputs)
        fullParagraphContainer.innerHTML = tokens.map((token, index) => {
            if (gapIndices.includes(index)) {
                const word = extractWord(token);
                const prefix = token.slice(0, token.indexOf(word));
                const suffix = token.slice(token.indexOf(word) + word.length);
                return `${prefix}<input type="text" value="${word}" class="gap-input correct" readonly style="width: ${word.length + 2}ch">${suffix}`;
            }
            return token;
        }).join('');
    }

    function cleanWord(word) {
        if (!word) return "";
        let cleaned = "";
        for (let i = 0; i < word.length; i++) {
            let isSep = false;
            for (let j = 0; j < wordSeparators.length; j++) {
                if (word[i] === wordSeparators[j]) {
                    isSep = true;
                    break;
                }
            }
            if (!isSep) {
                cleaned += word[i];
            }
        }
        return cleaned.toLowerCase().trim();
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
                    // Auto-advance to next unresolved input with a small delay
                    let nextInput = null;
                    for (let i = index + 1; i < inputs.length; i++) {
                        if (!inputs[i].classList.contains('correct')) {
                            nextInput = inputs[i];
                            break;
                        }
                    }
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
            nextButton.classList.add("button-success");
            nextButton.textContent = "Solved! Next Challenge?";
            nextButton.focus();
        } else {
            nextButton.classList.remove("button-success");
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