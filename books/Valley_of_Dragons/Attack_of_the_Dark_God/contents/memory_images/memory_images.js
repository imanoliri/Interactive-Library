const imageDir = "../..";
let imageSources = [];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let numImagesSelect = 6;

async function fetchImages() {
    try {
        const response = await fetch('./../../interactive_book_images.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        imageSources = await response.json();
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('slider');
    const label = document.getElementById('numImagesLabel');
    const resetButton = document.getElementById('reset-button');

    slider.addEventListener('input', () => {
        numImagesSelect = parseInt(slider.value, 10);
        label.textContent = numImagesSelect;
        initGame();
    });

    resetButton.addEventListener('click', initGame);

    fetchImages().then(initGame);
});

function initGame() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    
    // Reset stats
    moves = 0;
    matchedPairs = 0;
    flippedCards = [];
    updateStats();

    // Select and shuffle images
    const symbols = shuffleArray([...imageSources]).slice(0, numImagesSelect);
    const deck = shuffleArray([...symbols, ...symbols]);

    deck.forEach(imagePath => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.symbol = imagePath;

        const inner = `
            <div class="card-back"></div>
            <div class="card-front">
                <img src="${imageDir}/${imagePath}" draggable="false">
            </div>
        `;
        card.innerHTML = inner;

        card.addEventListener('click', () => handleCardClick(card));
        container.appendChild(card);
    });
}

function handleCardClick(card) {
    if (
        card.classList.contains('flipped') || 
        card.classList.contains('matched') || 
        flippedCards.length === 2
    ) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        updateStats();
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.symbol === card2.dataset.symbol) {
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            updateStats();
            
            if (matchedPairs === numImagesSelect) {
                setTimeout(() => alert(`Victory! You found all pairs in ${moves} moves. ✨`), 500);
            }
        }, 300);
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }, 1000);
    }

    flippedCards = [];
}

function updateStats() {
    document.getElementById('moveCount').textContent = moves;
    document.getElementById('matchCount').textContent = matchedPairs;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
