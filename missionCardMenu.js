export class MissionSelectorMenu {
    constructor(missionsIdArray, title, parentElement, selectedFilters) {
        this.missionsIdArray = missionsIdArray;
        this.title = title; 
        this.selectedFilters = selectedFilters;
        this.parentElement = parentElement;
        this.data = this.selectedFilters.getData();
        this.initialize();
    }

    initialize() {
        this.createMissionSelectormenu(this.missionsIdArray, this.title);
    }

    getContributionColors() {
        return this.selectedFilters.getContributionColors();
    }

    getEmblemIds() {
        return this.selectedFilters.getEmblemIds();
    }

    setMissionId(missionId) {
        this.selectedFilters.setMissionId(missionId);
    }

    createMissionSelectormenu(missionsIdArray, title) {
        // Create the mission menu container
        const missionMenuContainer = document.createElement('div');
        Object.assign(missionMenuContainer.style, {
            position: 'fixed',
            bottom: '0', // Position at the bottom of the screen
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            opacity: '1',
            width: '100vw',
            height: '60vh',
            overflow: 'hidden',
            zIndex: '10001', // Ensure it stays above the overlay
        });

        // Create title
        const menuTitle = document.createElement('span');
        Object.assign(menuTitle.style, {
            fontSize: '50px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: 'black',
            marginTop: '3vh',
            marginBottom: '1vh',
            fontFamily: 'Saira Stencil One, Sans-serif',
        });
        menuTitle.textContent = `Missioner i ${title}`;
        missionMenuContainer.appendChild(menuTitle);

        // Create a full-screen overlay that blocks interactions
        const backgroundOverlay = document.createElement('div');
        Object.assign(backgroundOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw', // Cover the entire viewport width
            height: '40vh', // Cover the entire viewport height
            //backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
            zIndex: '10000', // Ensure it's below the menu
            pointerEvents: 'auto', // Allow clicks on the overlay
        });

        // Close the menu when clicking the overlay
        backgroundOverlay.addEventListener('click', () => {
            // Apply the closing animation
            Object.assign(missionMenuContainer.style, {
                animation: 'slideDown 0.5s ease-out forwards', // Play reverse animation
            });
            // Listen for the animation to complete
            missionMenuContainer.addEventListener('animationend', () => {
                missionMenuContainer.style.display = 'none'; // Hide the menu after animation
                backgroundOverlay.style.display = 'none'; // Hide the overlay
            }, { once: true }); // Ensure the event listener is triggered only once
        });

        // Create the close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;'; // "×" symbol
        Object.assign(closeButton.style, {
            position: 'absolute',
            fontWeight: 'lighter',
            top: '10px',
            right: '10px',
            backgroundColor: 'transparent',
            color: 'black',
            border: 'none',
            fontSize: '36px', // Reduce size for better alignment
            zIndex: '10',
            width: '60px',           // Fixed width for the circle
            height: '60px',          // Fixed height for the circle
            //borderRadius: '50%',     // Makes the element a perfect circle
            display: 'flex',         // Flexbox for centering the text
            justifyContent: 'center', // Center the text horizontally
            alignItems: 'center',    // Center the text vertically
            //border: '3px solid #000',
            textAlign: 'center',
            fontFamily: 'Saira Stencil One, Sans-serif',
            lineHeight: '1',         // Normalize line height
            boxSizing: 'border-box', // Include padding and border in 
        });

        // Close the menu when clicking the close button
        closeButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the click from propagating to the overlay

            // Apply the closing animation
            Object.assign(missionMenuContainer.style, {
                animation: 'slideDown 0.5s ease-out forwards', // Play reverse animation
            });
            // Listen for the animation to complete
            missionMenuContainer.addEventListener('animationend', () => {
                missionMenuContainer.style.display = 'none'; // Hide the menu after animation
                backgroundOverlay.style.display = 'none'; // Hide the overlay
            }, { once: true }); // Ensure the event listener is triggered only once
        });


        // Append the overlay and close button to the document body
        document.body.appendChild(backgroundOverlay);
        missionMenuContainer.appendChild(closeButton);

        
        // Create a slider container
        const sliderContainer = document.createElement('div');
        Object.assign(sliderContainer.style, {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            width: '1258px',
            height: '100%',
            scrollBehavior: 'smooth',
            marginBottom: '1vh',
            boxSizing: 'border-box', // Ensure consistent sizing
            msOverflowStyle: 'none',  /* IE and Edge */
            scrollbarWidth: 'none',     /* Firefox */
        });
    
        // Loop through the missions and create mission cards
        missionsIdArray.forEach((missionId) => {
            const missionCard = document.createElement('div');
            Object.assign(missionCard.style, {
                flex: '0 0 auto',
                scrollSnapAlign: 'start',
                backgroundColor: '#e6e6e6',
                margin: '10px', // Space between cards
                width: '300px', // Fixed width for consistent rendering
                height: 'calc(100% - 20px)', // Adjust height based on parent and spacing
                textAlign: 'center',
                display: 'flex', // Flexbox for child alignment
                flexDirection: 'column', // Stack child elements
                //justifyContent: 'space-between',
                boxSizing: 'border-box', // Include padding and border in the size
            });

            // Add custom content to the mission card
            this.createMissionCard(missionCard, missionId);

            // Add mission-specific content dynamically (optional)
            const missionContent = document.createElement('div');
            missionContent.style.marginTop = '10px'; // Adjust margin for spacing
            missionCard.appendChild(missionContent);

            // Append mission card to the slider container
            sliderContainer.appendChild(missionCard);
        });
        
    
        // Add progress text below the slider
        const progressText = document.createElement('span');
        Object.assign(progressText.style, {
            fontSize: '20px',
            fontFamily: 'Saira Stencil One, Sans-serif',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: 'black',
            marginBottom: '3vh',
        });
        
    
        // Conditional CSS: Adjust snapping and justifyContent
        if (missionsIdArray.length < 5) {
            sliderContainer.style.justifyContent = 'center'; // Center cards
            sliderContainer.style.scrollSnapType = 'none';  // Disable snapping
        } else {
            sliderContainer.style.justifyContent = 'start'; // Align cards to the left
            sliderContainer.style.scrollSnapType = 'x mandatory'; // Enable snapping
        }
    
        // Update progress dynamically
        const updateProgress = () => {
            const cardWidth = 310; // Width of each card including margin
            const visibleCards = Math.min(
                Math.ceil(sliderContainer.scrollLeft / cardWidth), // Count based on scroll position
                missionsIdArray.length // Ensure it doesn't exceed total cards
            );
            if (missionsIdArray.length === 1) {
                progressText.textContent = `VISER ${missionsIdArray.length} MISSION `;
            } else if (missionsIdArray.length < 5) {
                progressText.textContent = `VISER ${missionsIdArray.length} MISSIONER`;
            } else {
                progressText.textContent = `VISER ${visibleCards + 3} UD AF ${missionsIdArray.length}`;
                prevButton.style.display = 'block';
                nextButton.style.display = 'block';
            }
        };
        
        const navigationcontainer = document.createElement('div');
        Object.assign(navigationcontainer.style, {
            display: 'flex',         // Flexbox for centering the text
            justifyContent: 'center', // Center the text horizontally
            alignItems: 'center',    //
            width: '100%',
            height: '100%',
            gap: '20px'
        });
        // Navigation Buttons
        const prevButton = document.createElement('button');
        const nextButton = document.createElement('button');
        
        // Style the navigation button
        Object.assign(prevButton.style, {
            width: '40px',
            height: '55px',
            backgroundColor: 'transparent', // Transparent base
            border: 'none',
            display: 'none',                // Center arrow elements
        });

        // Add the arrow shape using two divs
        const leftBoxPrev = document.createElement('div');
        Object.assign(leftBoxPrev.style, {
            width: '30px',
            height: '7px',
            backgroundColor: 'black',       // Fill color
            transform: 'rotate(-45deg)', // Position as left side of arrow
            borderRadius: '5px',            // Optional rounding
            display: 'inherit',
        });

        const rightBoxPrev = document.createElement('div');
        Object.assign(rightBoxPrev.style, {
            width: '30px',
            height: '7px',
            backgroundColor: 'black',       // Fill color
            transform: 'rotate(45deg) translate(7px, 7px)',  // Position as right side of arrow
            borderRadius: '5px',            // Optional rounding
            display: 'inherit',
        });

        // Append arrow parts to the button
        prevButton.appendChild(leftBoxPrev);
        prevButton.appendChild(rightBoxPrev);

        // Style the navigation button
        Object.assign(nextButton.style, {
            width: '40px',
            height: '55px',
            backgroundColor: 'transparent', // Transparent base
            transform: 'rotate(180deg)',
            border: 'none',
            display: 'none',                // Center arrow elements
        });
        // Add the arrow shape using two divs
        const leftBoxNext = document.createElement('div');
        Object.assign(leftBoxNext.style, {
            width: '30px',
            height: '7px',
            backgroundColor: 'black',       // Fill color
            transform: 'rotate(-45deg)', // Position as left side of arrow
            borderRadius: '5px',            // Optional rounding
            display: 'inherit',
        });
    
        const rightBoxNext = document.createElement('div');
        Object.assign(rightBoxNext.style, {
            width: '30px',
            height: '7px',
            backgroundColor: 'black',       // Fill color
            transform: 'rotate(45deg) translate(7px, 7px)',  // Position as right side of arrow
            borderRadius: '5px',            // Optional rounding
            display: 'inherit',
        });
    
        // Append arrow parts to the button
        nextButton.appendChild(leftBoxNext);
        nextButton.appendChild(rightBoxNext);

        navigationcontainer.appendChild(prevButton);
        navigationcontainer.appendChild(sliderContainer);
        navigationcontainer.appendChild(nextButton);
        missionMenuContainer.appendChild(navigationcontainer);
        missionMenuContainer.appendChild(progressText);
        // Scroll Behavior for Buttons
        const cardWidth = 320; // Adjust to match card width + margin

        prevButton.addEventListener('click', () => {
            sliderContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });

        nextButton.addEventListener('click', () => {
            sliderContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
        //missionMenuContainer.appendChild(prevButton);
        //missionMenuContainer.appendChild(nextButton);

        // Listen to scroll events
        sliderContainer.addEventListener('scroll', updateProgress);

        // Initialize progress text
        updateProgress();

        // Add the mission menu container to the parent element
        this.parentElement.appendChild(missionMenuContainer);
        
        // Define keyframes dynamically
        const styleSheet = document.styleSheets[0];

        // Add popUp keyframes
        styleSheet.insertRule(`
            @keyframes popUp {
                from {
                    transform: translateY(100%); /* Start off-screen */
                }
                to {
                    transform: translateY(0);   /* End at the final position */
                }
            }
        `, styleSheet.cssRules.length);

        // Add slideDown keyframes
        styleSheet.insertRule(`
            @keyframes slideDown {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
        `, styleSheet.cssRules.length);

        // Apply animation to the missionMenuContainer
        Object.assign(missionMenuContainer.style, {
            animation: 'popUp 0.5s ease-out forwards', // Apply popUp animation
        });
    }

    createMissionCard(missionCard, missionId) {
        const data = this.data;
        const missionInformation = getMissionById(data.missions, missionId);

        function getMissionById(missionsArray, id) {
            if (!Array.isArray(missionsArray)) {
                throw new Error("Invalid missions data: Expected an array.");
            }
        
            const mission = missionsArray.find(mission => mission.id === id);
            if (mission) {
                return mission;
            } else {
                throw new Error(`Mission with id ${id} not found.`);
            }
        }
        
        // Create the mission time container
        const missionTime = document.createElement('div');
        Object.assign(missionTime.style, {
            width: '100%',             // Fully respect parent padding
            height: 'auto',            // Fixed height for clarity
            backgroundColor: '#212521',
            padding: '10px',
            boxSizing: 'border-box',   // Include padding in the dimensions
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            //borderRadius: '5px 5px 0 0',
        });
    
        const menuTitle = document.createElement('span');
        Object.assign(menuTitle.style, {
            fontSize: '26px',
            fontWeight: 'bold',
            color: 'white',
            fontFamily: 'Saira Stencil One, Sans-serif',
            textTransform: 'uppercase',
        });
        let endYear = null
        if (missionInformation.year.to === 0) {
            endYear = 2000;
        } else {
            endYear = missionInformation.year.to;
        }
        const missionDuration = missionInformation.year.from + '-' + endYear; 
        menuTitle.textContent = missionDuration; // Example time range
        missionTime.appendChild(menuTitle);
    
        // Create image container
        const imageContainer = document.createElement('div');
        Object.assign(imageContainer.style, {
            position: 'relative',
            width: '100%',
            //height: '50%',             // Proportionate height
            backgroundColor: '#e6e6e6',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
        });
    
        // add image to the container 
        const url = new URL(window.location.href);
        const thumbNailUrl = `${url.protocol}//${url.hostname}/wp-content/uploads/`+missionInformation.content.thumb.url;
        
        // Check if the thumbnail URL exists before creating the image
        if (missionInformation?.content?.thumb?.url) {
            const image = document.createElement('img');
        
            // Apply styles to ensure the image fits the container
            Object.assign(image.style, {
                width: '100%',
                height: '225px', // Maintain aspect ratio
                display: 'block', // Avoid inline spacing issues
                objectFit: 'cover', // Ensure it fits within its container neatly
            });
        
            // Set the image source and append it to the container
            image.src = thumbNailUrl;
            image.alt = 'Mission Thumbnail'; // Always include alt text for accessibility
            imageContainer.appendChild(image);
        } else {
            console.error('Thumbnail URL is missing or invalid.');
        }    
        const forceFlagContainer = document.createElement('div');
        Object.assign(forceFlagContainer.style, {
            position: 'absolute',
            top: '0px',
            width: '100%',
            height: '15px',
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'start',
        });
    
        // Get relevant forces and their associated contribution colors
        const forces = missionInformation.forces; // Array of force IDs like [1087, 1088]
        const contributionColors = this.selectedFilters.getContributionColors();
        //const containerWidth = forceFlagContainer.getBoundingClientRect();
        const width = (300/7)+'px'
        // Iterate over the forces to create flags dynamically
        forces.forEach(forceId => {
            const forceColor = contributionColors[forceId]; // Access backgroundColor and textColor
            
            if (forceColor) { // Check if the force ID exists in contributionColors
                // Create a flag container
                const forceFlag = document.createElement('div');
                Object.assign(forceFlag.style, {
                    backgroundColor: forceColor.backgroundColor,
                    width: width,
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'start',
                    alignItems: 'start',
                });
                // Append the flag to the desired parent container
                forceFlagContainer.appendChild(forceFlag);
            } else {
                console.warn(`No color configuration found for force ID: ${forceId}`);
            }
        });
    
        imageContainer.appendChild(forceFlagContainer);
    
        // Create content container
        const contentContainer = document.createElement('div');
        Object.assign(contentContainer.style, {
            width: '100%',
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'start',
            alignItems: 'start',
            backgroundColor: '#e6e6e6',
            boxSizing: 'border-box',
            padding: '10px',
            position: 'relative',
        });
    
        const title = document.createElement('h3');
        Object.assign(title.style, {
            fontWeight: 'bold',
            fontFamily: 'Saira Stencil One, Sans-serif',
            textTransform: 'uppercase',
            margin: '5px 0',
            overflow: 'hidden',        // Hide overflowing content
            whiteSpace: 'nowrap',      // Prevent text from wrapping
            textOverflow: 'ellipsis',  // Show "..." for truncated text
            fontSize: '18px',          // Default font size
            maxWidth: '100%',          // Ensure the title doesn't grow beyond its container
        });
        
        title.textContent = missionInformation.title;
        contentContainer.appendChild(title);
    
        function reduceFontSizeToFit(element, maxFontSize = 20, minFontSize = 10) {
            let fontSize = maxFontSize;
        
            // Apply initial font size
            element.style.fontSize = fontSize + 'px';
        
            // Check if the text overflows the container
            while (element.scrollWidth > element.offsetWidth && fontSize > minFontSize) {
                fontSize -= 1; // Reduce font size
                element.style.fontSize = fontSize + 'px';
            }
        }
        
        const subtitle = document.createElement('p');
        Object.assign(subtitle.style, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            margin: '5px 0',
            overflow: 'hidden',        // Hide overflowing content
            whiteSpace: 'nowrap',      // Prevent text from wrapping
            textOverflow: 'ellipsis',  // Show "..." for truncated text
            fontSize: '18px',          // Default font size
            maxWidth: '100%',          // Ensure the title doesn't grow beyond its container
        });
        subtitle.textContent = missionInformation.subtitle;
        contentContainer.appendChild(subtitle);
    
        const emblemContainer = document.createElement('div');
        Object.assign(emblemContainer.style, {
            display: 'flex',
            gap: '5px',
            width: '100%',
            justifyContent: 'flex-start',
            alignItems: 'start',
            margin: '10px 0',
        });
    
        // Call the function for the title element
        reduceFontSizeToFit(title, 18, 12);
    
        // Get mission information
        const missionImageArray = missionInformation.content.gallery.images;
        const emblemIds = this.selectedFilters.getEmblemIds();
        const missionEmblems = [];
        // Process the images
        missionImageArray.forEach((image, index) => {
            if (typeof image.url !== 'string') {
                console.warn('Invalid image format:', image);
                return; // Skip invalid images
            }
    
            const imageId = parseInt(image.url.split('/').slice(-2, -1)[0], 10); // Extract ID from the URL
            
            if (emblemIds.includes(imageId)) {
                missionEmblems.push(image); // Add emblems to missionEmblems array
                const emblem = document.createElement('img');
                Object.assign(emblem.style, {
                    width: 'auto',
                    height: '30px',
                });
                emblem.src = `${url.protocol}//${url.hostname}/wp-content/uploads/`+image.url;;
                emblemContainer.appendChild(emblem);
            }
        });
        contentContainer.appendChild(emblemContainer);
    
        const missionButton = document.createElement('button');
        Object.assign(missionButton.style, {
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: '#212521',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
        });
        missionButton.addEventListener('click', () => {
            this.selectedFilters.setMissionId(missionId);
            
            //const data = selectedFilters.getData();
            const missionInformation = getMissionById(this.data.missions, missionId);

            // Validate and convert the mission ID to ensure it's stored as a number
            const convertedMissionId = typeof missionId === 'string' ? Number(missionId) : missionId;
            if (isNaN(convertedMissionId)) {
                console.error('Invalid mission ID: Cannot store in localStorage');
                return; // Exit if the ID is not a valid number
            }
        
            // Store the converted mission ID in localStorage
            localStorage.setItem('currentMissionId', convertedMissionId);
        
            if (localStorage.getItem('currentMissionId')) {        
                // Redirect to the new page
                const url = new URL(window.location.href);
                const newPagePath = `${url.protocol}//${url.hostname}/missionstest-1/`;
                window.location.href = newPagePath; // Replace with the actual target URL
            } else {
                console.error('Mission ID did not get stored in localStorage');
            }
        });
        
        missionButton.textContent = 'GÅ TIL'; //TODO change from hard coded when adding english support
        contentContainer.appendChild(missionButton);
    
        missionCard.appendChild(missionTime);
        missionCard.appendChild(imageContainer);
        missionCard.appendChild(contentContainer);
    }
}