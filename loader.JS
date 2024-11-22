console.log("1");
console.log(isOnMissionsPage());
let missionId = 1248; // default value
const urlDk = "https://staging-1732022352.gbplayground.dk/wp-content/uploads/2024/11/dk.json";

main(missionId, urlDk);

function main(missionId, urlDk) {
    if (isOnMissionsPage()) {
        fetchAndProcessData(missionId, urlDk);     
    }
}
// Function to fetch data and process it
async function fetchAndProcessData(missionId,url) {
    try {
        const jsonData = await jQuery.getJSON(url);
        console.log("Data received:", jsonData);
        // Call a function to process the data
        processData(missionId, jsonData);
    } catch (error) {
        console.error("Error fetching JSON:", error);
    }
}
// Function to process the data
function processData(missionId , data) {
    // Implement your logic here
    console.log("Processing data:", data);
    const dataDk = data.missions;
    console.log("dataDk:", dataDk)
    debugger;
    // For example, assign to a variable, manipulate DOM, etc.
    const table = findElementById('MissionTitle');
    debugger;
    filteredArrayOfElements = searchAndFindTextElements(table);
    const missionInformation = getMissionById(dataDk, missionId)
    console.log('filteredArrayOfElements', filteredArrayOfElements);
    console.log("missioninformation",missionInformation);
    debugger;
    const testTitel = missionInformation.title;
    const testString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus bibendum at odio sollicitudin imperdiet. Aliquam aliquet lacinia lectus a blandit. Nulla efficitur erat et est pulvinar dapibus. In laoreet dictum ligula maximus vehicula. Nullam sollicitudin tempus turpis, sit amet ullamcorper leo aliquam nec. Pellentesque et justo mi. Nunc metus turpis, elementum quis hendrerit eget, scelerisque vitae nulla. Phasellus pretium, sem eget tincidunt ultrices, neque dolor tristique quam, vel ullamcorper nisi erat nec turpis. Nulla tristique vitae eros eget pharetra. Praesent efficitur nisi varius orci fermentum rhoncus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam efficitur orci ut massa finibus, vel scelerisque lectus elementum. Maecenas condimentum nunc efficitur neque cursus auctor. Etiam a mi ut turpis aliquam finibus eget eget enim. Fusce volutpat mi mauris, eleifend congue ex bibendum id. Ut dictum porttitor erat, et varius augue vulputate sed. Proin rhoncus finibus posuere. Nunc blandit viverra dui, ut vulputate eros sodales et. Suspendisse condimentum justo non ante condimentum, vel rutrum nibh elementum. Nullam a porttitor nisi. Fusce metus leo, maximus eget pretium tincidunt, tristique sed nulla. Nullam consectetur congue maximus. Ut dignissim tempus ullamcorper. Nunc dictum leo nunc, sed ultrices tortor dignissim in. Sed sit amet congue lectus. In hac habitasse platea dictumst. Ut commodo nisi id interdum porta. Nullam interdum ultricies ex sit amet faucibus. Pellentesque volutpat mollis elit, sit amet scelerisque nulla faucibus sit amet. Morbi sit amet lobortis risus, vel elementum magna. Vestibulum in tristique diam. Sed ornare nulla sit amet metus dapibus, ac finibus dolor consectetur. Donec vehicula ac nunc at volutpat. Integer gravida rutrum posuere. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam aliquam eros sed dolor venenatis gravida quis et risus. Fusce eu nibh metus. Quisque egestas convallis magna. Sed mauris neque, aliquet ac vulputate id, consectetur ut dolor. Vivamus felis urna, faucibus in leo eget, bibendum ultricies diam. Sed tempus sodales commodo. Mauris faucibus congue gravida.Ut quam urna, tempus et massa in, faucibus porttitor enim. Aliquam at elementum enim, at bibendum ex. Vestibulum rhoncus tristique quam, eu luctus nisl. Quisque eget justo tortor. Pellentesque et tincidunt est, ac ultrices metus. Morbi vel urna sed velit vehicula lacinia sed at purus. Donec sodales enim ut elit luctus sollicitudin. Phasellus ultrices at dui sed placerat. Mauris non facilisis nunc. Nunc rhoncus tellus magna, quis molestie est maximus et. Etiam vehicula sodales odio sed malesuada. Aenean tempor mollis lobortis."
    debugger;
    addLongStringInChunks(filteredArrayOfElements[0], testTitel, 1000); 
}
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
