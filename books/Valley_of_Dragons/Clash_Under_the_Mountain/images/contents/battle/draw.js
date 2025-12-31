import { updateHealthBar, handleNodeHoverHighlightAccessibleUnitsNodes, handleNodeLeaveHighlight, handleDragStart, handleDragOver, handleDrop, handleClick, } from './callbacks.js';
import { drawNetworkConnections } from './networks.js';


const teamColors = {
    1: "green",
    2: "orange",
    3: "blueviolet",
    4: "lightseagreen",
    5: "lightgreen",
    6: "maroon"
};


// DRAW functions
export function drawAll(nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale, networkConfigs) {
    drawNodes(nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale)
    drawMobileElements(nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale)
    drawNetworkConnections(networkConfigs)
}

export function drawMobileElements(nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale) {
    units = units.filter(u => u.health > 0);
    drawUnits(nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale);
    drawUnitsTable(units);
    updateHealthBar(units, teamColors);

}

function drawNodes(nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale) {
    const existingNodes = document.querySelectorAll(".node");
    existingNodes.forEach(node => node.remove());
    nodes.forEach(node => {
        const div = document.createElement("div");
        div.classList.add("node");
        div.style.left = `${nodeXOffset + (node.x - 1) * nodeSize * nodeXScale}px`;
        div.style.top = `${nodeYOffset + (node.y - 1) * nodeSize * nodeYScale}px`;
        div.dataset.nodeId = node.id; // Assign the node ID as a data attribute

        // Create a tooltip to show unit details on hover
        const tooltip = document.createElement("div");
        tooltip.classList.add("node-tooltip");
        tooltip.innerHTML = `
            <strong>Node:</strong> ${node.id}<br>
            <strong>Coords:</strong> (${node.x},${node.y},${node.z})<br>
            <strong>Location:</strong> ${node.group_1 ?? ""} ${node.group_2 ?? ""} ${node.group_3 ?? ""}
        `;
        div.appendChild(tooltip);

        // Drag and drop callbacks
        div.addEventListener("dragover", handleDragOver);
        div.addEventListener("drop", (event) => { handleDrop(event, nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale); });
        div.addEventListener('mouseenter', (event) => { handleNodeHoverHighlightAccessibleUnitsNodes(event, units, unitTypes, meleeNetwork); });
        div.addEventListener('mouseleave', handleNodeLeaveHighlight);

        // Click and click callbacks
        div.addEventListener('click', (event) => { handleClick(event, nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale); });

        battlefield.appendChild(div);
    });
}

function drawUnits(nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale) {
    const existingUnits = document.querySelectorAll(".unit-circle");
    existingUnits.forEach(unit => unit.remove());
    units.forEach(unit => {
        const node = nodes.find(n => n.id === unit.node);
        if (!node) return; // Skip if the node is not found

        // Create the circular div for the unit
        const circle = document.createElement("div");
        circle.classList.add("unit-circle");
        circle.style.borderColor = unitTypes[unit.type]['color'];
        circle.textContent = unit.id;
        circle.setAttribute("draggable", "true"); // Make the unit circle draggable
        const teamNumber = parseInt(unit.team);
        if (teamColors[teamNumber]) {
            circle.style.backgroundColor = teamColors[teamNumber];
        }

        // Position the circle at the node's coordinates
        circle.style.left = `${nodeXOffset + (node.x - 1) * nodeSize * nodeXScale}px`;
        circle.style.top = `${nodeYOffset + (node.y - 1) * nodeSize * nodeYScale}px`;

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
            <strong>Node:</strong> ${node.id}<br>
            <strong>Coords:</strong> (${node.x}, ${node.y}, ${node.z})<br>
            <strong>Location:</strong> ${node.group_1 ?? ""} ${node.group_2 ?? ""} ${node.group_3 ?? ""}
        `;
        circle.appendChild(tooltip);
        battlefield.appendChild(circle); // Append the unit circle to the battlefield

        // Drag and drop callbacks
        circle.addEventListener('mouseenter', (event) => { handleNodeHoverHighlightAccessibleUnitsNodes(event, units, unitTypes, meleeNetwork); });
        circle.addEventListener('mouseleave', handleNodeLeaveHighlight);
        circle.addEventListener("dragstart", handleDragStart);
        circle.addEventListener("dragover", handleDragOver);
        circle.addEventListener("drop", (event) => { handleDrop(event, nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale); });


        // Click and click callback
        circle.addEventListener("click", (event) => { handleClick(event, nodes, units, unitTypes, meleeNetwork, nodeSize, nodeXOffset, nodeYOffset, nodeXScale, nodeYScale); });

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
