import { MissionSelectorMenu } from './missionCardMenu.js'

export class InfoScreenPage {
    static excludedIds = [1240, 4690, 4691]; // Shared static property for excluded IDs 
    constructor(data, selectedFilters){
        this.data = data
        this.currentMissionId = 5388;
        this.selectedFilters = selectedFilters;
         // stores the active state and filter buttons
        this.filterStateStorage = {
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
        this.initialize();
    }

    initialize(){
        console.log('InfoScreenPage')
        this.updateTheInfoScreen(this.data, this.currentMissionId)
    }
    // Static methods to manage ExcludedIds
    static getExcludedIds() {
        return [...this.excludedIds]; // Return a copy of the array to avoid direct modification
    }
    updateTheInfoScreen(data, missionId) {
        // Create the filter buttons for the info screen
        this.createInfoScreenFilterButton(currentMissionId, data, this.getExcludedIds());
        const selectedMission  = applyFiltersToFindMissions(data, selectedFilters.getAllFilters());
    
        // Update map pins based on the new filters
        const mapContainer = document.getElementById('infoScreenMap');
        if (mapContainer) {
            mapContainer.style.backgroundImage = 'url("https://kastellet.gbplayground.dk/wp-content/uploads/2024/12/verdenskort_8K.png")'; //TODO fixed this monster
            Object.assign(mapContainer.style, {
                backgroundSize: 'cover', /* Or contain, depending on the design */
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                position: 'fixed',
            });
        } else {
            console.error('Element with id "infoScreenMap" not found.');
        }
        updateMapPins(data, this.getExcludedIds(), mapContainer, selectedMission, selectedFilters.contributionColors, 'continent');
    }

    createInfoScreenFilterButton(missionId, data, excludedIds) {
        const buttonIds = ['PeriodFilterButton', 'contributionFilterButton', 'geographyFilterButton'];
        const originalArray = generateDataSet(1940, 2029, 10);
        // Remove the item with description "1970-1979"
        const dataSet = originalArray.filter(item => item.description !== "1970-1979");
        const contributionColors = selectedFilters.getContributionColors();
    
        buttonIds.forEach(buttonId => {
            const parentButton = document.getElementById(buttonId);
    
            if (!parentButton) {
                console.error(`Button with ID "${buttonId}" not found.`);
                return;
            }
    
            // Reset and apply styles to the parent button
            parentButton.style.all = 'unset';
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
            filterSelectorContainer.id = 'filterSelectorContainer';
            applyStyles(filterSelectorContainer, {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '10px',
                display: 'none',
            });
    
            // Populate the container with filter buttons based on type
            if (parentButton.id === "PeriodFilterButton") {
                parentButton.textContent = 'Periode';
                dataSet.forEach((dataItem) => {
                    const filterSelectorButton = createfilterSelectorButton(parentButton);
                    filterSelectorButton.textContent = dataItem.description;
                    filterSelectorButton.id = 'filterOption-period';
                    filterSelectorButton.setAttribute('filterId', 'filterOption-period');
                    filterSelectorButton.setAttribute('filterValue', dataItem.description);
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
                    filterSelectorButton.setAttribute('filterId', 'filterOption-contribution');
                    filterSelectorButton.setAttribute('filterValue', force?.title || 'Unknown Force');
                    filterSelectorButton.id = 'filterOption-contribution'
                    filterSelectorContainer.appendChild(filterSelectorButton);
                    filterSelectorButton.addEventListener('click', function(){applyFilter('contribution' , filterSelectorButton.textContent, filterSelectorButton, parentButton, data);});
                });
            } else if (parentButton.id === "geographyFilterButton") {
                parentButton.textContent = data.locations[6]?.title || 'Geography';
                data.locations.forEach((location) => {
                    if (!excludedIds.includes(location?.id)) {
                        const filterSelectorButton = createfilterSelectorButton(parentButton);
                        filterSelectorButton.textContent = location?.title || 'Unknown Location';
                        filterSelectorButton.setAttribute('filterValue', location?.title || 'Unknown Force');
                        filterSelectorButton.setAttribute('filterId', 'filterOption-geography');
                        filterSelectorContainer.appendChild(filterSelectorButton);
                        filterSelectorButton.id = `filterSelectorButtonGeography-${location?.region.toLowerCase().replace(/\s+/g, '')}`;
                        filterSelectorButton.addEventListener('click', function(){applyFilter('geography', filterSelectorButton.textContent, filterSelectorButton, parentButton, data);});
                    }
                });
            }
    
            // Add the filter container to the wrapper
            buttonWrapper.appendChild(filterSelectorContainer);
            parentButton.addEventListener('click', () => {
                const type = parentButton.id.replace('FilterButton','').toLowerCase()
                if (filterStateStorage[type].isFilterActive){
                    resetFilterObjects(data, type);
                } else {
                    const isDisplayed = filterSelectorContainer.style.display === 'flex';
                    filterSelectorContainer.style.display = isDisplayed ? 'none' : 'flex';
                }
                
            });
        });
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
        // Helper function to create a filter selector button
        function  createfilterSelectorButton(parentButton) {
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
        // Function to apply styles
        function applyStyles(element, styles) {
            Object.assign(element.style, styles);
        }
    }
    // filter event listener function call
    applyFilter(type, value, filterButtonElement, parentButtonElement, data) {
        selectedFilters.updateSelectedFilter(type, value); // Update queryable data
        updateInterfaceFromStateStorage(type, parentButtonElement, filterButtonElement);
        closeAllFilterContainers();
    }

    // type can be 'continent' or 'country'
    hideOrShowMapPins(type, display) {
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

    resetFilterObjects(data, type = null){
        selectedFilters.resetSelectedFilter(type); // Notify listener via reset
        resetStateStorage(type);
        
    }

    // used to close the filter selectors on each search so the options are not in the way of the map pins
    closeAllFilterContainers() {
        const filterButtons = document.querySelectorAll('[id*="filterSelectorContainer"]');
        filterButtons.forEach(button => {
            button.style.display = 'none'; // Hide all filter containers
        });
    }


    updateInterfaceFromStateStorage(type, parentButtonElement, filterButtonElement){
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

    resetStateStorage(type = null) {
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
    handleStateIndictionForFilters(type, parentButtonElement, filterButtonElement) {
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
    /**
     * Applies user-selected filters to find relevant mission IDs.
     *
     * @param {Object} jsonData - The dataset containing all missions and related data.
     * @param {Object} selectedFilters - The user-selected filters for period, contribution, and geography.
     * @returns {Array} filteredMissionIds - An array of mission IDs that match the selected filters.
     */
    applyFiltersToFindMissions(jsonData, selectedFilters) {
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
    }
}







function zoomToCoordinates(regionName, backgroundMap) {
    // the map coordinates for zooming in and placing continent map pins
    const mapCoordinatesForZoom = {
        africa: { scale: 2, x: -5, y: -10 },
        asia: { scale: 2, x: -60, y: 0 },
        europe: { scale: 3.8, x: -5, y: 65 },
        america: { scale: 1.4, x: 40, y: 0 },
        middleeast: { scale: 7, x: -60, y: 27 },
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
function createMapPin(region, location, missions, forces, type = 'continent', data, title, baseImagePath) {
    // Create the main container for the map pin
    const mapPinContainer = document.createElement('div');
    // map coordinates for placing continent map pins
    const mapCoordinatesForContinetMapPins = {
        africa: { x: 48, y: 50 },
        asia: { x: 70, y: 40 },
        europe: { x: 45, y: 27 },
        america: { x: 20, y: 45 },
        middleeast: { x: 55, y: 35 },
        australia: { x: 45, y: 55 },
        default: { x: 50, y: 55 } // Default zoom for reset or unmatched regions
    };

    const mapCoordinatesForCountyMapPins = {
        usa: { x: 15, y: 35 }, // America
        chile: { x: 24, y: 65 }, // America
        haiti: { x: 23, y: 43 }, // America 
        congo: { x: 50, y: 57 }, // Africa
        libya: { x: 47, y: 40 }, // Africa
        liberia: { x: 41, y: 52 }, // Africa
        sierraleone: { x: 39, y: 50 }, // Africa
        ethiopia: { x: 52.5, y: 51 }, // Africa
        eritrea: { x: 53, y: 47 }, // Africa
        namibia: { x: 47.5, y: 68 }, // Africa
        somalia: { x: 56, y: 52 }, // Africa
        mali: { x: 43, y: 45 }, // Africa
        sudan: { x: 50, y: 47 }, // Africa
        centralafricanrepublic: { x: 48, y: 51 }, // Africa
        kenya: { x: 52, y: 55 }, // Africa
        southafrica: { x: 49, y: 72 }, // Africa
        morocco: { x: 41, y: 40 }, // Africa
        lebanon: { x: 52.5, y: 39.1 }, // Middle East
        cyprus: { x: 51.6, y: 38.5 }, // Middle East
        iraq: { x: 55, y: 40.2 }, // Middle East
        palestine: { x: 52.2, y: 40.7 }, // Middle East
        yemen: { x: 55, y: 47 }, // Middle East
        iran: { x: 56, y: 38.8 }, // Middle East
        turkey: { x: 50.5, y: 37.5 }, // Middle East
        syria: { x: 53.4, y: 38.7 }, // Middle East
        egypt: { x: 50, y: 42 }, // Middle East
        jordan: { x: 53.3, y: 40.2 }, // Middle East
        saudiarabia: { x: 56, y: 45 }, // Middle East
        tajikistan: { x: 63, y: 34 }, // Asia
        nepal: { x: 66.7, y: 40 }, // Asia
        pakistan: { x: 61, y: 42 }, // Asia
        india: { x: 63.3, y: 46.1 }, // Asia
        korea: { x: 77.3, y: 35.7 }, // Asia
        afghanistan: { x: 63.5, y: 39.2 }, // Asia
        georgia: { x: 55, y: 35 }, // Asia
        easttimor: { x: 77, y: 58.7 }, // Asia
        indonesia: { x: 73.5, y: 55 }, // Asia
        srilanka: { x: 64.8, y: 51 }, // Asia
        myanmar: { x: 68.8, y: 46 }, // Asia
        japan: { x: 80.5, y: 36 }, // Asia
        philippines: { x: 76, y: 49 }, // Asia
        //balkan: { x: 49, y: 33.5 }, // Europe -rename to serbia
        albania: { x: 448, y: 35.5 }, // Europe
        kosovo: { x: 49, y: 33.5 }, // Europe
        croatia: { x: 46.5, y: 32.5 }, // Europe
        iceland: { x: 38, y: 19.5 }, // Europe
        estonia: { x: 49.5, y: 24 }, // Europe
        macedonia: { x: 49.5, y: 35.5 }, // Europe
        bosnia: { x: 47.5, y: 33.5 }, // Europe
        holland: { x: 44, y: 29 }, // Europe done
        hungary: { x: 47.5, y: 31.5 }, // Europe done
        poland: { x: 47, y: 27.8 }, // Europe done
        russia: { x: 54, y: 27.5 }, // Europe done
        romania: { x: 50, y: 32.5 }, // Europe done
        czechrepublic: { x: 46.5, y: 30 }, // Europe done
        ukraine: { x: 51.5, y: 30 }, // Europe done
        latvia: { x: 49, y: 27 }, // Europe done
        unitedkingdom: { x: 42.4, y: 27.5 }, // Europe done
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
        width: '150px',
        height: 'auto',
        zIndex: '100',
        pointerEvents: 'auto',
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
        const coordinates = mapCoordinatesForCountyMapPins[region.toLowerCase()] || mapCoordinatesForCountyMapPins.default;
        Object.assign(mapPinContainer.style, {
            left: `${coordinates.x}%`, // Position in percentage relative to the viewport
            top: `${coordinates.y}%`,
        });  
        mapPinContainer.id = `map-pin-${region.toLowerCase()}-${location.replace(/\s/g, '-').toLowerCase()}` // 
            // Unique ID for countries
        mapPinContainer.setAttribute('data-type', 'country');
    }
    
    // Add the location name as a label
    const mapPinLocation = document.createElement('span');
    Object.assign(mapPinLocation.style, {
        fontSize: '20px',
        display: 'flex', // Keep flex for alignment
        justifyContent: 'center', // Horizontally center text
        alignItems: 'center', // Vertically center text
        textTransform: 'uppercase',
        fontWeight: 'bold',
        color: 'white',
        overflow: 'visible',
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
        marginTop: '5px',
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
    const currentColor = selectedFilters.getCurrentColor();
    
    // Fetch the SVG content dynamically
    fetch(baseImagePath + '2024/12/location_on_24dp_UNDEFINED_FILL1_wght200_GRAD0_opsz24.svg')
        .then(response => response.text())
        .then(svgContent => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
            const svgElement = svgDoc.querySelector('svg');

            // Set the initial color and size of the SVG
            svgElement.setAttribute('fill', currentColor); // Initial color
            svgElement.style.width = '62px';
            svgElement.style.height = '62px';

            // Append the SVG to the wrapper
            mapPinImageContainer.appendChild(svgElement); // Add to the DOM
        })
        .catch(err => console.error('Error fetching SVG:', err));

    
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
            width: '15px',
            height: '5px',
            borderRadius: '1px',
            margin: '0px 2px',
            overflow: 'visibile',
            flexShrink: '0',
            backgroundColor: force.backgroundColor || '#ccc', // Default to gray if no color provided
        });
        forceContainer.appendChild(mapPinForceColor);
    });
}
function updateMapPins(data, excludedIds, container, selectedMission, forceColors, type = 'continent') {
    const existingPins = Array.from(container.children);
    const matchingMissions = data.missions.filter(mission => selectedMission.includes(mission.id));
    // Construct the base image path dynamically
    const url = new URL(window.location.href);
    const baseImagePath = `${url.protocol}//${url.hostname}/wp-content/uploads/`;

    if (type === 'country') {
        // countryPin.style.transform = 'scale(0.36)';
        const scaleValues = {
            africa: { scale: 0.36 },
            asia: { scale: 0.5 },
            europe: { scale: 0.2 },
            america: { scale: 0.7 },
            middleeast: { scale: 0.15 },
            australia: {scale: 1 },
            default: { scale: 1 } // Default zoom for reset or unmatched regions
        }
        
        // Extract valid country names from the filtered hotspots
        const validCountriesAndCurrentCountry = selectedFilters.getFilteredCountries()
        const validCountries = validCountriesAndCurrentCountry[0]
        const currentContinent = validCountriesAndCurrentCountry[1]

        // Create a Map to store country-to-missions associations
        const countryMissionMap = new Map();

        // Iterate through each matching mission
        matchingMissions.forEach((mission) => {
            const missionHotspots = mission.hotspotCollections; // Get hotspots for the mission

            // Find the relevant hotspots for this mission
            const hotspots = data.hotspotCollections.filter(hotspot =>
                missionHotspots.includes(hotspot.id) && hotspot.county
            );

            // Associate each country with the mission ID
            hotspots.forEach((hotspot) => {
                const country = hotspot.county.toLowerCase().replace(/\s+/g, ''); // Normalize country name
                // Only include countries in the current continent
                if (validCountries.has(country)) {
                    if (!countryMissionMap.has(country)) {
                        countryMissionMap.set(country, []); // Initialize if the country is not already in the map
                    }
                    countryMissionMap.get(country).push(mission.id); // Add the mission ID to the country's list
                }
            });
        });
        if (countryMissionMap.has('balkan')) {
            // Get all the mission IDs from other countries
            const otherCountryMissions = new Set();
        
            // Collect all mission IDs from countries other than "balkan"
            countryMissionMap.forEach((missions, country) => {
                if (country !== 'balkan') {
                    missions.forEach(missionId => otherCountryMissions.add(missionId));
                }
            });
        
            // Get the current Balkan mission list
            const balkanMissions = countryMissionMap.get('balkan');
        
            // Filter out mission IDs that are present in other countries
            const filteredBalkanMissions = balkanMissions.filter(missionId => !otherCountryMissions.has(missionId));
        
            // Update the Balkan missions in the map
            //console.log('Updated Balkan Mission List:', filteredBalkanMissions);
            //console.log('Updated Country Mission Map:', countryMissionMap);
            countryMissionMap.set('balkan', filteredBalkanMissions);
        }
        // remove dublicate mission ids. Dublicates can happen when using hotspots to find missions
        countryMissionMap.forEach((value, key) => {
            const uniqueValues = [...new Set(value)];
            countryMissionMap.set(key, uniqueValues);
        })
       
        // Iterate over the countryMissionMap to create pins
        countryMissionMap.forEach((missions, country) => {
            const countryHotspot = data.hotspotCollections.find(h =>
                h.county && h.county.toLowerCase() === country.toLowerCase()
            );
     
            if (countryHotspot) {
                
                // Get the mission count directly from the map
                const missionCount = missions.length;

                // Determine the force colors for each missions
                const missionForForces = []
                missions.forEach((mission) => {
                    const missionInformation = getMissionById(data.missions, mission);
                    missionForForces.push(missionInformation)
                })
                const matchingForceColors = getColorsForMissionForces(forceColors, missionForForces);
                let countryPin = existingPins.find(pin => pin.id ===`pin-${country.toLowerCase()}`)
                if (countryPin){
                    //update
                    countryPin.querySelector('.mission-count').textContent = `${missionCount} Missioner`;
                    const containerForForces = countryPin.querySelector('.mapPinForceColor');
                    if (containerForForces) {
                        containerForForces.innerHTML = ''; // Clear existing flags
                        createForceColorFlags(matchingForceColors, containerForForces); // Add updated flags
                    }
                } else {
                    // Create and append the country pin
                    countryPin = createMapPin(
                        countryHotspot.county, // Pass the country name
                        countryHotspot.county, // Display name for the pin
                        missionCount, // Number of missions
                        matchingForceColors, // Force colors
                        'country', // Pin type
                        data, // Full data set
                        countryHotspot.title, // Tooltip or title for the pin
                        baseImagePath // Path to assets
                    );
                    // Apply scaling to reduce size by XX%
                    const scaleValue = scaleValues[currentContinent]?.scale || scaleValues.default.scale;
                    countryPin.style.transform = `scale(${scaleValue})`;
                    countryPin.style.transformOrigin = 'center'; // Ensure scaling happens relative to the center of the pin
                    
                    
                    // Assign unique ID and attributes
                    countryPin.id = `pin-${country.toLowerCase()}`; // Unique ID for the country pin
                    countryPin.setAttribute('data-type', 'country');

                    // Append the pin to the map container
                    container.appendChild(countryPin);

                    // Add event listener for continent pin
                    countryPin.addEventListener('click', function() {
                        const missionIdsInStringFormat = countryPin.getAttribute('data-mission-ids');
                        const missionIds = missionIdsInStringFormat ? missionIdsInStringFormat.split(',').map(Number):[];
                        const countryName = countryPin.querySelector('span')
                        //createMissionSelectormenu(missionIds, countryName.textContent);
                        const parentElement = document.getElementById('InfoScreenContainer');
                        const mappinMissionCards = new MissionSelectorMenu(
                            missionIds,
                            countryName.textContent,
                            parentElement,
                            selectedFilters
                        )
                        console.log('missionIds', missionIds)
                    });
                }
                countryPin.setAttribute('data-mission-ids', missions.join(',')); // Add mission IDs as a comma-separated list
            } else {
                console.warn("No matching hotspot found for country:", country);
            }

        });
    }

    // Continue with continent pin processing
    data.locations.forEach((location) => {
        if (!excludedIds.includes(location?.id)) {
            const formattedRegion = location.region.toLowerCase().replace(/\s/g, '');
            const formattedTitle = location.title;

            const matchingHotspots = data.hotspotCollections.filter(hotspot =>
                hotspot.region.toLowerCase().replace(/\s/g, '') === formattedRegion
            );
            const matchingHotspotIds = matchingHotspots.map(hotspot => hotspot.id);
            const missionsForLocation = matchingMissions.filter(mission =>
                mission.hotspotCollections.some(hotspotId => matchingHotspotIds.includes(hotspotId))
            );
            const missionCount = missionsForLocation.length;
            const matchingForceColors = getColorsForMissionForces(forceColors, missionsForLocation);

            let pin = existingPins.find(p => p.id === `pin-${formattedRegion}`);
            if (pin) {
                // Update existing pin
                pin.querySelector('.mission-count').textContent = `${missionCount} Missioner`;
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
                    formattedTitle,
                    baseImagePath
                );
                pin.id = `pin-${formattedRegion}`;
                container.appendChild(pin);

                // Add event listener for continent pin
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
        const pinType = pin.getAttribute('data-type'); // Get the pin type (continent or country)
        const region = pin.id.replace('pin-', ''); // Extract the region from the pin ID
        const currentFilters = selectedFilters.getAllFilters(); // Get active filters
        const pinMissionIds = (pin.getAttribute('data-mission-ids') || "").split(',').map(Number); // Get mission IDs from the pin
    
        if (pinType === 'country') {
            if (currentFilters.geography === null) {
                console.log(`Removing country pin due to no geography filter: ${region}`);
                pin.remove(); // Remove all country pins if no geography filter
                return;
            }
    
            // Get valid countries for the current continent
            const validCountries = selectedFilters.getFilteredCountries()[0];
            if (!validCountries.has(region)) {
                console.log(`Removing country pin not in valid countries: ${region}`);
                pin.remove(); // Remove pin if country is not valid for the geography filter
                return;
            }
    
            // Check if any mission ID in the pin matches the filtered mission IDs
            const isCountryStillValid = pinMissionIds.some(missionId => selectedMission.includes(missionId));
    
            if (!isCountryStillValid) {
                console.log(`Removing country pin not matching filters: ${region}`);
                pin.remove(); // Remove pin if it doesn't match the filters
            }
        } else if (pinType === 'continent') {
            const isRegionStillValid = data.locations.some(loc =>
                loc.region.toLowerCase().replace(/\s/g, '') === region && // Match location region
                matchingMissions.some(mission =>
                    mission.hotspotCollections.some(hotspotId =>
                        data.hotspotCollections.some(h =>
                            h.id === hotspotId &&
                            h.region.toLowerCase().replace(/\s/g, '') === region
                        )
                    )
                )
            );
    
            if (!isRegionStillValid) {
                console.log(`Removing continent pin: ${region}`);
                pin.remove(); // Remove invalid continent pin
            }
        } else {
            console.warn('Unknown pin type:', pinType);
        }
    });
}
