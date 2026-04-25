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
let imagesWithIndices;

let numImagesSelect;
let selectedImages;
let imagesToSelect;

let slider;
let numImagesLabel;

let circleContainer;
let popupSolved;
let popupFailed;




document.addEventListener('DOMContentLoaded', () => {
    fetchImages().then(createOrder);
});


function createOrder() {
    imagesWithIndices = imageSources.map((src, index) => ({ src, index }));

    slider = document.getElementById('numImagesSlider');
    numImagesLabel = document.getElementById('numImagesLabel');

    numImagesSelect = parseInt(slider.value, 10);
    numImagesLabel.textContent = numImagesSelect;// Initial number of images to display


    // Update the number of images based on the slider value
    slider.addEventListener('input', () => {
        numImagesSelect = parseInt(slider.value, 10);
        numImagesLabel.textContent = numImagesSelect;
        createAndPositionImages(); // Recreate the images with the new number
    });


    circleContainer = document.getElementById('circle-container');
    popupSolved = document.getElementById('popup-solved');
    popupFailed = document.getElementById('popup-failed');

    console.log(JSON.stringify(imageSources));

    // Initialize the puzzle
    createAndPositionImages();

    // QOL: Keyboard selection and control
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        const activePopup = document.querySelector('.popup.active');
        const popupId = activePopup ? activePopup.id : null;

        if (key >= '1' && key <= '7') {
            const index = parseInt(key) - 1;
            const images = document.querySelectorAll('.circle-container .image');
            if (images[index]) {
                handleImageClick(images[index], selectedImages[index]);
            }
        } else if (key === 'Enter') {
            if (activePopup) {
                changePuzzle(popupId);
            }
        } else if (key === 'Backspace') {
            if (activePopup) {
                resetPuzzle(popupId);
            } else {
                // Also allow resetting the current attempt without a popup
                resetPuzzle('popup-solved'); // This function only uses ID to hide it, so this works safely
            }
        }
    });
}

// Function to create and position images in a circular pattern
function createAndPositionImages() {

    // CSS and sizes
    let containerSize = 0.9 * Math.min(window.innerWidth, window.innerHeight); // Size of the circular container (adaptative)
    let maxImageRadius = (containerSize * Math.sin(Math.PI / numImagesSelect)) / (1 + Math.sin(Math.PI / numImagesSelect)) / 2;
    let imageSize = 2 * maxImageRadius * 0.9; // Adjust image size
    let centerSize = (containerSize - 2 * imageSize) * 0.85;
    let centerPosition = containerSize / 2;


    // Set CSS variables
    document.documentElement.style.setProperty('--container-size', `${containerSize}px`);
    document.documentElement.style.setProperty('--image-size', `${imageSize}px`);
    document.documentElement.style.setProperty('--highlight-size', `${imageSize * 3 / 100}px`);
    document.documentElement.style.setProperty('--center-size', `${centerSize}px`);
    document.documentElement.style.setProperty('--center-position', `${centerPosition}px`);

    adjustFontSize()



    // Clear previous images and numbers
    const images = document.querySelectorAll('.circle-container .image');
    images.forEach(image => image.remove());
    const labels = document.querySelectorAll('.image-label');
    labels.forEach(label => label.remove());

    // Initialize and shuffle the images
    selectedImages = shuffleSelectArray([...imagesWithIndices]); // Make a copy and shuffle
    imagesToSelect = [...selectedImages]; // Copy to keep track of user selection

    console.log(JSON.stringify(selectedImages));

    // Initialize the angle and radius for positioning
    const angleIncrement = (2 * Math.PI) / selectedImages.length;
    const radius = containerSize / 2 - imageSize / 2;
    const labelRadius = containerSize / 2 + 15; // Slightly outside the circle

    selectedImages.forEach((imageObj, position) => {
        const img = document.createElement('img');
        img.src = `${imageDir}/${imageObj.src}`;
        img.alt = `Image ${position + 1}`;
        img.classList.add('image');

        // Calculate position for the image
        const angle = angleIncrement * position - Math.PI / 2 - Math.PI / 6;
        const x = radius * Math.cos(angle) + radius;
        const y = radius * Math.sin(angle) + radius;
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;

        // Create numerical label
        const label = document.createElement('div');
        label.classList.add('image-label');
        label.textContent = position + 1;
        
        // Calculate position for the label (relative to center of container)
        // The container is centered at centerPosition, centerPosition
        const labelX = centerPosition + labelRadius * Math.cos(angle);
        const labelY = centerPosition + labelRadius * Math.sin(angle);
        label.style.left = `${labelX}px`;
        label.style.top = `${labelY}px`;

        // Add click event listener
        img.addEventListener('click', () => handleImageClick(img, imageObj));

        circleContainer.appendChild(img);
        circleContainer.appendChild(label);
    });
}

function handleImageClick(img, imageObj) {
    let minRemainderIndex = getMinimumIndex(imagesToSelect);
    console.log(JSON.stringify(imagesToSelect));
    console.log("imageObj.index:", imageObj.index);
    console.log("minRemainderIndex:", minRemainderIndex);

    if (imageObj.index === minRemainderIndex) {
        img.classList.add('highlight');        
    } else {
        popupFailed.classList.add('active');
    }

    imagesToSelect = removeImageByIndex(imagesToSelect, imageObj.index);
    if (imagesToSelect.length === 0) {
        popupSolved.classList.add('active');
    }
}

// Function to select and shuffle a number of elements from the array
function shuffleSelectArray(images) {
    shuffleArray(images);
    return images.slice(0, numImagesSelect);
}

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to get the minimum index from imagesToSelect
function getMinimumIndex(images) {
    return Math.min(...images.map(imageObj => imageObj.index));
}

// Function to remove an image by index from imagesToSelect
function removeImageByIndex(images, targetIndex) {
    const indexToRemove = findIndexInImageIndexList(images, targetIndex);
    images.splice(indexToRemove, 1);
    return images;
}

// Function to find the index of an image in the array
function findIndexInImageIndexList(pairsArray, targetIndex) {
    for (let i = 0; i < pairsArray.length; i++) {
        if (pairsArray[i].index === targetIndex) {
            return i;
        }
    }
    return -1;
}

// Function to reset the puzzle (deselects images but keeps the same set)
function resetPuzzle(popupId) {
    // Remove the 'highlight' class from all images
    const images = document.querySelectorAll('.circle-container .image');
    images.forEach(image => image.classList.remove('highlight'));

    // Hide the popup message
    document.getElementById(popupId).classList.remove('active');

    // Re-initialize the imagesToSelect array to the original selectedImages
    imagesToSelect = [...selectedImages];
}

// Function to change to a new puzzle (reshuffles and selects new images)
function changePuzzle(popupId) {
    createAndPositionImages();
    document.getElementById(popupId).classList.remove('active');
}

function adjustFontSize() {
    const centerText = document.querySelector('.center-text');
    const parentWidth = centerText.offsetWidth;
    const parentHeight = centerText.offsetHeight;

    // Start with a reasonably large font size
    let fontSize = 100;

    // Reduce the font size until it fits within the container
    centerText.style.fontSize = `${fontSize}px`;
    while (
        centerText.scrollWidth > parentWidth ||
        centerText.scrollHeight > parentHeight
    ) {
        fontSize--;
        centerText.style.fontSize = `${fontSize}px`;
    }
}
