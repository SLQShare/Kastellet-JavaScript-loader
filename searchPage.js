export class SearchPage {
    constructor(data) {
        this.data = data;
        this.searchPageContainer = null;
        this.searchActionContainer = null;
        this.searchBar = null;
        this.tagBox = null;
        this.keyboard = null;

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
            justifyContent: 'space-evenly',
            alignItems: 'self-end',
        });
        page.appendChild(container);
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
        // Apply styles with dynamic column span
        SearchPage.applyTagStyles(tagElement, colSpan);
    createTagBox() {
        const tagBox = document.createElement('div');
        Object.assign(tagBox.style, {
            width: '40%',
            height: '70%',
            display: 'flex',
            flexDirection: 'row', // Makes items stack from the bottom
            flexWrap: 'wrap',               // Allows wrapping
            gap: '10px',
            marginTop: '20px',
            overflow: 'auto',
        });
        

        // Generate tags from the data
        const tags = this.getUniqueTags();
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            Object.assign(tagElement.style, {
                padding: '8px 12px',
                backgroundColor: '#518346',
                color: '#ffffff',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
            });
            tagElement.textContent = tag;
            tagElement.addEventListener('click', () => this.searchByTag(tag));
            tagBox.appendChild(tagElement);
        });

        this.searchPageContainer.appendChild(tagBox);
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
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å'], // Row 1
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Æ', 'Ø'], // Row 2
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'SPACE', 'DELETE'] // Row 3
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
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gridColumn: key === 'DELETE' ? 'span 2' : key === 'SPACE' ? 'span 2' : 'span 1', // Span multiple columns
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


    // Update search results based on input
    updateSearchResults(query) {
        console.log('Searching for:', query);
        return;
        const results = this.data.missions.filter(mission =>
            mission.title.toLowerCase().includes(query.toLowerCase())
        );
        console.log('Search Results:', results);
        this.renderSearchResults(results);
    }

    // Render the search results
    renderSearchResults(results) {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = ''; // Clear previous results

        results.forEach(result => {
            const resultElement = document.createElement('div');
            Object.assign(resultElement.style, {
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#e6e6e6',
                borderRadius: '5px',
            });
            resultElement.textContent = result.title;
            resultsContainer.appendChild(resultElement);
        });
    }

    // Search for missions by tag
    searchByTag(tag) {
        console.log('Searching by tag:', tag);
        const results = this.data.missions.filter(mission =>
            mission.tags.includes(tag)
        );
        console.log('Search Results for tag:', results);
        this.renderSearchResults(results);
    }

    // Extract unique tags from the data
    getUniqueTags() {
        const tags = new Set();
        this.data.missions.forEach(mission => {
            mission.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags);
    }
}
