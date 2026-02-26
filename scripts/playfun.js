// Play.fun SDK - Wait for auto-initialization
(function() {
    'use strict';
    
    console.log('[Play.fun] Starting monitor...');
    
    var checkCount = 0;
    var maxChecks = 30;
    
    function monitor() {
        checkCount++;
        
        // Check for widget iframe
        var iframes = document.querySelectorAll('iframe');
        var playFunFrame = null;
        iframes.forEach(function(f) {
            if (f.src && f.src.includes('play.fun')) {
                playFunFrame = f;
            }
        });
        
        // Check for any new global
        var globals = Object.keys(window).filter(function(k) {
            return k.toLowerCase().includes('play') || 
                   k.toLowerCase().includes('fun') || 
                   k.toLowerCase().includes('ogp');
        });
        
        // Check for widget container
        var widget = document.querySelector('[id*="play"], [class*="play"]');
        
        console.log('[Play.fun] Check #' + checkCount);
        console.log('  - Play.fun iframe:', playFunFrame ? 'FOUND' : 'not found');
        console.log('  - Play-related globals:', globals.length > 0 ? globals.slice(0, 5) : 'none');
        console.log('  - Widget element:', widget ? widget.tagName + '#' + widget.id : 'not found');
        
        // Try to find any Play.fun related object
        if (window.PlayFunSDK) {
            console.log('[Play.fun] ✓ PlayFunSDK found!');
            tryInit(window.PlayFunSDK);
            return;
        }
        
        if (window.__PLAYFUN__ || window.playFun) {
            console.log('[Play.fun] ✓ PlayFun instance found!');
            startEarning(window.playFun || window.__PLAYFUN__);
            return;
        }
        
        if (checkCount < maxChecks) {
            setTimeout(monitor, 1000);
        } else {
            console.log('[Play.fun] Max checks reached. SDK may use different integration method.');
            // Try alternative: maybe SDK exposes through event
            tryAlternativeIntegration();
        }
    }
    
    function tryInit(SDK) {
        try {
            var instance = new SDK({
                gameId: '7b292365-07da-45d3-805c-75c2ce5d117e'
            });
            
            if (instance.init) {
                instance.init().then(function() {
                    console.log('[Play.fun] ✓ Initialized!');
                    startEarning(instance);
                }).catch(function(e) {
                    console.error('[Play.fun] Init failed:', e);
                });
            } else {
                startEarning(instance);
            }
        } catch (e) {
            console.error('[Play.fun] Error:', e);
        }
    }
    
    function tryAlternativeIntegration() {
        console.log('[Play.fun] Trying alternative methods...');
        
        // Method 1: Try to use the meta tag directly
        var meta = document.querySelector('meta[name="x-ogp-key"]');
        if (meta) {
            console.log('[Play.fun] Meta tag found:', meta.content);
        }
        
        // Method 2: Check if SDK already created any UI
        var potentialWidgets = document.querySelectorAll('div, iframe');
        var found = false;
        potentialWidgets.forEach(function(el) {
            var html = el.outerHTML.toLowerCase();
            if (html.includes('play') || html.includes('point') || html.includes('ogp')) {
                if (!found) {
                    console.log('[Play.fun] Potential widget found:', el.tagName);
                    found = true;
                }
            }
        });
        
        if (!found) {
            console.log('[Play.fun] No SDK integration detected. The SDK may need to be configured differently.');
            console.log('[Play.fun] Please check Play.fun documentation for integration method.');
        }
    }
    
    function startEarning(sdk) {
        console.log('[Play.fun] Starting earnings...');
        var total = 0;
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
    
    // Start monitoring
    setTimeout(monitor, 1000);
    
})();
