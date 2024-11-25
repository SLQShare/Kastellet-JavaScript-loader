console.log(isOnMissionsPage());
let missionId = 1248; // default value
const urlDk = "https://staging-1732022352.gbplayground.dk/wp-content/uploads/2024/11/dk.json";

main(missionId, urlDk);

function main(missionId, urlDk) {
    if (isOnMissionsPage()) {
        fetchAndProcessData(missionId, urlDk);     
    }
}

// Function to fetch data and process it
async function fetchAndProcessData(missionId,url) {
    try {
        const jsonData = await jQuery.getJSON(url);
        console.log("Data received:", jsonData);
        // Call a function to process the data
        processData(missionId, jsonData);
    } catch (error) {
        console.error("Error fetching JSON:", error);
    }
}

// Function to process the data
function processData(missionId , data) {
    // Implement your logic here
    console.log("Processing data:", data);
    const dataDk = data;
    console.log("dataDk:", dataDk)
    addTextFromDataToTable(dataDk, missionId)
    updateImagesAndImageText(dataDk, missionId)
}

// checks the current page, so the code is only running when needed
function isOnMissionsPage() {
    const path = window.location.pathname.toLowerCase();
    return path.includes('/missions');
}

// finds element by Id
function findElementById(id) {
    return document.getElementById(id);
}

// checks HTML element for text
function hasNonEmptyText(element) {
    return element.textContent.trim().length > 0;
}

// removes placeholder text and adds long text in chunks to save TODO: likely needs to be deleted
function addLongStringInChunks(element, longString, chunkSize = 1000) {
    if (!element) {
        console.error("Element not found.");
        return;
    }
    element.textContent = "";
    let currentIndex = 0;
    const totalLength = longString.length;

    while (currentIndex < totalLength) {
        const chunk = longString.slice(currentIndex, currentIndex + chunkSize);
        element.textContent += chunk; // Append the current chunk
        currentIndex += chunkSize;
    }
}

// searches all child elements of element and store all elements containing text 
function searchAndFindTextElements(element){
    if (!element) {
        console.error(element +' not found.');
        return;
    }
    const childElements = Array.from(element.querySelectorAll('*'));

    const filteredArray = childElements.filter(element => 
        element.tagName.toLowerCase() !== 'div' && hasNonEmptyText(element)
    );
    return filteredArray
}

function getMissionById(missionsArray, id) {
    if (!Array.isArray(missionsArray)) {
        throw new Error("Invalid missions data: Expected an array.");
    }

    const mission = missionsArray.find(mission => mission.id === id);
    if (mission) {
        return mission;
    } else {
        throw new Error(`Mission with id ${id} not found.`);
    }
}

function addTextFromDataToTable(data, missionId) {
    const table = findElementById('MissionTabs');
    const missionInformation = getMissionById(data.missions, missionId);

    // Ensure the mission data is valid
    if (!missionInformation || !missionInformation.content || !missionInformation.content.text) {
        console.error("Invalid mission data or content structure.");
        return;
    }

    // Get text elements
    const textElementsByClass = Array.from(document.getElementsByClassName('TabText'));

    // Get header elements
    const filteredArrayOfElements = searchAndFindTextElements(table).filter(
        element => element instanceof HTMLElement && !(element.tagName.toLowerCase() === 'button' || element.tagName.toLowerCase() === 'p')
    );

    // Determine the number of sections to process (minimum of available data or elements)
    const numSections = Math.min(
        missionInformation.content.text.length,
        textElementsByClass.length,
        Math.floor(filteredArrayOfElements.length / 2) // Two headers per section
    );

    //console.log(`Processing ${numSections} sections...`);

    // Loop through text entries for text assignments
    for (let i = 0; i < numSections; i++) {
        const textEntry = missionInformation.content.text[i];

        // Assign text content
        if (textEntry && textEntry.text && textElementsByClass[i]) {
            textElementsByClass[i].innerHTML = textEntry.text; // Assign text
        } else {
            console.warn(`No text or element found for index ${i}`);
        }
    }

    // Loop through header assignments and hide unused buttons
    for (let i = 0; i < filteredArrayOfElements.length; i++) {
        const headerEntry = missionInformation.content.text[i]?.heading;
        const buttonElement = filteredArrayOfElements[i].closest('button'); // Find the closest parent button

        if (i < numSections) {
            // Assign header content
            if (headerEntry) {
                filteredArrayOfElements[i].textContent = headerEntry; // Assign heading
                if (buttonElement) {
                    buttonElement.style.display = ''; // Show the button
                }
            } else {
                if (buttonElement) {
                    buttonElement.style.display = 'none'; // Hide the button
                }
            }
        } else {
            // Hide the button for unused headers
            if (buttonElement) {
                buttonElement.style.display = 'none';
            }
        }
    }
}
// updates the images for the mission TODO: The image location is hard coded and need to be changed
function updateImagesAndImageText(data, missionId) {
    const pictureSlider = document.getElementsByClassName('swiper-wrapper'); // Elementor carousel wrapper
    const missionInformation = getMissionById(data.missions, missionId);
    try {
        console.log("pictureSlider[0]:", pictureSlider[0]);
        console.log("missionInformation:", missionInformation);

        const missionImageArray = missionInformation.content.gallery.images;
        console.log("missionImageArray:", missionImageArray);

        const existingSlides = Array.from(pictureSlider[0].querySelectorAll('.swiper-slide'));
        console.log("Existing Slides:", existingSlides);

        for (let i = 0; i < missionImageArray.length; i++) {
            const imageLocation = missionImageArray[i]?.url;
            const imageText = missionImageArray[i]?.caption;

            console.log(`Image Location: ${imageLocation}`);
            console.log(`Image Text: ${imageText}`);

            if (i < existingSlides.length) {
                // Update existing slides
                const imageDiv = existingSlides[i].querySelector('.elementor-carousel-image');
                if (imageDiv) {
                    imageDiv.style.backgroundImage = `url('https://staging-1732022352.gbplayground.dk/wp-content/uploads/MissionImages/${imageLocation}')`;
                    imageDiv.setAttribute('aria-label', imageText || '');
                }
            } else {
                // Create new slides
                const wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'swiper-slide';
                wrapperDiv.setAttribute('role', 'group');
                wrapperDiv.setAttribute('aria-label', `${i + 1} / ${missionImageArray.length}`);
                wrapperDiv.style.width = '423px';
                wrapperDiv.style.marginRight = '10px';

                const imageDiv = document.createElement('div');
                imageDiv.className = 'elementor-carousel-image';
                imageDiv.setAttribute('role', 'img');
                imageDiv.style.backgroundImage = `url('https://staging-1732022352.gbplayground.dk/wp-content/uploads/MissionImages/${imageLocation}')`;
                imageDiv.setAttribute('aria-label', imageText || '');

                wrapperDiv.appendChild(imageDiv);

                // Append the new slide to the swiper-wrapper
                pictureSlider[0].appendChild(wrapperDiv);

                console.log("Appended new slide:", wrapperDiv);
            }
        }
    } catch (error) {
        console.error("Error updating carousel:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const imageText = document.getElementById('figureTextId');
    const imageTextElementArray = searchAndFindTextElements(imageText);
    let imageTextParagraphElement = null;

    // Determine the target element for updating text
    if (imageTextElementArray.length === 1) {
        imageTextParagraphElement = imageTextElementArray[0];
    } else {
        console.warn('Unable to determine single imageTextParagraphElement.');
        return;
    }

    console.log('imageTextParagraphElement:', imageTextParagraphElement);

    // Select the carousel wrapper
    const carousel = document.querySelector('.swiper-wrapper'); // Adjust selector as needed

    if (carousel) {
        // Add event listener to detect changes in the slider
        carousel.addEventListener('transitionend', () => {
            updateActiveSlideText(imageTextParagraphElement);
        });

        // Initial update for the first active slide
        updateActiveSlideText(imageTextParagraphElement);
    } else {
        console.error('Carousel element not found.');
    }

    // Function to update the text for the active slide
    function updateActiveSlideText(textElement) {
        if (!textElement) return;

        // Find the currently active slide
        const activeSlide = document.querySelector('.swiper-slide-active');
        if (activeSlide) {
            // Extract the `aria-label` or other relevant text from the active slide
            const ariaLabel = activeSlide.getAttribute('aria-label') || 'No description available';
            textElement.textContent = ariaLabel;

            console.log('Updated text to active slide aria-label:', ariaLabel);
        } else {
            console.warn('No active slide found.');
        }
    }
});

