// Play.fun SDK Integration for Pokechill
// Simple setup - adds points for gameplay

(function() {
    'use strict';
    
    // Configuration
    const GAME_ID = '7b292365-07da-45d3-805c-75c2ce5d117e';
    let playFun = null;
    let isInitialized = false;
    let initAttempts = 0;
    const MAX_ATTEMPTS = 30; // 30 seconds max
    
    // Wait for external SDK script to load
    function waitForSDK() {
        return new Promise((resolve) => {
            const checkSDK = () => {
                initAttempts++;
                
                // Check for different possible global names
                if (typeof window.PlayFunSDK !== 'undefined') {
                    console.log('[Play.fun] SDK found (PlayFunSDK)');
                    resolve(window.PlayFunSDK);
                    return;
                }
                if (typeof window.PlayFun !== 'undefined') {
                    console.log('[Play.fun] SDK found (PlayFun)');
                    resolve(window.PlayFun);
                    return;
                }
                if (typeof window.Playdotfun !== 'undefined') {
                    console.log('[Play.fun] SDK found (Playdotfun)');
                    resolve(window.Playdotfun);
                    return;
                }
                
                if (initAttempts >= MAX_ATTEMPTS) {
                    console.error('[Play.fun] SDK failed to load after 30 seconds');
                    resolve(null);
                    return;
                }
                
                console.log('[Play.fun] Waiting for SDK... (' + initAttempts + '/' + MAX_ATTEMPTS + ')');
                setTimeout(checkSDK, 1000);
            };
            
            // Start checking
            checkSDK();
        });
    }
    
    // Initialize Play.fun SDK
    async function initPlayFun() {
        try {
            const SDK = await waitForSDK();
            
            if (!SDK) {
                console.error('[Play.fun] SDK not available');
                return;
            }
            
            playFun = new SDK({
                gameId: GAME_ID,
                ui: { 
                    usePointsWidget: true,
                    position: 'bottom-right'
                }
            });
            
            await playFun.init();
            isInitialized = true;
            
            console.log('[Play.fun] SDK initialized successfully!');
            showNotification('🎮 Play.fun connected! Earn points by playing!');
            
            // Setup game hooks after successful init
            setupGameHooks();
            
        } catch (error) {
            console.error('[Play.fun] Initialization failed:', error);
        }
    }
    
    // Add points wrapper
    async function addPoints(amount, reason) {
        if (!isInitialized || !playFun) {
            console.log('[Play.fun] Not initialized yet, cannot add points:', amount);
            return;
        }
        
        try {
            if (typeof playFun.addPoints === 'function') {
                playFun.addPoints(amount);
            }
            if (typeof playFun.savePoints === 'function') {
                await playFun.savePoints();
            }
            
            if (reason) {
                console.log('[Play.fun] +' + amount + ' points - ' + reason);
                showNotification('✨ +' + amount + ' points! ' + reason);
            }
        } catch (error) {
            console.error('[Play.fun] Failed to add points:', error);
        }
    }
    
    // Notification helper
    function showNotification(message) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #D4A853, #B8941F);
            color: #1A1A1A;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        notif.textContent = message;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
    
    // Hook into game events - only call if functions exist
    function setupGameHooks() {
        console.log('[Play.fun] Setting up game hooks...');
        
        // Hook for battle wins
        if (typeof window.winBattle === 'function') {
            const originalWinBattle = window.winBattle;
            window.winBattle = function() {
                const result = originalWinBattle.apply(this, arguments);
                addPoints(50, 'Battle won!');
                return result;
            };
        }
        
        // Hook for capturing Pokemon
        if (typeof window.catchPokemon === 'function') {
            const originalCatch = window.catchPokemon;
            window.catchPokemon = function() {
                const result = originalCatch.apply(this, arguments);
                if (result !== false) {
                    addPoints(100, 'Pokemon caught!');
                }
                return result;
            };
        }
        
        // Hook for leveling up
        if (typeof window.levelUpPokemon === 'function') {
            const originalLevelUp = window.levelUpPokemon;
            window.levelUpPokemon = function() {
                const result = originalLevelUp.apply(this, arguments);
                addPoints(25, 'Level up!');
                return result;
            };
        }
        
        console.log('[Play.fun] Game hooks installed');
    }
    
    // Manual points function for testing
    window.givePlayFunPoints = function(amount) {
        addPoints(amount, 'Bonus points!');
    };
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayFun);
    } else {
        initPlayFun();
    }
    
})();
