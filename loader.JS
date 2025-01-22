import { MissionPage } from './missionPage.js'
import { SearchPage } from './searchPage.js'
import { MissionSelectorMenu } from './missionCardMenu.js'
import { InfoScreenPage } from './infoScreen.js'
import { SelectedFilters } from './SelectedFilters.js'
import { BackNavigation } from './BackNavigation.js'

//global variables
const url = new URL(window.location.href);
const jsonDkPath = url.origin+'/wp-content/uploads/2024/12/dk3.json'
//`${url.protocol}//${url.hostname}/wp-content/uploads/2024/12/dk3.json`;


// Step 1: Instantiate SelectedFilters without updateMapPins dependency
const selectedFilters = new SelectedFilters({});

main(jsonDkPath);
controlFlags();
// Create an instance of BackNavigation
const backNavigation = new BackNavigation();

function main(apiUrl) {
    // Get mission ID from selected filters or local storage
    const defaultMissionId = selectedFilters.getMissionId();
    let missionId = localStorage.getItem('currentMissionId') || 5388;

    // Validate missionId before storing in local storage
    if (!localStorage.getItem('currentMissionId') && defaultMissionId) {
        localStorage.setItem('currentMissionId', defaultMissionId);
    }

    // Ensure missionId is valid before proceeding
    if (!missionId) {
        console.error('Mission ID is not available.');
        return; // Exit the function if no mission ID is found
    }

    // Fetch and process data with the determined mission ID
    fetchAndProcessData(missionId, apiUrl);
}


function checkIdTypes(missionsArray, storedId) {
    if (!Array.isArray(missionsArray)) {
        throw new Error("Invalid missions data: Expected an array.");
    }

    const dataIdType = typeof missionsArray[0]?.id; // Check the type of the first ID in the array
    const storedIdType = typeof storedId; // Check the type of the stored ID

    console.log(`Data ID type: ${dataIdType}`);
    console.log(`Stored ID type: ${storedIdType}`);

    if (dataIdType !== storedIdType) {
        console.warn("Type mismatch detected. Converting stored ID to match data ID type.");
        if (dataIdType === "number") {
            return Number(storedId);
        } else if (dataIdType === "string") {
            return String(storedId);
        } else {
            throw new Error("Unsupported ID type in data.");
        }
    }

    return storedId; // If types match, return the stored ID as-is
}

// Function to fetch data and process it
async function fetchAndProcessData(missionId, url) {
    try {
        const jsonData = await jQuery.getJSON(url);
        const typeCheckedMissionId = checkIdTypes(jsonData.missions, missionId)
        // Call a function to process the data
        console.log("dataDk:", jsonData);
        selectedFilters.setData(jsonData);
        processData(typeCheckedMissionId, jsonData);
    } catch (error) {
        console.error("Error fetching JSON:", error);
    }
}

// Function to process the data
function processData(missionId , data) {
    updateTheMissionsPage(missionId, data);
    updateTheInfoScreen(data, missionId);
    updateSearchPage(data);
    updateBackgroundPages(data)
    updateBeredskabsKort(missionId, data)
}
function updateTheInfoScreen(data, missionId){
    if (isOnMissionsPage('') || isOnMissionsPage('/en/')) {
        selectedFilters.setData(data);
        const InfoSide = new InfoScreenPage(selectedFilters.getData(), missionId, selectedFilters);
        selectedFilters.updateMapPins = InfoSide.updateMapPins.bind(InfoSide);

        selectedFilters.addFilterListener((type, value) => {
            selectedFilters.handleFilterChange(type, value);
        });
    }
}

function updateSearchPage(){
    if (isOnMissionsPage('search') || isOnMissionsPage('en/search')){
        const searchPageInstance = new SearchPage(selectedFilters.getData(), selectedFilters, 'Søg i missioner her!');
    }
}

// update the missionspage with information
function updateTheMissionsPage(missionId, data){
    if (isOnMissionsPage('missionstest-1') || isOnMissionsPage('/en/missionstest-1')) {
        // Create an instance of MissionPage
        const missionPage = new MissionPage(data, missionId, selectedFilters);
        debugger;
    }
    debugger;
}
// function that adds the mission card menu to the background pages. The rest of the pages were made in wordpress, so this function is the only part needed in code.
function updateBackgroundPages(data){
    data.collections.forEach((collection)=> {
        if (isOnMissionsPage(collection.title)){
            const button = document.getElementById('missionButton'+collection.id)
            const homePage = document.getElementById('PageElement'+collection.id)
            if (button) {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    const missionCardMenuForBackgroundPages = new MissionSelectorMenu(
                        collection.missions,
                        collection.title,
                        homePage,
                        selectedFilters
                    )
                })
            }
        }
    })
}

function updateBeredskabsKort(missionId, data){
    if (isOnMissionsPage('beredskabskort') || isOnMissionsPage('en/beredskabskort')){
        // Step 1: Instantiate SelectedFilters without updateMapPins dependency
        const selectedFiltersBeredskabs = new SelectedFilters({});
        selectedFiltersBeredskabs.setData(data);
        const BeredskabsKort = new InfoScreenPage(selectedFiltersBeredskabs.getData(), missionId, selectedFiltersBeredskabs, 1092);
        selectedFiltersBeredskabs.updateMapPins = BeredskabsKort.updateMapPins.bind(BeredskabsKort);
        
        selectedFiltersBeredskabs.addFilterListener((type, value) => {
            selectedFiltersBeredskabs.handleFilterChange(type, value);
        });
        const url = `${window.location.protocol}//${window.location.hostname}/beredskabsstyrelsen/`;

        // Find the element with the specific filter value
        const element = document.getElementById('contributionFilterButton');
        const parentElement = document.getElementById('InfoScreenContainer');
        const linkButton = document.createElement('button');
        if (element) {
            // Copy all computed styles from `element` to `linkButton`
            const styles = getComputedStyle(element);
            for (const property of styles) {
                linkButton.style[property] = styles.getPropertyValue(property);
            }
            //linkButton.textContent = element.textContent;
            linkButton.textContent = 'Background'.toUpperCase();
            // Apply styles to position the element in the bottom-left corner
            Object.assign(linkButton.style, {
                position: 'fixed',    // Make the element fixed
                bottom: '5%',       // Adjust the distance from the bottom
                left: '5%',         // Adjust the distance from the left
                zIndex: '1',       // Ensure it's on top of other element
                width: 'auto',
                padding: '0px 25px'
            });

            // Assuming linkButton is a <button> element
            linkButton.addEventListener('click', () => {
                window.location.href = url;
            });
            parentElement.appendChild(linkButton);
        } else {
            console.error('Element with filtervalue="1092" not found');
        }
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
        return normalizedPath === '/' || normalizedPath === '/en/';
    }

    return normalizedPath === `/${normalizedSiteName}/` || normalizedPath === `/en/${normalizedSiteName}/`;
}

// creator the language toggle button
function createLangToggle(parentElement, lang) {
    const langConfigs = {
        en: {
            lang: 'en',
            imgSrc: `${window.location.origin}/wp-content/uploads/2024/11/flag-2.svg`,
            altText: 'Switch to English',
            dataSrc: `${window.location.origin}/wp-content/uploads/2024/11/flag-2.svg`,
        },
        dk: {
            lang: 'dk',
            imgSrc: `${window.location.origin}/wp-content/uploads/2024/11/flag-1.svg`,
            altText: 'Switch to Danish',
            dataSrc: `${window.location.origin}/wp-content/uploads/2024/11/flag-1.svg`,
        },
    };

    const config = langConfigs[lang];
    if (!config) {
        console.error(`Invalid language tag: ${lang}`);
        return null;
    }

    // Create button
    const langButton = document.createElement('div');
    langButton.setAttribute('lang-control', config.lang);
    langButton.style.cursor = 'pointer';
    langButton.style.display = 'flex';
    langButton.style.alignItems = 'end';

    // Create image inside the button
    const img = document.createElement('img');
    img.src = config.imgSrc;
    // Use defineProperty to make `src` immutable
    Object.defineProperty(img, 'src', {
        value: config.imgSrc,
        //writable: false, // Prevents reassignment of `src`
        //configurable: false,
    });

    img.setAttribute('data-src', config.dataSrc); // Sync lazy load source from config
    img.alt = config.altText; // Set alt text
    img.width = 60; // Set image dimensions
    img.height = 60;

    langButton.appendChild(img); // Add image to the button
    parentElement.appendChild(langButton); // Add button to the container

    // Return the button element
    return langButton;
}

// behavior for the language toggle button
function controlFlags() {
    const langLocationParent = document.querySelector('[lang-control]');
    if (!langLocationParent) {
        console.error('Language control parent element not found.');
        return;
    }

    const url = new URL(window.location.href);
    const currentLang = url.pathname.includes('/en') ? 'en' : 'dk';
    const toggleLang = currentLang === 'en' ? 'dk' : 'en'; // Determine the language to toggle to

    console.log('Detected Current Language:', currentLang);

    // Create the language toggle button
    const langButton = createLangToggle(langLocationParent, toggleLang);

    // Add click event listener
    langButton.addEventListener('click', () => {
        console.log(`Switching to ${toggleLang.toUpperCase()}`);
        const currentPath = url.pathname.replace(/^\/en\//, ''); // Remove `/en/` prefix if present
        const newUrl =
            toggleLang === 'en'
                ? `${url.origin}/en${currentPath}`
                : `${url.origin}/${currentPath}`;
        console.log(`Redirecting to: ${newUrl}`);
         // Replace the current history entry to prevent back navigation to the old language
        history.replaceState(null, '', window.location.href);
        
        window.location.href = newUrl; // Redirect to the new language
    });
    
}

controlFlags();
