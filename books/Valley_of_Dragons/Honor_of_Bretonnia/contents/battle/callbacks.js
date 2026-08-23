import { drawMobileElements } from './draw.js'
import { handleMove, handleSwap, handleCombat } from './units.js';



// BATTLE STATUS callbacks
export function updateHealthBar(units, teamColors) {
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
export function handleNodeHoverHighlightAccessibleUnitsNodes(event, units, unitTypes, meleeNetwork) {
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
        const moveNetworks = unitTypes[unitType]["movementNetworks"]
        const attackNetworks = unitTypes[unitType]["attackNetworks"]
        networksToUse = [...moveNetworks === null ? [] : moveNetworks, ...attackNetworks === null ? [] : attackNetworks]
    }

    // Find and highlight all reachable nodes for each network
    networksToUse.forEach(network => {
        const accessibleNodes = network.filter(pair => pair[0] === nodeId).map(pair => (pair[0] === nodeId ? pair[1] : pair[0]));

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

export function handleNodeLeaveHighlight() {
    // Remove highlight from all nodes
    document.querySelectorAll('.highlight').forEach(node => {
        node.classList.remove('highlight');
    });
}


// DRAG AND DROP callbacks
let draggedUnitId = null; // Variable to store the ID of the dragged unit --> THIS IS SHARED BETWEEN handleDragStart() and handleDrop()

export function handleDragStart(event) {
    draggedUnitId = parseInt(event.target.dataset.unitId); // Store the ID of the dragged unit
    event.dataTransfer.effectAllowed = "move";

    // Hide the hover text (tooltip)
    const tooltip = event.target.querySelector('.unit-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none'; // Hide the tooltip
    }
}

export function handleDragOver(event) {
    event.preventDefault(); // Allow dropping by preventing the default behavior
}

export function handleDrop(event, nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale) {
    event.preventDefault();
    handleUnitAction(draggedUnitId, parseInt(event.target.dataset.nodeId), nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale)
}

// CLICK AND CLICK callbacks
let selectedUnitId = null; // Variable to store the ID of the selected unit

// Function to handle click on a unit
export function handleClick(event, nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale) {
    // If a unit is already selected, the clicked unit is the target unit
    if (selectedUnitId) {
        handleUnitAction(selectedUnitId, parseInt(event.target.dataset.nodeId), nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale)
        selectedUnitId = null; // Reset the selected unit after using it
    } else {
        // If no unit is selected, select the clicked unit
        selectedUnitId = parseInt(event.target.dataset.unitId);
        writeToLog(`\nSelected unit: ${selectedUnitId}`);
    }
}


function writeToLog(message) {
    logTextbox.value = `${logTextbox.value}\n${message}`;
    logTextbox.scrollTop = logTextbox.scrollHeight;
}

function handleUnitAction(actionUnitId, targetNodeId, nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale) {

    units = units.filter(u => u.health > 0);
    const actionUnit = units.find(unit => unit.id === actionUnitId);

    // get target unit from target Node
    const targetUnit = units.find(unit => unit.node === targetNodeId);

    // If there's a target unit, handle combat or swapping
    if (targetUnit) {
        if (actionUnit.team === targetUnit.team) {
            // Swap the units
            handleSwap(actionUnit, targetUnit, unitTypes)
        } else {
            // Enemy unit: initiate combat
            units = handleCombat(actionUnit, targetUnit, actionUnit.node, targetUnit.node, units, unitTypes);
        }
    } else if (targetNodeId) {
        // If there is a target node, and no target unit on it, move unit
        handleMove(actionUnit, actionUnit.node, targetNodeId, unitTypes);
    }
    drawMobileElements(nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale)

}
