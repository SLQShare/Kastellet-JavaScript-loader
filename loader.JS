let missionId = 1248; // default value
const urlDk = "https://staging-1732022352.gbplayground.dk/wp-content/uploads/2024/11/dk.json";
const urlDk2 = 'https://staging-1732022352.gbplayground.dk/wp-content/uploads/2024/12/dk2.json';
// filter storage object
const selectedFilters = {
    period: null,
    contribution: null, 
    geography: null,
};

const filterStateStorage = {
    period: {
        isFilterActive: false,
        activeParentButton: null,
        activeFilterButton: null,
    },
    contribution: {
        isFilterActive: false,
        activeParentButton: null,
        activeFilterButton: null,
    },
    geography: {
        isFilterActive: false,
        activeParentButton: null,
        activeFilterButton: null,
    },
};
// the map coordinates for zooming in and placing continent map pins
const mapCoordinatesForZoom = {
    africa: { scale: 2.7, x: -10, y: -43 },
    asia: { scale: 3, x: -60, y: -25 },
    europe: { scale: 3.8, x: -13, y: 50 },
    america: { scale: 1.4, x: 50, y: -13 },
    middleeast: { scale: 6, x: -50, y: -15 },
    australia: { scale: 1.6, x: -15, y: 5 },
    default: { scale: 1, x: 0, y: 0 } // Default zoom for reset or unmatched regions
};
// map coordinates for placing continent map pins
const mapCoordinatesForContinetMapPins = {
    africa: { x: 50, y: 55 },
    asia: { x: 70, y: 45 },
    europe: { x: 50, y: 35 },
    america: { x: 25, y: 45 },
    middleeast: { x: 58, y: 45 },
    australia: { x: 50, y: 55 },
    default: { x: 50, y: 55 } // Default zoom for reset or unmatched regions
};
const forceColors = {
    1087: { backgroundColor: "#518346", textColor: "#ffffff" },
    1088: { backgroundColor: "#4a9fd8", textColor: "#ffffff" },
    1089: { backgroundColor: "#052854", textColor: "#ffffff" },
    1090: { backgroundColor: "#8d1b3d", textColor: "#ffffff" },
    1091: { backgroundColor: "#ffffff", textColor: "#81847e" }, 
    1092: { backgroundColor: "#de8130", textColor: "#ffffff" },
    1093: { backgroundColor: "#f4d70d", textColor: "#ffffff" },
};

// Singleton for managing excludedIds
const ExcludedIdsManager = (() => {
    let excludedIds = [1240, 4690, 4691]; // Initial values

    return {
        getExcludedIds: () => [...excludedIds], // Return a copy of the array to avoid direct modification
        addExcludedId: (id) => {
            if (!excludedIds.includes(id)) {
                excludedIds.push(id);
            }
        },
        removeExcludedId: (id) => {
            excludedIds = excludedIds.filter(item => item !== id);
        },
        clearExcludedIds: () => {
            excludedIds = [];
        }
    };
})();

main(missionId, urlDk2);

function main(missionId, urlDk) {
    fetchAndProcessData(missionId, urlDk);   
}

// Function to fetch data and process it
async function fetchAndProcessData(missionId, url) {
    try {
        const jsonData = await jQuery.getJSON(url);
        console.log("Data received");
        // Call a function to process the data
        processData(missionId, jsonData);
    } catch (error) {
        console.error("Error fetching JSON:", error);
    }
}

// Function to process the data
function processData(missionId , data) {
    const dataDk = data;
    console.log("dataDk:", dataDk);
    updateTheMissionsPage(missionId, data);
    updateTheInfoScreen(missionId, data);
}

// update the missionspage with information
function updateTheMissionsPage(missionId, data){
    if (isOnMissionsPage('missions')) {
        headerInformation(data, missionId, 'MissionTitle', 'name');
        headerInformation(data, missionId, 'MissionSubtitle', 'subtitle');
        comparesTheForceTagsToMissionForces(data, missionId, "ForceContainer");
        assignMissionDuration(data, missionId, "MissionDuration")
        addTextFromDataToTable(data, missionId);
        updateImagesAndImageText(data, missionId);   
    }
}



// Checks if the current page matches the specified site name
function isOnMissionsPage(siteName) {
    if (!siteName || typeof siteName !== 'string') {
        console.error('Invalid siteName provided');
        return false;
    }
    
    const path = window.location.pathname.toLowerCase();
    const normalizedSiteName = siteName.trim().toLowerCase();

    console.log(`Checking path: ${path} for /${normalizedSiteName}`);
    return path.includes(`/${normalizedSiteName}`);
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

// headerInformation(data, missionId, cssId, informationType
function headerInformation(data, missionId, cssId, informationType){
    const missionInformation = getMissionById(data.missions, missionId);
    const elementArray = searchAndFindTextElements(findElementById(cssId));
    try {
        elementArray[0].innerHTML = missionInformation[informationType];
    } catch (error) {
        log.error("invalide information passed into headerInformation", error)
    }
}

// loop child elements and compare each element to mission forces
function comparesTheForceTagsToMissionForces(data, missionId, cssId){
    const missionInformation = getMissionById(data.missions, missionId);
    const elementForcesArray = Array.from(findElementById(cssId).querySelectorAll('*'));
    const missionForces = missionInformation.forces;
    
    elementForcesArray.forEach(element => {
        const elementId = parseInt(element.id, 10)
        if (!missionForces.includes(elementId)){
            element.style.display = 'none'
        }
    });
}

// concatenate from and to into the year
function assignMissionDuration(data, missionId, cssId){
    const missionInformation = getMissionById(data.missions, missionId);
    const missionDuration = searchAndFindTextElements(findElementById(cssId));
    try {
        missionDuration[0].innerHTML = String(missionInformation.year.from) +'-'+String(missionInformation.year.to);
    } catch (error) {
        console.error(error)
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
        console.log("missionInformation:", missionInformation);

        const missionImageArray = missionInformation.content.gallery.images;
        const existingSlides = Array.from(pictureSlider[0].querySelectorAll('.swiper-slide'));

        for (let i = 0; i < missionImageArray.length; i++) {
            const imageLocation = missionImageArray[i]?.url;
            const imageText = missionImageArray[i]?.caption;

            if (i < existingSlides.length) {
                // Update existing slides
                const imageDiv = existingSlides[i].querySelector('.elementor-carousel-image');
                if (imageDiv) {
                    imageDiv.style.backgroundImage = `url('https://staging-1732022352.gbplayground.dk/wp-content/uploads/MissionImages/${imageLocation}')`;
                    imageDiv.setAttribute('aria-label', imageText || '');
                }
                if (i === 0) {
                    const imageTextParagraphElement = findImageTextElement();
                    updateSlideText(imageTextParagraphElement, 'swiper-slide');
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
            }
        }
    } catch (error) {
        console.error("Error updating carousel:", error);
    }
}
function findImageTextElement(){
    const imageText = document.getElementById('figureTextId');
    const imageTextElementArray = searchAndFindTextElements(imageText);
 
    // Determine the target element for updating text
    if (imageTextElementArray.length === 1) {
        return imageTextElementArray[0];
    } else {
        console.warn('Unable to determine single imageTextParagraphElement.');
        return;
    }
}
// Function to update the text for the active slide
function updateSlideText(textElement, classNameString) {
    if (!textElement) return;
    const activeSlide = document.querySelector('.'+classNameString);
    if (activeSlide) {
        const childElementArray = Array.from(activeSlide.querySelectorAll('*'));
        textElement.textContent = childElementArray[0].attributes["aria-label"].nodeValue;
    } else {
        console.warn('No active slide found.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!isOnMissionsPage('missions')) {
        return;     
    }
    const imageTextParagraphElement = findImageTextElement();

    // Select the carousel wrapper
    const carousel = document.querySelector('.swiper-wrapper'); // Adjust selector as needed

    if (carousel) {
        // Add event listener to detect changes in the slider
        carousel.addEventListener('transitionend', () => {
            updateSlideText(imageTextParagraphElement, 'swiper-slide-active');
        });

        // Initial update for the first active slide
        updateSlideText(imageTextParagraphElement, 'swiper-slide-active');
    } else {
        console.error('Carousel element not found.');
    }
});

// update the infoscreen
function updateTheInfoScreen(missionId, data){
    if (isOnMissionsPage('Missions')){
        return
    }
    
    createInfoScreenFilterButton(missionId, data)
}
function createInfoScreenFilterButton(missionId, data) {
    const resetButton = document.createElement('div');
    resetButton.id = 'resetButton';
    resetButton.textContent = 'Nulstil'; // TODO hardcoded danish
    const referenceButton = document.getElementById('geographyFilterButton')
    referenceButton.insertAdjacentElement('afterend', resetButton);
    const buttonIds = ['PeriodFilterButton', 'contributionFilterButton', 'geographyFilterButton', 'resetButton'];
    const dataSet = generateDataSet(1940, 2029, 10);
    const contributionColors = {
        1087: { backgroundColor: "#518346", textColor: "#ffffff" },
        1088: { backgroundColor: "#4a9fd8", textColor: "#ffffff" },
        1089: { backgroundColor: "#052854", textColor: "#ffffff" },
        1090: { backgroundColor: "#8d1b3d", textColor: "#ffffff" },
        1091: { backgroundColor: "#ffffff", textColor: "#81847e" }, 
        1092: { backgroundColor: "#de8130", textColor: "#ffffff" },
        1093: { backgroundColor: "#f4d70d", textColor: "#ffffff" },
    };
    
    buttonIds.forEach(buttonId => {
        const parentButton = document.getElementById(buttonId);

        if (!parentButton) {
            console.error(`Button with ID "${buttonId}" not found.`);
            return;
        }

        // Reset and apply styles to the parent button
        parentButton.style.all = 'unset';
        
        if (buttonId === 'resetButton'){
            applyStyles(parentButton, {
                color: 'white',
                fontSize: '24px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Saira Stencil One, Sans-serif',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '10px',
                width: '200px',
                height: '75px',
                backgroundColor: '#d9534f',
                borderRadius: '50px',
            })
        } else {
            applyStyles(parentButton, {
                color: 'white',
                fontSize: '24px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Saira Stencil One, Sans-serif',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '10px',
                width: '350px',
                height: '75px',
                backgroundColor: '#72756f',
                borderRadius: '50px',
            });
        }

        // Create a wrapper for the button and its filters
        const buttonWrapper = document.createElement('div');
        applyStyles(buttonWrapper, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        });

        // Move the button into the wrapper
        parentButton.parentElement.insertBefore(buttonWrapper, parentButton);
        buttonWrapper.appendChild(parentButton);

        // Create a new container for the filter options
        const filterSelectorContainer = document.createElement('div');
        applyStyles(filterSelectorContainer, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '10px',
            display: 'none',
        });

        // Populate the container with filter buttons based on type
        if (parentButton.id === "PeriodFilterButton") {
            parentButton.textContent = 'Period';
            dataSet.forEach((dataItem) => {
                const filterSelectorButton = createfilterSelectorButton(parentButton);
                filterSelectorButton.textContent = dataItem.description;
                filterSelectorContainer.appendChild(filterSelectorButton);
                filterSelectorButton.addEventListener('click', function(){applyFilter('period', filterSelectorButton.textContent, filterSelectorButton, parentButton, data);});
            });
        } else if (parentButton.id === "contributionFilterButton") {
            parentButton.textContent = 'Styrke'; //TODO remove hardcode
            data.forces.forEach((force) => {
                const colors = contributionColors[force.id] || { backgroundColor: "#cccccc", textColor: "#000000" };
                const filterSelectorButton = createfilterSelectorButton(parentButton);
                filterSelectorButton.textContent = force?.title || 'Unknown Force';
                filterSelectorButton.style.backgroundColor = colors.backgroundColor;
                filterSelectorButton.style.WebkitTextFillColor = colors.textColor;
                filterSelectorContainer.appendChild(filterSelectorButton);
                filterSelectorButton.addEventListener('click', function(){applyFilter('contribution' , filterSelectorButton.textContent, filterSelectorButton, parentButton, data);});
            });
        } else if (parentButton.id === "geographyFilterButton") {
            parentButton.textContent = data.locations[6]?.title || 'Geography';
            const excludedIds = [4690, 4691];
            data.locations.forEach((location) => {
                if (!excludedIds.includes(location?.id)) {
                    const filterSelectorButton = createfilterSelectorButton(parentButton);
                    filterSelectorButton.textContent = location?.title || 'Unknown Location';
                    filterSelectorContainer.appendChild(filterSelectorButton);
                    filterSelectorButton.addEventListener('click', function(){applyFilter('geography', filterSelectorButton.textContent, filterSelectorButton, parentButton, data);});
                }
            });
        }

        // Add the filter container to the wrapper
        buttonWrapper.appendChild(filterSelectorContainer);
        // Add toggle behavior to the parent button
        if (parentButton.id === "resetButton") {
            parentButton.addEventListener('click', () => {
                resetFilterObjects(data); // Call the function to reset all filters
            });
        } else {
            parentButton.addEventListener('click', () => {
                const type = parentButton.id.replace('FilterButton','').toLowerCase()
                if (filterStateStorage[type].isFilterActive){
                    resetFilterObjects(data, type);
                }
                const isDisplayed = filterSelectorContainer.style.display === 'flex';
                filterSelectorContainer.style.display = isDisplayed ? 'none' : 'flex';
            });
        }
    });
}

// filter event listener function call
function applyFilter(type, value, filterButtonElement, parentButtonElement, data) {
    updateSelectedFilter(type, value); // Update queryable data
    updateInterfaceFromStateStorage(type, parentButtonElement, filterButtonElement);
    if (type === 'geography') {
        // Normalize and handle value as an array or single string
        const selectedRegion = Array.isArray(value) ? value[0] : value.trim().toLowerCase(); 

        // Find matching location
        const matchingLocation = data.locations.find(location => 
            location.region.toLowerCase() === selectedRegion ||
            location.title.toLowerCase() === selectedRegion
        );
        const location = matchingLocation.region.toLowerCase().replace(/\s/g, '')
        if (location) {
            // Pass the matching location's coordinates (or any relevant data) to zoom
            zoomToCoordinates(location, document.getElementById('infoScreenMap'));
        } else {
            console.warn('No matching location found for:', selectedRegion);
        }
    }
    applyFiltersToFindMissions(data, selectedFilters);
}

function resetFilterObjects(data, type = null){
    resetSelectedFilter(type);
    resetStateStorage(type);
    if (!type || type === 'geography') {
        zoomToCoordinates('default', document.getElementById('infoScreenMap')); // Reset zoom to default when geography is reset
    }
    applyFiltersToFindMissions(data, selectedFilters);
    
}

function updateInterfaceFromStateStorage(type, parentButtonElement, filterButtonElement){
    // Check if a filter is already active
    if (filterStateStorage[type].isFilterActive) {
        console.warn(`Filter type "${type}" is already active.`);
        return; // Prevent further interaction until reset
    }
    // Apply the new filter
    handleStateIndictionForFilters(type, parentButtonElement, filterButtonElement);

    // Update the state tracker
    filterStateStorage[type].isFilterActive = true;
    filterStateStorage[type].activeParentButton = parentButtonElement;
    filterStateStorage[type].activeFilterButton = filterButtonElement;
    filterButtonElement.parentElement.style.display = 'none';
}

function resetStateStorage(type = null) {
    // Reset all filters if no specific type is provided
    if (!type) {
        for (const key in filterStateStorage) {
            const state = filterStateStorage[key];
            const { activeParentButton, activeFilterButton } = state;

            if (state.isFilterActive && activeParentButton && activeFilterButton) {
                // Reverse the style swap
                handleStateIndictionForFilters(key, activeFilterButton, activeParentButton);
            }

            // Reset state properties
            state.isFilterActive = false;
            state.activeParentButton = null;
            state.activeFilterButton = null;
        }
        return;
    }

    // Reset a specific filter type
    const state = filterStateStorage[type];
    if (!state) {
        console.error(`Invalid filter type: ${type}`);
        return;
    }

    const { activeParentButton, activeFilterButton } = state;

    if (state.isFilterActive && activeParentButton && activeFilterButton) {
        // Reverse the style swap
        handleStateIndictionForFilters(type, activeFilterButton, activeParentButton);
    }

    // Reset state properties for the specific type
    state.isFilterActive = false;
    state.activeParentButton = null;
    state.activeFilterButton = null;
}


// data state
function updateSelectedFilter(type, value) {
    if (!type || value === undefined) {
        console.error("Invalid filter type or value.");
        return;
    }
    selectedFilters[type] = value;
}

function resetSelectedFilter(type = null) {
    if (!type) {
        for (const key in selectedFilters) {
            selectedFilters[key] = null;
        }
        return;
    }

    if (selectedFilters.hasOwnProperty(type)) {
        selectedFilters[type] = null;
    } else {
        console.error(`Invalid filter type: ${type}`);
    }
}


// state indication for filter options
function handleStateIndictionForFilters(type, parentButtonElement, filterButtonElement) {
    if (!parentButtonElement || !filterButtonElement) {
        console.error('Parent button or filter button not found.', error);
        return;
    }

    // Save parent button's styles and content
    const parentStyles = {
        backgroundColor: parentButtonElement.style.backgroundColor,
        color: parentButtonElement.style.color,
        text: parentButtonElement.textContent,
    };

    // Save filter button's styles and content
    const filterStyles = {
        backgroundColor: filterButtonElement.style.backgroundColor,
        color: filterButtonElement.style.WebkitTextFillColor,
        text: filterButtonElement.textContent,
    };

    // Swap styles and content
    parentButtonElement.style.backgroundColor = filterStyles.backgroundColor;
    parentButtonElement.style.color = filterStyles.color;
    parentButtonElement.textContent = filterStyles.text;

    filterButtonElement.style.backgroundColor = parentStyles.backgroundColor;
    filterButtonElement.style.color = parentStyles.color;
    filterButtonElement.textContent = parentStyles.text;
}

// Helper function to create a filter selector button
function createfilterSelectorButton(parentButton) {
    const filterSelectorButton = document.createElement('div');
    applyStyles(filterSelectorButton, {
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        height: '75px',
        WebkitAlignItems: 'center',
        WebkitJustifyContent: 'center',
        marginBottom: '5px',
        WebkitTextFillColor: '#81847e',
        display: 'flex',
        width: '350px',
        textAlign: 'center',
        borderRadius: '50px',
        fontSize: '24px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    });

    return filterSelectorButton;
}

// Function to copy all computed styles from one element to another
function copyAllStyles(sourceElement, targetElement, stringArray = []) {
    if (!sourceElement || !targetElement) {
        console.error("Source or target element not found.");
        return;
    }
    const computedStyles = window.getComputedStyle(sourceElement);
    const excludedProperties = stringArray; // Use the passed array or default to an empty array

    // Apply all computed styles except those in the excluded list
    Array.from(computedStyles).forEach(property => {
        if (!excludedProperties.includes(property)) {
            targetElement.style[property] = computedStyles.getPropertyValue(property);
        }
    });
}

// Function to apply styles
function applyStyles(element, styles) {
    Object.assign(element.style, styles);
}

// function to create the date intervals for the period options
function generateDataSet(startYear, endYear, intervalSize) {
    const dataSet = [];
    for (let year = startYear; year <= endYear; year += intervalSize) {
        const endIntervalYear = Math.min(year + intervalSize - 1, endYear);
        dataSet.push({
            interval: [year, endIntervalYear],
            description: `${year}-${endIntervalYear}`
        });
    }
    return dataSet;
}
/**
 * Formats selected filter values into a structured format for easier processing.
 * Converts user-selected filter criteria into IDs or structured ranges where necessary.
 *
 * @param {Object} filters - The user-selected filters (e.g., period, contribution, geography).
 * @param {Object} data - The dataset containing the mapping of filter names to IDs and other metadata.
 * @returns {Object} formattedFilters - The formatted filters object with IDs or ranges.
 */
function formatSelectedFilterValues(filters, data) {
    const formattedFilters = {};

    // Format period filter: Converts "YYYY-YYYY" string to an array of [startYear, endYear].
    if (filters.period) {
        const [startYear, endYear] = filters.period.split("-").map(Number);
        formattedFilters.period = [startYear, endYear];
    }

    // Format contribution filter: Matches user-selected titles with their corresponding IDs in `data.forces`.
    if (filters.contribution) {
        const contributionIds = data.forces
            .filter(force => filters.contribution.includes(force.title)) // Match selected titles.
            .map(force => force.id); // Extract corresponding IDs.
        formattedFilters.contribution = contributionIds;
    }

    // Format geography filter: Matches user-selected geography titles with region IDs in `data.locations`.
    if (filters.geography) {
        const geographyIds = data.locations
            .filter(location => filters.geography.includes(location.title)) // Match selected titles.
            .map(location => location.region); // Extract corresponding region IDs.
            if (Array.isArray(geographyIds)) {
                formattedFilters.geography = geographyIds.map(geo =>
                    geo.toLowerCase().replace(/\s/g, '')
                );
            } else {
                formattedFilters.geography = geographyIds.toLowerCase().replace(/\s/g, '');
            }    
    }

    console.log("Formatted Filters:", formattedFilters); // Debugging: Check the resulting formatted filters.
    return formattedFilters;
}

/**
 * Applies user-selected filters to find relevant mission IDs.
 *
 * @param {Object} jsonData - The dataset containing all missions and related data.
 * @param {Object} selectedFilters - The user-selected filters for period, contribution, and geography.
 * @returns {Array} filteredMissionIds - An array of mission IDs that match the selected filters.
 */
function applyFiltersToFindMissions(jsonData, selectedFilters) {
    // Convert user-selected filters into a structured format.
    const formattedFilters = formatSelectedFilterValues(selectedFilters, jsonData);

    // Initialize the filtered mission IDs with all mission IDs in the dataset.
    let filteredMissionIds = jsonData.missions.map(mission => mission.id);

    // Apply each filter to narrow down the mission IDs.
    Object.entries(formattedFilters).forEach(([filterType, filterValue]) => {
        if (filterValue) {
            // Narrow down mission IDs based on the current filter type and value.
            filteredMissionIds = applyFilterByType(
                jsonData,
                filteredMissionIds,
                filterType,
                filterValue
            );
        }
    });

    console.log("Filtered Mission IDs:", filteredMissionIds); // Debugging: Check the final filtered mission IDs.
    return filteredMissionIds;
}

/**
 * Applies a specific filter type (e.g., period, contribution, geography) to a set of mission IDs.
 *
 * @param {Object} jsonData - The dataset containing all missions and related data.
 * @param {Array} missionIds - The current list of mission IDs to filter.
 * @param {String} filterType - The type of filter to apply (e.g., period, contribution, geography).
 * @param {Array} filterValue - The value(s) to filter by (e.g., year range, contribution IDs, region names).
 * @returns {Array} - The filtered list of mission IDs.
 */
function applyFilterByType(jsonData, missionIds, filterType, filterValue) {
    return missionIds.filter(missionId => {
        // Find the mission object corresponding to the current mission ID.
        const mission = jsonData.missions.find(m => m.id === missionId);

        // If no mission is found, log a warning and skip this mission.
        if (!mission) {
            console.warn(`Mission with ID ${missionId} not found.`);
            return false;
        }

        switch (filterType) {
            case "period":
                // Check if the mission's year range overlaps with the selected period range.
                const { from, to } = mission.year; // Mission's start and end year.
                const [startYear, endYear] = filterValue; // User-selected period range.
                return (from >= startYear && from <= endYear) || (to >= startYear && to <= endYear);

            case "contribution":
                // Check if the mission's forces include any of the selected contribution IDs.
                return filterValue.some(contributionId => mission.forces.includes(contributionId));

            case "geography":
                // Find hotspots that match the selected geography regions.
                const matchingHotspots = jsonData.hotspotCollections.filter(hotspot =>
                    filterValue.some(region => hotspot.region.toLowerCase() === region.toLowerCase())
                );

                // Extract IDs from the matching hotspots.
                const matchingHotspotIds = matchingHotspots.map(hotspot => hotspot.id);

                // Check if the mission's hotspots include any of the matching hotspot IDs.
                return mission.hotspotCollections.some(hotspotId =>
                    matchingHotspotIds.includes(hotspotId)
                );

            default:
                console.warn(`Unknown filter type: ${filterType}`);
                return true; // If filter type is unknown, do not filter out the mission.
        }
    });
}

const mapCoordinatesForZoom = {
    africa: { scale: 2.7, x: -10, y: -43 },
    asia: { scale: 3, x: -60, y: -25 },
    europe: { scale: 3.8, x: -13, y: 50 },
    america: { scale: 1.4, x: 50, y: -13 },
    middleeast: { scale: 6, x: -50, y: -15 },
    australia: { scale: 1.6, x: -15, y: 5 },
    default: { scale: 1, x: 0, y: 0 } // Default zoom for reset or unmatched regions
};

function zoomToCoordinates(regionName, backgroundMap) {
    const coordinates = mapCoordinatesForZoom[regionName] || mapCoordinatesForZoom.default;
    backgroundMap.style.transform = `translate(${coordinates.x}vw, ${coordinates.y}vh) scale(${coordinates.scale})`;
}
