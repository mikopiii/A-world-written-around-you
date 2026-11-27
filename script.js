/* BACKGROUND MUSIC */

const bgm = new Audio("audio/bgm.mp3");
bgm.loop = true;

bgm.play().catch(function() {
    document.addEventListener("click", function() {
        bgm.play();
    }, { once: true });
});


/* GAME TITLE TYPEWRITER EFFECT */

const startButton = document.getElementById("startButton");
const gameTitle = document.getElementById("gameTitle");

const titleText = "A World Written Around You";

let titleIndex = 0;
let deleting = false;

function typeWriter() {
    if (!deleting) {
        gameTitle.textContent = titleText.substring(0, titleIndex + 1);
        titleIndex++;

        if (titleIndex === titleText.length) {
            deleting = true;
            setTimeout(typeWriter, 2000);
            return;
        }

        setTimeout(typeWriter, 120);
    } else {
        gameTitle.textContent = titleText.substring(0, titleIndex - 1);
        titleIndex--;

        if (titleIndex === 0) {
            deleting = false;
            setTimeout(typeWriter, 1000);
            return;
        }

        setTimeout(typeWriter, 60);
    }
}

typeWriter();


/* PAGE NAVIGATION */

const homePage = document.getElementById("homePage");
const chapterPage = document.getElementById("chapterPage");
const chapterIntro = document.getElementById("chapterIntro");
const chapterIntroTitle = document.getElementById("chapterIntroTitle");

startButton.addEventListener("click", function() {

    homePage.style.display = "none";
    chapterPage.style.display = "block";

});


/* CHAPTER CONTENT TYPEWRITER EFFECT */

const chapterTypingSpeed = 60;

let chapterTypingTimer = null;

const chapterOriginalContent = new WeakMap();

function typeChapterContent(element) {

    clearTimeout(chapterTypingTimer);

    // Preserve the original chapter content
    if (!chapterOriginalContent.has(element)) {

        const contentCopy = element.cloneNode(true);

        contentCopy.querySelectorAll("br").forEach(function(lineBreak) {
            lineBreak.replaceWith("\n");
        });

        const fullText = contentCopy.textContent
            .split("\n")
            .map(function(line) {
                return line.trim();
            })
            .join("\n")
            .trim();

        chapterOriginalContent.set(element, fullText);

    }

    const fullText = chapterOriginalContent.get(element);

    element.textContent = "";

    let characterIndex = 0;

    if (!fullText) {
        return;
    }

    function typeNextCharacter() {

        if (characterIndex < fullText.length) {

            element.textContent += fullText.charAt(characterIndex);

            characterIndex++;

            chapterTypingTimer = setTimeout(
                typeNextCharacter,
                chapterTypingSpeed
            );

        }

    }

    typeNextCharacter();

}


/* CHAPTER SELECTION AND TRANSITIONS */

const chapterBoxes = document.querySelectorAll(".chapter-box");

const chapterPages = document.querySelectorAll(".chapter-content");

const backButtons = document.querySelectorAll(".chapterBackButton");

const nextButtons = document.querySelectorAll(".chapter-next-button");

const previousButtons = document.querySelectorAll(".chapter-previous-button");

let selectedChapter = null;
let chapterTransitionTimer = null;
let chapterNavigationTimer = null;

const chapterFadeDuration = 700;


// DISPLAY SELECTED CHAPTER

function displayChapter(chapterNumber) {

    // Hide all chapter pages
    chapterPages.forEach(function(page) {
        page.style.display = "none";
    });

    // Display selected chapter page
    const selectedPage = document.getElementById(
        "chapter" + chapterNumber + "Content"
    );

    selectedPage.style.display = "block";

    // Reset chapter text transition
    const chapterText = selectedPage.querySelector(
        "[data-chapter-text]"
    );

    chapterText.classList.remove("fade-out");

    // Enable navigation buttons
    selectedPage.querySelectorAll(".chapter-navigation-button").forEach(function(button) {
        button.disabled = false;
    });

    // Start chapter content typewriter
    typeChapterContent(chapterText);

}


// CHAPTER SELECTION BUTTONS

chapterBoxes.forEach(function(box) {

    box.addEventListener("click", function() {

        selectedChapter = Number(this.dataset.chapter);

        // Stop any previous transitions
        clearTimeout(chapterTransitionTimer);
        clearTimeout(chapterNavigationTimer);
        clearTimeout(chapterTypingTimer);

        // Hide chapter selection
        chapterPage.style.display = "none";

        // Show the editable chapter title during the transition
        chapterIntroTitle.textContent =
            this.dataset.transitionTitle || "Chapter " + selectedChapter;

        chapterIntro.style.display = "block";

        // Restart transition animation
        chapterIntro.classList.remove("show");
        void chapterIntro.offsetWidth;
        chapterIntro.classList.add("show");

        // Show selected chapter page after 4 seconds
        chapterTransitionTimer = setTimeout(function() {

            chapterIntro.style.display = "none";
            chapterIntro.classList.remove("show");

            displayChapter(selectedChapter);

        }, 4000);

    });

});


/* CHAPTER NEXT AND PREVIOUS NAVIGATION */


function navigateChapter(direction) {

    // Prevent navigation beyond available chapters
    const nextChapter = selectedChapter + direction;

    if (nextChapter < 1 || nextChapter > 16) {
        return;
    }

    // Prevent multiple transitions at once
    clearTimeout(chapterNavigationTimer);

    // Stop current chapter typing
    clearTimeout(chapterTypingTimer);

    const currentPage = document.getElementById(
        "chapter" + selectedChapter + "Content"
    );

    const currentText = currentPage.querySelector(
        "[data-chapter-text]"
    );

    // Disable navigation buttons during transition
    currentPage.querySelectorAll(".chapter-navigation-button").forEach(function(button) {
        button.disabled = true;
    });

    // Slowly fade out current chapter writing
    currentText.classList.add("fade-out");

    // Open the next or previous chapter after the fade
    chapterNavigationTimer = setTimeout(function() {

        selectedChapter = nextChapter;

        // Show the new chapter title
        chapterIntroTitle.textContent =
            document.querySelector(
                '.chapter-box[data-chapter="' + selectedChapter + '"]'
            )?.dataset.transitionTitle || "Chapter " + selectedChapter;

        chapterIntro.style.display = "block";

        // Restart transition animation
        chapterIntro.classList.remove("show");
        void chapterIntro.offsetWidth;
        chapterIntro.classList.add("show");

        // Display the new chapter after 4 seconds
        chapterNavigationTimer = setTimeout(function() {

            chapterIntro.style.display = "none";
            chapterIntro.classList.remove("show");

            displayChapter(selectedChapter);

        }, 4000);

    }, chapterFadeDuration);

}


// NEXT BUTTONS

nextButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        navigateChapter(1);

    });

});


// PREVIOUS BUTTONS

previousButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        navigateChapter(-1);

    });

});


// CHAPTER BACK BUTTON NAVIGATION

backButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // Stop chapter typing and transitions
        clearTimeout(chapterTypingTimer);
        clearTimeout(chapterNavigationTimer);

        // Hide current chapter page
        chapterPages.forEach(function(page) {

            page.style.display = "none";

            // Reset chapter text opacity
            const chapterText = page.querySelector("[data-chapter-text]");

            chapterText.classList.remove("fade-out");

            // Re-enable navigation buttons
            page.querySelectorAll(".chapter-navigation-button").forEach(function(navButton) {
                navButton.disabled = false;
            });

        });

        // Return to chapter selection
        chapterPage.style.display = "block";

    });

});