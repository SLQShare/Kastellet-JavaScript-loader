export class IdleScreen {
    constructor(data) {
        this.time = 0;
        this.idleTimeLimit = 180000; //ms Example:300000 = 30 seconds of inactivity, 1 sec = 1000 
        this.imageInterval = 8000;
        this.timer = null; // For managing the idle timer
        this.idleContainer = null;
        this.data = data;
        this.images = []; // must be URLs
        this.video = null
        this.key;
        this.location = null;
        this.isVideoPlaying = false;
        this.observer = null;
        this.closeButton = null;
        this.clickControl = false;
        this.init(this.data);
    }

    init(data){
        this.assignLocation();
        this.addEvent();
        this.startIdleTimer();
        this.assignImages(data);
    }

    assignLocation() {
        // Check if 'idleHomepage' is already set in sessionStorage
        let savedHomepage = sessionStorage.getItem("idleHomepage");
    
        if (!savedHomepage) { 
            const url = new URL(window.location.href);
            this.location = url.origin + url.pathname; // Store the current page as homepage
            sessionStorage.setItem("idleHomepage", this.location); // Save in sessionStorage
        } else {
            this.location = savedHomepage; // Retrieve the saved homepage
        }
    }
    
    addEvent() {
        // Bind `this.resetTimer` to maintain context in event listeners
        const boundResetTimer = this.resetTimer.bind(this);
    
        // Reset timer on page load
        //window.addEventListener('load', boundResetTimer, true);
    
        document.addEventListener('touchstart', boundResetTimer, true);
        document.addEventListener('touchmove', boundResetTimer, true);
        document.addEventListener('touchend', boundResetTimer, true);
        if (this.isOnMissionsPage('videomap')){
            this.startObserving();
        }
    }

    startObserving() {
        // Target elements where videos might appear
        const targetNode = document.body;

        if (!targetNode) return;

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === "VIDEO") {
                        this.attachVideoListeners(node);
                        this.elementEdits(node)
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll("video").forEach(this.attachVideoListeners.bind(this));
                        this.elementEdits(node)
                    }
                });
            });
        });

        this.observer.observe(targetNode, { childList: true, subtree: true });
    }
    elementEdits(videoElement){
        const closeButtonArray = document.getElementsByClassName('dialog-close-button dialog-lightbox-close-button');
        if (closeButtonArray.length > 1){
            const buttonButtonSwiper = closeButtonArray[0]; // Source button
            const closeButton = closeButtonArray[1]; // Target button
        
            if (buttonButtonSwiper && closeButton) {
                // Copy size from the source button
                closeButton.style.width = `2.6vw`;
                closeButton.style.height = `4.6vh`;
                closeButton.style.top = `94%`;
                
                // Adjust font size, padding, margins, and other styles
                closeButton.querySelectorAll("*").forEach(child => {
                    child.style.width = `2.6vw`;
                    child.style.height = `4.6vh`;
                });
                if (closeButton) this.closeButton = closeButton;
            } else {
                console.warn("One or both elements not found.");
            }

        }
    }

    attachVideoListeners(video) {
        if (!video.dataset.listenerAdded) { 
            video.dataset.listenerAdded = "true";

            if (!video.paused) {
                this.isVideoPlaying = true;
            }

            video.addEventListener("playing", () => {
                this.isVideoPlaying = true;
            });

            video.addEventListener("pause", () => {
                this.isVideoPlaying = false;
            });

            video.addEventListener("ended", () => {
                this.resetTimer();
                this.isVideoPlaying = false;
                this.closeButton.click();
            });
        }
    }

    // Checks if the current page matches the specified site name
    isOnMissionsPage(siteName) {
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

    resetTimer() {
        this.time = 0;
        console.log('Timer reset', (this.idleTimeLimit/1000)/60, 'min');
        if (this.idleContainer && !this.clickControl){
            this.clickControl = true;
            this.removeIdleContainer();
            this.createLoadingElement();
            window.location.replace(this.location);

        } 
        
        this.startIdleTimer();
    }

    startIdleTimer() {
        console.log('Timer started', (this.idleTimeLimit/1000)/60, 'min');
        // Trigger idle state after the specified time limit
        this.timer = setTimeout(() => {
            if (this.isVideoPlaying === true){
                this.resetTimer();
            } else if (this.isVideoPlaying === false){
                this.idleTrigger();
            }
        }, this.idleTimeLimit);
    }

    idleTrigger() {
        this.createIdleElements();
    }

    createIdleElements() {
        const idleContainer = document.createElement('div');
        Object.assign(idleContainer.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: '#363636',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '100000',
            opacity: '0', // Start with zero opacity for fade-in effect
            transition: 'opacity 2.5s ease', // Add a transition for opacity
            overflow: 'hidden',
        });
    
        let currentIndex = 0;
        const imageElements = [];
    
        this.images.forEach((img, index) => {
            const imageElement = document.createElement('img');
            Object.assign(imageElement.style, {
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: index === 0 ? '1' : '0', // Show first image only
                transition: 'opacity 1s ease',
            });
            imageElement.src = img;
            idleContainer.appendChild(imageElement);
            imageElements.push(imageElement);
        });
    
        document.body.appendChild(idleContainer);
        
        // Trigger fade-in animation
        setTimeout(() => {
            idleContainer.style.opacity = '1'; // Fade in to full visibility
        }, 10); // Small timeout to ensure transition is applied
    
        this.idleContainer = idleContainer;
    
        // Function to fade between images
        function showNextImage() {
            imageElements[currentIndex].style.opacity = '0'; // Hide current
            currentIndex = (currentIndex + 1) % imageElements.length; // Move to next
            imageElements[currentIndex].style.opacity = '1'; // Show next
        }
    
        // Start automatic slideshow
        setInterval(showNextImage, this.imageInterval); // Change image every 8 seconds
    }
    
    // removes the idle element container
    removeIdleContainer() {
        const container = this.idleContainer;
        if (container) {
            container.style.transition = 'opacity 2s ease';
            container.style.opacity = '0';
    
            // Remove the element after the transition
            setTimeout(() => {
                if (container.parentElement) container.remove();
            }, 2000); // Match the duration of the transition
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
    
    assignImages(data){
        const aspectRatio = window.innerWidth / window.innerHeight;
        const siteImages = aspectRatio > 1 
            ? Object.values(data.Screensavers.Horizontal.images)
            : Object.values(data.Screensavers.Vertical.images);

        // Default images (fallback)
        const fallbackImages = [
            'https://kastellet.gbplayground.dk/wp-content/uploads/media/1685/oestlige-middelhav.jpg?anchor=center&mode=crop&width=800&height=600&rnd=132481081580000000',
            'https://kastellet.gbplayground.dk/wp-content/uploads/media/1388/absalon-i-adenbugten-2009-076.jpg?anchor=center&mode=crop&width=800&height=600&rnd=132483992300000000'
        ];

        // Assign generated images (or fallback if empty)
        this.images = siteImages.length > 0 ? siteImages : fallbackImages;
    }
}