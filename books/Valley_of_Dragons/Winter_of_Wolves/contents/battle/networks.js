
export function definenetworkConfigs(svg, nodes, nodeSize, nodeXOffset, nodeYOffset, checkboxMeleeNetwork, checkboxArcherNetwork, checkboxFlierNetwork, checkboxCavalryNetwork, checkboxSiegeNetwork, meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, cavalryNetwork) {
    // Create SVG element for lines
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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

    const drawingConfig = {
        svg: svg, nodes: nodes, nodeSize: nodeSize, nodeXOffset: nodeXOffset, nodeYOffset: nodeYOffset
    }


    const networkConfigs = {
        meleeNetwork: {
            checkbox: checkboxMeleeNetwork,
            svgConfig: {
                ...drawingConfig,
                networkType: "meleeNetwork",
                network: meleeNetwork,
                color: "red",
                width: nodeSize / 10,
                dashArray: "",
                curvedLine: false
            }
        },
        archerNetwork: {
            checkbox: checkboxArcherNetwork,
            svgConfig: {
                ...drawingConfig,
                networkType: "archerNetwork",
                network: archerNetwork,
                color: "green",
                width: nodeSize / 10,
                dashArray: "10,10",
                curvedLine: false
            }
        },
        flierNetwork: {
            checkbox: checkboxFlierNetwork,
            svgConfig: {
                ...drawingConfig,
                networkType: "flierNetwork",
                network: flierNetwork,
                color: "blue",
                width: nodeSize / 300,
                dashArray: "",
                curvedLine: true,
                focalPointX: focalPointX,
                focalPointY: focalPointY,
                curvatureStrength: 150
            }
        },
        cavalryNetwork: {
            checkbox: checkboxCavalryNetwork,
            svgConfig: {
                ...drawingConfig,
                networkType: "cavalryNetwork",
                network: cavalryNetwork,
                color: "yellow",
                width: nodeSize / 30,
                dashArray: "",
                curvedLine: true,
                focalPointX: focalPointX,
                focalPointY: focalPointY,
                curvatureStrength: 150
            }
        },
        siegeNetwork: {
            checkbox: checkboxSiegeNetwork,
            svgConfig: {
                ...drawingConfig,
                networkType: "siegeNetwork",
                network: siegeNetwork,
                color: "white",
                width: nodeSize / 150,
                dashArray: "",
                curvedLine: true,
                focalPointX: focalPointX,
                focalPointY: focalPointY,
                curvatureStrength: 150
            }
        }
    };
    return networkConfigs
}



export function drawNetworkConnections(networkConfigs) {
    Object.entries(networkConfigs).forEach(([key, value]) => updateDrawNetwork(key, value));
}

export function toggleNetwork(e, networkConfigs) {
    const network = e.target.id
    updateDrawNetwork(network, networkConfigs[network])
}


function updateDrawNetwork(network, networkConfig) {
    document.querySelectorAll(`.${network}-border-line`).forEach(line => line.remove());
    document.querySelectorAll(`.${network}-line`).forEach(line => line.remove());

    if (networkConfig['checkbox'].checked) {
        createConnections(networkConfig['svgConfig']);

    } else {
        document.querySelectorAll(`.${network}-border-line`).forEach(line => line.remove());
        document.querySelectorAll(`.${network}-line`).forEach(line => line.remove());
    }

}

function createConnections({ svg, nodes, nodeSize, nodeXOffset, nodeYOffset, networkType, network, color, width, dashArray, curvedLine, focalPointX, focalPointY, curvatureStrength }) {
    network.forEach(pair => {
        const node1 = nodes.find(node => node.id === pair[0]);
        const node2 = nodes.find(node => node.id === pair[1]);
        if (node1 && node2) {
            drawLine(svg, networkType,
                nodeXOffset + (node1.x - 1) * nodeSize + nodeSize / 2, nodeYOffset + (node1.y - 1) * nodeSize + nodeSize / 2,
                nodeXOffset + (node2.x - 1) * nodeSize + nodeSize / 2, nodeYOffset + (node2.y - 1) * nodeSize + nodeSize / 2,
                color, width, dashArray, curvedLine, focalPointX, focalPointY, curvatureStrength
            );
        }
    });
}

function drawLine(svg, networkType, x1, y1, x2, y2, color, width, dashArray, curvedLine = false, curvatureFocalPointX, curvatureFocalPointY, curvatureStrength) {
    if (curvedLine) {
        // If curvedLine is true, use the drawCurvedLine function
        drawCurvedLine(svg, networkType, x1, y1, x2, y2, color, width, dashArray, curvatureFocalPointX, curvatureFocalPointY, curvatureStrength);
    } else {

        // Draw a thicker black line as the border
        const borderLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        borderLine.setAttribute("class", `border-line ${networkType}-border-line`);
        borderLine.setAttribute("x1", x1);
        borderLine.setAttribute("y1", y1);
        borderLine.setAttribute("x2", x2);
        borderLine.setAttribute("y2", y2);
        borderLine.setAttribute("stroke", "black");
        borderLine.setAttribute("stroke-width", `${width}`);
        borderLine.setAttribute("stroke-linecap", "round");
        borderLine.setAttribute("stroke-dasharray", dashArray);
        svg.appendChild(borderLine);

        // Draw the colored line on top
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", `line ${networkType}-line`);
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", `${width / 2}`);
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
    path.setAttribute("class", `border-line ${networkType}-border-line`);
    path.setAttribute("d", d);
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", `${width}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", dashArray);

    // Draw a thicker black path as the border
    const borderPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    borderPath.setAttribute("class", `line ${networkType}-line`);
    borderPath.setAttribute("d", d);
    borderPath.setAttribute("stroke", "black");
    borderPath.setAttribute("stroke-width", `${width / 2}`);
    borderPath.setAttribute("fill", "none");
    borderPath.setAttribute("stroke-dasharray", dashArray);
    svg.appendChild(borderPath);

    // Append the colored curved line
    svg.appendChild(path);
}



