import { MissionSelectorMenu } from './missionCardMenu.js'

export class SearchPage {
    constructor(data, selectedFilters) {
        this.searchPageContainer = null;
        this.searchActionContainer = null;
        this.searchBar = null;
        this.tagBox = null;
        this.keyboard = null;
        this.SearhResultOfTags = null;
        this.data = data;
        this.missionMenu = null;
        this.missionId = null;
        this.selectedFilters = selectedFilters;
        this.searchPage = null;
        this.init();
    }

    // Initialize the search page components
    init() {
        this.styleContainer();
        this.createSearchActionContainer();
        this.createSearchBar();
        this.createTagBox();
        this.createTouchKeyboard();
    }
    styleContainer() {
        const page = document.getElementById('searchScreen'); // Main container for search page
        const container = document.createElement('div');
        Object.assign(container.style, {
            display: 'flex',
            position: 'fixed',
            flexDirection: 'row',
            height: '60%',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'self-end',
        });
        page.appendChild(container);
        this.searchPage = page;
        this.searchPageContainer = container;
    }
    createSearchActionContainer() {
        const container = document.createElement('div');
        Object.assign(container.style, {
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            justifyContent: 'center', // Centers items along the main axis
            alignItems: 'center',    // Centers items along the cross-axis
            width: '50%',
        });
        
        this.searchActionContainer = container;
        this.searchPageContainer.appendChild(this.searchActionContainer);
    }
    // Create the search bar
    createSearchBar() {
        const searchBarContainer = document.createElement('div');
        Object.assign(searchBarContainer.style, {
            width: '80%',
            height: '60px',
            marginBottom: '40px',
        });
        const searchBar = document.createElement('input');
        Object.assign(searchBar.style, {
            width: '100%',
            height: '100%',
            padding: '10px',
            fontSize: '22px',
            fontFamily: 'Saira Stencil One, Sans-serif',
            fontWeight: 'bold',
            boxSizing: 'border-box',
            //textTransform: 'lowercase', 
        });
        searchBar.type = 'text';
        searchBar.placeholder = 'Søg efter missioner...'; //TODO fix for english
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
            right: '-93%',
            transform: 'translateY(-125%)',
            width: '40px',
            height: '40px',
            background: '#ff5c5c',
            border: 'none',
            borderRadius: '50%',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'none', // Initially hidden
        });
        clearButton.textContent = '×'; // Cross symbol
        clearButton.addEventListener('click', () => {
            searchBar.value = '';
            clearButton.style.display = 'none';
            this.updateSearchResults(''); // Clear search results
        });

        searchBarContainer.appendChild(searchBar);
        searchBarContainer.appendChild(clearButton);
        this.searchActionContainer.appendChild(searchBarContainer);
    }
    static applyTagStyles(element, colSpan = 1) {
        Object.assign(element.style, {
            padding: '12px',
            backgroundColor: '#f4f4f4',
            color: '#020202',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '22px',
            fontFamily: 'Saira Stencil One, Sans-serif',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',        // Prevent wrapping
            height: '50px',             // Fixed row height
            textAlign: 'center',
            display: 'flex',             // Use Flexbox for centering
            alignItems: 'center',
            justifyContent: 'center',
            gridColumn: `span ${colSpan}`, // Dynamic column span
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
        const tagBoxContainer = document.createElement('div');
        Object.assign(tagBoxContainer.style, {
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            justifyContent: 'start', // Centers items along the main axis
            alignItems: 'start',    // Centers items along the cross-axis
            width: '45%',
            height: '290px'
        });
        Object.assign(tagBox.style, {
            width: '100%',
            display: 'grid',                 // Switch to grid layout
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', // Flexible columns
            gridAutoFlow: 'row dense',       // Fill rows in a dense manner
            gap: '10px',                     // Space between items
            overflow: 'hidden',
            alignContent: 'start',             // Align items to the bottom of the container
        });
        
        const tags = this.SearhResultOfTags;
    
        if (!tags) {
            const links = this.data.collections.map(item => item.title);
            links.forEach(link => {
                const tagElement = this.createTagElement(link, this.searchByTag.bind(this));
                tagBox.appendChild(tagElement);
            });
        } else {
            tags.forEach(tag => {
                const tagElement = this.createTagElement(tag, this.searchByTag.bind(this));
                tagBox.appendChild(tagElement);
            });
        }
        tagBoxContainer.appendChild(tagBox);
        this.searchPageContainer.appendChild(tagBoxContainer);
        this.tagBox = tagBox;
    }
    

    // Create the touch-based keyboard with Danish layout
    createTouchKeyboard() {
        const keyboardContainer = document.createElement('div');
        Object.assign(keyboardContainer.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(11, 1fr)', // 12 columns for the grid
            gap: '10px',
            width: '80%',
            //margin: '20px auto',
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
                    height: '40px',
                    backgroundColor: key === 'DELETE' ? '#ff5c5c' : key === 'SPACE' ? '#ffffff' : '#ffffff',
                    color: '#212521',
                    border: '3px solid #212521',
                    borderRadius: '10px',
                    fontSize: '22px',
                    fontFamily: 'Saira Stencil One, Sans-serif',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gridColumn: key === 'SPACE' ? 'span 2' : 'span 1', // Span multiple columns
                });

                keyButton.textContent = (key === 'SPACE' || key === 'DELETE') ? '' : key;
                if (key === 'DELETE') {
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

    createTagSearchResults(tagBox, tags, query) {
        // Clear existing children in the tagBox
        while (tagBox.firstChild) {
            tagBox.removeChild(tagBox.firstChild);
        }
    
        // Handle different cases
        if ((!tags || tags.length === 0) && query === '') {
            const links = this.data.collections.map(item => item.title); //TODO update to contain the webadress
            links.forEach(link => {
                const tagElement = this.createTagElement(link, this.searchByTag.bind(this));
                tagBox.appendChild(tagElement);
            });
        } else if ((!tags || tags.length === 0) && query.length > 0) {
            const errorElement = this.createTagElement('Intet resultat', null); // TODO fix for english
            errorElement.style.backgroundColor = '#ff5c5c';
            tagBox.appendChild(errorElement);
        } else {
            tags.forEach(tag => {
                const tagElement = this.createTagElement(tag, this.searchByTag.bind(this));
                tagBox.appendChild(tagElement);
            });
        }
    }
    
    // Update search results based on input
    updateSearchResults(query) {
        console.log('Searching for:', query, query.length);
    
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
            .slice(0,18)
            .sort((a, b) => a.localeCompare(b));

        // Update tag search results
        this.createTagSearchResults(this.tagBox, sortedTags, query);
    }
   // Search for missions by tag
    searchByTag(tag) {
        console.log('Searching by tag:', tag);

        // Filter missions that include the tag
        const results = this.data.missions
            .filter(mission => mission.tags.includes(tag)) // Find missions with the tag
            .map(mission => mission.id);                  // Extract their IDs

        console.log('Relevant mission IDs from tag:', results);
        this.missionId = results;
        this.missionMenu = new MissionSelectorMenu( //TODO rewrite the class so I can update information instead of Repeated Instantiation of MissionSelectorMenu
            this.missionId,
            tag,
            this.searchPage,
            this.selectedFilters
        );
    }
}
