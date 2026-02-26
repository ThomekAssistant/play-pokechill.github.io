// Play.fun SDK Integration for Pokechill
// Auto-initializes using meta tag

(function() {
    'use strict';
    
    let playFun = null;
    let isInitialized = false;
    let checkInterval = null;
    
    // Wait for Play.fun SDK to be ready
    function init() {
        console.log('[Play.fun] Waiting for SDK...');
        
        checkInterval = setInterval(function() {
            // Check if Play.fun SDK loaded and initialized itself
            if (typeof window.playFun !== 'undefined' && window.playFun) {
                clearInterval(checkInterval);
                playFun = window.playFun;
                isInitialized = true;
                console.log('[Play.fun] SDK ready!');
                showNotification('🎮 Play.fun connected!');
                setupHooks();
            }
            // Or check for PlayFunSDK global
            else if (typeof window.PlayFunSDK !== 'undefined') {
                clearInterval(checkInterval);
                // SDK loaded but not initialized - meta tag will handle it
                console.log('[Play.fun] SDK found, waiting for auto-init...');
                setTimeout(function() {
                    if (typeof window.playFun !== 'undefined') {
                        playFun = window.playFun;
                        isInitialized = true;
                        console.log('[Play.fun] Auto-initialized!');
                        showNotification('🎮 Play.fun connected!');
                        setupHooks();
                    }
                }, 2000);
            }
        }, 500);
        
        // Stop checking after 30 seconds
        setTimeout(function() {
            if (!isInitialized) {
                clearInterval(checkInterval);
                console.log('[Play.fun] SDK not detected');
            }
        }, 30000);
    }
    
    // Add points
    function addPoints(amount, reason) {
        if (!isInitialized || !playFun) return;
        
        try {
            if (typeof playFun.addPoints === 'function') {
                playFun.addPoints(amount);
            }
            if (typeof playFun.savePoints === 'function') {
                playFun.savePoints();
            }
            if (reason) {
                console.log('[Play.fun] +' + amount + ' points: ' + reason);
            }
        } catch (e) {
            console.error('[Play.fun] Error:', e);
        }
    }
    
    // Notification
    function showNotification(msg) {
        var div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:20px;right:20px;background:#D4A853;color:#1A1A1A;padding:15px 20px;border-radius:10px;font-weight:600;z-index:10000;box-shadow:0 4px 15px rgba(0,0,0,0.3);';
        div.textContent = msg;
        document.body.appendChild(div);
        setTimeout(function() { div.remove(); }, 3000);
    }
    
    // Hook game functions
    function setupHooks() {
        console.log('[Play.fun] Installing hooks...');
        
        // Try to hook various game functions
        if (typeof window.winBattle === 'function') {
            var orig = window.winBattle;
            window.winBattle = function() {
                addPoints(50, 'Battle won!');
                return orig.apply(this, arguments);
            };
        }
        
        if (typeof window.catchPokemon === 'function') {
            var orig2 = window.catchPokemon;
            window.catchPokemon = function() {
                var result = orig2.apply(this, arguments);
                if (result !== false) addPoints(100, 'Pokemon caught!');
                return result;
            };
        }
    }
    
    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
