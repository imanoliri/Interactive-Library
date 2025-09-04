async function fetchBattleData() {
    try {
        
        const response_battle_metadata = await fetch('battle_metadata.json');
        const response_nodes = await fetch('auto_data/nodes.json');
        const response_units = await fetch('auto_data/units.json');
        const response_meleeNetwork = await fetch('auto_data/melee_interactions.json');
        const response_archerNetwork = await fetch('auto_data/archer_interactions.json');
        const response_flierNetwork = await fetch('auto_data/flier_interactions.json');
        const response_siegeNetwork = await fetch('auto_data/siege_interactions.json');


        battle_metadata = await response_battle_metadata.json();
        console.log("Battle metadata fetched:", nodes);
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

    } catch (error) {
        console.error('Error fetching JSON:', error);
    }
}

let deploymentLevel
let nodes
let units

let meleeNetwork
let archerNetwork
let flierNetwork
let siegeNetwork

let networkDrawingConfig

let battle_metadata

let battleName
let nodeSize
let nodeXOffset
let nodeYOffset
let nodeXScale
let nodeYScale
let battleMapFile
let battleMapInfoHTML


// Get HTML elements
const slider = document.getElementById("difficultySlider");
const sliderValue = document.getElementById("sliderValue");
const setDifficultyButton = document.getElementById("setDifficultyButton");
const logTextbox = document.getElementById("logTextbox");
logTextbox.value = ""
const checkboxMeleeNetwork = document.getElementById('meleeNetwork');
const checkboxArcherNetwork = document.getElementById('archerNetwork');
const checkboxFlierNetwork = document.getElementById('flierNetwork');
const checkboxSiegeNetwork = document.getElementById('siegeNetwork');


const teamColors = {
    1: "green",
    2: "orange",
    3: "blueviolet",
    4: "lightseagreen",
    5: "lightgreen",
    6: "maroon"
};


document.addEventListener('DOMContentLoaded', () => {
    fetchBattleData().then(createBattle);
});
    
function createBattle() {

    defineHtmlElementsCallbacks()

    getMetadata()

    // Nodes & units
    deploymentLevel = parseInt(slider.value, 10);
    nodes = createNodes(nodes);
    units = createUnits(units, deploymentLevel);

    
    // Networks
    meleeNetwork = createMeleeNetwork(meleeNetwork);
    archerNetwork = createArcherNetwork(archerNetwork);
    flierNetwork = createFlierNetwork(flierNetwork);
    siegeNetwork = createSiegeNetwork(siegeNetwork);

    
    // Set CSS variables
    
    setCSSVariables(nodeSize)

    // Define Network Drawing Configs
    networkDrawingConfig = defineNetworkDrawingConfig(meleeNetwork, archerNetwork, flierNetwork, siegeNetwork)

    drawAll()
}

function getMetadata(){
    battleName = battle_metadata["battle_name"]
    nodeSize = battle_metadata["nodeSize"];
    nodeXOffset = battle_metadata["nodeXOffset"];
    nodeYOffset = battle_metadata["nodeYOffset"];
    nodeXScale = battle_metadata["nodeXScale"];
    nodeYScale = battle_metadata["nodeYScale"];
    battleMapFile = battle_metadata["battle_map_file"];
    battleMapInfoHTML = battle_metadata["battle_map_info_html"];

    // Update HTML elements
    document.title = battleName;
    document.querySelector("h1").textContent = battleName;
    document.documentElement.style.setProperty('--battle-map-file', `url(${battleMapFile})`);
}


function defineHtmlElementsCallbacks() {
    sliderValue.textContent =  parseInt(slider.value, 10);
    slider.addEventListener("input", function() {
        sliderValue.textContent = slider.value;
    });
    setDifficultyButton.addEventListener("click", function() {
        location.reload();
    });
    checkboxMeleeNetwork.addEventListener('change', toggleNetwork);
    checkboxArcherNetwork.addEventListener('change', toggleNetwork);
    checkboxFlierNetwork.addEventListener('change', toggleNetwork);
    checkboxSiegeNetwork.addEventListener('change', toggleNetwork);
}

function toggleNetwork(e) {
    checkbox = e.target
    if (checkbox.checked) {
        createConnections(
            networkDrawingConfig[checkbox.id]
        );

    } else {
        document.querySelectorAll(`.${checkbox.id}-border-line`).forEach(line => line.remove());
        document.querySelectorAll(`.${checkbox.id}-line`).forEach(line => line.remove());
    }
}


// CREATE functions
function createNodes(nodes) {
    return invertYScale(nodes) 
}

function invertYScale(nodes) {
    const maxY = Math.max(...nodes.map(node => node.y));
    return nodes.map(node => ({
        ...node,
        y: maxY - node.y + 1
    }));
}

function createUnits(units, deploymentLevel) {
    units = units.filter(unit => (unit.min_deployment <= deploymentLevel) & (deploymentLevel <=  unit.max_deployment));
    return units
}

function createMeleeNetwork(meleeNetwork) {
    return meleeNetwork
}

function createArcherNetwork(archerNetwork) {
    return archerNetwork

}

function createFlierNetwork(flierNetwork) {
    return flierNetwork
}

function createSiegeNetwork(siegeNetwork){
    return siegeNetwork
}

function createPairs(element, list) {
    // Initialize an empty array to store the pairs
    let pairs = [];

    // Loop through each item in the list and create a pair
    list.forEach(item => {
        pairs.push([element, item]);
    });

    return pairs; // Return the array of pairs
}

// HELPER functions
function writeToLog(message) {
    logTextbox.value = `${logTextbox.value}\n${message}`;
    logTextbox.scrollTop = logTextbox.scrollHeight;
}

function vhToPixels(value) {
    // Extract the numerical part from the value (e.g., "30vh" -> 30)
    const numericValue = parseFloat(value);

    // Calculate the pixel equivalent using the window's inner height
    const pixels = (window.innerHeight * numericValue) / 100;
    return pixels;
}


function setCSSVariables(nodeSize) {
    document.documentElement.style.setProperty('--node-size', `${nodeSize}px`);
    document.documentElement.style.setProperty('--unit-size', `${nodeSize}px`);
    document.documentElement.style.setProperty('--node-size-highlight', `${nodeSize*1.2}px`);
    document.documentElement.style.setProperty('--unit-size-highlight', `${nodeSize*1.2}px`);
}


// DRAW functions
function drawAll(){
    drawNodes()
    drawMobileElements()
    drawNetworkConnections()
}

function defineNetworkDrawingConfig(meleeNetwork, archerNetwork, flierNetwork, siegeNetwork) {
    // Create SVG element for lines
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    battlefield.appendChild(svg);

    // Set the focal point to the center of the page
    let maxNodesX = Math.max(...nodes.map(node => node.x)) * nodeSize;
    let maxNodesY = Math.max(...nodes.map(node => node.y)) * nodeSize;
    const focalPointX = maxNodesX / 2;
    const focalPointY = maxNodesY / 2;


    networkDrawingConfig = {
        meleeNetwork: {
            svg: svg,
            networkType: "meleeNetwork",
            nodes: nodes,
            nodeSize: nodeSize,
            network: meleeNetwork,
            color: "red",
            width: nodeSize/10,
            dashArray: "",
            lateralOffset: 0,
            curvedLine: false
        },
        archerNetwork: {
            svg: svg,
            networkType: "archerNetwork",
            nodes: nodes,
            nodeSize: nodeSize,
            network: archerNetwork,
            color: "green",
            width: nodeSize/10,
            dashArray: "10,10",
            lateralOffset: 0,
            curvedLine: false
        },
        flierNetwork: {
            svg: svg,
            networkType: "flierNetwork",
            nodes: nodes,
            nodeSize: nodeSize,
            network: flierNetwork,
            color: "blue",
            width: nodeSize/300,
            dashArray: "",
            lateralOffset: 0,
            curvedLine: true,
            focalPointX: focalPointX,
            focalPointY: focalPointY,
            curvatureStrength: 150
        },
        siegeNetwork: {
            svg: svg,
            networkType: "siegeNetwork",
            nodes: nodes,
            nodeSize: nodeSize,
            network: siegeNetwork,
            color: "white",
            width: nodeSize/10,
            dashArray: "10,25",
            lateralOffset: 0,
            curvedLine: false
        }
    };
return networkDrawingConfig
}

function drawMobileElements(){
    units = units.filter(u => u.health > 0);
    drawUnits(nodes, units, nodeSize, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork);
    drawUnitsTable(units);
    updateHealthBar(units);
    
}

function drawNodes() {
    nodes.forEach(node => {
        const div = document.createElement("div");
        div.classList.add("node");
        div.style.left = `${nodeXOffset + node.x * nodeSize * nodeXScale}px`;
        div.style.top = `${nodeYOffset + node.y * nodeSize * nodeYScale}px`;
        div.dataset.nodeId = node.id; // Assign the node ID as a data attribute

        // Drag and drop callbacks
        div.addEventListener("dragover", handleDragOver);
        div.addEventListener("drop", (event) => {handleDrop(event, nodes, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, nodeSize);});
        div.addEventListener('mouseenter', (event) => {handleNodeHoverHighlightAccessibleUnitsNodes(event, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork);});
        div.addEventListener('mouseleave', handleNodeLeaveHighlight);

        // Click and click callbacks
        div.addEventListener('click', (event) => {handleNodeClick(event, nodes, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, nodeSize);});

        battlefield.appendChild(div);
    });
}

function drawUnits(nodes, units, nodeSize, meleeNetwork, archerNetwork, flierNetwork) {
    const existingUnits = document.querySelectorAll(".unit-circle");
    existingUnits.forEach(unit => unit.remove());
    units.forEach(unit => {
        const node = nodes.find(n => n.id === unit.node);
        if (!node) return; // Skip if the node is not found

        // Create the circular div for the unit
        const circle = document.createElement("div");
        circle.classList.add("unit-circle", `team-${unit.team}`, `type-${unit.type}`);
        circle.textContent = unit.id;
        circle.setAttribute("draggable", "true"); // Make the unit circle draggable
        const teamNumber = parseInt(unit.team);
        if (teamColors[teamNumber]) {
            circle.style.backgroundColor = teamColors[teamNumber];
        }

        // Position the circle at the node's coordinates
        circle.style.left = `${nodeXOffset + node.x * nodeSize * nodeXScale}px`;
        circle.style.top = `${nodeYOffset + node.y * nodeSize * nodeYScale}px`;

        // Set unit ID as a data attribute for reference
        circle.dataset.unitId = unit.id;
        circle.dataset.nodeId = unit.node;
        circle.dataset.type = unit.type;

        // Create a tooltip to show unit details on hover
        const tooltip = document.createElement("div");
        tooltip.classList.add("unit-tooltip");
        tooltip.innerHTML = `
            <strong>ID:</strong> ${unit.id}<br>
            <strong>Team:</strong> ${unit.team}<br>
            <strong>Name:</strong> ${unit.name}<br>
            <strong>Type:</strong> ${unit.type}<br>
            <strong>Attack Melee:</strong> ${unit.attack_melee}<br>
            <strong>Attack Range:</strong> ${unit.attack_range}<br>
            <strong>Defense:</strong> ${unit.defense}<br>
            <strong>Health:</strong> ${unit.health}<br>
            <strong>Node:</strong> ${unit.node}<br>
            <strong>Deployment Min:</strong> ${unit.min_deployment}
            <strong>Deployment Max:</strong> ${unit.max_deployment}
        `;
        circle.appendChild(tooltip);
        battlefield.appendChild(circle); // Append the unit circle to the battlefield

        // Drag and drop callbacks
        circle.addEventListener('mouseenter', (event) => {handleNodeHoverHighlightAccessibleUnitsNodes(event, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork);});
        circle.addEventListener('mouseleave', handleNodeLeaveHighlight);
        circle.addEventListener("dragstart", handleDragStart);
        circle.addEventListener("dragover", handleDragOver);
        circle.addEventListener("drop", (event) => {handleDrop(event, nodes, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, nodeSize);});
        

        // Click and click callback
        circle.addEventListener("click", (event) => {handleUnitClick(event, nodes, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, nodeSize);});

    });
}

function drawUnitsTable(units) {
    const tableBody = document.querySelector("#unitTable tbody");
    tableBody.innerHTML = ""; // Clear any existing table rows

    units.forEach(unit => {
        const row = document.createElement("tr");

        // Create non-editable cells for each property
        for (let key in unit) {
            const cell = document.createElement("td");
            cell.textContent = unit[key]; // Set the cell content

            if (key === 'team') { // Set team cell color
                const teamNumber = parseInt(cell?.textContent.trim());
                if (teamColors[teamNumber]) {
                    cell.style.backgroundColor = teamColors[teamNumber];
                }
            }

            row.appendChild(cell); // Append the cell to the row
        }

        tableBody.appendChild(row); // Append the row to the table body
    });
}

function drawNetworkConnections() {
    if (checkboxMeleeNetwork.checked) {createConnections(networkDrawingConfig["meleeNetwork"]);}
    if (checkboxArcherNetwork.checked) {createConnections(networkDrawingConfig["archerNetwork"]);}
    if (checkboxFlierNetwork.checked) {createConnections(networkDrawingConfig["flierNetwork"]);}
    if (checkboxSiegeNetwork.checked) {createConnections(networkDrawingConfig["siegeNetwork"]);}
}

function createConnections({svg, networkType, nodes, nodeSize, network, color, width, dashArray, lateralOffset, curvedLine, focalPointX, focalPointY, curvatureStrength}) {
    network.forEach(pair => {
        const node1 = nodes.find(node => node.id === pair[0]);
        const node2 = nodes.find(node => node.id === pair[1]);
        if (node1 && node2) {
            drawLine(svg, networkType,
                node1.x * nodeSize + nodeSize / 2, node1.y * nodeSize + nodeSize / 2,
                node2.x * nodeSize + nodeSize / 2, node2.y * nodeSize + nodeSize / 2,
                color, width, dashArray, lateralOffset, curvedLine, focalPointX, focalPointY, curvatureStrength
            );
        }
    });
}

function drawLine(svg, networkType, x1, y1, x2, y2, color, width, dashArray, lateralOffset = 0, curvedLine = false, curvatureFocalPointX, curvatureFocalPointY, curvatureStrength) {
    if (curvedLine) {
        // If curvedLine is true, use the drawCurvedLine function
        drawCurvedLine(svg, networkType, x1, y1, x2, y2, color, width, dashArray, curvatureFocalPointX, curvatureFocalPointY, curvatureStrength);
    } else {
        // Adjust the coordinates by the lateral offset for a straight line
        const adjustedX1 = x1 + lateralOffset;
        const adjustedY1 = y1;
        const adjustedX2 = x2 + lateralOffset;
        const adjustedY2 = y2;

        // Draw a thicker black line as the border
        const borderLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        borderLine.setAttribute("class", `${networkType}-border-line`);
        borderLine.setAttribute("x1", adjustedX1);
        borderLine.setAttribute("y1", adjustedY1);
        borderLine.setAttribute("x2", adjustedX2);
        borderLine.setAttribute("y2", adjustedY2);
        borderLine.setAttribute("stroke", "black");
        borderLine.setAttribute("stroke-width", `${width}`);
        borderLine.setAttribute("stroke-linecap", "round");
        borderLine.setAttribute("stroke-dasharray", dashArray);
        svg.appendChild(borderLine);

        // Draw the colored line on top
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", `${networkType}-line`);
        line.setAttribute("x1", adjustedX1);
        line.setAttribute("y1", adjustedY1);
        line.setAttribute("x2", adjustedX2);
        line.setAttribute("y2", adjustedY2);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", `${width/2}`);
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("stroke-dasharray", dashArray);
        svg.appendChild(line);
    }
}

function drawCurvedLine(svg, networkType, x1, y1, x2, y2, color, width, dashArray, focalPointX, focalPointY, curvatureStrength = 100) {
    // Calculate the midpoint of the line
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Calculate the direction vector from the focal point to the midpoint
    let directionX = midX - focalPointX;
    let directionY = midY - focalPointY;

    // Normalize the direction vector to get a unit vector
    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    if (length !== 0) { // Avoid division by zero
        directionX /= length;
        directionY /= length;
    }

    // Adjust the control point to bend the line away from the focal point
    const controlX = midX + curvatureStrength * directionX;
    const controlY = midY + curvatureStrength * directionY;

    // Create an SVG path element for the curved line
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
    path.setAttribute("class", `${networkType}-border-line`);
    path.setAttribute("d", d);
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", `${width}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", dashArray);

    // Draw a thicker black path as the border
    const borderPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    borderPath.setAttribute("class", `${networkType}-line`);
    borderPath.setAttribute("d", d);
    borderPath.setAttribute("stroke", "black");
    borderPath.setAttribute("stroke-width", `${width/2}`);
    borderPath.setAttribute("fill", "none");
    borderPath.setAttribute("stroke-dasharray", dashArray);
    svg.appendChild(borderPath);

    // Append the colored curved line
    svg.appendChild(path);
}


// BATTLE STATUS callbacks
function updateHealthBar(units) {
    const healthBar = document.getElementById("healthBar");
    healthBar.innerHTML = ""; // Clear previous content

    // Aggregate health points by team
    const teamHealth = {};
    let totalHealth = 0;

    units.forEach(unit => {
        if (unit.health > 0) {
            if (!teamHealth[unit.team]) {
                teamHealth[unit.team] = 0;
            }
            teamHealth[unit.team] += unit.health;
            totalHealth += unit.health;
        }
    });

    // Create a section for each team
    Object.keys(teamHealth).forEach(team => {
        const healthPercentage = (teamHealth[team] / totalHealth) * 100;
        const teamSection = document.createElement("div");
        teamSection.classList.add("team-section");
        teamSection.style.width = `${healthPercentage}%`;

        // Set a color for each team
        if (teamColors[team]) {
            teamSection.style.backgroundColor = teamColors[team];
        }

        healthBar.appendChild(teamSection);
    });
}


// HOVER callbacks
function handleNodeHoverHighlightAccessibleUnitsNodes(event, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork) {
    let nodeId;
    let networksToUse = [];

    // Check if the hovered element is a node
    if (event.target.classList.contains('node')) {
        nodeId = parseInt(event.target.dataset.nodeId); // Get the ID of the hovered node
        networksToUse = [meleeNetwork]; // Use only the melee network for nodes
    } else {
        // If the hovered element is a unit, get the unit details
        const unitType = event.target.dataset.type; // Get the type of the hovered unit
        nodeId = parseInt(event.target.dataset.nodeId); // Get the ID of its node

        // Determine which networks to use based on unit type
        if (unitType === 'M') {
            networksToUse = [meleeNetwork];
        } else if (unitType === 'A') {
            networksToUse = [meleeNetwork, archerNetwork];
        } else if (unitType === 'F') {
            networksToUse = [meleeNetwork, flierNetwork];
        } else if (unitType === 'S') {
            networksToUse = [meleeNetwork, siegeNetwork];
        }
    }

    // Find and highlight all reachable nodes for each network
    networksToUse.forEach(network => {
        const accessibleNodes = network
            .filter(pair => pair[0] === nodeId || pair[1] === nodeId)
            .map(pair => (pair[0] === nodeId ? pair[1] : pair[0]));

        accessibleNodes.forEach(id => {
            // Check if there is a unit on the current node
            const unitOnNode = units.find(unit => unit.node === id);

            if (unitOnNode) {
                // If a unit is found, highlight the unit circle
                const unitCircleElement = document.querySelector(`[data-unit-id='${unitOnNode.id}']`);
                if (unitCircleElement) {
                    unitCircleElement.classList.add('highlight'); // Add highlight class to the unit circle
                }
            } else {
                // If no unit is found, highlight the node
                const nodeElement = document.querySelector(`[data-node-id='${id}']`);
                if (nodeElement) {
                    nodeElement.classList.add('highlight'); // Add highlight class to the node
                }
            }
        });
    });
}

function handleNodeLeaveHighlight() {
    // Remove highlight from all nodes
    document.querySelectorAll('.highlight').forEach(node => {
        node.classList.remove('highlight');
    });
}


// DRAG AND DROP callbacks
let draggedUnitId = null; // Variable to store the ID of the dragged unit --> THIS IS SHARED BETWEEN handleDragStart() and handleDrop()

function handleDragStart(event) {
    draggedUnitId = event.target.dataset.unitId; // Store the ID of the dragged unit
    event.dataTransfer.effectAllowed = "move";

    // Hide the hover text (tooltip)
    const tooltip = event.target.querySelector('.unit-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none'; // Hide the tooltip
}
}

function handleDragOver(event) {
    event.preventDefault(); // Allow dropping by preventing the default behavior
}

function handleDrop(event, nodes, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, nodeSize) {
    event.preventDefault();
    units = units.filter(u => u.health > 0);
    const targetNodeId = event.target.dataset.nodeId; // Get the ID of the node being dropped on (it can come from the node itself or from a unit that belongs to it)

    if (draggedUnitId && targetNodeId) {
        const draggedUnit = units.find(unit => unit.id == draggedUnitId);
        const draggedUnitNodeIdInt = parseInt(draggedUnit.node);
        const targetNodeIdInt = parseInt(targetNodeId);

        if (draggedUnit) {
            // Check if there is a unit already assigned to the target node
            const targetUnit = units.find(unit => unit.node === targetNodeIdInt); 

            if (targetUnit) {
                if (draggedUnit.team === targetUnit.team) {
                    // Swap the nodes
                    if (networkContainsConnection(meleeNetwork, draggedUnit.node, targetUnit.node) & networkContainsConnection(meleeNetwork, targetUnit.node, draggedUnit.node)){
                        const tempNode = draggedUnit.node;
                        draggedUnit.node = targetUnit.node;
                        targetUnit.node = tempNode;
                        writeToLog(`\nSwapped unit:${draggedUnit.id} <-> unit:${targetUnit.id}`);
                    } else {
                        writeToLog(`\nCannot swap unit:${draggedUnit.id} <-> unit:${targetUnit.id}`);
                    }
                } else {
                    // If not same team, combat
                    units = handleCombat(draggedUnit, targetUnit, draggedUnitNodeIdInt, targetNodeIdInt, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork)}
                
            } else {
                // If no unit is in the target node, simply move the dragged unit to the target node
                handleMoveDrag(draggedUnit, draggedUnitNodeIdInt, targetNodeIdInt, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork)
            }

            // Redraw the units to update their positions
            drawMobileElements(nodes, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, nodeSize);
        }
    }
}

function handleMoveDrag(u, x, y, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork) {
    console.log('handleMoveDrag')
    const draggedUnitIdInt = parseInt(u.id);
    if (networkContainsConnection(meleeNetwork, x, y)) {
        writeToLog(`\nmove unit ${draggedUnitIdInt} from node:${x} -> node:${y}`)
        u.node = y;
    } else if (u.type === 'F' && networkContainsConnection(flierNetwork, x, y)){
        writeToLog(`\nfly unit ${draggedUnitIdInt} from node:${x} -> node:${y}`)
        u.node = y
    } else {
        writeToLog(`cannot move unit ${draggedUnitIdInt} from node:${x} -> node:${y}`)
    }

    return networkContainsConnection(meleeNetwork, x, y);
}

function networkContainsConnection(network, x, y) {
    return network.some(pair => pair[0] === x && pair[1] === y);
}

// CLICK AND CLICK callbacks
let selectedUnitId = null; // Variable to store the ID of the selected unit
let clickedUnit = null;

// Function to handle click on a unit
function handleUnitClick(event, nodes, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, nodeSize) {
    units.filter(u => u.health > 0)
    // If a unit is already selected and the user clicks on another unit of the same team, swap positions
    if (selectedUnitId) {
        const clickedUnitId = event.target.dataset.unitId;
        clickedUnit = units.find(unit => unit.id == clickedUnitId);
        const selectedUnit = units.find(unit => unit.id == selectedUnitId);

        if (clickedUnit && selectedUnit) {
            if (selectedUnit.team === clickedUnit.team) {
                // Swap the nodes
                
                if (networkContainsConnection(meleeNetwork, selectedUnit.node, clickedUnit.node) & networkContainsConnection(meleeNetwork, clickedUnit.node, selectedUnit.node)){
                    const tempNode = selectedUnit.node;
                    selectedUnit.node = clickedUnit.node;
                    clickedUnit.node = tempNode;
                    writeToLog(`\nSwapped unit:${selectedUnit.id} <-> unit:${clickedUnit.id}`);
                } else {
                    writeToLog(`\Cannot swap unit:${selectedUnit.id} <-> unit:${clickedUnit.id}`);
                }
            } else {
                // Different teams: initiate combat
                units = handleCombat(selectedUnit, clickedUnit, selectedUnit.node, clickedUnit.node, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork);
            }
        }
        selectedUnitId = null; // Reset the selected unit after using it
    } else {
        // If no unit is selected, select this unit
        selectedUnitId = event.target.dataset.unitId;
        writeToLog(`\nSelected unit: ${selectedUnitId}`);
    }

    drawMobileElements(nodes, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, nodeSize);
}

// Function to handle click on a node
function handleNodeClick(event, nodes, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, nodeSize) {
    units = units.filter(u => u.health > 0);
    if (selectedUnitId) {
        const targetNodeId = parseInt(event.target.dataset.nodeId);
        const selectedUnit = units.find(unit => unit.id == selectedUnitId);

        if (selectedUnit) {
            // Check if there's another unit on the target node
            const targetUnit = units.find(unit => unit.node === targetNodeId);

            if (targetUnit) {
                // If there's a unit on the target node, handle combat or swapping
                if (selectedUnit.team === targetUnit.team) {
                    if (networkContainsConnection(meleeNetwork, selectedUnit.node, clickedUnit.node) & networkContainsConnection(meleeNetwork, clickedUnit.node, selectedUnit.node)){
                        // Friendly unit: swap nodes
                        const tempNode = selectedUnit.node;
                        selectedUnit.node = targetNodeId;
                        targetUnit.node = tempNode;
                        writeToLog(`\nSwapped unit:${selectedUnit.id} <-> unit:${targetUnit.id}`);
                    } else {
                        writeToLog(`\Cannot swap unit:${selectedUnit.id} <-> unit:${clickedUnit.id}`);
                    }
                    
                } else {
                    // Enemy unit: initiate combat
                    units = handleCombat(selectedUnit, targetUnit, selectedUnit.node, targetNodeId, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork);
                }
            } else {
                // No unit on the target node: move the selected unit
                handleMoveDrag(selectedUnit, selectedUnit.node, targetNodeId, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork);
            }

            selectedUnitId = null; // Reset the selected unit
            drawMobileElements(nodes, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, nodeSize);
        }
    }
}

// Add click event listeners to units and nodes
function addClickEventListeners() {
    const unitCircles = document.querySelectorAll(".unit-circle");
    unitCircles.forEach(circle => {
        circle.addEventListener("click", handleUnitClick);
    });

    const nodeElements = document.querySelectorAll(".node");
    nodeElements.forEach(node => {
        node.addEventListener("click", handleNodeClick);
    });
}



// COMBAT logic
function handleCombat(u, v, x, y, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork) {
    console.log('handleCombat')
    if (u.team === v.team) {
        writeToLog(`\nswap unit:${u.id} <-> unit:${v.id}`)
        const tempNode = u.node;
        u.node = v.node;
        v.node = tempNode;
        return units;
    }

    if (u.type === 'M') {
        writeToLog(`\nmelee attack unit:${u.id} -> unit:${v.id}`)
        units = handleMeleeDrag(u, v, x, y, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork)
    } else if (u.type === 'A') {
        writeToLog(`\nshoot unit:${u.id} -> unit:${v.id}`)
        units = handleArcherDrag(u, v, x, y, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork)
    } else if (u.type === 'F') {
        writeToLog(`\nflying attack unit:${u.id} -> unit:${v.id}`)
        units = handleFlierDrag(u, v, x, y, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork)
    } else if (u.type === 'S') {
        writeToLog(`\nshoot siege unit:${u.id} -> unit:${v.id}`)
        units = handleSiegeDrag(u, v, x, y, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork)
    } else {
        writeToLog(`\ncannot attack unit:${u.id} -> unit:${v.id}`)
    }

    console.log('filter health units')
    return units.filter(u => u.health > 0)
}

function handleMeleeDrag(u, v, x, y, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork) {
    console.log('handleMeleeDrag')
    if (networkContainsConnection(meleeNetwork, x, y)) {
        return handleMeleeCombat(u, v, x, y, units)
    } else {
        writeToLog('cannot attack')
        return units
    } 
}

function handleArcherDrag(u, v, x, y, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork) {
    console.log('handleArcherDrag')
    if (networkContainsConnection(meleeNetwork, x, y)) {
        return handleArcherCombat(u, v, x, y, units)
    } else if (networkContainsConnection(archerNetwork, x, y)) {
        return handleArcherCombat(u, v, x, y, units)
    } else {
        writeToLog('cannot attack')
        return units
    }
}

function handleFlierDrag(u, v, x, y, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork) {
    console.log('handleFlierDrag')
    if (networkContainsConnection(meleeNetwork, x, y)) {
        writeToLog('Flier attacks by land.')
        return handleMeleeCombat(u, v, x, y, units)
    } else if (networkContainsConnection(flierNetwork, x, y)){
        writeToLog('Flier attacks by air.')
        return handleMeleeCombat(u, v, x, y, units)
    } else {
        writeToLog('cannot attack')
        return units
    }
}

function handleSiegeDrag(u, v, x, y, units, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork) {
    console.log('handleSiegeDrag')
    if (networkContainsConnection(meleeNetwork, x, y)) {
        return handleSiegeCombat(u, v, x, y, units)
    } else if (networkContainsConnection(siegeNetwork, x, y)) {
        return handleSiegeCombat(u, v, x, y, units)
    } else {
        writeToLog('cannot attack')
        return units
    }
}

function handleMeleeCombat(attacker, defender, x, y, units){
    while (attacker.health > 0 && defender.health > 0) {
        // Attacker attacks first
        let damage = Math.max(1, attacker.attack_melee - defender.defense);
        defender.health -= damage;
        if (defender.health <= 0) {
            writeToLog(`Attacker wins with ${attacker.health} health left.`)
            // Defender is defeated: move attacker to node, remove defender, stop combat
            attacker.node = defender.node
            return units.filter(u => u.id !== defender.id);
        }

        // Defender attacks back
        damage = Math.max(1, defender.attack_melee - attacker.defense);
        attacker.health -= damage;
        if (attacker.health <= 0) {
            writeToLog(`Defender wins with ${defender.health} health left.`)
            // Attacker is defeated: remove attacker, stop combat
            return units.filter(u => u.id !== attacker.id);
        }
    }
}

function handleArcherCombat(attacker, defender, x, y, units){
    let damage = Math.max(1, attacker.attack_range - defender.defense);
    writeToLog(`Archer deals ${damage} damage.`)
    defender.health -= damage;
    if (defender.health <= 0) {
        writeToLog('Archer kills target.')
        // Defender is defeated
        units = units.filter(u => u.id !== defender.id);
    } else {
        writeToLog(`Target has ${defender.health} health left.`)
    }
    return units
}

function handleSiegeCombat(attacker, defender, x, y, units){
    let damage = Math.max(1, attacker.attack_range - defender.defense);
    writeToLog(`Siege deals ${damage} damage.`)
    defender.health -= damage;
    if (defender.health <= 0) {
        writeToLog('Siege kills target.')
        // Defender is defeated
        units = units.filter(u => u.id !== defender.id);
    } else {
        writeToLog(`Target has ${defender.health} health left.`)
    }
    return units
}

// Instructions Modal
document.getElementById("instructionsButton").addEventListener("click", function() {
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

document.getElementById("closeInstructionsModal").addEventListener("click", function() {
    document.getElementById("instructionsModal").style.display = "none";
});

// Map Info Modal
document.getElementById("mapInfoButton").addEventListener("click", function() {
    const modal = document.getElementById("mapInfoModal");
    const mapInfoText = document.getElementById("mapInfoText");

    // Fetch the HTML file and insert its content into the modal
    fetch(battleMapInfoHTML)
        .then(response => {
            console.log(battleMapInfoHTML)
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

document.getElementById("closeMapInfoModal").addEventListener("click", function() {
    document.getElementById("mapInfoModal").style.display = "none";
});


