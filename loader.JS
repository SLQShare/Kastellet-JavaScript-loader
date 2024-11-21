// Variables 
console.log("1")
// Accessing the JSON data
console.log(window.jsonData);
const data = window.jsonData

function isOnMissionsPage() {
    const path = window.location.pathname.toLocaleLowerCase();
    return path.includes('/missions')
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