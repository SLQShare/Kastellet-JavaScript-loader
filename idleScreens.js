export class IdleScreen {
    constructor(imageOrientation, data) {
        this.time = 0;
        this.idleTimeLimit = 30000; //ms Example:300000 = 30 seconds of inactivity, 1 sec = 1000
        this.timer = null; // For managing the idle timer
        this.idleContainer = null;
        this.data = data;
        this.images = []; // must be URLs
        this.imageOrientation = imageOrientation //vertikal or horisontal
        this.key;
        this.location = location;
        this.init(this.imageOrientation, this.data);
    }

    init(imageOrientation, data){
        this.addEvent();
        this.startIdleTimer();
        this.assignImages(imageOrientation, data);
    }


    addEvent() {
        // Bind `this.resetTimer` to maintain context in event listeners
        const boundResetTimer = this.resetTimer.bind(this);

        // Reset timer on page load
        window.addEventListener('load', boundResetTimer, true);

        // Add event listeners for user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach((name) => {
            document.addEventListener(name, boundResetTimer, true);
        });
    }

    resetTimer() {
        this.time = 0;
        console.log('Timer reset', this.time);
        if (this.idleContainer) this.removeIdleContainer();

        // Restart the idle timer
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.startIdleTimer();
    }

    startIdleTimer() {
        // Trigger idle state after the specified time limit
        this.timer = setTimeout(() => {
            this.idleTrigger();
        }, this.idleTimeLimit);
    }

    idleTrigger() {
        console.log('User is idle');
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
            zIndex: '1000',
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
        setInterval(showNextImage, 4000); // Change image every 4 seconds
    }
    
    // removes the idle element container
    removeIdleContainer() {
        const container = this.idleContainer;
        if (container) {
            container.style.transition = 'opacity 1s ease';
            container.style.opacity = '0';
    
            // Remove the element after the transition
            setTimeout(() => {
                if (container.parentElement) container.remove();
            }, 1000); // Match the duration of the transition
        }
    }  
    
    assignImages(imageOrientation, data){
        const url = new URL(window.location.href);
        //url.origin
        const siteImages = [];
        
        
        console.log('data.idlescreenImages', data.idlescreenImages)
        console.log('siteImages', siteImages);
        
        // Default images (fallback)
        const fallbackImages = [
            'https://kastellet.gbplayground.dk/wp-content/uploads/media/1685/oestlige-middelhav.jpg?anchor=center&mode=crop&width=800&height=600&rnd=132481081580000000',
            'https://kastellet.gbplayground.dk/wp-content/uploads/media/1388/absalon-i-adenbugten-2009-076.jpg?anchor=center&mode=crop&width=800&height=600&rnd=132483992300000000'
        ];

        // Assign generated images (or fallback if empty)
        this.images = siteImages.length > 0 ? siteImages : fallbackImages;
    }
}