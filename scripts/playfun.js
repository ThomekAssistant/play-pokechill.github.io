// Play.fun SDK Integration - Force load check
(function() {
    'use strict';
    
    console.log('[Play.fun] Script loaded at:', new Date().toISOString());
    console.log('[Play.fun] Document readyState:', document.readyState);
    
    // Check if sdk.play.fun script element exists
    var scripts = document.querySelectorAll('script');
    var foundSdk = false;
    scripts.forEach(function(s) {
        if (s.src && s.src.includes('sdk.play.fun')) {
            console.log('[Play.fun] SDK script element found:', s.src);
            console.log('[Play.fun] Script loaded?', s.readyState || 'unknown');
            foundSdk = true;
        }
    });
    
    if (!foundSdk) {
        console.error('[Play.fun] SDK script element NOT FOUND in DOM!');
    }
    
    // Wait longer and check multiple times
    var attempts = 0;
    var maxAttempts = 20;
    
    function checkAndInit() {
        attempts++;
        console.log('[Play.fun] Check attempt', attempts + '/' + maxAttempts);
        
        // Try all possible variations
        var checks = {
            'PlayFunSDK': typeof window.PlayFunSDK,
            'PlayFun': typeof window.PlayFun,
            'playFun': typeof window.playFun,
            'Playdotfun': typeof window.Playdotfun,
            'playdotfun': typeof window.playdotfun,
            'OGP': typeof window.OGP,
            'ogp': typeof window.ogp
        };
        
        console.log('[Play.fun] Types found:', JSON.stringify(checks));
        
        // If any is not undefined, we found something
        var found = null;
        for (var key in checks) {
            if (checks[key] !== 'undefined') {
                console.log('[Play.fun] ✓ Found', key, ':', checks[key]);
                found = { name: key, type: checks[key], obj: window[key] };
                break;
            }
        }
        
        if (found) {
            console.log('[Play.fun] Attempting init with', found.name);
            tryInit(found);
        } else if (attempts < maxAttempts) {
            console.log('[Play.fun] Nothing found, retrying in 2s...');
            setTimeout(checkAndInit, 2000);
        } else {
            console.error('[Play.fun] SDK never loaded after', maxAttempts, 'attempts');
            console.log('[Play.fun] All window keys containing play/fun:', 
                Object.keys(window).filter(function(k) {
                    return k.toLowerCase().includes('play') || k.toLowerCase().includes('fun');
                }).slice(0, 20)
            );
        }
    }
    
    function tryInit(sdkInfo) {
        try {
            var SDK = sdkInfo.obj;
            var instance;
            
            if (sdkInfo.type === 'function') {
                instance = new SDK({
                    gameId: '7b292365-07da-45d3-805c-75c2ce5d117e',
                    ui: { usePointsWidget: true }
                });
            } else {
                instance = SDK;
            }
            
            console.log('[Play.fun] Instance created:', instance);
            
            if (instance && typeof instance.init === 'function') {
                instance.init().then(function() {
                    console.log('[Play.fun] ✓✓✓ SUCCESS! SDK initialized');
                    startEarning(instance);
                }).catch(function(e) {
                    console.error('[Play.fun] Init promise rejected:', e);
                });
            } else {
                console.log('[Play.fun] No init method, assuming auto-initialized');
                startEarning(instance);
            }
        } catch (e) {
            console.error('[Play.fun] Init error:', e);
        }
    }
    
    function startEarning(sdk) {
        var total = 0;
        console.log('[Play.fun] Starting 10s timer...');
        setInterval(function() {
            try {
                if (sdk.addPoints) {
                    sdk.addPoints(10);
                    total += 10;
                    console.log('[Play.fun] +' + 10 + ' pts (Total: ' + total + ')');
                }
                if (sdk.savePoints) sdk.savePoints();
            } catch (e) {
                console.error('[Play.fun] Error:', e);
            }
        }, 10000);
    }
    
    // Start checking
    setTimeout(checkAndInit, 1000);
    
})();
