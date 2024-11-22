const fs = require('fs');

// Read the entire file
const file = fs.readFileSync('./dk.json', 'utf8');
const data = JSON.parse(file);
const missionsData = data.missions;
main();

function main(){
    console.log('test')
    console.log(data);
    console.log(data.missions[0].id)
    const missionInfo = getMissionById(missionsData, 1248);
    console.log("Mission Found:", missionInfo);
    console.log(missionInfo.title)
    console.log("test")
    console.log($.getJSON("https://staging-1732022352.gbplayground.dk/wp-content/uploads/2024/11/dk.json"))

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
