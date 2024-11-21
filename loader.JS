// Variables 
console.log("1")
// Accessing the JSON data
console.log(window.jsonData);
// checks the current page, so the code is only running when needed
function isOnMissionsPage() {
    const path = window.location.pathname.toLowerCase();
    return path.includes('/missions');
}
// finds element by Id
function findElementById(id) {
    return document.getElementById(id);
}
// checks HTML element for text
function hasNonEmptyText(element) {
    return element.textContent.trim().length > 0;
}
// removes placeholder text and adds long text in chunks to save
function addLongStringInChunks(element, longString, chunkSize = 1000) {
    if (!element) {
        console.error("Element not found.");
        return;
    }
    element.textContent = "";
    let currentIndex = 0;
    const totalLength = longString.length;

    while (currentIndex < totalLength) {
        const chunk = longString.slice(currentIndex, currentIndex + chunkSize);
        element.textContent += chunk; // Append the current chunk
        currentIndex += chunkSize;
    }
}

// searches all child elements of element and store all elements containing text 
function searchAndFindTextElements(element){
    if (!element) {
        console.error(element +' not found.');
        return;
    }
    const childElements = Array.from(element.querySelectorAll('*'));

    const filteredArray = childElements.filter(element => 
        element.tagName.toLowerCase() !== 'div' && hasNonEmptyText(element)
    );
    return filteredArray
}

// updates text on element