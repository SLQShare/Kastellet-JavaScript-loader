import { MissionSelectorMenu } from './missionCardMenu.js'

export class SearchPage {
    constructor(data, selectedFilters, title, urlsIslandTag) {
        this.searchPageContainer = null;
        this.searchActionContainer = null;
        this.searchBar = null;
        this.tagBox = null;
        this.tagBoxContainer = null;
        this.keyboard = null;
        this.SearhResultOfTags = null;
        this.data = data;
        this.missionMenu = null;
        this.missionId = null;
        this.selectedFilters = selectedFilters;
        this.searchPage = null;
        this.title = title;
        this.searchHeader = null;
        this.tagBoxHeader = null;
        this.isEn = false; // used to check the language state
        this.urlsIslandTag = urlsIslandTag;
        this.init();
    }

    // Initialize the search page components
    init() {
        this.langControl()
        this.styleContainer();
        this.createActionContainers();
        this.createTitles()
        this.createSearchBar();
        this.createTagBox();
        this.createTouchKeyboard();
    }
    // checks the language setting
    langControl(){
        const url = window.location.href; // Get the full URL of the current page
        if (url.includes('/en')) {
            // en
            this.isEn = true;
        } else {
            // da
            this.isEn = false;
        }
    }

    styleContainer() {
        const page = document.getElementById('searchScreen'); // Main container for search page
        
        const container = document.createElement('div');
        Object.assign(container.style, {
            display: 'flex',
            position: 'relative',
            flexDirection: 'row',
            height: '60%',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'space-evenly',
            alignItems: 'flex-end',
        });
        page.appendChild(container);

        this.searchPage = page;
        this.searchPageContainer = container;
    }
    createActionContainers() {
        const container = document.createElement('div');
        Object.assign(container.style, {
            width: '45%',
            height: '35.49vh',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'start', // Centers items along the main axis
            alignItems: 'start',    // Centers items along the cross-axis
        });
        
        this.searchActionContainer = container;
        this.searchPageContainer.appendChild(this.searchActionContainer);

        const tagBoxContainer = document.createElement('div');
        Object.assign(tagBoxContainer.style, {
            width: '45%',
            height: '35.49vh',
        });
        this.searchPageContainer.appendChild(tagBoxContainer);
        this.tagBoxContainer = tagBoxContainer
    }
    
    createTitles() {
        const searchBarTitle = document.createElement('H3');
        searchBarTitle.textContent = `${this.isEn? "Search In Mission Tags" : "Søg I Mission Tags"}`;
        titleStyles(searchBarTitle)
        this.searchActionContainer.appendChild(searchBarTitle);


        const tagsTitle = document.createElement('H3');
        tagsTitle.textContent = `${this.isEn? "Background Information" : "Baggrundsinformation"}`;
        titleStyles(tagsTitle)
        this.tagBoxContainer.appendChild(tagsTitle);
        function titleStyles(element){
            Object.assign(element.style, {
                fontSize: 'clamp(0.8rem, 1.67vw, 2rem)', 
                fontFamily: 'Saira Stencil One, Sans-serif',
                fontWeight: 'bold',
                color: '#ffffff',
                whiteSpace: 'nowrap', /* Prevents text from wrapping */
                overflow: 'hidden', /* Hides extra text */
                textOverflow: 'ellipsis', /* Adds "..." if text overflows */
            });
        }
        this.searchHeader = searchBarTitle;
        this.tagBoxHeader = tagsTitle;
    }

    // Create the search bar
    createSearchBar() {
        const searchBarContainer = document.createElement('div');
        Object.assign(searchBarContainer.style, {
            width: '100%',
            height: '4.63vh',
            marginBottom: '4.63vh',
        });



        const searchBar = document.createElement('input');
        Object.assign(searchBar.style, {
            width: '100%',
            height: '100%',
            padding: '0.52vw',
            fontSize: 'clamp(0.8rem, 1.25vw, 1.5rem)', 
            fontFamily: 'Saira Stencil One, Sans-serif',
            fontWeight: 'bold',
            boxSizing: 'border-box',
            borderRadius: '0.26vw',
            whiteSpace: 'nowrap', /* Prevents text from wrapping */
            overflow: 'hidden', /* Hides extra text */
            textOverflow: 'ellipsis', /* Adds "..." if text overflows */
        });
        searchBar.type = 'text';
        searchBar.placeholder = `${this.isEn? "Search..." : "Søg..."}`;
        searchBar.addEventListener('input', () => {
            // Show the clear button only if there is text in the search bar
            if (searchBar.value === '') {
                clearButton.style.display = 'none'; // Hide the clear button when input is empty
            } else {
                clearButton.style.display = 'block'; // Show the clear button when input has text
            }
            searchBar.value = searchBar.value.charAt(0).toUpperCase() + searchBar.value.slice(1);// has no effect
            let arr = Array.from(searchBar.value);
            arr = arr.map((element, index) => {
                if (index < 1){
                    return element.toUpperCase();
                }
                return element.toLowerCase();
            });
            searchBar.value = arr.join('')
        });
        this.searchBar = searchBar;

        // Create clear button
        const clearButton = document.createElement('button');
        Object.assign(clearButton.style, {
            position: 'relative',
            right: '-94.7%',
            transform: 'translateY(-112.5%)',
            width: '2.08vw',
            height: '3.70vh',
            border: 'solid 0.10vw',
            borderRadius: '50%',
            display: 'none', // Initially hidden
            fontSize: 'clamp(0.5rem, 1.67vw, 2rem)', 
            whiteSpace: 'nowrap', /* Prevents text from wrapping */
            overflow: 'hidden', /* Hides extra text */
            textOverflow: 'ellipsis', /* Adds "..." if text overflows */
        });
        clearButton.textContent = '×'; // Cross symbol
        clearButton.addEventListener('click', () => {
            searchBar.value = '';
            clearButton.style.display = 'none';
            this.updateSearchResults(''); // Clear search results
        });
        //searchBarContainer.appendChild(searchPageTitle);
        searchBarContainer.appendChild(searchBar);
        searchBarContainer.appendChild(clearButton);
        this.searchActionContainer.appendChild(searchBarContainer);
    }
        // Create the touch-based keyboard with Danish layout
    createTouchKeyboard() {
        const keyboardContainer = document.createElement('div');
        Object.assign(keyboardContainer.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(11, 1fr)', // 12 columns for the grid
            gap: '0.52vw',
            width: '100%',
        });

        // Danish keyboard layout (including DELETE and SPACE buttons)
        const rows = [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'DELETE'], // Row 1
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å'], // Row 1
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Æ', 'Ø'], // Row 2
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'SPACE', '.', '-'] // Row 3
        ];

        rows.forEach((rowKeys, rowIndex) => {
            rowKeys.forEach((key, columnIndex) => {
                const keyButton = document.createElement('button');
                Object.assign(keyButton.style, {
                    width: '100%', // Full width of the grid cell
                    height: '3.70vh',
                    backgroundColor: '#ffffff',
                    color: '#212521',
                    border: '0.16vw solid #212521',
                    borderRadius: '0.52vw',
                    fontSize: 'clamp(0.2rem, 1.25vw, 1.5rem)', 
                    fontFamily: 'Saira Stencil One, Sans-serif',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gridColumn: key === 'SPACE' ? 'span 2' : 'span 1', // Span multiple columns
                    whiteSpace: 'nowrap', /* Prevents text from wrapping */
                    overflow: 'hidden', /* Hides extra text */
                    textOverflow: 'ellipsis', /* Adds "..." if text overflows */
                });

                keyButton.textContent = (key === 'SPACE' || key === 'DELETE') ? '' : key;
                if (key === 'DELETE') {
                    keyButton.innerHTML = '&#9003;';
                    keyButton.addEventListener('click', () => {
                        this.searchBar.value = this.searchBar.value.slice(0, -1); // Remove the last character
                        this.updateSearchResults(this.searchBar.value); // Update search results dynamically
                        // Manually trigger the `input` event
                        const event = new Event('input', { bubbles: true });
                        this.searchBar.dispatchEvent(event);
                    });
                } else if (key === 'SPACE') {
                    keyButton.addEventListener('click', () => {
                        this.searchBar.value += ' '; // Add a space
                        this.updateSearchResults(this.searchBar.value); // Update search results dynamically
                        const event = new Event('input', { bubbles: true });
                        this.searchBar.dispatchEvent(event);
                    });
                } else if (key) {
                    keyButton.addEventListener('click', () => {
                        this.searchBar.value += key; // Append the pressed key to the search bar
                        this.updateSearchResults(this.searchBar.value); // Update search results dynamically
                        const event = new Event('input', { bubbles: true });
                        this.searchBar.dispatchEvent(event);
                    });
                }
                keyboardContainer.appendChild(keyButton);
            });
        });

        this.searchActionContainer.appendChild(keyboardContainer);
        this.keyboardContainer = keyboardContainer;
    }
        static applyTagStyles(element, colSpan = 1) {
        Object.assign(element.style, {
            padding: '0.63vw',
            backgroundColor: '#f4f4f4',
            color: '#020202',
            borderRadius: '0.26vw',
            cursor: 'pointer',
            fontSize: 'clamp(0.8rem, 1.25vw, 1.5rem)',     
            fontFamily: 'Saira Stencil One, Sans-serif',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',        // Prevent wrapping
            height: '4.63vh',             // Fixed row height
            textAlign: 'center',
            display: 'flex',             // Use Flexbox for centering
            alignItems: 'center',
            justifyContent: 'center',
            gridColumn: `span ${colSpan}`, // Dynamic column span
            whiteSpace: 'nowrap', /* Prevents text from wrapping */
            overflow: 'hidden', /* Hides extra text */
            textOverflow: 'ellipsis', /* Adds "..." if text overflows */
        });
    }
    createTagElement(tag, clickHandler) {
        const tagElement = document.createElement('div');
    
        // Calculate column span dynamically based on text length
        const length = tag.length;
        let colSpan = 1; // Default column span
    
        if (length > 6 && length <= 17) {
            colSpan = 2; // Medium text uses 2 columns
        } else if (length > 17 && length <= 22) {
            colSpan = 3; // Long text uses 3 columns
        } else if (length > 22) {
            colSpan = 4; // Extra-long text uses 4 columns
        }
    
        // Apply styles with dynamic column span
        SearchPage.applyTagStyles(tagElement, colSpan);
    
        tagElement.textContent = tag;
    
        if (clickHandler) {
            tagElement.addEventListener('click', () => clickHandler(tag));
        }
        return tagElement;
    }
    
    createTagBox() {
        const tagBox = document.createElement('div');
        Object.assign(tagBox.style, {
            width: '100%',
            maxHeight: '71.76vh',
            display: 'grid',                 // Switch to grid layout
            gridTemplateColumns: 'repeat(auto-fit, minmax(5.21vw, 1fr))', // Flexible columns
            gridTemplateRows: 'repeat(13, auto)', // **Limit to 3 rows**
            gridAutoFlow: 'row dense',       // Fill rows in a dense manner
            gap: '0.52vw',                     // Space between items
            overflow: 'hidden',
            alignContent: 'start',             // Align items to the bottom of the container
        });
        
        const tags = this.SearhResultOfTags;
        this.tagBoxContainer.appendChild(tagBox);
        //this.searchPageContainer.appendChild(tagBoxContainer);
        this.tagBox = tagBox;
        this.createTagSearchResults(tagBox, tags);
    }
    
    createTagSearchResults(tagBox, tags, query = '') {
        // Clear existing children in the tagBox
        if (tagBox.firstChild){
            while (tagBox.firstChild) {
                tagBox.removeChild(tagBox.firstChild);
            }
        }
        
        const generateUrl = (link) => {
            const url = new URL(window.location.href)
            //`${url.protocol}//${url.hostname}/${link}`
            return `${url.protocol}//${url.hostname}${this.isEn? "/en/" : "/"}${link}`;        
            };

        // Handle different cases
        if ((!tags || tags.length === 0) && query === '') {
            // requires the danish data file as the HTML pages are in danish
            const links = this.data.collections.map(item => item); //TODO update to contain the webadress
            links.forEach(link => {
                const fullUrl = generateUrl(link.UrlTag+'-'+this.urlsIslandTag);
                const tagElement = this.createTagElement(link.title, () => {
                    window.location.assign(fullUrl);
                });
                tagBox.appendChild(tagElement);
                this.tagBoxHeader.textContent = `${this.isEn? "Background Information" : "Baggrundsinformation"}`;
            });
        } else if ((!tags || tags.length === 0) && query.length > 0) {
            const errorElement = this.createTagElement(`${this.isEn? "No Result" : "Intet Resultat"}`, null); 
            tagBox.appendChild(errorElement);
            this.tagBoxHeader.textContent = `${this.isEn? "Please Try Again" : "Prøv Igen"}`;
        } else {
            tags.forEach(tag => {
                const tagElement = this.createTagElement(tag, this.searchByTag.bind(this));
                tagBox.appendChild(tagElement);
                const stringTag = query.toLocaleLowerCase();
                this.tagBoxHeader.textContent = `${this.isEn? "Relevant Tags For" : "Relevante Tags Til"} ${stringTag}`;
            });
        }
    }
    
    // Update search results based on input
    updateSearchResults(query) {
        // Handle empty query
        if (query.length === 0) {
            this.createTagSearchResults(this.tagBox, [], query); // Pass an empty array
            return;
        }
    
        // Convert the query to lowercase for case-insensitive comparison
        const lowercaseQuery = query.toLowerCase();
    
        // Collect matching tags
        const tags = new Set();
        this.data.missions.forEach(mission => {
            mission.tags.forEach(tag => {
                // Match tags starting with the query
                if (tag.toLowerCase().startsWith(lowercaseQuery)) {
                    tags.add(tag);
                }
            });
        });
    
        // Convert Set to Array, sort alphabetically, and remove duplicates
        const sortedTags = [...tags]
            //.slice(0,18)
            .sort((a, b) => a.localeCompare(b));

        // Update tag search results
        this.createTagSearchResults(this.tagBox, sortedTags, query);
    }
   // Search for missions by tag
    searchByTag(tag) {
        // Filter missions that include the tag
        const results = this.data.missions
            .filter(mission => mission.tags.includes(tag)) // Find missions with the tag
            .map(mission => mission.id);                  // Extract their IDs

        this.missionId = results;
        this.missionMenu = new MissionSelectorMenu(
            this.missionId,
            tag,
            this.searchPage,
            this.selectedFilters,
            this.urlsIslandTag
        );
    }
}
