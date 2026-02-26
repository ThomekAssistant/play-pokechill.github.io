// Play.fun SDK Integration for Pokechill
// Simple setup - adds points for in-game actions

(function() {
    'use strict';
    
    // Configuration
    const GAME_ID = '32b55ac9-64d3-4534-9457-d7e7bfa16f36';
    let playFun = null;
    let isInitialized = false;
    
    // Initialize Play.fun SDK
    async function initPlayFun() {
        try {
            if (typeof PlayFunSDK === 'undefined') {
                console.log('[Play.fun] SDK not loaded yet, retrying in 1s...');
                setTimeout(initPlayFun, 1000);
                return;
            }
            
            playFun = new PlayFunSDK({
                gameId: GAME_ID,
                ui: { 
                    usePointsWidget: true,
                    position: 'bottom-right'
                }
            });
            
            await playFun.init();
            isInitialized = true;
            
            console.log('[Play.fun] SDK initialized successfully!');
            
            // Show welcome notification
            showNotification('🎮 Play.fun connected! Earn points by playing!');
            
        } catch (error) {
            console.error('[Play.fun] Initialization failed:', error);
        }
    }
    
    // Add points wrapper
    async function addPoints(amount, reason = '') {
        if (!isInitialized || !playFun) {
            console.log('[Play.fun] Not initialized, points not saved:', amount);
            return;
        }
        
        try {
            playFun.addPoints(amount);
            await playFun.savePoints();
            
            if (reason) {
                console.log(`[Play.fun] +${amount} points - ${reason}`);
                showNotification(`✨ +${amount} points! ${reason}`);
            }
        } catch (error) {
            console.error('[Play.fun] Failed to add points:', error);
        }
    }
    
    // Notification helper
    function showNotification(message) {
        // Create notification element
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
        
        // Remove after 3 seconds
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
    
    // Hook into game events
    function setupGameHooks() {
        // Hook for battle wins
        const originalWinBattle = window.winBattle;
        window.winBattle = function(...args) {
            const result = originalWinBattle ? originalWinBattle.apply(this, args) : undefined;
            addPoints(50, 'Battle won!');
            return result;
        };
        
        // Hook for capturing Pokemon
        const originalCatchPokemon = window.catchPokemon;
        window.catchPokemon = function(...args) {
            const result = originalCatchPokemon ? originalCatchPokemon.apply(this, args) : undefined;
            if (result !== false) {
                addPoints(100, 'Pokemon caught!');
            }
            return result;
        };
        
        // Hook for leveling up
        const originalLevelUp = window.levelUpPokemon;
        window.levelUpPokemon = function(...args) {
            const result = originalLevelUp ? originalLevelUp.apply(this, args) : undefined;
            addPoints(25, 'Level up!');
            return result;
        };
        
        // Hook for completing areas/dungeons
        const originalCompleteArea = window.completeArea;
        window.completeArea = function(...args) {
            const result = originalCompleteArea ? originalCompleteArea.apply(this, args) : undefined;
            addPoints(200, 'Area completed!');
            return result;
        };
        
        // Hook for evolving Pokemon
        const originalEvolve = window.evolvePokemon;
        window.evolvePokemon = function(...args) {
            const result = originalEvolve ? originalEvolve.apply(this, args) : undefined;
            addPoints(150, 'Pokemon evolved!');
            return result;
        };
        
        console.log('[Play.fun] Game hooks installed');
    }
    
    // Manual points function for testing
    window.givePlayFunPoints = function(amount) {
        addPoints(amount, 'Bonus points!');
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initPlayFun();
            setTimeout(setupGameHooks, 2000); // Wait for game to load
        });
    } else {
        initPlayFun();
        setTimeout(setupGameHooks, 2000);
    }
    
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
    
})();
