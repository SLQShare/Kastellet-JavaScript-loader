export class SelectedFilters {
    constructor(dependencies = {}) {
        this.data = null;
        this.period = null;
        this.contribution = null;
        this.geography = null;
        this.currentMissionId = 5388;
        this.emblemIds = [
            1688, // fn_logo
            1691, // nato_log
            1687, // eu_logo
            1689, // forsvaret_logo
            1693, // politi_logo
            1686, // beredskabsstyrelsen 
            1690, // hjemmevaernet_logo
        ]; 
        this.contributionListeners = [];
        this.filterListeners = []; // Add a list for general filter listeners
        this.mapContainer = null;
        this.excludedIds = [1240, 4690, 4691];
        this.updateMapPins = dependencies.updateMapPins || (() => {});

        this.contributionColors = {
            1087: { backgroundColor: "#518346", textColor: "#ffffff" },
            1088: { backgroundColor: "#4a9fd8", textColor: "#ffffff" },
            1089: { backgroundColor: "#052854", textColor: "#ffffff" },
            1090: { backgroundColor: "#8d1b3d", textColor: "#ffffff" },
            1091: { backgroundColor: "#ededed", textColor: "#81847e" }, // ffffff
            1092: { backgroundColor: "#de8130", textColor: "#ffffff" },
            1093: { backgroundColor: "#f4d70d", textColor: "#ffffff" },
        };
        this.validFilterOptions = []
        this.currentColor = '#72756f';

        SelectedFilters.instance = this;
    }
    getExcludedIds(){
        return this.excludedIds;
    }
    
    setMapContainer(mapContainer) {
        this.mapContainer = mapContainer;
    }

    getMapContainer() {
        return this.mapContainer;
    }
    
    getEmblemIds(){
        return this.emblemIds;
    }

    getContributionColors(){
        return this.contributionColors;
    }

    setMissionId(missionid) {
        this.currentMissionId = missionid;
    }

    getMissionId() {
        return this.currentMissionId;
    }

    setCurrentColor(color) {
        this.currentColor = color;
    }

    getCurrentColor() {
        return this.currentColor;
    }

    setData(data) {
        this.data = data;
    }

    getData() {
        return this.data;
    }

    getAllFilters() {
        return {
            period: this.period,
            contribution: this.contribution,
            geography: this.geography
        };
    }
    getValidFilterOptions(){
        return this.validFilterOptions;
    }
    setValidFilterOptions(options){
        this.validFilterOptions = options;
    }

    updateSelectedFilter(type, value) {
        if (!type || value === undefined) {
            console.error("Invalid filter type or value.");
            return;
        }

        if (this.hasOwnProperty(type)) {
            this[type] = value;

            if (type === "contribution") {
                this.notifyContributionListeners(value);
            }

            // Notify general filter listeners
            this.notifyFilterListeners(type, value);
        } else {
            console.error(`Invalid filter type: ${type}`);
        }
    }

    resetSelectedFilter(type = null) {
        if (!type) {
            this.clearFilters();
            return;
        }

        if (this.hasOwnProperty(type)) {
            this[type] = null;
            if (type === "contribution") {
                this.notifyContributionListeners(null);
            }

            // Notify general filter listeners of reset
            this.notifyFilterListeners(type, null);
        } else {
            console.error(`Invalid filter type: ${type}`);
        }
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

    getFilteredCountries(){
        const currentContinent2 = this.getAllFilters().geography.toLowerCase();
        const normalizedInput = currentContinent2.toLowerCase().replace(/\s+/g, '');
    
        // Match the input against location data in `title` or `region`
        const matchingLocation = this.data.locations.find(location => 
            location.region.toLowerCase().replace(/\s+/g, '') === normalizedInput ||
            location.title.toLowerCase().replace(/\s+/g, '') === normalizedInput
        );
        const currentContinent = matchingLocation.region.toLowerCase().replace(/\s+/g, '');
    
        // Filter hotspots to ensure they belong to the selected continent
        const continentHotspots = this.data.hotspotCollections.filter(hotspot =>
            hotspot.region.toLowerCase().replace(/\s+/g, '') === currentContinent
        );
    
        // Extract valid country names from the filtered hotspots
        const validCountries = new Set(
            continentHotspots
                .filter(hotspot => hotspot.county && typeof hotspot.county === 'string') // Ensure county exists and is a string
                .map(hotspot => hotspot.county.toLowerCase().replace(/\s+/g, '')) // Normalize county name
        );
        return [validCountries, currentContinent];
    }

    addContributionListener(listener) {
        if (typeof listener === "function") {
            this.contributionListeners.push(listener);
        }
    }

    notifyContributionListeners(value) {
        this.contributionListeners.forEach(listener => listener(value));
    }

    // Add a general-purpose filter listener
    addFilterListener(listener) {
        if (typeof listener === "function") {
            this.filterListeners.push(listener);
        }
    }

    notifyFilterListeners(type, value) {
        this.filterListeners.forEach(listener => listener(type, value));
    }

    // function to create the date intervals for the period options
    generateDataSet(startYear, endYear, intervalSize) {
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
    
    dependentFilter(){
        if (!this.validFilterOptions.length > 0){
            const originalArray = this.generateDataSet(1940, 2029, 10);
            const timeIntervals = originalArray.map(item => item.description);
            const forces = this.data.forces.map(item => item.title);
            const excludedIds = this.getExcludedIds()
            const locationsOptions = this.data.locations
                .filter(location => !excludedIds.includes(location?.id))
                .map(location => location?.title);

            const validFilterOptions = [timeIntervals, forces, locationsOptions]
            this.setValidFilterOptions(validFilterOptions)
        }
        const searchInfilterOptions = (arrayOfOptions, filterType, currentfilter, data) => {
            const invalidOptions = []; // Local list for invalid options

            arrayOfOptions.forEach((option) => {
                const tempFilters = { ...currentfilter }; // Clone the object to avoid mutation
                tempFilters[filterType] = option;
                const availableMissions = this.applyFiltersToFindMissions(data, tempFilters);
                // Handle invalid options
                if (!availableMissions || availableMissions.length === 0) {
                    invalidOptions.push({ [filterType]: option }); // Collect invalid options
                }
            });

            return invalidOptions; // Return collected invalid options
        }
        const currentFilters = this.getAllFilters(); // object
        const filterOptions = this.getValidFilterOptions(); // array 
        const listOfInvalidOptions = [];

        for (const [key, value] of Object.entries(currentFilters)) {
            if (!value) {
                if (key === 'period') {
                    const invalidOptions = searchInfilterOptions(filterOptions[0], key, currentFilters, this.data);
                    listOfInvalidOptions.push(...invalidOptions);
                } else if (key === 'contribution') {
                    const invalidOptions = searchInfilterOptions(filterOptions[1], key, currentFilters, this.data);
                    listOfInvalidOptions.push(...invalidOptions); 
                } else if (key === 'geography') {
                    const invalidOptions = searchInfilterOptions(filterOptions[2], key, currentFilters, this.data);
                    listOfInvalidOptions.push(...invalidOptions);
                }
            }
        }

        
        function makeInvalidOptionNonInteractable(invalidOptions, data) {
            // Select all relevant elements at the start
            const elementsToCheck = document.querySelectorAll('[filterId]');
        
            // Convert invalidOptions into a lookup for quick checks
            const invalidLookup = new Map();
            invalidOptions.forEach(option => {
                Object.entries(option).forEach(([key, value]) => {
                    if (!invalidLookup.has(key)) {
                        invalidLookup.set(key, new Set());
                    }
                    invalidLookup.get(key).add(value);
                });
            });
        
            // Iterate through all elements to reset or hide them
            elementsToCheck.forEach((element) => {
                const filterId = element.getAttribute('filterId');
                let filterValue = element.getAttribute('filterValue');
                const key = filterId.split('-')[1]; // Extract the key from filterId (e.g., "period")
        
                // Convert contribution ID to title if the key is "contribution"
                // TODO streamline the contribution code to use the ID instead of title.
                if (key === "contribution" && data && data.forces) {
                    const matchingForce = data.forces.find(force => force.id === Number(filterValue));
                    if (matchingForce) {
                        filterValue = matchingForce.title; // Replace the ID with the title
                    }
                }
        
                // Check if the element is in the invalid options
                const isInvalid = invalidLookup.has(key) && invalidLookup.get(key).has(filterValue);
        
                if (isInvalid) {
                    // Hide invalid elements
                    element.style.opacity = '0'; // Make invisible
                    element.style.pointerEvents = 'none'; // Disable interaction
                    element.style.order = '999'; // Push to the end
                } else {
                    // Reset valid elements
                    element.style.opacity = '1'; // Make visible
                    element.style.pointerEvents = 'auto'; // Enable interaction
                    element.style.order = '0'; // Reset order
                }
            });
        }
        
        makeInvalidOptionNonInteractable(listOfInvalidOptions, this.data);
        return listOfInvalidOptions;
    }
    
    // Main handler for filter changes (instance-specific logic)
    handleFilterChange(type, value) {
        
        const currentFilters = this.getAllFilters();
        const selectedMission = this.applyFiltersToFindMissions(this.data, currentFilters);
        let forceIdForColor = null;
        // Contribution Filter Logic
 

        if (currentFilters.contribution) {
            const contributionIds = this.data.forces
                .filter(force => currentFilters.contribution.includes(force.title))
                .map(force => force.id);
            forceIdForColor = contributionIds.length > 0 ? contributionIds[0] : null;
            this.setCurrentColor(this.contributionColors[forceIdForColor]?.backgroundColor || '#72756f');
        } else {
            this.setCurrentColor('#72756f');
        }
        this.dependentFilter();

        // Geography Filter Logic
        if (currentFilters.geography === null) {
            zoomToCoordinates('default', this.mapContainer);
            updatePinColors(forceIdForColor, this.contributionColors);
            this.updateMapPins(this.data, this.getExcludedIds(), this.mapContainer, selectedMission, this.contributionColors, 'continent');
            hideOrShowMapPins('continent', 'block');
            return;
        }

        if (currentFilters.geography) {
            const geographyFilter = currentFilters.geography.trim().toLowerCase();
            const matchingLocation = this.data.locations.find(location =>
                location.region.toLowerCase() === geographyFilter ||
                location.title.toLowerCase() === geographyFilter
            );

            if (matchingLocation) {
                const location = matchingLocation.region.toLowerCase().replace(/\s/g, '');
                hideOrShowMapPins('continent', 'none');
                zoomToCoordinates(location, this.mapContainer);
                this.updateMapPins(this.data, this.getExcludedIds(), this.mapContainer, selectedMission, this.contributionColors, 'country');
                updatePinColors(forceIdForColor, this.contributionColors);
                hideOrShowMapPins('continent', 'none');
                return;
            } else {
                console.warn('No matching location found for:', geographyFilter);
            }
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
        // Helper: Update pin colors based on contribution filter
        function updatePinColors(forceIdForColor, contributionColors) {
            const elements = document.querySelectorAll('[id^="pin-"]');
            elements.forEach(element => {
                const svgElement = element.querySelector('svg');
                if (svgElement) {
                    const color = forceIdForColor && contributionColors[forceIdForColor]
                        ? contributionColors[forceIdForColor].backgroundColor
                        : '#72756f'; // Default color
                    svgElement.setAttribute('fill', color);
                }
            }); 
        }
    }
}
