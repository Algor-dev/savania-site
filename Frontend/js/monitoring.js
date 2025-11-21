class SecurityMonitor {
    constructor() {
        this.setupMonitoring();
    }

    setupMonitoring() {
        // Surveillance des requêtes réseau suspectes
        this.monitorNetworkRequests();
        
        // Détection de bots
        this.detectBots();
        
        // Surveillance du comportement utilisateur
        this.monitorUserBehavior();
    }

    monitorNetworkRequests() {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            
            // Bloquer les requêtes vers des domaines suspects
            if (this.isSuspiciousDomain(url)) {
                securityManager.logSecurityEvent('suspicious_request_blocked', { url });
                return Promise.reject(new Error('Requête suspecte bloquée'));
            }
            
            return originalFetch.apply(this, args);
        }.bind(this);
    }

    isSuspiciousDomain(url) {
        const suspiciousDomains = [
            'coin-hive.com',
            'crypto-loot.com',
            'miner.pr0gramm.com'
        ];
        
        return suspiciousDomains.some(domain => url.includes(domain));
    }

    detectBots() {
        // Détection basique de bots
        if (!navigator.userAgent) {
            securityManager.logSecurityEvent('bot_detected', { type: 'no_user_agent' });
        }
        
        if (navigator.webdriver) {
            securityManager.logSecurityEvent('bot_detected', { type: 'webdriver' });
        }
    }

    monitorUserBehavior() {
        let rapidClicks = 0;
        let lastClickTime = 0;
        
        document.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - lastClickTime < 100) { // Clics très rapides
                rapidClicks++;
                if (rapidClicks > 10) {
                    securityManager.logSecurityEvent('rapid_clicks_detected', { count: rapidClicks });
                }
            } else {
                rapidClicks = 0;
            }
            lastClickTime = now;
        });
    }
}

// Initialisation du monitoring
const securityMonitor = new SecurityMonitor();