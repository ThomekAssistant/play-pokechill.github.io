// Play.fun SDK Integration - Points every 10 seconds
(function() {
    'use strict';
    
    var GAME_ID = '7b292365-07da-45d3-805c-75c2ce5d117e';
    var sdk = null;
    var pointsInterval = null;
    var totalPoints = 0;
    
    function init() {
        console.log('[Play.fun] Starting initialization...');
        
        if (typeof window.PlayFunSDK === 'undefined') {
            console.log('[Play.fun] SDK not loaded yet, retrying in 1s...');
            setTimeout(init, 1000);
            return;
        }
        
        try {
            sdk = new window.PlayFunSDK({
                gameId: GAME_ID,
                ui: {
                    usePointsWidget: true,
                    position: 'bottom-right'
                }
            });
            
            sdk.init().then(function() {
                console.log('[Play.fun] ✓ SDK initialized successfully!');
                window.playFun = sdk;
                startPointsTimer();
            }).catch(function(err) {
                console.error('[Play.fun] ✗ Init error:', err);
            });
            
        } catch (e) {
            console.error('[Play.fun] ✗ Failed to create SDK:', e);
        }
    }
    
    function startPointsTimer() {
        console.log('[Play.fun] Starting 10-second points timer...');
        
        // Give points immediately on start
        givePoints();
        
        // Then every 10 seconds
        pointsInterval = setInterval(givePoints, 10000);
    }
    
    function givePoints() {
        if (!sdk) {
            console.log('[Play.fun] SDK not ready, skipping points');
            return;
        }
        
        try {
            var points = 10; // Points to give every 10 seconds
            sdk.addPoints(points);
            sdk.savePoints();
            
            totalPoints += points;
            var timestamp = new Date().toLocaleTimeString();
            
            console.log('[Play.fun] [' + timestamp + '] +' + points + ' points given (Total: ' + totalPoints + ')');
            
        } catch (e) {
            console.error('[Play.fun] Error giving points:', e);
        }
    }
    
    // Stop timer function (for debugging)
    window.stopPlayFunPoints = function() {
        if (pointsInterval) {
            clearInterval(pointsInterval);
            console.log('[Play.fun] Points timer stopped. Total given: ' + totalPoints);
        }
    };
    
    // Start
    setTimeout(init, 1000);
    
})();
