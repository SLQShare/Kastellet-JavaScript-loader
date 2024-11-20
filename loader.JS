// Variables 
console.log("1")
// Accessing the JSON data
console.log(window.jsonData);
const data = window.jsonData

function isOnMissionsPage() {
    const path = window.location.pathname.toLocaleLowerCase();
    return path.includes('/missions')
}

function getElementByIdAndModify(id, newColor) {
    const element = document.getElementById(id);
    if (element) {
        element.style.color = newColor;
    } else {
        console.error(`Element with id "${id}" not found`);
    }
}

// Usage
getElementByIdAndModify('MissionTitle', 'blue');
console.log(isOnMissionsPage())