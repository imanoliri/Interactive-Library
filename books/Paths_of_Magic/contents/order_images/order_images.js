const imageDir = "../..";
let imageSources = [];
let correctSequence = [];
let currentIndex = 0;
let numImages = 6;

async function fetchImages() {
    try {
        const response = await fetch('./../../interactive_book_images.json');
        if (!response.ok) throw new Error("Failed to fetch images");
        imageSources = await response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('numImagesSlider');
    const label = document.getElementById('numImagesLabel');
    const resetBtn = document.getElementById('reset-btn');

    slider.addEventListener('input', () => {
        numImages = parseInt(slider.value, 10);
        label.textContent = numImages;
        initGame();
    });

    resetBtn.addEventListener('click', initGame);

    fetchImages().then(initGame);
});

function initGame() {
    const container = document.getElementById('circle-container');
    // Remove existing nodes (keep center content)
    document.querySelectorAll('.image-node').forEach(n => n.remove());
    
    currentIndex = 0;
    
    // Select a random slice of the images as our "Story segment"
    // We assume the JSON is in chronological order
    const maxStart = Math.max(0, imageSources.length - numImages);
    const startIdx = Math.floor(Math.random() * (maxStart + 1));
    correctSequence = imageSources.slice(startIdx, startIdx + numImages);
    
    // Shuffle for display
    const shuffled = [...correctSequence].map((path, id) => ({ path, originalId: id }));
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    updateProgress();
    renderNodes(shuffled);
}

function renderNodes(shuffled) {
    const container = document.getElementById('circle-container');
    const containerSize = container.offsetWidth;
    const radius = containerSize * 0.38;
    const center = containerSize / 2;
    const nodeSize = containerSize * 0.2;

    document.documentElement.style.setProperty('--container-size', `${containerSize}px`);
    document.documentElement.style.setProperty('--image-size', `${nodeSize}px`);

    shuffled.forEach((item, i) => {
        const angle = (i / shuffled.length) * (2 * Math.PI) - Math.PI / 2;
        const x = center + radius * Math.cos(angle) - nodeSize / 2;
        const y = center + radius * Math.sin(angle) - nodeSize / 2;

        const node = document.createElement('div');
        node.className = 'image-node';
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.dataset.path = item.path;

        const img = document.createElement('img');
        img.src = `${imageDir}/${item.path}`;
        img.draggable = false;
        node.appendChild(img);

        node.addEventListener('click', () => handleNodeClick(node, item.path));
        container.appendChild(node);
    });
}

function handleNodeClick(node, path) {
    if (node.classList.contains('correct')) return;

    if (path === correctSequence[currentIndex]) {
        node.classList.add('correct');
        currentIndex++;
        updateProgress();

        if (currentIndex === correctSequence.length) {
            setTimeout(() => {
                alert("The Timeline is Restored! You have remembered it all. ✨");
            }, 500);
        }
    } else {
        node.classList.add('wrong');
        setTimeout(() => node.classList.remove('wrong'), 400);
        
        // Reset progress on error? Or just highlight error.
        // Let's be lenient but maybe reset streak if we had one.
    }
}

function updateProgress() {
    const indicator = document.getElementById('progress-indicator');
    indicator.textContent = `${currentIndex} / ${correctSequence.length}`;
}

window.addEventListener('resize', () => {
    // Re-render nodes on resize for positioning
    const shuffled = Array.from(document.querySelectorAll('.image-node')).map(n => ({
        path: n.dataset.path,
        // We don't really need originalId here for positioning
    }));
    initGame(); // Simpler to just re-init for now
});
