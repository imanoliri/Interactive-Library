/* MAGIC COMBAT SYSTEM LOGIC */

window.enemyMetadata = null;
window.currentEnemy = null;
window.playerAttack = { magic: null, strength: null, strengthPts: 0 };
window.playerEnergy = 5;
window.enemyState = { lives: 0, usedMagics: [] };
let popupTimeout = null;

const magicCounters = {
    'Water': ['Fire', 'Wind', 'Lightning'],
    'Fire': ['Trees', 'Undead'],
    'Trees': ['Earth'],
    'Earth': ['Lightning'],
    'Lightning': ['Water', 'Lifeforce'],
    'Sun': ['Darkness', 'Undead'],
    'Wind': ['Fire'],
    'Lifeforce': ['Undead', 'Darkness'],
    'Undead': ['Lifeforce']
};

async function loadEnemyMetadata() {
    try {
        const res = await fetch('enemy_metadata.json');
        if (res.ok) {
            window.enemyMetadata = await res.json();
            console.log("Enemy metadata loaded");
        }
    } catch (e) {
        // No metadata is fine
    }
}
loadEnemyMetadata();

function showGameUI() {
    if (!window.currentEnemy) return;

    if (window.playerEnergy <= 0) {
        return;
    }

    const pauseBtn = document.getElementById('modalSlideshowBtn');
    if (pauseBtn && pauseBtn.textContent === '⏹️') pauseBtn.click();

    document.getElementById('enemyName').textContent = window.currentEnemy.name;
    const enemyMagics = Array.isArray(window.currentEnemy.magicType) ? window.currentEnemy.magicType : [window.currentEnemy.magicType];
    const defaultConfig = {
        givesBonus: enemyMagics.map(() => true),
        givesWeakness: enemyMagics.map(() => true)
    };
    const config = window.currentEnemy.magicConfig || defaultConfig;

    const magicBadgeContainer = document.getElementById('enemyMagicBadges');
    if (magicBadgeContainer) {
        magicBadgeContainer.innerHTML = '';
        enemyMagics.forEach((type, idx) => {
            const b = config.givesBonus[idx];
            const w = config.givesWeakness[idx];
            let tooltip = "";
            let label = type;

            if (b && w) {
                tooltip = `${type}: The creature gets the Bonus and Weakness of this element.`;
            } else if (b && !w) {
                label += " (BONUS)";
                tooltip = `${type}: The creature gets the Bonus of this element.`;
            } else if (!b && w) {
                label += " (WEAKNESS)";
                tooltip = `${type}: The creature gets the Weakness of this element.`;
            } else {
                label += " (PASSIVE)";
                tooltip = `${type}: The creature gets no Bonus or Weakness from this element.`;
            }

            const span = document.createElement('span');
            span.className = 'stat-badge magic-badge';
            span.textContent = label;
            span.title = tooltip;
            magicBadgeContainer.appendChild(span);
        });
    }

    const physicality = window.currentEnemy.physicality;
    const physBadge = document.getElementById('enemyPhysicality');
    if (physBadge) {
        let pipsCount = 1;
        if (physicality === 'Medium') pipsCount = 2;
        else if (physicality === 'Heavy') pipsCount = 3;

        let pipsHtml = '<div class="phys-pips">';
        for (let i = 0; i < pipsCount; i++) pipsHtml += '<div class="phys-pip"></div>';
        pipsHtml += '</div>';
        physBadge.innerHTML = `<span>${physicality}</span>${pipsHtml}`;
    }

    const bossBadge = document.getElementById('enemyLevelBadge');
    if (bossBadge) {
        let textParts = [];
        if (window.currentEnemy.powerBonus) {
            textParts.push(`Power (+${window.currentEnemy.powerBonus})`);
        }
        if (window.enemyState && window.enemyState.lives > 1) {
            let hearts = '';
            for (let i = 0; i < window.enemyState.lives; i++) hearts += '♥️';
            textParts.push(hearts);
        }
        
        if (textParts.length > 0) {
            bossBadge.style.display = 'inline-block';
            bossBadge.textContent = textParts.join(' ');
        } else {
            bossBadge.style.display = 'none';
        }
    }

    document.getElementById('playerEnergyCount').textContent = `🧡 ${window.playerEnergy}`;

    document.querySelectorAll('.magic-btn').forEach(btn => {
        btn.classList.remove('selected', 'is-counter', 'is-threatened', 'is-double-edged');
        const magicType = btn.dataset.magic;

        let isStrategic = false;
        if (config.givesWeakness) {
            for (let i = 0; i < enemyMagics.length; i++) {
                if (config.givesWeakness[i] && magicCounters[magicType] && magicCounters[magicType].includes(enemyMagics[i])) {
                    isStrategic = true;
                    break;
                }
            }
        }

        let isThreatened = false;
        if (config.givesBonus) {
            for (let i = 0; i < enemyMagics.length; i++) {
                if (config.givesBonus[i] && magicCounters[enemyMagics[i]] && magicCounters[enemyMagics[i]].includes(magicType)) {
                    isThreatened = true;
                    break;
                }
            }
        }

        if (isStrategic && isThreatened) {
            btn.classList.add('is-double-edged');
        } else if (isStrategic) {
            btn.classList.add('is-counter');
        } else if (isThreatened) {
            btn.classList.add('is-threatened');
        }

        if (window.enemyState && window.enemyState.usedMagics && window.enemyState.usedMagics.includes(magicType)) {
            btn.disabled = true;
            btn.style.opacity = '0.3';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });

    document.getElementById('executeAttackBtn').disabled = true;
    document.querySelector('.game-ui-panel').style.display = 'flex';
    document.getElementById('battleResult').style.display = 'none';
    document.getElementById('gameUIContainer').style.display = 'flex';
}

function hideGameUI() {
    document.getElementById('gameUIContainer').style.display = 'none';
    document.getElementById('battleResult').style.display = 'none';
    const guide = document.getElementById('matchupGuideOverlay');
    if (guide) guide.style.display = 'none';
    const info = document.getElementById('enemyInfoOverlay');
    if (info) info.style.display = 'none';
    clearEnemyMatchupHighlights();
}

function selectMagic(magicType, btnEl) {
    window.playerAttack.magic = magicType;
    document.querySelectorAll('.magic-btn').forEach(btn => btn.classList.remove('selected'));
    btnEl.classList.add('selected');
    checkAttackReady();
}

function updateStrengthFromSlider(value) {
    const val = parseInt(value);
    let strengthStr = 'Medium';
    let pts = 2;

    if (val === 1) { strengthStr = 'Light'; pts = 1; }
    else if (val === 2) { strengthStr = 'Medium'; pts = 2; }
    else if (val === 3) { strengthStr = 'Heavy'; pts = 3; }

    window.playerAttack.strength = strengthStr;
    window.playerAttack.strengthPts = pts;

    const label = document.getElementById('strengthLabel');
    const cost = document.getElementById('strengthCost');
    if (label) label.textContent = (strengthStr === 'Light') ? 'Light 🔄' : strengthStr;
    if (cost) {
        cost.textContent = (strengthStr === 'Heavy') ? '(-1 🧡)' : '';
        cost.style.color = (strengthStr === 'Heavy') ? '#f87171' : 'transparent';
    }

    const pips = document.querySelectorAll('.strength-pips .strength-pip');
    pips.forEach((pip, index) => {
        if (index < val) pip.classList.add('active');
        else pip.classList.remove('active');
    });

    checkAttackReady();
}

function checkAttackReady() {
    if (window.playerAttack.magic && window.playerAttack.strength) {
        document.getElementById('executeAttackBtn').disabled = false;
    }
}

function executeAttack() {
    const enemy = window.currentEnemy;
    const player = window.playerAttack;

    let heavyCostText = '';
    if (player.strength === 'Heavy') {
        window.playerEnergy = Math.max(0, window.playerEnergy - 1);
        heavyCostText = ' (Cost 1 energy for Heavy)';
    }

    let enemyBase = 0;
    if (enemy.physicality === 'Light') enemyBase = 1;
    else if (enemy.physicality === 'Medium') enemyBase = 2;
    else if (enemy.physicality === 'Heavy') enemyBase = 3;

    let enemyPower = enemy.powerBonus || 0;
    let enemyAdv = 0;
    let playerBase = player.strengthPts;
    let playerAdv = 0;

    const enemyMagics = Array.isArray(enemy.magicType) ? enemy.magicType : [enemy.magicType];
    const defaultConfig = {
        strengthsCompound: true,
        weaknessesCompound: true,
        givesBonus: enemyMagics.map(() => true),
        givesWeakness: enemyMagics.map(() => true)
    };
    const config = enemy.magicConfig || defaultConfig;

    if (magicCounters[player.magic]) {
        for (let i = 0; i < enemyMagics.length; i++) {
            if (config.givesWeakness[i] && magicCounters[player.magic].includes(enemyMagics[i])) {
                playerAdv += 2;
                if (!config.weaknessesCompound) break;
            }
        }
    }

    for (let i = 0; i < enemyMagics.length; i++) {
        const em = enemyMagics[i];
        if (config.givesBonus[i] && magicCounters[em] && magicCounters[em].includes(player.magic)) {
            enemyAdv += 2;
            if (!config.strengthsCompound) break;
        }
    }

    const playerPts = playerBase + playerAdv;
    const enemyPts = enemyBase + enemyPower + enemyAdv;
    const popup = document.getElementById('battlePopup');
    const popupStatus = document.getElementById('popupStatus');
    const pScoreEl = document.getElementById('popupPlayerScore');
    const pBreakdownEl = document.getElementById('popupPlayerBreakdown');
    const eScoreEl = document.getElementById('popupEnemyScore');
    const eBreakdownEl = document.getElementById('popupEnemyBreakdown');
    const symbolEl = document.getElementById('popupSymbol');

    if (window.enemyState && window.enemyState.lives > 0 && player.strength !== 'Light') {
        if (!window.enemyState.usedMagics.includes(player.magic)) {
            window.enemyState.usedMagics.push(player.magic);
        }
    }

    const pBreakdown = `base ${playerBase}${playerAdv > 0 ? ` + ${playerAdv} bonus` : ''}`;
    const eBreakdown = `base ${enemyBase}${enemyPower > 0 ? ` + ${enemyPower} power` : ''}${enemyAdv > 0 ? ` + ${enemyAdv} bonus` : ''}`;

    const isVictory = (playerPts > enemyPts && window.enemyState.lives <= 1);
    
    if (playerPts > enemyPts) {
        if (window.enemyState.lives > 1) {
            window.enemyState.lives -= 1;
        } else {
            const energyReward = 1 + ((enemy.powerBonus || 0) * 2);
            window.playerEnergy += energyReward;
            if (window.enemyState) window.enemyState.lives = 0;
        }
    } else if (playerPts < enemyPts) {
        const diff = enemyPts - playerPts;
        const energyLost = diff >= 2 ? 2 : 1;
        window.playerEnergy = Math.max(0, window.playerEnergy - energyLost);
    }

    document.getElementById('playerEnergyCount').textContent = `🧡 ${window.playerEnergy}`;
    showGameUI();

    const isTotalDefeat = (window.playerEnergy === 0);

    if (isVictory || isTotalDefeat) {
        if (popupTimeout) clearTimeout(popupTimeout);
        popup.style.display = 'none';

        const resOver = document.getElementById('battleResult');
        const title = document.getElementById('resultTitle');
        const details = document.getElementById('resultDetails');
        
        document.querySelector('.game-ui-panel').style.display = 'none';
        resOver.style.display = 'flex';
        title.classList.remove('victory', 'defeat');
        const actionBtn = document.getElementById('resultActionBtn');

        if (isVictory) {
            const energyReward = 1 + ((enemy.powerBonus || 0) * 2);
            title.textContent = 'Victory!';
            title.classList.add('victory');
            details.textContent = `Your ${player.strength} ${player.magic} attack (${playerPts} pts) defeated the ${enemy.name} (${enemyPts} pts)! You gained ${energyReward} 🧡 and cleared the path.${heavyCostText}`;
            if (actionBtn) {
                actionBtn.textContent = 'Continue';
                actionBtn.onclick = continueBossFight;
            }
        } else {
            title.textContent = 'Defeat!';
            title.classList.add('defeat');
            details.textContent = `Your energy has been depleted. You have no more strength to continue this journey. Refresh the page to recover.`;
            if (actionBtn) {
                actionBtn.textContent = 'Refresh';
                actionBtn.onclick = () => location.reload();
            }
        }
    } else {
        if (popupTimeout) clearTimeout(popupTimeout);
        popup.classList.remove('success', 'draw', 'defeat', 'fade-out');
        popup.style.display = 'flex';
        
        pScoreEl.textContent = playerPts;
        pBreakdownEl.textContent = pBreakdown;
        eScoreEl.textContent = enemyPts;
        eBreakdownEl.textContent = eBreakdown;

        if (playerPts > enemyPts) {
            popup.classList.add('success');
            popupStatus.textContent = 'Hit!';
            symbolEl.textContent = '>';
            document.getElementById('popupEnergyChange').textContent = '0 🧡';
        } else if (playerPts === enemyPts) {
            popup.classList.add('draw');
            popupStatus.textContent = 'Draw';
            symbolEl.textContent = '=';
            document.getElementById('popupEnergyChange').textContent = '0 🧡';
        } else {
            popup.classList.add('defeat');
            popupStatus.textContent = 'Defeat';
            symbolEl.textContent = '<';
            
            const diff = enemyPts - playerPts;
            const energyLost = diff >= 2 ? 2 : 1;
            document.getElementById('popupEnergyChange').textContent = `-${energyLost} 🧡`;
        }
        
        popupTimeout = setTimeout(hideBattlePopup, 5000);
    }
}

function hideBattlePopup() {
    const popup = document.getElementById('battlePopup');
    if (!popup || popup.style.display === 'none') return;
    
    popup.classList.add('fade-out');
    setTimeout(() => {
        popup.style.display = 'none';
        popup.classList.remove('fade-out');
    }, 300);
}

function continueBossFight() {
    const isVictory = (window.enemyState && window.enemyState.lives === 0 && window.currentEnemy);

    document.getElementById('battleResult').style.display = 'none';
    
    if (isVictory) {
        hideGameUI();
        const fightBtn = document.getElementById('fightEnemyBtn');
        if (fightBtn) fightBtn.style.display = 'none';
        window.currentEnemy = null;
    } else {
        showGameUI();
    }
}

function fleeFight() {
    if (window.playerEnergy > 0) {
        window.playerEnergy -= 1;
        document.getElementById('playerEnergyCount').textContent = `🧡 ${window.playerEnergy}`;
        if (window.currentEnemy) {
            window.enemyState = { lives: window.currentEnemy.lives || 1, usedMagics: [] };
        }
        hideGameUI();
    } else {
        alert("You have no energy left to flee! You must fight.");
    }
}

function continueBossFight() {
    if (window.enemyState && window.enemyState.lives > 0) {
        showGameUI();
    } else {
        hideGameUI();
        const fightBtn = document.getElementById('fightEnemyBtn');
        if (fightBtn) fightBtn.style.display = 'none';
        window.currentEnemy = null;
    }
}

let magicCircleInitialized = false;

function toggleMatchupGuide() {
    const guideOverlay = document.getElementById('matchupGuideOverlay');
    if (!guideOverlay) return;
    const isShowing = (guideOverlay.style.display === 'none' || !guideOverlay.style.display);

    if (isShowing) {
        clearEnemyMatchupHighlights();
        const tagContainer = document.getElementById('tacticalTagsContainer');
        if (tagContainer) tagContainer.innerHTML = '';
        
        guideOverlay.style.display = 'flex';
        if (!magicCircleInitialized) {
            initMagicCircle();
            magicCircleInitialized = true;
        }
    } else {
        guideOverlay.style.display = 'none';
    }
}

function showEnemyMatchupGuide() {
    const enemy = window.currentEnemy;
    if (!enemy) return;

    const guideOverlay = document.getElementById('matchupGuideOverlay');
    if (!guideOverlay) return;

    // Toggle logic: If already showing, close it
    if (guideOverlay.style.display === 'flex') {
        guideOverlay.style.display = 'none';
        return;
    }

    // Open guide
    guideOverlay.style.display = 'flex';
    if (!magicCircleInitialized) {
        initMagicCircle();
        magicCircleInitialized = true;
    }

    // Reset previous highlights
    clearEnemyMatchupHighlights();

    const enemyMagics = Array.isArray(enemy.magicType) ? enemy.magicType : [enemy.magicType];
    const defaultConfig = {
        strengthsCompound: true,
        weaknessesCompound: true,
        givesBonus: enemyMagics.map(() => true),
        givesWeakness: enemyMagics.map(() => true)
    };
    const config = enemy.magicConfig || defaultConfig;

    const tagContainer = document.getElementById('tacticalTagsContainer');
    if (tagContainer) {
        tagContainer.innerHTML = '';
        let text = '';
        if (config.weaknessesCompound && config.strengthsCompound) {
            text = "Enemy's bonuses and weaknesses stack";
        } else if (config.weaknessesCompound) {
            text = "Enemy's weaknesses stack";
        } else if (config.strengthsCompound) {
            text = "Enemy's bonuses stack";
        }

        if (text) {
            tagContainer.innerHTML = `<div class="tactical-rule-text">${text}</div>`;
        }
    }

    const circleContainer = document.getElementById('magicCircleContainer');
    if (circleContainer) circleContainer.classList.add('has-active'); // Dim others

    const nodes = document.querySelectorAll('.magic-node');
    const arrows = document.querySelectorAll('.matchup-arrow');

    // Default: Color all lines as faded counters (using existing Green 'is-outgoing' + 'dimmed')
    arrows.forEach(arrow => {
        arrow.classList.add('is-outgoing', 'dimmed');
    });

    enemyMagics.forEach((type, idx) => {
        const node = Array.from(nodes).find(n => n.dataset.id === type);
        if (node) {
            node.classList.add('is-enemy-highlight'); // Orange tactical glow
            
            arrows.forEach(arrow => {
                // Incoming to enemy = Enemy Weakness = Player Advantage = Green (is-outgoing)
                if (arrow.dataset.target === type) {
                    arrow.classList.remove('is-incoming'); // Ensure no stale Red
                    arrow.classList.add('is-outgoing'); // Green
                    
                    if (config.givesWeakness[idx]) {
                        arrow.classList.remove('dimmed');
                        const sourceNode = Array.from(nodes).find(n => n.dataset.id === arrow.dataset.source);
                        if (sourceNode) sourceNode.classList.add('is-target-out'); // Highlight as player advantage
                    }
                }
                
                // Outgoing from enemy = Enemy Bonus = Player Threat = Red (is-incoming)
                if (arrow.dataset.source === type) {
                    arrow.classList.remove('is-outgoing'); // Swap from default Green
                    arrow.classList.add('is-incoming'); // Red
                    
                    if (config.givesBonus[idx]) {
                        arrow.classList.remove('dimmed');
                        const targetNode = Array.from(nodes).find(n => n.dataset.id === arrow.dataset.target);
                        if (targetNode) targetNode.classList.add('is-target-in'); // Highlight as threat
                    }
                }
            });
        }
    });
}

function clearEnemyMatchupHighlights() {
    const circleContainer = document.getElementById('magicCircleContainer');
    if (circleContainer) circleContainer.classList.remove('has-active');

    document.querySelectorAll('.magic-node').forEach(node => {
        node.classList.remove('active', 'is-target-in', 'is-target-out', 'is-double-edged', 'is-enemy-highlight');
    });

    document.querySelectorAll('.matchup-arrow').forEach(arrow => {
        arrow.classList.remove('is-incoming', 'is-outgoing', 'dimmed');
    });

    const tagContainer = document.getElementById('tacticalTagsContainer');
    if (tagContainer) tagContainer.innerHTML = '';
}

function initMagicCircle() {
    const container = document.getElementById('magicNodesContainer');
    const svg = document.getElementById('magicCircleSvg');
    if (!container || !svg) return;

    const nodes = [
        { id: 'Water', label: 'Water', emoji: '💧' },
        { id: 'Fire', label: 'Fire', emoji: '🔥' },
        { id: 'Trees', label: 'Trees', emoji: '🌳' },
        { id: 'Earth', label: 'Earth', emoji: '⛰️' },
        { id: 'Lightning', label: 'Storm', emoji: '⚡' },
        { id: 'Wind', label: 'Wind', emoji: '💨' },
        { id: 'Lifeforce', label: 'Life', emoji: '✨' },
        { id: 'Sun', label: 'Sun', emoji: '☀️' },
        { id: 'Darkness', label: 'Darkness', emoji: '🌑' },
        { id: 'Undead', label: 'Undead', emoji: '💀' }
    ];

    const centerX = 50, centerY = 50, radius = 35;
    const nodeElements = {};

    svg.innerHTML = `
        <defs>
            <marker id="arrowhead-default" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="rgba(255, 255, 255, 1.0)" />
            </marker>
            <marker id="arrowhead-out" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#22c55e" />
            </marker>
            <marker id="arrowhead-in" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#ef4444" />
            </marker>
        </defs>
    `;

    nodes.forEach((node, i) => {
        const angle = (i * (360 / nodes.length) - 90) * (Math.PI / 180);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const el = document.createElement('div');
        el.className = 'magic-node';
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.dataset.id = node.id;
        el.innerHTML = `<span class="node-emoji">${node.emoji}</span><span class="node-label">${node.label}</span>`;
        container.appendChild(el);
        nodeElements[node.id] = { x, y, el };
    });

    const nodeEl = container.querySelector('.magic-node');
    const containerWidth = container.offsetWidth || 500;
    const nodeWidth = nodeEl ? nodeEl.offsetWidth : 60;
    const dynamicOffset = (nodeWidth / 2 / containerWidth) * 100;
    const arrowMargin = 0.5;
    const offset = dynamicOffset + arrowMargin;

    const arrows = [];
    Object.entries(magicCounters).forEach(([sourceId, targets]) => {
        const source = nodeElements[sourceId];
        if (!source) return;
        targets.forEach(targetId => {
            const target = nodeElements[targetId];
            if (!target) return;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'matchup-arrow');
            path.dataset.source = sourceId;
            path.dataset.target = targetId;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const x1 = source.x + (dx * offset / dist);
            const y1 = source.y + (dy * offset / dist);
            const x2 = target.x - (dx * offset / dist);
            const y2 = target.y - (dy * (offset + 1.2) / dist);
            path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
            svg.appendChild(path);
            arrows.push(path);
        });
    });

    window.addEventListener('resize', () => {
        const guide = document.getElementById('matchupGuideOverlay');
        if (guide && guide.style.display === 'flex') {
            const newContainerWidth = container.offsetWidth;
            const newNodeWidth = nodeEl.offsetWidth;
            const newOffset = (newNodeWidth / 2 / newContainerWidth) * 100 + arrowMargin;
            arrows.forEach(arrow => {
                const s = nodeElements[arrow.dataset.source];
                const t = nodeElements[arrow.dataset.target];
                const dxx = t.x - s.x;
                const dyy = t.y - s.y;
                const d = Math.sqrt(dxx * dxx + dyy * dyy);
                const nx1 = s.x + (dxx * newOffset / d);
                const ny1 = s.y + (dyy * newOffset / d);
                const nx2 = t.x - (dxx * newOffset / d);
                const ny2 = t.y - (dyx * (newOffset + 1.2) / d);
                arrow.setAttribute('d', `M ${nx1} ${ny1} L ${nx2} ${ny2}`);
            });
        }
    }, { passive: true });

    const circleContainer = document.getElementById('magicCircleContainer');
    Object.values(nodeElements).forEach(nodeData => {
        const el = nodeData.el;
        const id = el.dataset.id;
        el.addEventListener('mouseenter', () => {
            circleContainer.classList.add('has-active');
            el.classList.add('active');
            arrows.forEach(arrow => {
                if (arrow.dataset.source === id) {
                    arrow.classList.add('is-outgoing');
                    nodeElements[arrow.dataset.target].el.classList.add('is-target-out');
                } else if (arrow.dataset.target === id) {
                    arrow.classList.add('is-incoming');
                    nodeElements[arrow.dataset.source].el.classList.add('is-target-in');
                } else arrow.classList.add('dimmed');
            });
        });
        el.addEventListener('mouseleave', () => {
            circleContainer.classList.remove('has-active');
            el.classList.remove('active');
            arrows.forEach(arrow => arrow.classList.remove('is-outgoing', 'is-incoming', 'dimmed'));
            Object.values(nodeElements).forEach(n => n.el.classList.remove('is-target-out', 'is-target-in'));
        });
    });
}

function toggleEnemyInfo(show) {
    const overlay = document.getElementById('enemyInfoOverlay');
    if (!overlay) return;
    if (show) {
        const enemy = window.currentEnemy;
        const infoTitle = document.getElementById('infoEnemyName');
        const infoContent = document.getElementById('enemyInfoContent');
        infoTitle.textContent = enemy.name;
        const enemyMagics = Array.isArray(enemy.magicType) ? enemy.magicType : [enemy.magicType];
        const defaultConfig = { strengthsCompound: true, weaknessesCompound: true, givesBonus: enemyMagics.map(() => true), givesWeakness: enemyMagics.map(() => true) };
        const config = enemy.magicConfig || defaultConfig;
        let html = '';
        if (enemy.description) html += `<div class="dossier-lore">${enemy.description}</div>`;
        html += `<div class="dossier-grid"><div class="dossier-stat-card"><span class="dossier-label">🛡️ Physicality</span><span class="dossier-value">${enemy.physicality}</span></div><div class="dossier-stat-card"><span class="dossier-label">⭐ Power Bonus</span><span class="dossier-value">+${enemy.powerBonus || 0}</span></div></div>`;
        html += `<div class="dossier-section"><div class="dossier-section-title">Elemental Types</div><div class="dossier-badges-list">`;
        enemyMagics.forEach((type, idx) => {
            const b = config.givesBonus[idx], w = config.givesWeakness[idx];
            let description = (b && w) ? "Bonus & Weakness" : b ? "Bonus" : w ? "Weakness" : "Passive";
            html += `<div class="dossier-badge-row" style="display: flex; align-items: center; gap: 1rem; padding: 0.6rem;"><span class="stat-badge magic-badge" style="min-width: 90px; text-align: center;">${type}</span><span class="dossier-badge-role" style="font-size: 0.85rem; color: #cbd5e1;">${description}</span></div>`;
        });
        html += `</div></div>`;
        html += `<div class="dossier-section"><div class="dossier-section-title">Interaction Rules</div><div class="dossier-rules-box"><div class="rule-pill ${config.weaknessesCompound ? 'active' : 'inactive'}"><span>Stacking Weakness</span><span class="rule-toggle">${config.weaknessesCompound ? 'YES' : 'NO'}</span></div><div class="rule-pill ${config.strengthsCompound ? 'active' : 'inactive'}"><span>Stacking Bonus</span><span class="rule-toggle">${config.strengthsCompound ? 'YES' : 'NO'}</span></div></div></div>`;
        infoContent.innerHTML = html;
        overlay.style.display = 'flex';
    } else overlay.style.display = 'none';
}

// Keyboard Shortcuts for Combat
document.addEventListener('keydown', (e) => {
    const gameUI = document.getElementById('gameUIContainer');
    if (!gameUI || gameUI.style.display === 'none') return;

    // Ignore if user is typing elsewhere
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // But allow if it's our own slider
        if (e.target.id !== 'strengthSlider') return;
    }

    const key = e.key.toLowerCase();

    // Magic Type Shortcuts: w=water, t=trees, e=earth, s=sun, d=wind, f=fire, r=storm, l=life
    const magicKeys = {
        'w': 'Water',
        't': 'Trees',
        'e': 'Earth',
        's': 'Sun',
        'd': 'Wind',
        'f': 'Fire',
        'r': 'Lightning',
        'l': 'Lifeforce'
    };

    if (magicKeys[key]) {
        e.preventDefault();
        const type = magicKeys[key];
        const btn = document.querySelector(`.magic-btn[data-magic="${type}"]`);
        if (btn && !btn.disabled) {
            selectMagic(type, btn);
        }
    }

    // Power Level Shortcuts: 1-3
    if (['1', '2', '3'].includes(key)) {
        e.preventDefault();
        const slider = document.getElementById('strengthSlider');
        if (slider) {
            slider.value = key;
            updateStrengthFromSlider(key);
        }
    }

    // Action Shortcuts: Enter to Attack, Q to Quit, G/M for Guides, I for Info
    if (key === 'q') {
        e.preventDefault();
        hideGameUI();
    } else if (key === 'g') {
        e.preventDefault();
        showEnemyMatchupGuide();
    } else if (key === 'm') {
        e.preventDefault();
        toggleMatchupGuide();
    } else if (key === 'i') {
        e.preventDefault();
        const infoOverlay = document.getElementById('enemyInfoOverlay');
        const isShowing = infoOverlay && infoOverlay.style.display !== 'none';
        toggleEnemyInfo(!isShowing);
    } else if (e.key === 'Enter') {
        const attackBtn = document.getElementById('executeAttackBtn');
        const battleResult = document.getElementById('battleResult');
        
        // If attack button is enabled and we are not showing a result
        if (attackBtn && !attackBtn.disabled && (!battleResult || battleResult.style.display === 'none')) {
            e.preventDefault();
            executeAttack();
        } else if (battleResult && battleResult.style.display !== 'none') {
            // If showing result, Enter can trigger the result action button
            const actionBtn = document.getElementById('resultActionBtn');
            if (actionBtn) {
                e.preventDefault();
                actionBtn.click();
            }
        }
    }
});
