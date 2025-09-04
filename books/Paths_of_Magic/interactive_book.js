// Load the JSON file and create tabs
async function loadStory() {
    try {
        // Fetch the story_by_chapters.json file
        const responseStoryData = await fetch('interactive_book_tabs.json');
        const storyData = await responseStoryData.json();
        const response_story_metadata = await fetch('story_metadata.json');
        const story_metadata = await response_story_metadata.json();
        console.log(story_metadata)

        document.title = story_metadata['story_name'];
        document.querySelector("h1").textContent = story_metadata['story_name'];

        // Get references to tabs container and content container
        const tabButtons = document.getElementById('tabButtons');
        const tabContainer = document.getElementById('tabContents');

        // Generate tabs and their content
        Object.keys(storyData).forEach((chapterName, index) => {
            // Create a tab button
            const tabButton = document.createElement('div');
            tabButton.className = 'tab-button';
            tabButton.textContent = chapterName;

            // Add click event to show content when the tab is clicked
            tabButton.addEventListener('click', () => showTab(storyData, chapterName, tabButton, tabContainer))

            // Create the tab container
            tabButtons.appendChild(tabButton);
        });


        tabButtons.children[0].classList.add('active');
        tabContainer.innerHTML = storyData[Object.keys(storyData)[0]];

    } catch (error) {
        console.error('Error loading the story:', error);
        document.getElementById('tabContents').textContent = 'Failed to load story. Please try again later.';
    }
}

function showTab (storyData, chapterName, tabButton, tabContainer) {
    document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
    tabButton.classList.add('active');
    tabContainer.innerHTML = storyData[chapterName];
};

// Load the story when the page loads
document.addEventListener('DOMContentLoaded', loadStory);