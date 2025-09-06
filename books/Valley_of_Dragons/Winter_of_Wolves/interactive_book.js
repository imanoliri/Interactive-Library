document.addEventListener('DOMContentLoaded', () => {
    window.onload = function () {
        showTab(0);
    }
});

function showTab(index) {
    var tabs = document.getElementsByClassName('tab');
    var buttons = document.getElementsByClassName('tab-button');
    console.log(index)
    console.log(tabs)
    console.log(buttons)
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
        buttons[i].classList.remove('active');
    }
    tabs[index].style.display = 'block';
    buttons[index].classList.add('active');
}

let userName
function sendChapterFeedback() {
    const aspects = ["Overall", "World-Building", "Plot", "Pacing", "Dialogue", "Character Development", "Conflict/Tension", "Themes", "Emotional Impact"];
    // Metadata
    if (!userName) {
        userName = prompt("Please enter your name (or leave blank for anonymous):") || "Anonymous";
    }
    const storyId = 1;
    const chapter = document.querySelector(".tab-button.active")?.textContent.trim();
    const currentDate = new Date().toISOString();
    // Collect data from both tables
    let chapterFeedback = { chapter: chapter, ratings: {}, comments: {} };
    // Collect ratings
    const ratingCells = Array.from(document.querySelectorAll("#feedbackTable tr")).find(row => row.cells[0]?.textContent.trim() === "Rating")?.querySelectorAll("td[contenteditable='true']");
    ratingCells.forEach((cell, i) => {
        const value = parseInt(cell.innerText.trim(), 10);
        chapterFeedback.ratings[aspects[i]] = isNaN(value) ? null : value;
    });
    // Collect comments
    const commentCells = Array.from(document.querySelectorAll("#feedbackTable tr")).find(row => row.cells[0]?.textContent.trim() === "Comments")?.querySelectorAll("td[contenteditable='true']");
    commentCells.forEach((cell, i) => {
        chapterFeedback.comments[aspects[i]] = cell.innerText.trim() || null;
    });
    // Add metadata
    feedbackData = [{
        userName: userName,
        storyID: storyId,
        date: currentDate,
        chapter: chapter,
        ...chapterFeedback
    }];

    if (chapterFeedbackIsEmpty(chapterFeedback) !== true) {

        console.log(chapterFeedback)

        // Send feedback to the Netlify serverless function
        fetch('/.netlify/functions/logFeedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackData)
        })
            .then(response => {
                if (response.ok) {
                    alert("Feedback sent successfully!");
                } else {
                    alert("Failed to send feedback. Please try again.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred. Please try again.");
            });
    }
}

function chapterFeedbackIsEmpty(chapterFeedback) {
    const allRatingsAreEmpty = Object.values(chapterFeedback.ratings).every(value => value === null);
    const allCommentsAreEmpty = Object.values(chapterFeedback.comments).every(value => value === null || value.trim() === "");
    return allRatingsAreEmpty && allCommentsAreEmpty;
}