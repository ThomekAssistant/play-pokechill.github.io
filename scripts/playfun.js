// Play.fun SDK Integration
(function() {
    'use strict';
    
    console.log('[Play.fun] Script loaded');
    
    function init() {
        console.log('[Play.fun] Checking for OpenGameSDK...');
        
        if (typeof window.OpenGameSDK === 'undefined') {
            console.log('[Play.fun] SDK not loaded yet, retrying in 1s...');
            setTimeout(init, 1000);
            return;
        }
        
        console.log('[Play.fun] ✓ OpenGameSDK found!');
        
        try {
            const sdk = new OpenGameSDK({
                ui: { usePointsWidget: true }
            });
            
            // IMPORTANT: Use the correct game ID!
            sdk.init({ 
                gameId: '7b292365-07da-45d3-805c-75c2ce5d117e'
            }).then(() => {
                console.log('[Play.fun] ✓✓✓ SDK initialized successfully!');
                console.log('[Play.fun] Points widget should be visible');
                window.playFunSdk = sdk;
                
                // Start giving points every 10 seconds
                let total = 0;
                setInterval(() => {
                    try {
                        sdk.addPoints(10);
                        sdk.savePoints();
                        total += 10;
                        console.log(`[Play.fun] +10 points (Total: ${total})`);
                    } catch (e) {
                        console.error('[Play.fun] Error adding points:', e);
                    }
                }, 10000);
                
            }).catch((err) => {
                console.error('[Play.fun] ✗ Init failed:', err);
            });
            
        } catch (e) {
            console.error('[Play.fun] ✗ Error:', e);
        }
    }
    
    // Wait for SDK to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
    } else {
        setTimeout(init, 500);
    }
    
})();
