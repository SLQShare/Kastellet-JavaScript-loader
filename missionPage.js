export class MissionPage {
    constructor(data, missionId) {
        this.data = data;
        this.missionId = missionId;
        this.filtersSelected = null;
    }
    headerInformation(data, missionId, cssId, informationType){
        const missionInformation = this.getMissionById(data.missions, missionId);
        const elementArray = this.searchAndFindTextElements(this.findElementById(cssId));
        try {
            elementArray[0].innerHTML = missionInformation[informationType];
        } catch (error) {
            log.error("invalide information passed into headerInformation", error)
        }
    }
    setFilterState(filter){
        this.filtersSelected = filter;
    }
    getFilterState(){
        return this.filtersSelected;
    }
    
    getMissionById(missionsArray, id) {
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

    // finds element by Id
    findElementById(id) {
        return document.getElementById(id);
    }

    // checks HTML element for text
    hasNonEmptyText(element) {
        return element.textContent.trim().length > 0;
    }

    // searches all child elements of element and store all elements containing text 
    searchAndFindTextElements(element){
        if (!element) {
            console.error(element +' not found.');
            return;
        }
        const childElements = Array.from(element.querySelectorAll('*'));

        const filteredArray = childElements.filter(element => 
            element.tagName.toLowerCase() !== 'div' && this.hasNonEmptyText(element)
        );
        return filteredArray
    }
    
    // loop child elements and compare each element to mission forces
    comparesTheForceTagsToMissionForces(data, missionId, cssId){
        const missionInformation = this.getMissionById(data.missions, missionId);
        const elementForcesArray = Array.from(this.findElementById(cssId).querySelectorAll('*'));
        const missionForces = missionInformation.forces;
        
        elementForcesArray.forEach(element => {
            const elementId = parseInt(element.id, 10)
            if (!missionForces.includes(elementId)){
                element.style.display = 'none'
            }
        });
    }
    // concatenate from and to into the year
    assignMissionDuration(data, missionId, cssId){
        const missionInformation = this.getMissionById(data.missions, missionId);
        const missionDuration = this.searchAndFindTextElements(this.findElementById(cssId));
        try {
            missionDuration[0].innerHTML = String(missionInformation.year.from) +'-'+String(missionInformation.year.to);
        } catch (error) {
            console.error(error)
        }
    }
    addTextFromDataToTable(data, missionId) {
        const table = this.findElementById('MissionTabs');
        const missionInformation = this.getMissionById(data.missions, missionId);
    
        // Ensure the mission data is valid
        if (!missionInformation || !missionInformation.content || !missionInformation.content.text) {
            console.error("Invalid mission data or content structure.");
            return;
        }
    
        // Get text elements
        const textElementsByClass = Array.from(document.getElementsByClassName('TabText'));
        // Get text header elements
        const filteredArrayOfElementsH2 = this.searchAndFindTextElements(table).filter(
            element => element instanceof HTMLElement && element.tagName.toLowerCase() === 'h2'
        );
        // Get table buttons
        const filteredArrayOfElementsButton = this.searchAndFindTextElements(table).filter(
            element => element instanceof HTMLElement && element.tagName.toLowerCase() === 'button'
        );
    
        // Filter out "Kilder" and "Link" sections
        const missionDataToBeDisplayed = missionInformation.content.text.filter(
            type => type.id !== "Kilder" && type.id !== "Link"
        ); // TODO fix for english
    
        // Determine the number of sections to process
        const numSections = Math.min(
            missionDataToBeDisplayed.length,
            textElementsByClass.length,
            filteredArrayOfElementsH2.length,
            filteredArrayOfElementsButton.length
        );
    
        // Update table content
        missionDataToBeDisplayed.forEach((entry, index) => {
            if (index < numSections) {
                // Update text content
                if (entry.text && textElementsByClass[index]) {
                    textElementsByClass[index].innerHTML = entry.text;
                }
    
                // Update headers
                if (entry.heading && filteredArrayOfElementsH2[index]) {
                    filteredArrayOfElementsH2[index].textContent = entry.heading;
                }
    
                // Update buttons
                if (entry.heading && filteredArrayOfElementsButton[index]) {
                    filteredArrayOfElementsButton[index].textContent = entry.heading;
                    Object.assign(filteredArrayOfElementsButton[index].style, {
                        fontFamily: 'Poppins, Sans-serif',
                        textTransform: 'uppercase',
                        fontWeight: '300',
                        letterSpacing: '1px',
                    });
                    //filteredArrayOfElementsButton[index].style.display = ''; // Ensure visible
                }
            }
        });
    
        // Remove or hide extra elements
        for (let i = numSections; i < textElementsByClass.length; i++) {
            textElementsByClass[i].style.display = 'none'; // Hide extra text
        }
        for (let i = numSections; i < filteredArrayOfElementsH2.length; i++) {
            filteredArrayOfElementsH2[i].style.display = 'none'; // Hide extra headers
        }
        for (let i = numSections; i < filteredArrayOfElementsButton.length; i++) {
            filteredArrayOfElementsButton[i].style.display = 'none'; // Hide extra buttons
        }
    
        console.log(`Table updated for mission ID: ${missionId}`);
    }
    

    missionLocation(data, missionId) {
        let location = null; // Variable to store the location if found
        const locationButton = document.getElementById('MissionLocation');
        const textElement = locationButton.querySelector('.elementor-button-text');
        
        const url = new URL(window.location.href);
    
        // Iterate through each collection in the data
        data.collections.forEach((collection) => {
            // Check if the collection contains the mission with the given missionId
            const foundMission = collection.missions.find(mission => mission === missionId);
            if (foundMission) {
                // If found, assign the location from the collection
                location = collection.title; // Using collection.title as location
            }
        });
    
        if (location) {
            // Clear existing content inside `locationButton` if any
            locationButton.innerHTML = '';
    
            // Create a new <a> element
            const linkElement = document.createElement('a');
            linkElement.className = 'elementor-button elementor-button-link elementor-size-sm';
            linkElement.href = `${url.protocol}//${url.hostname}/${encodeURIComponent(location)}/`;
            linkElement.rel = 'noopener noreferrer'; // Optional: For security
    
            // Add the text inside the <a> element
            const spanWrapper = document.createElement('span');
            spanWrapper.className = 'elementor-button-content-wrapper';
    
            const spanText = document.createElement('span');
            spanText.className = 'elementor-button-text';
            spanText.textContent = location;
    
            // Append text to wrapper, wrapper to <a>, and <a> to button
            spanWrapper.appendChild(spanText);
            linkElement.appendChild(spanWrapper);
            locationButton.appendChild(linkElement);
        } else {
            // If no location is found, hide the button
            locationButton.style.display = 'none';
        }
    }

    parseMediaUrl(data, missionId, IdsForEmblems) {
        try {
            // Construct the base image path dynamically
            const url = new URL(window.location.href);
            const baseImagePath = `${url.protocol}//${url.hostname}/wp-content/uploads/`;
            
            // Get mission information
            const missionInformation = this.getMissionById(data.missions, missionId);
            if (!missionInformation || !missionInformation.content || !missionInformation.content.gallery.images) {
                console.error('Mission information or gallery images not found.');
                return;
            }
    
            const missionImageArray = missionInformation.content.gallery.images;
            const emblemIds = IdsForEmblems;
            console.log('emblemIds', emblemIds)
            const missionEmblems = [];
            const sortedImageContent  = [];
    
            // Process the images
            missionImageArray.forEach((image, index) => {
                if (typeof image.url !== 'string') {
                    console.warn('Invalid image format:', image);
                    return; // Skip invalid images
                }
    
                const imageId = parseInt(image.url.split('/').slice(-2, -1)[0], 10); // Extract ID from the URL
                
                if (emblemIds.includes(imageId)) {
                    missionEmblems.push(image); // Add emblems to missionEmblems array
                } else {
                    sortedImageContent.push(image); // Add other images to sortedImages array
                }
            });
    
            // Pass the sorted images and emblems to their respective functions
            this.updateEmblemSection(missionEmblems, baseImagePath); // Assuming updateEmblemSection is defined elsewhere
            this.createImageslider(sortedImageContent, baseImagePath); // Assuming updateSwiperSlider is defined elsewhere
        } catch (error) {
            console.error('Error in parseMediaUrl:', error);
        }
    }

    updateEmblemSection(newImages, baseImagePath) {
        const container = document.getElementById('MissionForceContainer');
        if (!container) {
            console.error('MissionForceContainer not found.');
            return;
        }
    
        // Remove all existing child elements
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        Object.assign(container.style, {
            maxHeight: '50px',
            overflow: 'auto',
        });
        // Add new images
        newImages.forEach((imageUrl) => {
            // Create the outer element for each image
            const imageElementWrapper = document.createElement('div');
            imageElementWrapper.className = 'elementor-element elementor-widget elementor-widget-image';
            imageElementWrapper.setAttribute('data-element_type', 'widget');
            imageElementWrapper.setAttribute('data-widget_type', 'image.default');
    
            // Create the widget container
            const widgetContainer = document.createElement('div');
            widgetContainer.className = 'elementor-widget-container';
            const url = baseImagePath+imageUrl.url
            // Create the image element
            const img = document.createElement('img');
            img.setAttribute('decoding', 'async');
            img.setAttribute('loading', 'lazy');
            img.src = url;
            img.alt = 'New Image';
            
            // Style the image to limit its height and maintain aspect ratio
            Object.assign(img.style, {
                maxHeight: '50px', // Limit the image height
                width: 'auto', // Allow the width to adjust proportionally
                objectFit: 'contain', // Ensure the image fits within the bounds without cropping
            });
    
            // Append the image to the widget container
            widgetContainer.appendChild(img);
    
            // Append the widget container to the outer wrapper
            imageElementWrapper.appendChild(widgetContainer);
    
            // Append the outer wrapper to the main container
            container.appendChild(imageElementWrapper);
        });
    }

    createImagesliderOld(imageArray, baseImagePath) {
        const imageSwiper = document.getElementById('imageSwiper');
        const parentElement = imageSwiper.parentElement;
        imageSwiper.remove();
        Object.assign(parentElement.style, {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        });

        
        // Clone first and last images for infinite looping
        const imagesWithClones = [
            imageArray[imageArray.length - 1], // Clone of the last image
            ...imageArray,
            imageArray[0], // Clone of the first image
        ];
        console.log('imageArray',imageArray)
        console.log('imagesWithClones',imagesWithClones)
        // Create the slider container
        const sliderContainer = document.createElement('div');
        Object.assign(sliderContainer.style, {
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            width: '100%',
            height: '60vh',
            scrollBehavior: 'smooth',
            boxSizing: 'border-box',
            scrollbarWidth: 'none',
            gap: '1px'
        });
    
        // Add images to the slider
        imagesWithClones.forEach(({ url, caption }) => {
            const imageElement = document.createElement('div');
            Object.assign(imageElement.style, {
                flex: '0 0 auto',
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                height: '100%', 
            });
    
            const img = document.createElement('img');
            img.src = `${baseImagePath}${url}`;
            img.alt = caption;
            Object.assign(img.style, {
                maxWidth: '100%',
                width: 'auto',
                height: '55vh',
                objectFit: 'scale-down'
            });
    
            const imgCaption = document.createElement('h3');
            imgCaption.textContent = caption;
            Object.assign(imgCaption.style, {
                marginTop: '10px',
                fontSize: '18px',
                textAlign: 'center',
                color: '#BEBEBE',
                fontFamily: 'Poppins, Sans-serif',
                fontSize: '20px',
                fontWeight: '400',
                fontStyle: 'italic',
            });
    
            imageElement.appendChild(img);
            imageElement.appendChild(imgCaption);
            sliderContainer.appendChild(imageElement);
        });
    
        // Navigation buttons
        const createNavButton = (isPrev) => {
            const button = document.createElement('button');
            Object.assign(button.style, {
                width: '40px',
                height: '55px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                margin: '5px',
                transform: isPrev ? 'none' : 'rotate(180deg)',
            });
    
            const arrow1 = document.createElement('div');
            const arrow2 = document.createElement('div');
            Object.assign(arrow1.style, {
                width: '30px',
                height: '7px',
                backgroundColor: 'black',
                borderRadius: '5px',
                transform: 'rotate(-45deg)',
            });
            Object.assign(arrow2.style, {
                width: '30px',
                height: '7px',
                backgroundColor: 'black',
                borderRadius: '5px',
                transform: 'rotate(45deg) translate(7px, 7px)',
            });
    
            button.appendChild(arrow1);
            button.appendChild(arrow2);
            return button;
        };
    
        const prevButton = createNavButton(true);
        const nextButton = createNavButton(false);
    
        // Navigation container
        const navigationContainer = document.createElement('div');
        Object.assign(navigationContainer.style, {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
        });
        navigationContainer.appendChild(prevButton);
        navigationContainer.appendChild(sliderContainer);
        navigationContainer.appendChild(nextButton);
        
        const circleNavigationContainer = document.createElement('div');
        Object.assign(circleNavigationContainer.style, {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
        });

        let currentDotIndex = 0;

        imageArray.forEach((image, index) => {
            const circleButton = document.createElement('button');
            Object.assign(circleButton.style, {
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: index === 0 ? '#000000' : '#cbcbcb',
                border: 'none',
                color: 'white',
                display: 'inlineBlock',
                margin: '4px'
            });
            
            // nav dots
            circleButton.addEventListener('click', () => {
                const firstImage = sliderContainer.firstElementChild;
                if (!firstImage) return;
        
                const imageWidth = firstImage.getBoundingClientRect().width;
                sliderContainer.scrollTo({ left: index * imageWidth, behavior: 'smooth' });
        
                // Update active dot
                updateActiveDot(index);
            });
            circleNavigationContainer.appendChild(circleButton);
        })
        parentElement.appendChild(navigationContainer);
        parentElement.appendChild(circleNavigationContainer);
        
        // Helper function to update active dot
        const updateActiveDot = (newIndex) => {
            const allDots = circleNavigationContainer.children;

            // Reset all dots to default color
            Array.from(allDots).forEach((dot, i) => {
                dot.style.backgroundColor = i === newIndex ? '#000000' : '#cbcbcb'; // Highlight active dot
            });

            currentDotIndex = newIndex;
        };

        // Helper function to update UI
        const updateUI = () => {
            const firstImage = sliderContainer.firstElementChild;
            if (!firstImage) return;
            
            const imageWidth = firstImage.getBoundingClientRect().width;
            const scrollLeft = sliderContainer.scrollLeft;
            const maxScroll = sliderContainer.scrollWidth - sliderContainer.offsetWidth;
    
            // Determine the currently displayed image index
            const currentIndex = Math.round(scrollLeft / imageWidth);
    
            // Show or hide navigation buttons
            prevButton.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
            nextButton.style.visibility = currentIndex < imageArray.length - 1 ? 'visible' : 'hidden';
        };
    
        // Scroll behavior for buttons
        prevButton.addEventListener('click', () => {
            const firstImage = sliderContainer.firstElementChild;
            if (!firstImage) return;
            const imageWidth = firstImage.getBoundingClientRect().width;
            sliderContainer.scrollBy({ left: -imageWidth, behavior: 'smooth' });
        });
    
        nextButton.addEventListener('click', () => {
            const firstImage = sliderContainer.firstElementChild;
            if (!firstImage) return;
            const imageWidth = firstImage.getBoundingClientRect().width;
            sliderContainer.scrollBy({ left: imageWidth, behavior: 'smooth' });
        });

        // Add scroll listener to sync dots with manual sliding
        sliderContainer.addEventListener('scroll', () => {
            const firstImage = sliderContainer.firstElementChild;
            if (!firstImage) return;

            const imageWidth = firstImage.getBoundingClientRect().width;
            const newIndex = Math.round(sliderContainer.scrollLeft / imageWidth);

            if (newIndex !== currentDotIndex) {
                updateActiveDot(newIndex);
            }
        });
    
        // Listen for scroll events to update UI
        sliderContainer.addEventListener('scroll', updateUI);
    
        // Initialize slider UI
        updateUI();
    }

    createImageslider(imageArray, baseImagePath) {
        const imageSwiper = document.getElementById('imageSwiper');
        const parentElement = imageSwiper.parentElement;
        imageSwiper.remove();
        Object.assign(parentElement.style, {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        });

        
        // Clone first and last images for infinite looping
        const imagesWithClones = [
            imageArray[imageArray.length - 1], // Clone of the last image
            ...imageArray,
            imageArray[0], // Clone of the first image
        ];
        console.log('imageArray',imageArray)
        console.log('imagesWithClones',imagesWithClones)
        // Create the slider container
        const sliderContainer = document.createElement('div');
        Object.assign(sliderContainer.style, {
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            width: '100%',
            height: '60vh',
            scrollBehavior: 'smooth',
            boxSizing: 'border-box',
            scrollbarWidth: 'none',
            gap: '1px'
        });
    
        // Add images to the slider
        imagesWithClones.forEach(({ url, caption }) => {
            const imageElement = document.createElement('div');
            Object.assign(imageElement.style, {
                flex: '0 0 auto',
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                height: '100%', 
            });
    
            const img = document.createElement('img');
            img.src = `${baseImagePath}${url}`;
            img.alt = caption;
            Object.assign(img.style, {
                maxWidth: '100%',
                width: 'auto',
                height: '55vh',
                objectFit: 'scale-down'
            });
    
            const imgCaption = document.createElement('h3');
            imgCaption.textContent = caption;
            Object.assign(imgCaption.style, {
                marginTop: '10px',
                fontSize: '18px',
                textAlign: 'center',
                color: '#BEBEBE',
                fontFamily: 'Poppins, Sans-serif',
                fontSize: '20px',
                fontWeight: '400',
                fontStyle: 'italic',
            });
    
            imageElement.appendChild(img);
            imageElement.appendChild(imgCaption);
            sliderContainer.appendChild(imageElement);
        });
    
        // Navigation buttons
        const createNavButton = (isPrev) => {
            const button = document.createElement('button');
            Object.assign(button.style, {
                width: '40px',
                height: '55px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                margin: '5px',
                transform: isPrev ? 'none' : 'rotate(180deg)',
            });
    
            const arrow1 = document.createElement('div');
            const arrow2 = document.createElement('div');
            Object.assign(arrow1.style, {
                width: '30px',
                height: '7px',
                backgroundColor: 'black',
                borderRadius: '5px',
                transform: 'rotate(-45deg)',
            });
            Object.assign(arrow2.style, {
                width: '30px',
                height: '7px',
                backgroundColor: 'black',
                borderRadius: '5px',
                transform: 'rotate(45deg) translate(7px, 7px)',
            });
    
            button.appendChild(arrow1);
            button.appendChild(arrow2);
            return button;
        };
    
        const prevButton = createNavButton(true);
        const nextButton = createNavButton(false);
    
        // Navigation container
        const navigationContainer = document.createElement('div');
        Object.assign(navigationContainer.style, {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
        });
        navigationContainer.appendChild(prevButton);
        navigationContainer.appendChild(sliderContainer);
        navigationContainer.appendChild(nextButton);
        
        const circleNavigationContainer = document.createElement('div');
        Object.assign(circleNavigationContainer.style, {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
        });

        let currentDotIndex = 0;

        imageArray.forEach((image, index) => {
            const circleButton = document.createElement('button');
            Object.assign(circleButton.style, {
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: index === 0 ? '#000000' : '#cbcbcb',
                border: 'none',
                color: 'white',
                display: 'inlineBlock',
                margin: '4px'
            });
            
            // nav dots
            circleButton.addEventListener('click', () => {
                const firstImage = sliderContainer.firstElementChild;
                if (!firstImage) return;
            
                const imageWidth = firstImage.getBoundingClientRect().width;
            
                // Adjust scroll position for the first clone
                const adjustedIndex = index + 1; // Account for the left clone
                sliderContainer.scrollTo({ left: adjustedIndex * imageWidth, behavior: 'smooth' });
            
                // Update active dot
                updateActiveDot(index);
            });
            
            circleNavigationContainer.appendChild(circleButton);
        })
        parentElement.appendChild(navigationContainer);
        parentElement.appendChild(circleNavigationContainer);
        
        // Helper function to update active dot
        const updateActiveDot = (newIndex) => {
            const allDots = circleNavigationContainer.children;
            imageArrayIndex = newIndex;
            console.log('newIndex', newIndex);
            // Reset all dots to default color
            Array.from(allDots).forEach((dot, i) => {
                dot.style.backgroundColor = i === newIndex ? '#000000' : '#cbcbcb'; // Highlight active dot
            });
        };
        
        let imageArrayIndex = 0; // Start at the first real image (index 1)
        let bool = true;
        // Scroll to a specific image based on index
        function controlLooping(index, type = 'instant') {
            const firstImage = sliderContainer.firstElementChild;
            if (!firstImage) return;
            console.log('controlLooping')
            const imageWidth = firstImage.getBoundingClientRect().width;
            const scrollLength = imageWidth * (index + 1); // Adjust for the left clone
            sliderContainer.scrollTo({ left: scrollLength, behavior: type });
        }
        
        
        // Helper function to update UI
        const updateUI = () => {
            const firstImage = sliderContainer.firstElementChild;
            if (!firstImage) return;

            const imageWidth = firstImage.getBoundingClientRect().width;
            const maxScroll = sliderContainer.scrollWidth - sliderContainer.offsetWidth;

            // Get current scroll position and determine index
            const realScrollLeft = sliderContainer.scrollLeft;
            const currentIndex = Math.round((realScrollLeft - imageWidth) / imageWidth);
            console.log('currentIndex', currentIndex);
            console.log('realScrollLeft', realScrollLeft);
            console.log('bool', bool);
            
            // Handle seamless looping
            if (currentIndex < 0) {
                // At left clone, jump to the last real image
                console.log('At left clone, jump to the last real image');
                imageArrayIndex = imageArray.length - 1;
                controlLooping(imageArrayIndex, 'instant');
                if (bool){
                    //controlLooping(imageArrayIndex, 'smooth');
                    bool = false;
                }
            } else if (currentIndex > 5) {
                console.log('At right clone, jump to the first real image');
                // At right clone, jump to the first real image
                imageArrayIndex = 0;
                controlLooping(imageArrayIndex, 'instant');
                if (bool){
                    //controlLooping(imageArrayIndex, 'smooth');
                    bool = false;
                }
            } else {
                // Update the index for the currently displayed real image
                imageArrayIndex = currentIndex;
            }
            // Update navigation dots
            updateActiveDot(imageArrayIndex);
        };

        // Arrow button behavior
        prevButton.addEventListener('click', () => {
            if (imageArrayIndex === 0) {
                imageArrayIndex = imageArray.length - 1;  // Loop to the last image
                controlLooping(imageArrayIndex, 'smooth');
            } else {
                imageArrayIndex -=1; // Move to the previous image
                controlLooping(imageArrayIndex, 'smooth');
                //updateActiveDot(imageArrayIndex);
            }
            updateUI();
        });

        nextButton.addEventListener('click', () => {
            if (imageArrayIndex < imageArray.length - 1) {
                imageArrayIndex += 1; // Move to the next image
                controlLooping(imageArrayIndex, 'smooth');
            } else {
                imageArrayIndex = 0; // Loop to the first image
                controlLooping(imageArrayIndex, 'smooth');
                //updateActiveDot(imageArrayIndex);
            }
            updateUI();
        });

        // Initialize the slider to the first real image
        const initializeSlider = () => {
            controlLooping(0, 'instant'); // Start at the first real image (index 1)
            updateUI(); // Sync the UI
        };


        let lastScrollLeft = 0; // Store the last known scroll position
        const threshold = 0; // Define the minimum scroll distance to trigger the event

        sliderContainer.addEventListener('scroll', () => {
            const currentScrollLeft = sliderContainer.scrollLeft;
            console.log('threshold', Math.abs(currentScrollLeft - lastScrollLeft))
            
            if (Math.abs(currentScrollLeft - lastScrollLeft) >= threshold) {
                lastScrollLeft = currentScrollLeft; // Update the last known position
                console.log('trigger')
                updateUI(); // Trigger your scroll event logic
            }
        });


        // Initialize the slider
        initializeSlider();

    }
};