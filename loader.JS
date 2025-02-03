import { MissionPage } from './missionPage.js'
import { SearchPage } from './searchPage.js'
import { MissionSelectorMenu } from './missionCardMenu.js'
import { InfoScreenPage } from './infoScreen.js'
import { SelectedFilters } from './SelectedFilters.js'
import { BackNavigation } from './BackNavigation.js'
import { LoadingAnimation} from './loadingAnimation.js'
import { IdleScreen } from './idleScreens.js'
//global variables
const loader = new LoadingAnimation();
const idleScreen = new IdleScreen();
const url = new URL(window.location.href);
const jsonDkPath = url.origin+'/wp-content/uploads/data-files/dk3.json';
const jsonEnPath = url.origin+'/wp-content/uploads/data-files/en.json';


// checks the language setting
function langControl(url, en, dk){
    if (url.pathname.includes('/en')) {
        // en
        return en
    } else {
        // da
        return dk
    }
}

const data = langControl(url, jsonEnPath, jsonDkPath) 
// Step 1: Instantiate SelectedFilters without updateMapPins dependency
const selectedFilters = new SelectedFilters({});
main(data);

controlFlags();
// Create an instance of BackNavigation
const backNavigation = new BackNavigation(selectedFilters);

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
        console.log("loaded data:", jsonData);
        selectedFilters.setData(jsonData);
        processData(typeCheckedMissionId, jsonData);
    } catch (error) {
        console.error("Error fetching JSON:", error);
        loader.removeLoaderContainer();
    }
}

// Function to process the data
function processData(missionId , data) {
    updateTheMissionsPage(missionId, data);
    updateTheInfoScreen(data, missionId);
    updateSearchPage(data);
    updateBackgroundPages(data)
    updateBeredskabsKort(missionId, data)
    areaPins(data);
    loader.removeLoaderContainer();
}
function updateTheInfoScreen(data, missionId){
    if (isOnMissionsPage('') || isOnMissionsPage('/en/')) {
        selectedFilters.setData(data);
        const InfoSide = new InfoScreenPage(selectedFilters.getData(), missionId, selectedFilters);
        selectedFilters.updateMapPins = InfoSide.updateMapPins.bind(InfoSide);

        selectedFilters.addFilterListener((type, value) => {
            selectedFilters.handleFilterChange(type, value);
        });
        loader.removeLoaderContainer();
    }
}

function updateSearchPage(){
    if (isOnMissionsPage('search') || isOnMissionsPage('en/search')){
        const searchPageInstance = new SearchPage(selectedFilters.getData(), selectedFilters, 'Søg i missioner her!');
        loader.removeLoaderContainer();
    }
}

// update the missionspage with information
function updateTheMissionsPage(missionId, data){
    if (isOnMissionsPage('missionstest-1') || isOnMissionsPage('/en/missionstest-1')) {
        // Create an instance of MissionPage
        const missionPage = new MissionPage(data, missionId, selectedFilters);
        loader.removeLoaderContainer();
    }
}

// function that adds the mission card menu to the background pages. The rest of the pages were made in wordpress, so this function is the only part needed in code.
function updateBackgroundPages(data) {
    const collections = data.collections;
    // Danish : English mapping
    const locationNameMapping = {
        "balkan": "Balkan",
        "cypern": "Cyprus",
        "irak": "Iraq",
        "afghanistan": "Afghanistan",
        "fn": "UN", 
        "eu": "EU", 
        "nato": "NATO", 
        "osce": "OSCE", 
        "beredskabsstyrelsen": "DEMA" 
    };

    // Iterate through collections
    collections.forEach(collection => {
        const title = collection.title.toLowerCase(); // Normalize title for matching

        // Check if the title is a Danish name
        const danishTitle = locationNameMapping[title] 
            ? title.charAt(0).toUpperCase() + title.slice(1) // Capitalize Danish name
            : null;

        // Check if the title is an English name
        const matchedDanishTitle = !danishTitle
            ? Object.keys(locationNameMapping).find(
                key => locationNameMapping[key].toLowerCase() === title
            )
            : null;

        // Final Danish name
        const finalDanishName = danishTitle || (matchedDanishTitle 
            ? matchedDanishTitle.charAt(0).toUpperCase() + matchedDanishTitle.slice(1) 
            : null);

        const englishPath = `/en/${finalDanishName}`;
        if (isOnMissionsPage(finalDanishName) || isOnMissionsPage(englishPath)) {
            console.log(`Matched Collection: ${collection.title}`);

            const button = document.getElementById(`missionButton${collection.id}`);
            const homePage = document.getElementById(`PageElement${collection.id}`);

            if (button) {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    const missionCardMenuForBackgroundPages = new MissionSelectorMenu(
                        collection.missions,
                        collection.title,
                        homePage,
                        selectedFilters
                    );
                });
            }
            loader.removeLoaderContainer();
        }
    });
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

        // Get the current URL
        const currentUrl = new URL(window.location.href);

        // Append the new path to the current URL
        const url = `${currentUrl}/beredskabsstyrelsen/`;


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
            linkButton.textContent = (BeredskabsKort.isEn ? 'Background'.toUpperCase() : 'Baggrund'.toUpperCase());

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
        loader.removeLoaderContainer();
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
        console.warn('Language control parent element not found.');
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

// check if any of the pages are loaded either in da(/cypern-forside/) or en (en/cypern-forside/)
// page to trigger: en/balkan-forside/, en/cypern-forside/, en/irak-forside/, /en/afghanistan-forside/
// Check if any of the pages are loaded either in da(/cypern-forside/) or en (en/cypern-forside/)
// Pages that should trigger the function
function areaPins(data) {
    // Supported pages and their corresponding keys in frontpages
    const pageMapping = {
        "/en/balkan-forside/": "Balkan",
        "/en/cypern-forside/": "Cypern",
        "/en/irak-forside/": "Iraq",
        "/en/afghanistan-forside/": "Afghanistan",
        "/balkan-forside/": "Balkan",
        "/cypern-forside/": "Cypern",
        "/irak-forside/": "Iraq",
        "/afghanistan-forside/": "Afghanistan"
    };

    // Get the current page path
    const currentPath = window.location.pathname;

    // Check if the page is supported and get the corresponding frontpage key
    const frontpageKey = pageMapping[currentPath];
    if (!frontpageKey || !data.frontpages[frontpageKey]) {
        return; // Exit if the page isn't supported or if data is missing
    }

    // Get frontpage mission data for the current page
    const frontpageData = data.frontpages[frontpageKey];

    // Find parent element
    const parentElement = document.querySelector('[parent="yes"]'); // Adjust selector as needed
    if (!parentElement) {
        console.error('Parent element not found.');
        return;
    }
    // Add event listeners to area pins
    const areaPins = document.querySelectorAll('[area]'); // Adjust selector to match area pins
    console.log('areaPins', areaPins);
    areaPins.forEach(pin => {
        const tag = pin.getAttribute('area'); // Retrieve 'area' attribute
        const tags = tag.split(',').map(t => t.trim()); // Split by comma and trim whitespace
        
        let idArray = [];

        // Find matching areas in the frontpage data
        tags.forEach(tag => {
            tag = toCapitalizedLowercase(tag);

            if (frontpageData[tag]) {
                idArray = idArray.concat(frontpageData[tag]); // Get mission IDs
            }
        });

        // Remove duplicates
        //idArray = [...new Set(idArray)];

        // Remove pins with no matching missions
        if (idArray.length === 0) {
            pin.remove();
            return;
        }

        let tagName = null;
        for (const child of pin.childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE && child.hasAttribute('tag')) {
                tagName = child.innerText;
                break; // Exit loop after finding the tag
            }
        }
        pin.addEventListener('click', () => {
            searchByTag(tagName, parentElement, data, idArray); // Add event listener for clicks
        });
    });

    function toCapitalizedLowercase(str) {
        if (!str) return ''; // Handle empty or null input
        str = str.toLowerCase(); // Convert the entire string to lowercase
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Search missions by tag
    function searchByTag(tagName, parentElement, data, missionIds) {
        let missionMenu = new MissionSelectorMenu(
            missionIds,
            tagName,
            parentElement,
            selectedFilters
        );
    }

    loader.removeLoaderContainer();
}
