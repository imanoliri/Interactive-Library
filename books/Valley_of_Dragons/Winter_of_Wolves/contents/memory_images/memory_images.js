const imageDir = "../.."

async function fetchImages() {
    try {
        const response = await fetch('./../../interactive_book_images.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        imageSources = await response.json();
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

let imageSources
let cursorIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    fetchImages().then(createMemory);
});

function createMemory() {
    const slider = document.getElementById('slider');
    const numImagesLabel = document.getElementById('numImagesLabel');
    const decreaseButton = document.getElementById('decreaseButton');
    const increaseButton = document.getElementById('increaseButton');

    numImagesSelect = parseInt(slider.value, 10);
    numImagesLabel.textContent = numImagesSelect;

    decreaseButton.addEventListener('click', () => {
        slider.value = parseInt(slider.value) - 1;
        slider.dispatchEvent(new Event('input'));
    });

    increaseButton.addEventListener('click', () => {
        slider.value = parseInt(slider.value) + 1;
        slider.dispatchEvent(new Event('input'));
    });

    slider.addEventListener('input', () => {
        numImagesSelect = parseInt(slider.value, 10);
        numImagesLabel.textContent = numImagesSelect;
        initializeGame();
    });

    const gameContainer = document.getElementById('game-container');
    const resetButton = document.getElementById('reset-button');

    let symbols
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;

    resetButton.addEventListener('click', initializeGame);

    // QOL: Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        const allCards = document.querySelectorAll('.card');
        if (allCards.length === 0) return;

        const cols = getComputedStyle(gameContainer).gridTemplateColumns.split(' ').length;

        if (e.key === 'ArrowRight') {
            moveCursor(1, allCards);
        } else if (e.key === 'ArrowLeft') {
            moveCursor(-1, allCards);
        } else if (e.key === 'ArrowDown') {
            moveCursor(cols, allCards);
        } else if (e.key === 'ArrowUp') {
            moveCursor(-cols, allCards);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent page scroll with space
            
            // If the game is won and Enter is pressed, reset the game
            if (e.key === 'Enter' && resetButton.classList.contains('win-highlight')) {
                initializeGame();
                return;
            }

            if (cursorIndex === -1) {
                moveCursor(0, allCards); // Activate first card if none selected
            } else if (cursorIndex >= 0 && cursorIndex < allCards.length) {
                handleCardClick({ target: allCards[cursorIndex] });
            }
        }
    });

    function moveCursor(step, allCards) {
        if (cursorIndex === -1) {
            cursorIndex = 0;
        } else {
            allCards[cursorIndex].classList.remove('cursor');
            cursorIndex = (cursorIndex + step + allCards.length) % allCards.length;
        }
        allCards[cursorIndex].classList.add('cursor');
        allCards[cursorIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Start the game on load
    initializeGame();

    function initializeGame() {
        gameContainer.innerHTML = '';
        symbols = shuffleSelectArray([...imageSources]);
        cards = createCardDeck();
        shuffleArray(cards);

        cards.forEach((imagePath, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.symbol = `${imageDir}/${imagePath}`;

            const img = document.createElement('img');
            img.src = `${imageDir}/${imagePath}`;
            card.appendChild(img);

            card.addEventListener('click', handleCardClick);
            gameContainer.appendChild(card);
        });

        matchedPairs = 0;
        flippedCards = [];
        cursorIndex = -1; // Reset cursor
        resetButton.classList.remove('win-highlight');
    }

    function handleCardClick(event) {
        const card = event.target ? event.target.closest('.card') : event;
        if (!card) return;

        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        if (flippedCards.length === 2) return;

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;

        if (card1.dataset.symbol === card2.dataset.symbol) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;

            if (matchedPairs === symbols.length) {
                resetButton.classList.add('win-highlight');
            }
        } else {
            document.body.style.pointerEvents = 'none'; // Prevent clicking while flipping back
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                document.body.style.pointerEvents = 'auto';
            }, 1000);
        }

        flippedCards = [];
    }

    function createCardDeck() {
        return [...symbols, ...symbols];
    }

    function shuffleSelectArray(images) {
        shuffleArray(images);
        return images.slice(0, numImagesSelect);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
