const fs = require('fs');

// Read the original file
const file = fs.readFileSync('./dk.json', 'utf8');
const data = JSON.parse(file);

main();

function main() {
    console.log('Categorizing hotspots and saving...');
    //const categorizedData = categorizeHotspotsAdvanced(data.hotspotCollections);
    // Save the updated data to a new file
    //saveUpdatedData(data, categorizedData);
    saveUpdatedData(data, county);
    
}

function categorizeHotspotsAdvanced(hotspotCollections) {
    const regionMappingUsingMapId = {
        Africa: [
            4244, 4249, 4257, 4423, 4475, 5082, 5091, 4484, 4485, 4520, 4523, 4478, 4479, 4472, 4271, 5028, 5141, 4487, 5098, 5137, 5094, 5092, 5083, 5029, 4524, 4521, 4489, 4486, 4476, 4473, 4422, 4422
        ],
        America: [
            4534, 4689, 4537, 4543, 4546
        ],
        Asia: [
            4148, 4256, 4430, 4431, 4540, 5065, 5070, 5072, 5087, 4513, 4436, 4482, 4518, 4549, 4427, 5080, 4548, 4510, 4465, 4426
        ],
        Australia: [
            // No entries yet
        ],
        MiddleEast: [
            4234, 4265, 4276, 4294, 4434, 4498, 4507, 5146, 5523, 4462, 4438, 4460, 4461, 4477, 4516, 5077, 4522, 5096, 5144, 4237, 4500, 5144, 5052, 4236
        ],
        Europe: [
            4238, 4240, 4285, 4424, 4425, 4432, 4438, 5041, 5042, 5064, 5036, 5037, 4526, 5034, 5035, 5033, 5067, 5032, 4469, 6887, 5149, 4531, 5048, 4528, 4527, 4470, 4614, 4616, 5522, 6892, 4474, 4528, 5089, 5149, 4429, 4613, 6885, 5321, 5138, 5088, 5051, 4615, 4494, 4428, 4293, 4684
        ],
        Regions: [
            4684, 3636
        ],
    };

    hotspotCollections.forEach(hotspot => {
        let assignedRegion = 'Uncategorized'; // Default to Uncategorized
        for (const [region, mapids] of Object.entries(regionMappingUsingMapId)) {
            if (mapids.includes(hotspot.mapid)) {
                assignedRegion = region;
                break;
            }
        }
        hotspot.region = assignedRegion; // Add the region tag to each hotspot
    });

    return hotspotCollections;
}

function saveUpdatedData(originalData, updatedHotspotCollections) {
    // Update the original data with the new hotspotCollections
    originalData.hotspotCollections = updatedHotspotCollections;

    // Save the updated data to a new file
    const outputFileName = './dk_updated_with_regions.json';
    fs.writeFileSync(outputFileName, JSON.stringify(originalData, null, 2), 'utf8');
    console.log(`Updated data saved to ${outputFileName}`);
}