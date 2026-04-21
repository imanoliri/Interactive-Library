const imageDir = "../.."

async function fetchImages() {
    try {
        const response = await fetch('./../../interactive_book_images.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        imageSources = await response.json();
        console.log("Images fetched:", imageSources);


    } catch (error) {
        console.error("Error fetching paragraphs:", error);
    }
}

let imageSources

document.addEventListener('DOMContentLoaded', () => {
    fetchImages().then(createMemory);
});

function createMemory() {
    const slider = document.getElementById('slider');
    const numImagesLabel = document.getElementById('numImagesLabel');
    const decreaseButton = document.getElementById('decreaseButton');
    const increaseButton = document.getElementById('increaseButton');

    numImagesSelect = parseInt(slider.value, 10);
    numImagesLabel.textContent = numImagesSelect;// Initial number of images to display


    decreaseButton.addEventListener('click', () => {
        slider.value = parseInt(slider.value) - 1;
        slider.dispatchEvent(new Event('input')); // Trigger input event

    });

    increaseButton.addEventListener('click', () => {
        slider.value = parseInt(slider.value) + 1;
        slider.dispatchEvent(new Event('input')); // Trigger input event

    });

    // Update the number of images based on the slider value
    slider.addEventListener('input', () => {
        numImagesSelect = parseInt(slider.value, 10);
        numImagesLabel.textContent = numImagesSelect;
        initializeGame(); // Recreate the images with the new number
    });

    const gameContainer = document.getElementById('game-container');
    const resetButton = document.getElementById('reset-button');

    // Array of image paths
    let symbols

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;


    // Reset the game
    resetButton.addEventListener('click', initializeGame);

    // Start the game on load
    initializeGame();


    // Initialize the game
    function initializeGame() {
        gameContainer.innerHTML = '';
        symbols = shuffleSelectArray([...imageSources]);
        cards = createCardDeck();
        shuffleArray(cards);

        cards.forEach(imagePath => {
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
    }

    // Handle card click event
    function handleCardClick(event) {
        const card = event.target.closest('.card');

        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        if (flippedCards.length === 2) return;

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }

    // Check if the flipped cards match
    function checkForMatch() {
        const [card1, card2] = flippedCards;

        if (card1.dataset.symbol === card2.dataset.symbol) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;

            if (matchedPairs === symbols.length) {
                setTimeout(() => alert('You matched all pairs!'), 300);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 1000);
        }

        flippedCards = [];
    }

    // Create a deck of cards (duplicate image paths for pairs)
    function createCardDeck() {
        return [...symbols, ...symbols];
    }

    // Function to select and shuffle a number of elements from the array
    function shuffleSelectArray(images) {
        console.log(numImagesSelect)
        shuffleArray(images);
        return images.slice(0, numImagesSelect);
    }


    // Shuffle the array of cards
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

}
