// Play.fun SDK Integration - Debug version
(function() {
    'use strict';
    
    var GAME_ID = '7b292365-07da-45d3-805c-75c2ce5d117e';
    
    function checkSDK() {
        console.log('[Play.fun] Checking available globals...');
        
        // List all possible SDK names
        var possibleNames = ['PlayFunSDK', 'PlayFun', 'playFun', 'Playdotfun', 'playdotfun', 'ogp', 'OGP'];
        var found = [];
        
        possibleNames.forEach(function(name) {
            if (typeof window[name] !== 'undefined') {
                console.log('[Play.fun] FOUND:', name, '- type:', typeof window[name]);
                found.push(name);
            }
        });
        
        // Also check for any global containing 'play' or 'fun'
        console.log('[Play.fun] Scanning window for SDK...');
        for (var key in window) {
            if (key.toLowerCase().includes('play') || key.toLowerCase().includes('fun') || key.toLowerCase().includes('ogp')) {
                if (typeof window[key] === 'function' || typeof window[key] === 'object') {
                    console.log('[Play.fun] Potential SDK:', key, '- type:', typeof window[key]);
                }
            }
        }
        
        return found;
    }
    
    function init() {
        console.log('[Play.fun] === STARTING DEBUG ===');
        
        var found = checkSDK();
        
        if (found.length === 0) {
            console.log('[Play.fun] No SDK found yet, waiting...');
            setTimeout(init, 2000);
            return;
        }
        
        console.log('[Play.fun] SDK(s) found:', found);
        
        // Try to use the first available SDK
        var sdkName = found[0];
        var SDK = window[sdkName];
        
        try {
            console.log('[Play.fun] Trying to initialize with:', sdkName);
            
            var sdk = new SDK({
                gameId: GAME_ID,
                ui: { usePointsWidget: true }
            });
            
            if (sdk.init && typeof sdk.init === 'function') {
                sdk.init().then(function() {
                    console.log('[Play.fun] ✓ SUCCESS with', sdkName);
                    startPoints(sdk);
                }).catch(function(e) {
                    console.error('[Play.fun] Init failed:', e);
                });
            } else {
                console.log('[Play.fun] SDK initialized (no init method needed)');
                startPoints(sdk);
            }
            
        } catch (e) {
            console.error('[Play.fun] Error creating SDK:', e);
            setTimeout(init, 2000);
        }
    }
    
    function startPoints(sdk) {
        var total = 0;
        
        setInterval(function() {
            try {
                if (sdk.addPoints) {
                    sdk.addPoints(10);
                    total += 10;
                    console.log('[Play.fun] +' + 10 + ' pts (Total: ' + total + ')');
                }
                if (sdk.savePoints) {
                    sdk.savePoints();
                }
            } catch (e) {
                console.error('[Play.fun] Points error:', e);
            }
        }, 10000);
    }
    
    // Start after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 500);
        });
    } else {
        setTimeout(init, 500);
    }
    
})();
