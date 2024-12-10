const url = new URL(window.location.href);
const jsonDkPath = `${url.protocol}//${url.hostname}/wp-content/uploads/2024/12/dk2.json`;
//wp-content/uploads/2024/12/dk2.json
//wp-content/themes/twentytwentyfive/js/dk.json
let missionId = 5388; // default value
//global variables
// saved the selected filters for data query
class SelectedFilters {
    constructor() {
        if (SelectedFilters.instance) {
            return SelectedFilters.instance;
        }

        this.period = null;
        this.contribution = null;
        this.geography = null;

        SelectedFilters.instance = this;
    }

    // Methods to access and modify filters
    getPeriod() {
        return this.period;
    }

    setPeriod(value) {
        this.period = value;
    }

    getContribution() {
        return this.contribution;
    }

    setContribution(value) {
        this.contribution = value;
    }

    getGeography() {
        return this.geography;
    }

    setGeography(value) {
        this.geography = value;
    }

    getAllFilters() {
        return {
            period: this.period,
            contribution: this.contribution,
            geography: this.geography
        };
    }

    clearFilters() {
        this.period = null;
        this.contribution = null;
        this.geography = null;
    }

    // Add updateSelectedFilter to the class
    updateSelectedFilter(type, value) {
        if (!type || value === undefined) {
            console.error("Invalid filter type or value.");
            return;
        }

        if (this.hasOwnProperty(type)) {
            this[type] = value;
        } else {
            console.error(`Invalid filter type: ${type}`);
        }
    }

    // Add resetSelectedFilter to the class
    resetSelectedFilter(type = null) {
        if (!type) {
            this.clearFilters();
            return;
        }

        if (this.hasOwnProperty(type)) {
            this[type] = null;
        } else {
            console.error(`Invalid filter type: ${type}`);
        }
    }
}

// Create a singleton instance
const selectedFilters = new SelectedFilters();

// stores the active state and filter buttons
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

main(missionId, jsonDkPath);

function main(missionId, urlDk) {
    fetchAndProcessData(missionId, urlDk);   
}

// Function to fetch data and process it
async function fetchAndProcessData(missionId, url) {
    try {
        const jsonData = await jQuery.getJSON(url);
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
        //updateSwiperSlider(data, missionId);
        updateSwiperSlider(data, missionId);
        missionLocation(data, missionId);
    }
}

// Checks if the current page matches the specified site name
function isOnMissionsPage(siteName) {
    if (typeof siteName !== 'string') {
        console.error('Invalid siteName provided');
        return false;
    }

    const url = new URL(window.location.href);
    const normalizedPath = url.pathname.toLowerCase();
    const normalizedSiteName = siteName.trim().toLowerCase();

    // Handle root (landing page) case
    if (normalizedSiteName === '') {
        return normalizedPath === '/';
    }

    return normalizedPath.includes(`/${normalizedSiteName}`);
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

window.onerror = function (message, source, lineno, colno, error) {
    if (error && error.message.includes("Cannot read properties of undefined (reading 'stop')")) {
        console.warn("Caught Swiper autoplay stop error:", error);
        return true; // Prevent the error from propagating
    }
    return false; // Let other errors propagate
};

function updateSwiperSlider(data, missionId) {
    const swiperContainer = document.querySelector('.swiper'); // Find the Swiper container
    const swiperWrapper = swiperContainer?.querySelector('.swiper-wrapper'); // Find the Swiper wrapper

    if (!swiperContainer || !swiperWrapper) {
        console.error('Swiper container or wrapper not found.');
        return;
    }

    // Fetch mission information from JSON data
    const missionInformation = getMissionById(data.missions, missionId);
    if (!missionInformation || !missionInformation.content || !missionInformation.content.gallery.images) {
        console.error('Mission information or gallery images not found.');
        return;
    }

    const missionImageArray = missionInformation.content.gallery.images;

    // Construct the base image path dynamically
    const url = new URL(window.location.href);
    const baseImagePath = `${url.protocol}//${url.hostname}/wp-content/uploads/`;

    // Clear existing slides
    swiperWrapper.innerHTML = '';

    // Add new slides
    missionImageArray.forEach((imageData) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
            <div class="elementor-element elementor-element-7f30c2c0 e-flex e-con-boxed e-con e-child">
                <div class="e-con-inner">
                    <div class="elementor-element elementor-element-a0ab922 elementor-widget elementor-widget-image">
                        <div class="elementor-widget-container">
                            <img src="${baseImagePath}${imageData.url}" alt="${imageData.caption}" loading="lazy" decoding="async">
                        </div>
                    </div>
                    <div class="elementor-element elementor-element-9421eab elementor-widget elementor-widget-heading">
                        <div class="elementor-widget-container">
                            <h3 class="elementor-heading-title elementor-size-default">${imageData.caption}</h3>
                        </div>
                    </div>
                </div>
            </div>`;
        swiperWrapper.appendChild(slide);
    });

    // Destroy existing Swiper instance
    if (swiperContainer.swiper) {
        swiperContainer.swiper.destroy(true, true);
    }

    // Extract settings dynamically
    const settings = JSON.parse(swiperContainer.closest('[data-settings]').getAttribute('data-settings') || '{}');
    const autoplaySpeed = parseInt(settings.autoplay_speed || 4000, 10);
    const autoplayEnabled = settings.autoplay === 'yes';

    // Reinitialize Swiper
    const swiperInstance = new Swiper(swiperContainer, {
        slidesPerView: 1,
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        loop: true,
        autoplay: autoplayEnabled ? { delay: autoplaySpeed } : false,
    });

    // Handle autoplay resumption for navigation and pagination
    const handleAutoplayResume = () => {
        if (swiperInstance.autoplay) {
            swiperInstance.autoplay.start();
        }
    };

    // Add event listeners for autoplay resumption
    const navigationButtons = swiperContainer.querySelectorAll('.swiper-button-next, .swiper-button-prev');
    navigationButtons.forEach((button) =>
        button.addEventListener('click', handleAutoplayResume)
    );

    const paginationButtons = swiperContainer.querySelectorAll('.swiper-pagination-bullet');
    paginationButtons.forEach((button) =>
        button.addEventListener('click', handleAutoplayResume)
    );

    console.log(`Swiper updated with ${missionImageArray.length} slides.`);
}

function missionLocation(data, missionId) {
    let location = null; // Variable to store the location if found
    const locationButton = document.getElementById('MissionLocation');
    const textElement = locationButton.querySelector('.elementor-button-text');
    
    const url = new URL(window.location.href);

    // Iterate through each collection in the data
    data.collections.forEach((collection) => {
        // Check if the collection contains the mission with the given missionId
        const foundMission = collection.missions.find(mission => mission === missionId);
        if (foundMission) {
            // If found, assign the location from the collection
            location = collection.title; // Using collection.title as location
        }
    });

    if (location) {
        // Clear existing content inside `locationButton` if any
        locationButton.innerHTML = '';

        // Create a new <a> element
        const linkElement = document.createElement('a');
        linkElement.className = 'elementor-button elementor-button-link elementor-size-sm';
        linkElement.href = `${url.protocol}//${url.hostname}/${encodeURIComponent(location)}/`;
        linkElement.rel = 'noopener noreferrer'; // Optional: For security

        // Add the text inside the <a> element
        const spanWrapper = document.createElement('span');
        spanWrapper.className = 'elementor-button-content-wrapper';

        const spanText = document.createElement('span');
        spanText.className = 'elementor-button-text';
        spanText.textContent = location;

        // Append text to wrapper, wrapper to <a>, and <a> to button
        spanWrapper.appendChild(spanText);
        linkElement.appendChild(spanWrapper);
        locationButton.appendChild(linkElement);
    } else {
        // If no location is found, hide the button
        locationButton.style.display = 'none';
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

// Update the info screen with missions and map pins
function updateTheInfoScreen(missionId, data) {
    if (!isOnMissionsPage('')) {
        return; // Exit if not on the landing page
    }
    debugger;
    // Create the filter buttons for the info screen
    createInfoScreenFilterButton(missionId, data, ExcludedIdsManager.getExcludedIds());
    const selectedMission  = applyFiltersToFindMissions(data, selectedFilters.getAllFilters());

    // Update map pins based on the new filters
    const mapContainer = document.getElementById('infoScreenMap');
    updateMapPins(data, ExcludedIdsManager.getExcludedIds(), mapContainer, selectedMission, forceColors);
}

function createInfoScreenFilterButton(missionId, data, excludedIds) {
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
            position: 'relative',
            zIndex: '50',
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
            data.locations.forEach((location) => {
                if (!excludedIds.includes(location?.id)) {
                    const filterSelectorButton = createfilterSelectorButton(parentButton);
                    filterSelectorButton.textContent = location?.title || 'Unknown Location';
                    filterSelectorContainer.appendChild(filterSelectorButton);
                    filterSelectorButton.id = `filterSelectorButtonGeography-${location?.region.toLowerCase()}`;
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
    selectedFilters.updateSelectedFilter(type, value); // Update queryable data
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
            hideOrShowMapPins('continent', 'none')
            zoomToCoordinates(location, document.getElementById('infoScreenMap'));
        } else {
            console.warn('No matching location found for:', selectedRegion);
        }
    }
    const selectedMission  = applyFiltersToFindMissions(data, selectedFilters.getAllFilters());
    // Update map pins based on the new filters
    const mapContainer = document.getElementById('infoScreenMap');
    updateMapPins(data, ExcludedIdsManager.getExcludedIds(), mapContainer, selectedMission, forceColors);
}
// type can be 'continent' or 'country'
function hideOrShowMapPins(type, display) {
    // Ensure `display` is a valid string
    if (typeof display !== 'string') {
        console.error('Invalid display value. Must be a string.');
        return;
    }
    const pins = document.querySelectorAll(`[data-type="${type}"]`);
    pins.forEach((pin) => {
        pin.style.display = display; // Assign the validated display value
    });
}

function resetFilterObjects(data, type = null){
    selectedFilters.resetSelectedFilter(type);
    resetStateStorage(type);
    if (!type || type === 'geography') {
        hideOrShowMapPins('continent', 'block')
        zoomToCoordinates('default', document.getElementById('infoScreenMap')); // Reset zoom to default when geography is reset       
    }

    // Update map pins based on the new filters
    const mapContainer = document.getElementById('infoScreenMap');
    updateMapPins(data, ExcludedIdsManager.getExcludedIds(), mapContainer, applyFiltersToFindMissions(data, selectedFilters.getAllFilters()), forceColors);
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



function zoomToCoordinates(regionName, backgroundMap) {
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
    const coordinates = mapCoordinatesForZoom[regionName] || mapCoordinatesForZoom.default;
    backgroundMap.style.transform = `translate(${coordinates.x}vw, ${coordinates.y}vh) scale(${coordinates.scale})`;
};


/**
 * Creates a map pin element for use on a map interface.
 *
 * @param {string} region - The region associated with the pin (e.g., "africa").
 * @param {string} location - The display name for the pin's location (e.g., "Africa").
 * @param {number} missions - The number of missions associated with the location.
 * @param {Array} forces - An array of objects representing forces. Each object should have:
 *                         - {string} name: The name of the force (e.g., "Army").
 *                         - {string} color: The color associated with the force (e.g., "#00ff00").
 * @param {string} type - The type of the map pin ('continent' or 'country'). Default is 'continent'.
 * @param {number} x - The x-coordinate for country-specific pins (percentage). Default is 0.
 * @param {number} y - The y-coordinate for country-specific pins (percentage). Default is 0.
 * @returns {HTMLElement} - The constructed map pin element, styled and ready to append to the DOM.
 *
 * Usage:
 * 1. For continent pins:
 *    createMapPin('africa', 'Africa', 10, [{ name: 'Army', color: '#00ff00' }], 'continent');
 *
 * 2. For country-specific pins:
 *    createMapPin('usa', 'USA', 5, [{ name: 'Navy', color: '#0000ff' }], 'country', 40, 60);
 */
function createMapPin(region, location, missions, forces, type = 'continent', data, title) {
    // Create the main container for the map pin
    const mapPinContainer = document.createElement('div');
    // map coordinates for placing continent map pins
    const mapCoordinatesForContinetMapPins = {
        africa: { x: 45, y: 55 },
        asia: { x: 65, y: 45 },
        europe: { x: 45, y: 35 },
        america: { x: 20, y: 45 },
        middleeast: { x: 53, y: 45 },
        australia: { x: 45, y: 55 },
        default: { x: 50, y: 55 } // Default zoom for reset or unmatched regions
    };
    mapPinContainer.removeAttribute('style');
    Object.assign(mapPinContainer.style, {
        position: 'absolute', // Position relative to the map
        display: 'inlineFlex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        WebkitAlignItems: 'center',
        WebkitJustifyContent: 'center',
        width: 'auto',
        height: 'auto',
        zIndex: '100',
        pointerEvents: 'auto',
        minWidth: '20px', 
        minHeight: '20px',
    });
    // Set position and scale based on the pin type
    if (type === 'continent') {
        const coordinates = mapCoordinatesForContinetMapPins[region.toLowerCase()] || mapCoordinatesForContinetMapPins.default;
        Object.assign(mapPinContainer.style, {
            left: `${coordinates.x}%`, // Position in percentage relative to the viewport
            top: `${coordinates.y}%`,
        });    
        mapPinContainer.setAttribute('data-type', 'continent');
    } else if (type === 'country') {
        Object.assign(mapPinContainer.style, {
            left: `${x}%`, // Custom x-coordinate for country-specific pins
            top: `${y}%`, // Custom y-coordinate for country-specific pins
        });
        //mapPinContainer.id = `map-pin-${region.toLowerCase()}-${location.replace(/\s/g, '-').toLowerCase()}`; // Unique ID for countries
        mapPinContainer.setAttribute('data-type', 'country');
    }
    
    // Add the location name as a label
    const mapPinLocation = document.createElement('span');
    Object.assign(mapPinLocation.style, {
        fontSize: '24px',
        display: 'flex', // Keep flex for alignment
        justifyContent: 'center', // Horizontally center text
        alignItems: 'center', // Vertically center text
        textTransform: 'uppercase',
        fontWeight: 'bold',
        color: 'white',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontFamily: 'Saira Stencil One, Sans-serif',
        width: '100%', // Ensure the element spans its container
        height: 'auto', // Adjust height based on content
    });
    mapPinLocation.textContent = title || 'Unknown Location';
    
    // Create a container for the forces associated with the location
    const mapPinForceContainer = document.createElement('div');
    mapPinForceContainer.classList.add('mapPinForceColor');
    Object.assign(mapPinForceContainer.style, {
        display: 'flex',
        justifyContent: 'center', // Horizontally center text
        alignItems: 'center', // Vertically center text
    });
    createForceColorFlags(forces, mapPinForceContainer)

    // Create a container for the missions associated with the location
    const mapPinMissionContainer = document.createElement('div');
    Object.assign(mapPinMissionContainer.style, {
        display: 'flex',
        justifyContent: 'center', // Horizontally center text
        alignItems: 'center', // Vertically center text
    });

    // Display the number of missions as a label
    const amountOfMissions = document.createElement('span');
    Object.assign(amountOfMissions.style, {
        fontSize: '12px',
        display: 'flex', // Use flexbox for alignment
        justifyContent: 'center', // Horizontally center text
        alignItems: 'center', // Vertically center text
        textTransform: 'uppercase',
        fontWeight: 'bold',
        color: 'white',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontFamily: 'Saira Stencil One, Sans-serif',
        width: '100%', // Ensure it spans its container for proper alignment
        height: 'auto', // Adjust height based on content
    });
    amountOfMissions.textContent = `${missions || 0} missioner`; //TODO hard coded
    amountOfMissions.classList.add('mission-count')
    mapPinMissionContainer.appendChild(amountOfMissions);

    // Create a container for the map pin's icon
    const mapPinImageContainer = document.createElement('div');
    Object.assign(mapPinImageContainer.style, {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    });

    // Add an image to the pin (currently using a placeholder style)
    const mapPinImage = document.createElement('img');
    Object.assign(mapPinImage.style, {
        width: '20px',
        height: '20px',
        backgroundColor: 'blue', // Default placeholder
    });
    mapPinImageContainer.appendChild(mapPinImage);

    // Assemble the map pin by appending all components
    mapPinContainer.appendChild(mapPinLocation);
    mapPinContainer.appendChild(mapPinForceContainer);
    mapPinContainer.appendChild(mapPinMissionContainer);
    mapPinContainer.appendChild(mapPinImageContainer);
    // Return the complete pin component
    return mapPinContainer;
}
function getColorsForMissionForces(forceColors, missions) {
    // Collect all force IDs from missions
    const allForceIds = new Set(
        missions.flatMap(mission => mission.forces) // Combine all force IDs into a single array
    );
    // Find matching colors in forceColors
    const matchingColors = Object.entries(forceColors)
        .filter(([id]) => allForceIds.has(parseInt(id))) // Check if color ID matches any force ID
        .map(([id, color]) => ({ id: parseInt(id), ...color })); // Return color object with ID included
    
    return matchingColors;
}


function createForceColorFlags(forces, forceContainer){
    // Add individual force indicators (small colored circles)
    (forces || []).forEach(force => {
        const mapPinForceColor = document.createElement('div');
        Object.assign(mapPinForceColor.style, {
            width: '20px',
            height: '5px',
            borderRadius: '1px',
            margin: '0px 2px',
            backgroundColor: force.backgroundColor || '#ccc', // Default to gray if no color provided
        });
        forceContainer.appendChild(mapPinForceColor);
    });
}
function updateMapPins(data, excludedIds, container, selectedMission, forceColors) {
    const existingPins = Array.from(container.children);
    const matchingMissions = data.missions.filter(mission => selectedMission.includes(mission.id))

    // Iterate through locations to update or create pins
    data.locations.forEach((location) => {
        if (!excludedIds.includes(location?.id)) {
            const formattedRegion = location.region.toLowerCase().replace(/\s/g, '');
            const formattedTitle = location.title;
            
            // Find matching hotspots for the location
            const matchingHotspots = data.hotspotCollections.filter(hotspot =>
                hotspot.region.toLowerCase().replace(/\s/g, '') === formattedRegion
            );
            const matchingHotspotIds = matchingHotspots.map(hotspot => hotspot.id);
            // Filter missions specific to this location
            const missionsForLocation = matchingMissions.filter(mission =>
                mission.hotspotCollections.some(hotspotId => matchingHotspotIds.includes(hotspotId))
            );
    
            // **CHANGED: Use missions for the location**
            const missionCount = missionsForLocation.length;
    
            // **CHANGED: Get colors specific to the missions for this location**
            const matchingForceColors = getColorsForMissionForces(forceColors, missionsForLocation);
    
            // Check if a pin for this region already exists
            let pin = existingPins.find(p => p.id === `pin-${formattedRegion}`);
            if (pin) {
                // Update existing pin
                pin.querySelector('.mission-count').textContent = `${missionCount} Missions`;
                const containerForForces = pin.querySelector('.mapPinForceColor');
                if (containerForForces) {
                    containerForForces.innerHTML = ''; // Clear existing flags
                    createForceColorFlags(matchingForceColors, containerForForces); // Add updated flags
                }
            } else {
                // Create a new pin
                pin = createMapPin(
                    formattedRegion,
                    location.region,
                    missionCount,
                    matchingForceColors,
                    'continent',
                    data,
                    formattedTitle
                );
                pin.id = `pin-${formattedRegion}`; // Add unique ID for easy reference
                container.appendChild(pin); // Append pins to the map container
                pin.addEventListener('click', function() {
                    const parentButton = document.getElementById('geographyFilterButton');
                    const filterSelectorButton = document.getElementById(`filterSelectorButtonGeography-${formattedRegion}`);
                    if (!filterSelectorButton || !parentButton) {
                        console.error('Filter selector button or parent button not found.', {
                            filterSelectorButton,
                            parentButton,
                        });
                        return;
                    }
                    applyFilter('geography', filterSelectorButton.textContent, filterSelectorButton, parentButton, data);
                });
            }            
        }
    });
    // Remove pins that no longer match the filters
    Array.from(container.children).forEach(pin => {
        const region = pin.id.replace('pin-', '');
        const isRegionStillValid = data.locations.some(loc =>
            loc.region.toLowerCase().replace(/\s/g, '') === region &&
            matchingMissions.some(mission =>
                mission.hotspotCollections.some(hotspotId =>
                    data.hotspotCollections.some(h => h.id === hotspotId && h.region.toLowerCase().replace(/\s/g, '') === region)
                )
            )
        );
        if (!isRegionStillValid) {
            pin.remove();
        }
    });
}