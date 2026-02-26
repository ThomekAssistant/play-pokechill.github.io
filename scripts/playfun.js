// Play.fun SDK Integration - Following official docs
(function() {
    'use strict';
    
    console.log('[Play.fun] Waiting for OpenGameSDK...');
    
    function init() {
        // Check if SDK loaded
        if (typeof window.OpenGameSDK === 'undefined') {
            console.log('[Play.fun] OpenGameSDK not loaded yet, retrying...');
            setTimeout(init, 1000);
            return;
        }
        
        console.log('[Play.fun] ✓ OpenGameSDK found!');
        
        try {
            // Create SDK instance - following docs exactly
            const sdk = new OpenGameSDK({
                ui: { 
                    usePointsWidget: true 
                }
            });
            
            console.log('[Play.fun] SDK instance created');
            
            // Initialize with gameId - following docs exactly
            sdk.init({ 
                gameId: '7b292365-07da-45d3-805c-75c2ce5d117e' 
            }).then(() => {
                console.log('[Play.fun] ✓✓✓ SDK ready!');
                window.playFun = sdk;
                startEarning(sdk);
            }).catch((err) => {
                console.error('[Play.fun] ✗ Init failed:', err);
            });
            
        } catch (e) {
            console.error('[Play.fun] ✗ Error:', e);
        }
    }
    
    function startEarning(sdk) {
        console.log('[Play.fun] Starting 10s points timer...');
        let total = 0;
        
        // Give points every 10 seconds
        setInterval(() => {
            try {
                sdk.addPoints(10);
                sdk.savePoints();
                total += 10;
                console.log(`[Play.fun] +10 pts (Total: ${total})`);
            } catch (e) {
                console.error('[Play.fun] Error:', e);
            }
        }, 10000);
    }
    
    // Start
    setTimeout(init, 1000);
    
})();
