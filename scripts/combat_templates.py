# HTML templates for the combat system components

COMBAT_TEMPLATES = """
        <button id="fightEnemyBtn" class="game-fight-btn" style="display:none;" onclick="showGameUI()">🔮 Battle!</button>
        
        <!-- Game UI -->
        <div id="gameUIContainer" class="game-ui-overlay" style="display:none;">
            <div class="game-ui-panel">
                <div class="game-ui-header">
                    <div class="enemy-info-left">
                        <div class="name-info-row">
                            <h2 id="enemyName">Enemy</h2>
                            <button class="enemy-info-btn" onclick="toggleEnemyInfo(true)" title="Enemy Information">❔</button>
                            <button class="enemy-info-btn" onclick="showEnemyMatchupGuide()" title="Enemy Weaknesses Matchup">⛧</button>
                        </div>
                        <div class="enemy-stats">
                            <span class="stat-badge boss-badge" id="enemyLevelBadge" style="display:none;">Boss (+1)</span>
                            <span class="stat-badge phys-badge" id="enemyPhysicality">???</span>
                            <div id="enemyMagicBadges" class="enemy-magic-bagdes-container" style="display: flex; gap: 0.5rem;"></div>
                        </div>
                    </div>
                    <div class="game-ui-right-controls">
                        <div class="player-energy-display" id="playerEnergyCount" title="Your Energy">🧡 5</div>
                        <button class="guide-btn" onclick="toggleMatchupGuide()" title="Matchup Guide">📖</button>
                        <button class="game-close-btn" onclick="hideGameUI()" title="Close">&times;</button>
                    </div>
                </div>
                
                <div class="player-actions HUD-style">
                    <div class="action-row">
                        <div class="magic-btn-grid" id="magicTypeSelector">
                            <button class="magic-btn water" data-magic="Water" onclick="selectMagic('Water', this)"><span class="btn-icon">💧</span><span class="btn-label">Water</span></button>
                            <button class="magic-btn trees" data-magic="Trees" onclick="selectMagic('Trees', this)"><span class="btn-icon">🌳</span><span class="btn-label">Trees</span></button>
                            <button class="magic-btn earth" data-magic="Earth" onclick="selectMagic('Earth', this)"><span class="btn-icon">⛰️</span><span class="btn-label">Earth</span></button>
                            <button class="magic-btn sun" data-magic="Sun" onclick="selectMagic('Sun', this)"><span class="btn-icon">☀️</span><span class="btn-label">Sun</span></button>
                            <button class="magic-btn wind" data-magic="Wind" onclick="selectMagic('Wind', this)"><span class="btn-icon">💨</span><span class="btn-label">Wind</span></button>
                            <button class="magic-btn fire" data-magic="Fire" onclick="selectMagic('Fire', this)"><span class="btn-icon">🔥</span><span class="btn-label">Fire</span></button>
                            <button class="magic-btn lightning" data-magic="Lightning" onclick="selectMagic('Lightning', this)"><span class="btn-icon">⚡</span><span class="btn-label">Storm</span></button>
                            <button class="magic-btn lifeforce" data-magic="Lifeforce" onclick="selectMagic('Lifeforce', this)"><span class="btn-icon">✨</span><span class="btn-label">Life</span></button>
                        </div>

                        <div class="strength-slider-container">
                            <div class="strength-slider-header">
                                <span id="strengthLabel" class="strength-label">Medium</span>
                                <span id="strengthCost" class="strength-cost"></span>
                            </div>
                            <div class="strength-slider-input-wrapper">
                                <div class="strength-slider-track-bg"></div>
                                <div class="strength-marker-container">
                                    <span class="strength-marker"></span>
                                    <span class="strength-marker"></span>
                                    <span class="strength-marker"></span>
                                </div>
                                <input type="range" id="strengthSlider" class="strength-slider" min="1" max="3" step="1" value="2" oninput="updateStrengthFromSlider(this.value)">
                            </div>
                            <div class="strength-pips">
                                <div class="strength-pip"></div>
                                <div class="strength-pip"></div>
                                <div class="strength-pip"></div>
                            </div>
                        </div>
                    </div>

                    <div class="battle-actions">
                        <button id="executeAttackBtn" class="execute-btn" onclick="executeAttack()" disabled>Attack!</button>
                        <button id="fleeFightBtn" class="execute-btn flee-btn" onclick="fleeFight()">Flee (-1 🧡)</button>
                    </div>
                </div>
            </div>
            
            <div id="battleResult" class="battle-result-overlay" style="display:none;">
                <h1 id="resultTitle">Victory!</h1>
                <p id="resultDetails">Your attack was successful!</p>
                <button class="execute-btn" style="margin-top: 1rem;" onclick="continueBossFight()">Continue</button>
            </div>

            <!-- Enemy Info Overlay -->
            <div id="enemyInfoOverlay" class="matchup-guide-overlay info-overlay" style="display:none;">
                <div class="matchup-guide-content">
                    <h2 id="infoEnemyName">Enemy Info</h2>
                    <div id="enemyInfoContent" class="enemy-info-details">
                        <!-- Content injected via JS -->
                    </div>
                    <button class="result-continue-btn" onclick="toggleEnemyInfo(false)">Back to Battle</button>
                </div>
            </div>

            <!-- Matchup Guide Overlay -->
            <div id="matchupGuideOverlay" class="matchup-guide-overlay" style="display:none;">
                <div class="matchup-guide-content magic-circle-ui">
                    <h2>📖 Magic Matchups</h2>
                    <div id="magicCircleContainer" class="magic-circle-container">
                        <svg id="magicCircleSvg" class="magic-circle-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"></svg>
                        <div id="magicNodesContainer" class="magic-nodes-container"></div>
                    </div>
                    <button class="execute-btn" style="margin-top: 1.5rem;" onclick="toggleMatchupGuide()">Close Guide</button>
                </div>
            </div>
        </div>
"""
