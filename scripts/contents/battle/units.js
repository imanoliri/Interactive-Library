

export function defineUnitTypes(meleeNetwork, archerNetwork, flierNetwork, siegeNetwork, cavalryNetwork) {
    return {
        M: { name: 'melee', color: 'red', movementNetworks: [meleeNetwork], attackNetworks: [meleeNetwork], combatHandler: handleMeleeCombat, verb: 'attacks' },
        A: { name: 'archer', color: 'green', movementNetworks: [meleeNetwork], attackNetworks: [meleeNetwork, archerNetwork], combatHandler: handleArcherCombat, verb: 'shoots' },
        S: { name: 'siege', color: 'white', movementNetworks: [meleeNetwork], attackNetworks: [meleeNetwork, archerNetwork, siegeNetwork], combatHandler: handleSiegeCombat, verb: 'shoots' },
        R: { name: 'monster', color: 'plum', movementNetworks: [meleeNetwork], attackNetworks: [meleeNetwork], combatHandler: handleMonsterCombat, verb: 'attacks' },
        V: { name: 'cavalry', color: 'yellow', movementNetworks: [meleeNetwork, cavalryNetwork], attackNetworks: [meleeNetwork, cavalryNetwork], combatHandler: handleCavalryCombat, verb: 'charges' },
        F: { name: 'flier', color: 'blue', movementNetworks: [meleeNetwork, flierNetwork], attackNetworks: [meleeNetwork, flierNetwork], combatHandler: handleMeleeCombat, verb: 'attacks' },
        P: { name: 'passive', color: 'peru', movementNetworks: [meleeNetwork], attackNetworks: null, combatHandler: null, verb: '' }
    }
}


function writeToLog(message) {
    logTextbox.value = `${logTextbox.value}\n${message}`;
    logTextbox.scrollTop = logTextbox.scrollHeight;
}

// MOVEMENT logic
export function handleMove(u, x, y, unitTypes) {
    console.log('handleMove')
    if (unitCanMove(u, x, y, unitTypes)) {
        writeToLog(`${u.name} ${u.id} moves\n\t${x} -> ${y}`)
        u.node = y;
    } else {
        writeToLog(`${u.name} ${u.id} cannot move\n\t${x} -> ${y}`)
    }
}


export function handleSwap(u, v, unitTypes) {
    if (unitCanMove(u, u.node, v.node, unitTypes) & unitCanMove(v, v.node, u.node, unitTypes)) {
        const tempNode = u.node;
        u.node = v.node;
        v.node = tempNode;
        writeToLog(`Swapped units:\n\t${u.id} <-> ${v.id}`);
    } else {
        writeToLog(`Cannot swap units:\n\t${u.id} <-> ${v.id}`);
    }
}
function unitCanMove(u, x, y, unitTypes) {
    for (const movementNetwork of unitTypes[u.type]["movementNetworks"]) {
        if (networkContainsConnection(movementNetwork, x, y)) {
            return true
        }
    }
    return false
}

function networkContainsConnection(network, x, y) {
    return network.some(pair => pair[0] === x && pair[1] === y);
}



// COMBAT logic
export function handleCombat(u, v, x, y, units, unitTypes) {
    console.log('handleCombat')
    writeToLog(`${u.name} ${u.id} ${unitTypes[u.type]["verb"]} ${v.name} ${v.id}`)

    if (unitCanAttack(u, x, y, unitTypes)) {
        unitTypes[u.type]["combatHandler"](u, v)
        return units.filter(u => u.health > 0)
    } else {
        writeToLog('cannot attack')
        return units
    }
}

function unitCanAttack(u, x, y, unitTypes) {
    if (unitTypes[u.type]["combatHandler"] === null) {
        return false
    }
    for (const attackNetwork of unitTypes[u.type]["attackNetworks"]) {
        if (attackNetwork === null) {
            return false
        }
        if (networkContainsConnection(attackNetwork, x, y)) {
            return true
        }
    }
    return false
}

function handleMeleeCombat(attacker, defender) {

    const maxAttacks = 3
    let performedAttacks = 0
    let minDamagePerAttack = 1
    if (defender.type === 'P') {
        minDamagePerAttack = 0
    }
    writeToLog(`\t${attacker.health} vs ${defender.health}`)
    while (performedAttacks < maxAttacks && attacker.health > 0 && defender.health > 0) {
        // Attacker attacks first
        let damage = Math.max(1, attacker.attack_melee - defender.defense);
        defender.health = Math.max(0, defender.health - damage);
        if (defender.health <= 0) {
            writeToLog(`\t${attacker.health} vs ${defender.health} --> Attacker wins`)
            // Defender is defeated: move attacker to node, stop combat
            attacker.node = defender.node
            return
        }

        // Defender attacks back
        damage = Math.max(minDamagePerAttack, defender.attack_melee - attacker.defense);
        attacker.health = Math.max(0, attacker.health - damage);
        if (attacker.health <= 0) {
            writeToLog(`\t${attacker.health} vs ${defender.health} --> Defender wins`)
            // Attacker is defeated: stop combat
            return
        }
        writeToLog(`\t${attacker.health} vs ${defender.health}`)
        performedAttacks += 1
    }
}

function handleArcherCombat(attacker, defender) {
    writeToLog(`\t${attacker.health} vs ${defender.health}`)
    let damage = Math.max(1, attacker.attack_range - defender.defense);
    defender.health = Math.max(0, defender.health - damage);
    if (defender.health <= 0) {
        writeToLog(`\t${attacker.health} vs ${defender.health} --> Archer kills target`)
    } else {
        writeToLog(`\t${attacker.health} vs ${defender.health}`)
    }
}

function handleSiegeCombat(attacker, defender) {
    writeToLog(`\t${attacker.health} vs ${defender.health}`)
    let damage = Math.max(1, attacker.attack_range - defender.defense);
    defender.health = Math.max(0, defender.health - damage);
    if (defender.health <= 0) {
        writeToLog(`\t${attacker.health} vs ${defender.health} --> Siege kills target`)
    } else {
        writeToLog(`\t${attacker.health} vs ${defender.health}`)
    }
}

function handleMonsterCombat(attacker, defender) {
    writeToLog(`\t${attacker.health} vs ${defender.health}`)
    attacker.health += 1;
    defender.health -= 1;
    writeToLog(`\tMonster eats 1 health from defender.`)
    handleMeleeCombat(attacker, defender)
}


function handleCavalryCombat(attacker, defender) {
    writeToLog(`\t${attacker.health} vs ${defender.health}`)
    defender.health = Math.max(0, defender.health - attacker.attack_melee);
    // Defender killed with first attack
    if (defender.health <= 0) {
        writeToLog(`\t${attacker.health} vs ${defender.health} --> Cavalry kills target during charge`)
        // Defender is defeated: move attacker to node, stop combat
        attacker.node = defender.node
        return
    }
    handleMeleeCombat(attacker, defender)
}