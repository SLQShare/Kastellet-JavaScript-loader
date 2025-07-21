export class MissionPage {
    constructor(data, missionId, filtersSelected, urlIslandTag, HideLocationButton = false) {
        this.data = data;
        this.missionId = missionId;
        this.filtersSelected = filtersSelected;
        this.urlIslandTag = urlIslandTag;
        this.HideLocationButton = HideLocationButton;
        this.isEn = false; // used to check the language state
        this.emblemIds = filtersSelected ? filtersSelected.getEmblemIds() : []; // Initialize emblemIds
        this.initialize();
    }

    initialize() {
        this.langControl();
        this.headerInformation(this.data, this.missionId, 'MissionTitle', 'title');
        this.headerInformation(this.data, this.missionId, 'MissionSubtitle', 'subtitle');
        this.comparesTheForceTagsToMissionForces(this.data, this.missionId, "ForceContainer");
        this.assignMissionDuration(this.data, this.missionId, "MissionDuration")
        this.addTextFromDataToTable(this.data, this.missionId);
        this.missionLocation(this.data, this.missionId, this.urlIslandTag, this.HideLocationButton);
        this.parseMediaUrl(this.data, this.missionId, this.emblemIds);
        this.addFlexBoxTightScreen();
        this.updateLayout();
    }

    // checks the language setting
    langControl(){
        const url = window.location.href; // Get the full URL of the current page
        if (url.includes('/en')) {
            // en
            this.isEn = true;
        } else {
            // da
            this.isEn = false;
        }
    }

    addFlexBoxTightScreen() {
        // Listen for window resizing
        window.addEventListener("resize", () => this.updateLayout());
    }

    updateLayout() {
        const missionInformation = this.getMissionById(this.data.missions, this.missionId);
        
        // Ensure the mission data is valid
        if (!missionInformation || !missionInformation.content || !missionInformation.content.text) {
            console.error("Invalid mission data or content structure.");
            return;
        }
        // Filter out "Kilder" and "Link" sections
        const missionDataToBeDisplayed = missionInformation.content.text.filter(
            type => type.id !== "Kilder" && type.id !== "Link"
        ); 
        
        
        const table =  document.getElementById('MissionTabs');
        if (!table) {
            console.error("Element #MissionTabs not found");
            return;
        }
        const parent = table.parentElement;

        if (!parent) {
            console.error("Element #MissionTabs not found");
            return;
        }
        const newtable = document.createElement('div');
        if (window.innerWidth < 1400) {
            if (document.getElementById('newtable')) return;
            table.style.display = 'none';
            missionDataToBeDisplayed.forEach(element => {
                let text = document.createElement('span');
                // heading is string and text is html
                text.innerHTML = text.innerHTML = `<strong>${element.heading}</strong> ${element.text}`;
                newtable.appendChild(text);
            })
            newtable.id = 'newtable';
            Object.assign(newtable.style, {
                fontFamily: 'Poppins, Sans-serif',
                fontSize: 'clamp(0.5rem, 1vw, 1.5rem)', 
                overflow: 'auto', /* Hides extra text */
                height: '50vh'
            });
            parent.appendChild(newtable);
        } else {
            table.style.display = 'block';
            const newtable = document.getElementById('newtable')
            if (newtable) newtable.remove();
        }
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
            missionDuration[0].innerHTML = 
                String(missionInformation.year.from) + '-' + 
                (String(missionInformation.year.to) === '0' ? '' : String(missionInformation.year.to));
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
        ); 

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
                        width: '12.5vw',
                        fontSize: 'clamp(0.5rem, 1vw, 1.5rem)', 
                        whiteSpace: 'nowrap', /* Prevents text from wrapping */
                        overflow: 'hidden', /* Hides extra text */
                        textOverflow: 'ellipsis', /* Adds "..." if text overflows */
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
    }
    

    missionLocation(data, missionId, urlIslandTag, HideLocationButton) {
        let location = null; // Variable to store the location if found
        let urlTag = null;
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
                urlTag = collection.UrlTag
            }
        });

        if (location && HideLocationButton === false) {
            // Clear existing content inside `locationButton` if any
            locationButton.innerHTML = '';
    
            // Create a new <a> element
            const linkElement = document.createElement('a');
            linkElement.className = 'elementor-button elementor-button-link elementor-size-sm';
            linkElement.href = `${url.protocol}//${url.hostname}${this.isEn? "/en/" : "/"}${encodeURIComponent(urlTag+'-'+urlIslandTag)}/`; 
            
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
            const missionEmblems = [];
            const sortedImageContent  = [];
    
            // Process the images
            missionImageArray.forEach((image, index) => {
                if (typeof image.url !== 'string') {
                    console.warn('Invalid image format:', image);
                    return; // Skip invalid images
                }
    
                const imageId = parseInt(image.url.split('/').slice(-2, -1)[0], 10); // Extract ID from the URL
                let emblemIndex = -1;
                if (emblemIds.includes(imageId)) {
                    // I want to store the emblems so the emblemIndex is add embles based on the ordered position
                    emblemIndex = emblemIds.indexOf(imageId); // Get the index of imageId
                    if (emblemIndex >= 0){
                        missionEmblems[emblemIndex] = image;
                    }
                } else {
                    sortedImageContent.push(image); // Add other images to sortedImages array
                }
            });
            const sortedEmblemElements = missionEmblems.filter((image) => image !== null && image !== undefined);
            // Pass the sorted images and emblems to their respective functions
            this.updateEmblemSection(sortedEmblemElements, baseImagePath); // Assuming updateEmblemSection is defined elsewhere
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
        imageArray.forEach(({ url, caption }) => {
            const imageElement = document.createElement('div');
            imageElement.classList.add('slider-item');
            Object.assign(imageElement.style, {
                flex: '0 0 auto',
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                height: '100%', 
                pointerEvents: 'auto',
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
            // Add lazy loading attribute
            img.setAttribute('loading', 'lazy');

    
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
            
            // Navigation dots click logic
            circleButton.addEventListener('click', () => {
                const firstImage = sliderContainer.firstElementChild;
                if (!firstImage) return;
            
                const imageWidth = firstImage.getBoundingClientRect().width;
            
                // Map the dot index to the corresponding real image in the mainSet
                const targetIndex = index + originalSliderItems.length; // Offset to align with mainSet
            
                // Scroll to the corresponding image in the mainSet
                sliderContainer.scrollTo({ left: targetIndex * imageWidth, behavior: 'smooth' });
            
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
        
            currentDotIndex = newIndex; // Update the current dot index
        };
        
        
        //sliderContainer 
        // Select all original slider items (these will be cloned to create sets)
        const originalSliderItems = Array.from(document.querySelectorAll('.slider-item'));

        let currentDotIndex = 1;

        // Helper function: Create a set of cloned slider items
        const createImageSet = (items) => {
            const fragment = document.createDocumentFragment(); // Use a fragment for efficient DOM updates
            items.forEach((item) => {
                const clone = item.cloneNode(true); // Deep clone to preserve inner elements and styles
                fragment.appendChild(clone);
            });
            return fragment;
        };

        // Function: Reset the slider container with three sets (left, main, right)
        const resetSliderContainer = () => {
            // Clear all current children in the slider container
            while (sliderContainer.firstChild) {
                sliderContainer.removeChild(sliderContainer.firstChild);
            }

            // Create three sets of slider items
            const leftSet = createImageSet(originalSliderItems);
            const mainSet = createImageSet(originalSliderItems);
            const rightSet = createImageSet(originalSliderItems);

            // Append the sets to the container in the order: left -> main -> right
            sliderContainer.appendChild(leftSet);
            sliderContainer.appendChild(mainSet);
            sliderContainer.appendChild(rightSet);

            // Calculate image width and adjust the initial scroll position to the main set
            const imageWidth = sliderContainer.firstElementChild.offsetWidth;
            sliderContainer.scrollTo({
                left: originalSliderItems.length * imageWidth, // Start at the beginning of the main set
                behavior: 'instant',
            });
        };

        // Scroll listener with active dot logic
        sliderContainer.addEventListener('scroll', () => {
            const scrollLeft = sliderContainer.scrollLeft; // Current scroll position
            const totalWidth = sliderContainer.scrollWidth; // Total width of all sets combined
            const viewportWidth = sliderContainer.clientWidth; // Visible width of the container
            const thresholdLeft = viewportWidth; // Threshold for scrolling to the left set
            const thresholdRight = totalWidth - 2 * viewportWidth; // Threshold for scrolling to the right set

            const imageWidth = sliderContainer.firstElementChild.offsetWidth; // Width of a single image

            if (scrollLeft <= thresholdLeft) {
                sliderContainer.scrollTo({
                    left: scrollLeft + originalSliderItems.length * imageWidth,
                    behavior: 'instant',
                });
            } else if (scrollLeft >= thresholdRight) {
                sliderContainer.scrollTo({
                    left: scrollLeft - originalSliderItems.length * imageWidth,
                    behavior: 'instant',
                });
            }

            const currentIndex = Math.round(scrollLeft / imageWidth);
            const realIndex = (currentIndex % originalSliderItems.length + originalSliderItems.length) % originalSliderItems.length;
            updateActiveDot(realIndex);
        });
        
        // Function: Move the slider programmatically (for button navigation)
        const moveSlider = (direction) => {
            const imageWidth = sliderContainer.firstElementChild.offsetWidth; // Width of a single image

            // Scroll the container by one image width in the given direction
            sliderContainer.scrollBy({
                left: direction * imageWidth,
                behavior: 'smooth', // Smooth animation for better user experience
            });
        };
        
        // remove arrow buttons if there is only one picture
        if (imageArray.length < 2){
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        } else {
            // Attach event listeners for the navigation buttons
            prevButton.addEventListener('click', () => moveSlider(-1)); // Move left by one image
            nextButton.addEventListener('click', () => moveSlider(1));  // Move right by one image
        }
    
        if (imageArray.length === 0) return;
        // Initialize the slider by resetting the container and setting the initial scroll position
        resetSliderContainer();
    }

};

