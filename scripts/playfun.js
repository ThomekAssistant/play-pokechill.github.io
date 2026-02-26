// Play.fun SDK Integration - Manual Init
(function() {
    'use strict';
    
    var GAME_ID = '7b292365-07da-45d3-805c-75c2ce5d117e';
    var sdk = null;
    
    function init() {
        console.log('[Play.fun] Starting manual init...');
        
        // Check if SDK script loaded
        if (typeof window.PlayFunSDK === 'undefined') {
            console.log('[Play.fun] SDK script not loaded yet, retrying...');
            setTimeout(init, 1000);
            return;
        }
        
        try {
            // Manual initialization
            sdk = new window.PlayFunSDK({
                gameId: GAME_ID,
                ui: {
                    usePointsWidget: true,
                    position: 'bottom-right'
                }
            });
            
            sdk.init().then(function() {
                console.log('[Play.fun] SDK initialized!');
                window.playFun = sdk; // Make it global
                setupHooks();
            }).catch(function(err) {
                console.error('[Play.fun] Init error:', err);
            });
            
        } catch (e) {
            console.error('[Play.fun] Failed to create SDK:', e);
        }
    }
    
    function addPoints(amount, reason) {
        if (!sdk) return;
        try {
            sdk.addPoints(amount);
            sdk.savePoints();
            console.log('[Play.fun] +' + amount + ' points: ' + reason);
        } catch (e) {
            console.error('[Play.fun] Error adding points:', e);
        }
    }
    
    function setupHooks() {
        console.log('[Play.fun] Setting up hooks...');
        
        if (typeof window.winBattle === 'function') {
            var orig = window.winBattle;
            window.winBattle = function() {
                addPoints(50, 'Battle won!');
                return orig.apply(this, arguments);
            };
        }
        
        if (typeof window.catchPokemon === 'function') {
            var orig = window.catchPokemon;
            window.catchPokemon = function() {
                var result = orig.apply(this, arguments);
                if (result !== false) addPoints(100, 'Pokemon caught!');
                return result;
            };
        }
    }
    
    // Start
    setTimeout(init, 1000);
    
})();
