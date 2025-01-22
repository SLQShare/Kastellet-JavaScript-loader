export class BackNavigation{
    constructor(filtersObject){
        this.NAVIGATION_STACK_KEY = 'navigationStack'; // Key for localStorage
        this.activeFilters = filtersObject;
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
        if (stack.length > 1) {
            let lastPage = null;

            // Helper function to detect language from a path
            const getLangFromPath = (path) => path.includes('/en') ? 'en' : 'dk';

            // Determine the language state of the last page
            const langState = getLangFromPath(stack[stack.length - 1]) === 'en';

            // Normalize the stack URLs based on the detected language state
            const normalizedStack = stack.map((element) => {
                if (langState) {
                    // Add `/en` to Danish URLs
                    return element.includes('/en') ? element : element.replace('.dk/', '.dk/en/');
                } else {
                    // Remove `/en` from English URLs
                    return element.replace('/en', '');
                }
            });

            // Iterate through the normalized stack from the end
            for (let i = normalizedStack.length - 1; i > 0; i--) {
                if (normalizedStack[i] !== normalizedStack[i - 1]) {
                    lastPage = normalizedStack[i - 1]; // Find the first non-matching page
                    break; // Exit the loop once found
                }
            }

            if (lastPage) {
                console.log('Navigating to:', lastPage);
                // Remove all pages from the stack up to the lastPage
                const updatedStack = normalizedStack.slice(0, normalizedStack.indexOf(lastPage) + 1);
                this.saveNavigationStack(updatedStack); // Save the updated stack
                window.location.href = lastPage; // Navigate to the last page
            } else {
                console.log('No non-matching previous page found.');
            }
        } else {
            console.log('No previous page in navigation stack.');
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
            // Trim the 5 oldest elements if the array is too long
            if (stack.length > 20) {
                stack = stack.slice(-15); // Keep only the latest 15 items
            }
            localStorage.setItem(this.NAVIGATION_STACK_KEY, JSON.stringify(stack));
            console.log('Saved navigation stack:', stack);
        } catch (error) {
            console.error('Error saving navigation stack:', error);
        }
    }

    // Push the current page to the navigation stack
    pushToNavigationStack() {
        const stack = this.getNavigationStack(); // Get the current stack
        stack.push(window.location.href); // Add the current page
        this.saveNavigationStack(stack); // Save it back to localStorage
        console.log('Updated navigationStack:', stack);
    }
}

