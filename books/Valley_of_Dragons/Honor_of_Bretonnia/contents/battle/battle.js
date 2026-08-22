import { drawAll } from './draw.js';
import { defineUnitTypes } from './units.js';
import { definenetworkConfigs, toggleNetwork } from './networks.js';

async function fetchBattleMetadatas(baseDir = './') {
    try {
        const response = await fetch('battles.json');
        if (!response.ok) throw new Error(`Failed to fetch battle list: ${response.status}`);
        battles = await response.json();

        console.log('Loaded Battles:', battles);

        // Fetch metadata from each valid subdirectory
        const metadatas = await Promise.all(
            battles.map(async dir => {
                const metadataURL = `${baseDir}/${dir}/battle_metadata.json`;
                try {
                    const metadataResponse = await fetch(metadataURL);
                    if (!metadataResponse.ok) throw new Error(`HTTP error! Status: ${metadataResponse.status}`);
                    return await metadataResponse.json(); // Return raw metadata
                } catch (error) {
                    console.error(`Error fetching metadata for ${dir}:`, error);
                    return null; // Skip directories with errors
                }
            })
        );

        return metadatas.filter(Boolean); // Remove null entries
    } catch (error) {
        console.error('Error fetching battles:', error);
        return [];
    }
}


function generateMetadataStrings(metadataList, sep = "_", sepBattleName = "_", sepBig = "__", extraInfo = false, addBattleName = true) {
    return metadataList.map(metadata => {
        const collectionId = metadata.collectionId || 'unknownCollection';
        const collectionBookId = metadata.collectionBookId || 'unknownBook';
        const bookBattleId = metadata.bookBattleId || 'unknownBookBattle';
        const battleId = metadata.battleId || 'unknownBattle';
        const battleName = metadata.battle_name || 'unknownBattle';
        let metadataStr = `${collectionId}${sep}${collectionId}${sep}${collectionBookId}${sep}${bookBattleId}`;
        if (addBattleName) { metadataStr = `${metadataStr}${sepBig}${battleName.replace(/ /g, sepBattleName)}`; }
        if (extraInfo === true) { metadataStr = `battle${sepBig}${metadataStr}${sepBig}${battleId}`; }
        return metadataStr
    });
}

async function fetchBattlesToChoose(baseDir = '.') {
    return fetchBattleMetadatas(baseDir).then(generateMetadataStrings)

}



async function fetchBattleData() {
    try {

        const response_nodes = await fetch(`${selectedBattleDir}/auto_data/nodes.json`);
        const response_units = await fetch(`${selectedBattleDir}/auto_data/units.json`);
        const response_meleeNetwork = await fetch(`${selectedBattleDir}/auto_data/melee_interactions.json`);
        const response_archerNetwork = await fetch(`${selectedBattleDir}/auto_data/archer_interactions.json`);
        const response_flierNetwork = await fetch(`${selectedBattleDir}/auto_data/flier_interactions.json`);
        const response_siegeNetwork = await fetch(`${selectedBattleDir}/auto_data/siege_interactions.json`);
        const response_cavalryNetwork = await fetch(`${selectedBattleDir}/auto_data/cavalry_interactions.json`);


        nodes = await response_nodes.json();
        console.log("Nodes fetched:", nodes);
        units = await response_units.json();
        console.log("Units fetched:", units);

        meleeNetwork = await response_meleeNetwork.json();
        console.log("meleeNetwork fetched:", meleeNetwork);
        archerNetwork = await response_archerNetwork.json();
        console.log("archerNetwork fetched:", archerNetwork);
        flierNetwork = await response_flierNetwork.json();
        console.log("flierNetwork fetched:", flierNetwork);
        siegeNetwork = await response_siegeNetwork.json();
        console.log("siegeNetwork fetched:", siegeNetwork);
        cavalryNetwork = await response_cavalryNetwork.json();
        console.log("cavalryNetwork fetched:", cavalryNetwork);

    } catch (error) {
        console.error('Error fetching JSON:', error);
    }
}

let battles
let selectedBattle
let selectedBattleDir
let battle_metadata

let deploymentLevel
let nodes
let units

let meleeNetwork
let archerNetwork
let flierNetwork
let siegeNetwork
let cavalryNetwork

let svg
let unitTypes
let networkConfigs

// battle_metadata
let battleName
let nodeSize
let nodeXOffset
let nodeYOffset
let nodeXScale
let nodeYScale
let battleMapFile
let battleMapInfoHTML


// Get HTML elements
const dropdown = document.getElementById('battleDropdown');
const slider = document.getElementById("difficultySlider");
const sliderValue = document.getElementById("sliderValue");
const setDifficultyButton = document.getElementById("setDifficultyButton");
const logTextbox = document.getElementById("logTextbox");
logTextbox.value = ""
const checkboxMeleeNetwork = document.getElementById('meleeNetwork');
const checkboxArcherNetwork = document.getElementById('archerNetwork');
const checkboxFlierNetwork = document.getElementById('flierNetwork');
const checkboxSiegeNetwork = document.getElementById('siegeNetwork');
const checkboxCavalryNetwork = document.getElementById('cavalryNetwork');



document.addEventListener('DOMContentLoaded', () => {
    fetchBattlesToChoose().then(defineHtmlElementsAndCallbacks);
});



function defineHtmlElementsAndCallbacks(battleStrs) {

    dropdown.addEventListener('change', handleBattleChange);
    dropdown.addEventListener('change', () => {
        fetchBattleData().then(createBattle);
    });
    console.log(battles)

    battleStrs.forEach((battleStr, index) => {
        const option = document.createElement('option');
        option.value = battleStr;
        option.dataset.path = battles[index];
        option.textContent = battleStr;
        dropdown.appendChild(option);
    });

    // Order dropdown options lexicographically
    const options = Array.from(dropdown.options);
    options.sort((a, b) => a.text.localeCompare(b.text));
    dropdown.innerHTML = '';
    options.forEach(option => dropdown.add(option));



    sliderValue.textContent = parseInt(slider.value, 10);
    slider.addEventListener("input", function () {
        sliderValue.textContent = slider.value;
    });
    setDifficultyButton.addEventListener("click", () => { fetchBattleData().then(createBattle); });
    checkboxMeleeNetwork.addEventListener('change', (e) => { toggleNetwork(e, networkConfigs); });
    checkboxArcherNetwork.addEventListener('change', (e) => { toggleNetwork(e, networkConfigs); });
    checkboxFlierNetwork.addEventListener('change', (e) => { toggleNetwork(e, networkConfigs); });
    checkboxSiegeNetwork.addEventListener('change', (e) => { toggleNetwork(e, networkConfigs); });
    checkboxCavalryNetwork.addEventListener('change', (e) => { toggleNetwork(e, networkConfigs); });

}

async function handleBattleChange(event) {
    selectedBattle = event.target.value;
    selectedBattleDir = event.target.selectedOptions[0].dataset.path;

    if (!selectedBattle) {
        detailsDiv.textContent = 'Select a battle to view details.';
        return;
    }

    try {
        console.log(`${selectedBattleDir}/battle_metadata.json`)
        const response = await fetch(`${selectedBattleDir}/battle_metadata.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch metadata for ${selectedBattle}`);
        }
        battle_metadata = await response.json();
        getMetadata()
        console.log("Battle metadata fetched:", battle_metadata);
    } catch (error) {
        console.error(`Error loading metadata for ${selectedBattle}:`, error);
    }
}

function createBattle() {

    // Nodes & units
    deploymentLevel = parseInt(slider.value, 10);
    nodes = createNodes(nodes);
    units = deployUnits(units, deploymentLevel);

    // Set CSS variables
    setCSSVariables()

    // Define unit types and networks
    unitTypes = defineUnitTypes(meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, cavalryNetwork);
    networkConfigs = definenetworkConfigs(svg, nodes, nodeSize, nodeXOffset, nodeYOffset, checkboxMeleeNetwork, checkboxArcherNetwork, checkboxFlierNetwork, checkboxCavalryNetwork, checkboxSiegeNetwork, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, cavalryNetwork)

    drawAll(nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale, networkConfigs)
}

function getMetadata() {
    battleName = battle_metadata["battle_name"]
    nodeSize = configNodeSizeToPx(battle_metadata["nodeSize"]);
    nodeXOffset = configNodeSizeToPx(battle_metadata["nodeXOffset"]);
    nodeYOffset = configNodeSizeToPx(battle_metadata["nodeYOffset"]);
    nodeXScale = battle_metadata["nodeXScale"];
    nodeYScale = battle_metadata["nodeYScale"];
    battleMapFile = `${selectedBattleDir}/${battle_metadata["battle_map_file"]}`;
    battleMapInfoHTML = `${selectedBattleDir}/${battle_metadata["battle_map_info_html"]}`;

    // Update HTML elements
    document.title = battleName;
    document.querySelector("h1").textContent = battleName;
    document.documentElement.style.setProperty('--battle-map-file', `url(${battleMapFile})`);
}

// CREATE functions
function createNodes(nodes) {
    return nodes
}


function deployUnits(units, deploymentLevel) {
    units = units.filter(unit => (unit.min_deployment <= deploymentLevel) & (deploymentLevel <= unit.max_deployment));
    return units
}

// HELPER functions
function configNodeSizeToPx(vh) {
    return (vh / 100 / 1000) * window.innerHeight;
}


function setCSSVariables() {
    document.documentElement.style.setProperty('--node-size', `${nodeSize}px`);
    document.documentElement.style.setProperty('--unit-size', `${nodeSize}px`);
    document.documentElement.style.setProperty('--node-size-highlight', `${nodeSize * 1.2}px`);
    document.documentElement.style.setProperty('--unit-size-highlight', `${nodeSize * 1.2}px`);
}

add_instructions_modal_content()
add_map_info_modal_content()

function add_instructions_modal_content() {
    document.getElementById("instructionsButton").addEventListener("click", function () {
        const modal = document.getElementById("instructionsModal");
        const instructionsText = document.getElementById("instructionsText");

        // Fetch the HTML file and insert its content into the modal
        fetch('battle_instructions.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                instructionsText.innerHTML = html; // Set the modal content
                modal.style.display = "flex";     // Show the modal
            })
            .catch(error => {
                console.error('Error loading', error);
                mapInfoText.innerHTML = `<p>Failed to load.</p>`;
                modal.style.display = "flex";
            });
    });

    document.getElementById("closeInstructionsModal").addEventListener("click", function () {
        document.getElementById("instructionsModal").style.display = "none";
    });
}

// Map Info Modal
function add_map_info_modal_content() {
    document.getElementById("mapInfoButton").addEventListener("click", function () {
        const modal = document.getElementById("mapInfoModal");
        const mapInfoText = document.getElementById("mapInfoText");

        // Fetch the HTML file and insert its content into the modal
        fetch(battleMapInfoHTML)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                mapInfoText.innerHTML = html; // Set the modal content
                modal.style.display = "flex";     // Show the modal
            })
            .catch(error => {
                console.error('Error loading', error);
                mapInfoText.innerHTML = `<p>Failed to load.</p>`;
                modal.style.display = "flex";
            });
    });

    document.getElementById("closeMapInfoModal").addEventListener("click", function () {
        document.getElementById("mapInfoModal").style.display = "none";
    });
}
