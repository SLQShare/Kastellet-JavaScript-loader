export class IdleScreen {
    constructor() {
        this.time = 0;
        this.idleTimeLimit = 180000; // Example: 30 seconds of inactivity
        this.timer = null; // For managing the idle timer
        this.idleContainer = null;
        this.addEvent();
        this.startIdleTimer();
        this.data = null;
        this.images = null;
    }

    setData(data){
        this.data = data;
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
        this.assignImages();
        this.createIdleElements();
    }

    // createIdleElements() {
    //     const idleContainer = document.createElement('div');
    //     Object.assign(idleContainer.style, {
    //         position: 'fixed',
    //         top: '0',
    //         left: '0',
    //         width: '100%',
    //         height: '100%',
    //         backgroundColor: '#363636',
    //         display: 'flex',
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //         zIndex: '1000',
    //         opacity: '0', // Start with zero opacity for fade-in effect
    //         transition: 'opacity 1s ease', // Add a transition for opacity
    //     });
    //     // this element will contain image so add auto slide
    
        
    
    //     // Trigger fade-in animation
    //     setTimeout(() => {
    //         idleContainer.style.opacity = '1'; // Fade in to full visibility
    //     }, 10); // Small timeout to ensure transition is applied
    //     document.body.appendChild(idleContainer);
    //     this.idleContainer = idleContainer;
    // }

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
            transition: 'opacity 1s ease', // Add a transition for opacity
        });
    
        // Create the initial image element
        const imageElement = document.createElement('img');
        Object.assign(imageElement.style, {
            position: 'absolute',
            width: '100%',
            height: '100%',
        });
    
        idleContainer.appendChild(imageElement);
        document.body.appendChild(idleContainer);
    
        // Trigger fade-in animation
        setTimeout(() => {
            idleContainer.style.opacity = '1'; // Fade in to full visibility
        }, 10); // Small timeout to ensure transition is applied
    
        this.idleContainer = idleContainer;
    
        // Initialize slideshow if images are provided
        if (this.images && this.images.length > 0) {
            let currentIndex = 0;
    
            const changeImage = () => {
                imageElement.src = this.images[currentIndex]; // Update the image source
                currentIndex = (currentIndex + 1) % this.images.length; // Cycle through images
            };
    
            // Start the slideshow
            changeImage(); // Show the first image immediately
            this.slideshowInterval = setInterval(changeImage, 5000); // Adjust interval as needed
        }
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
    
    assignImages(){
        const url = new URL(window.location.href);
        const normalizedPath = url.pathname.toLowerCase();

        //const siteImages = this.data.idleScreen.idle_images[normalizedPath]?.images || [];
        const siteImages = ['https://kastellet.gbplayground.dk/wp-content/uploads/media/1685/oestlige-middelhav.jpg?anchor=center&mode=crop&width=800&height=600&rnd=132481081580000000', 'https://kastellet.gbplayground.dk/wp-content/uploads/media/1388/absalon-i-adenbugten-2009-076.jpg?anchor=center&mode=crop&width=800&height=600&rnd=132483992300000000'];

        this.images = siteImages;
    }
}