export class BackNavigation{
    constructor(filtersObject){
        this.NAVIGATION_STACK_KEY = 'navigationStack'; // Key for localStorage
        this.selectedFilters = filtersObject;
        this.backButton = this.getBackButton()
        this.createNavigationStack(this.NAVIGATION_STACK_KEY )
        this.pushToNavigationStack()
        this.addBackButtonListener();
    }
     // Retrieve the navigation stack from localStorage
     createNavigationStack(key){
        if(!localStorage.getItem(key)){
            localStorage.setItem(key, JSON.stringify([]))
            }
        }
    
    getBackButton() {
        try {
            const backButton = document.getElementById('back-link'); // Get the element by ID
            if (backButton) {
                console.log('backButton', backButton)
                return backButton; // Return the button if it exists
            } else {
                console.warn('Back button element not found.');
                return null; // Return null if not found
            }
        } catch (error) {
            console.error('Error retrieving back button element:', error);
            return null; // Return null in case of an error
        }
    }

    // Add an event listener to the back button
    addBackButtonListener() {
        if (this.backButton) {
            this.backButton.addEventListener('click', (event) => {
                //event.preventDefault(); // Prevent default behavior if necessary
                console.log('Back button clicked!');
                this.handleBackNavigation(); // Call the back navigation handler
            });
        } else {
            console.warn('Back button not available to attach listener.');
        }
    }

   // Handle back navigation logic
    handleBackNavigation() {
        const stack = this.getNavigationStack(); // Retrieve the navigation stack
        const langSetting = this.getLangFromPath(window.location.pathname)
        console.log('handleBackNavigation stack', stack, stack.length);
        if (stack.length > 1) {
            let lastPage = stack[stack.length - 2]; // Get the last navigation entry

            console.log('lang check',langSetting)
            if (lastPage.isEn === langSetting && stack[stack.length - 1].fallback === false) {
                console.log("Last and current page was in", lastPage.isEn);
                debugger;
                history.go(-2);
            } else {
                console.log('fallback',lastPage)
                debugger;
                window.location.href = window.location.origin + lastPage.url;                
            }         
        } else {
            console.log('No previous page in navigation stack.');
            debugger;
            history.go(-2);
        }
    }
    
    getNavigationStack() {
        try {
            const storedStack = localStorage.getItem(this.NAVIGATION_STACK_KEY);
            console.log('storedStack', storedStack);
            return storedStack ? JSON.parse(storedStack) : []; // Parse the JSON or initialize an empty array
        } catch (error) {
            console.error('Error retrieving navigation stack:', error);
            return []; // Return an empty array on error
        }
    }

    // Save the navigation stack to localStorage
    saveNavigationStack(stack) {
        try {
            localStorage.setItem(this.NAVIGATION_STACK_KEY, JSON.stringify(stack));
            console.log('Saved navigation stack:', stack);
        } catch (error) {
            console.error('Error saving navigation stack:', error);
        }
    }

    // Push the current page to the navigation stack
    pushToNavigationStack() {
        let stack = this.getNavigationStack(); // Get the current stack
    
        // Ensure at least one entry is stored
        if (stack.length === 0) {
            stack = [];
        }
    
        // Get all selected filters
        const filterStates = this.selectedFilters.getAllFilters();
    
        // Construct the new state object
        const state = {
            isEn: this.getLangFromPath(window.location.pathname),
            url: window.location.pathname,
            fallback: false
        };
    
        const lastEntry = stack.length > 0 ? stack[stack.length - 1] : null;

        if (lastEntry && lastEntry.isEn != state.isEn){
            stack.forEach(element => {
                element.isEn = state.isEn;
                element.fallback = true;
                if (state.isEn === 'en') {
                    // Ensure `/en` is added correctly
                    if (!element.url.startsWith('/en')) {
                        element.url = '/en' + element.url.replace(/^\/en/, '');
                    }
                } else {
                    // Ensure `/en` is removed correctly
                    element.url = element.url.replace(/^\/en/, '');
                }
            });
            //state.fallback = true;
        }
        // Prevent duplicate entries (Check full state, not just URL)
        if (lastEntry && JSON.stringify(lastEntry) === JSON.stringify(state)) {
            return;
        }
        
        // Special case: Reset stack if too many entries and user navigates to `/`, `/search/`, `/en/`, or `/en/search/`
        if (stack.length > 30 ) {
            removeFirstHalfInPlace(stack);
            stack.push(state);
        } else {
            stack.push(state);
        }
        function removeFirstHalfInPlace(arr) {
            arr.splice(0, Math.ceil(arr.length / 2)); // Remove first half
        }
        
        // Save the updated navigation stack
        localStorage.setItem(this.NAVIGATION_STACK_KEY, JSON.stringify(stack));
        this.saveNavigationStack(stack);
    
        // Push new state to history only if language hasn't changed
        history.pushState(state, "", window.location.pathname);
    
        console.log("Updated navigationStack:", stack);
    }
    
    getLangFromPath = (path) => path.includes('/en') ? 'en' : 'dk';
}

