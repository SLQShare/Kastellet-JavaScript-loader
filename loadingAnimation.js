export class LoadingAnimation {
    constructor() {
        this.element = null; // Store the loading element reference
        this.blacklistedSites()
    }

    blacklistedSites() {
        const url = new URL(window.location.href);
        const normalizedPath = url.pathname.toLowerCase();
        const noLoadAniSitesArray = ['videomap', 'equipment', 'organizations', 'uniforms'];

        // Check if the normalizedPath includes any of the blacklisted sites
        const isBlacklisted = noLoadAniSitesArray.some((site) => normalizedPath.includes(site));

        if (isBlacklisted) {
            this.element = remove; // Prevent the loading animation from being created
            this.element = null; // Prevent the loading animation from being created
            console.log(`Loading animation is disabled for: ${normalizedPath}`);
        } else {
            // creates the element if it is on a whitelisted site
            const removeElement = document.getElementById('loaderRemoveOnLoad')
            if(removeElement)removeElement.remove();
            this.createLoadingElement();
        }
    }
    

    // Create the loading element and append it to the body
    createLoadingElement() {
        const animationElement = document.createElement('div');
        Object.assign(animationElement.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: '#363636',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000',
        });

        // Create a spinner for the loading animation
        const spinner = document.createElement('div');
        Object.assign(spinner.style, {
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255, 255, 255, 0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
        });

        animationElement.appendChild(spinner);
        document.body.appendChild(animationElement);
        this.element = animationElement;

        // Add CSS for the spinner animation
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Remove the loading screen with a fade-out effect
    removeLoaderContainer() {
        if (!this.element) return;

        const loaderElement = this.element;
        this.element = null;
        if (loaderElement) {
            loaderElement.style.transition = 'opacity 1s ease';
            loaderElement.style.opacity = '0';

            // Remove the element after the transition
            setTimeout(() => {
                if (loaderElement.parentElement)
                loaderElement.remove();
            }, 1000); // Match the duration of the transition
        }
    }
}