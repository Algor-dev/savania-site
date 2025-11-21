// Protection contre les injections
class SecurityManager {
    constructor() {
        this.initSecurity();
    }

    initSecurity() {
        // Détection de console ouverte
        this.detectDevTools();
        
        // Protection contre les copies
        this.protectContent();
        
        // Monitoring des erreurs
        this.monitorErrors();
        
        // Validation des formulaires
        this.secureForms();
    }

    // Détection des outils de développement
    detectDevTools() {
        const threshold = 160;
        const check = () => {
            const width = window.outerWidth - window.innerWidth;
            const height = window.outerHeight - window.innerHeight;
            
            if (width > threshold || height > threshold) {
                this.logSecurityEvent('dev_tools_detected');
                // Redirection vers la page d'accueil
                window.location.href = '/';
            }
        };
        
        setInterval(check, 1000);
    }

    // Protection du contenu
    protectContent() {
        // Empêcher le clic droit
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Empêcher le drag & drop d'images
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });

        // Empêcher la sélection de texte
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
    }

    // Validation sécurisée des formulaires
    secureForms() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const inputs = form.querySelectorAll('input, textarea');
            
            for (let input of inputs) {
                if (this.containsMaliciousCode(input.value)) {
                    e.preventDefault();
                    this.logSecurityEvent('malicious_input_blocked', {
                        field: input.name,
                        value: input.value.substring(0, 50)
                    });
                    alert('Entrée suspecte détectée. Veuillez vérifier votre saisie.');
                    return;
                }
            }
        });
    }

    // Détection de code malveillant
    containsMaliciousCode(text) {
        const patterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /onload\s*=|onerror\s*=|onclick\s*=/gi,
            /eval\s*\(/gi,
            /document\.cookie/gi,
            /alert\s*\(/gi,
            /fromCharCode/gi
        ];
        
        return patterns.some(pattern => pattern.test(text));
    }

    // Sanitization des entrées
    sanitizeInput(input) {
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#x27;')
            .replace(/"/g, '&quot;')
            .replace(/\//g, '&#x2F;')
            .replace(/\\/g, '&#x5C;')
            .replace(/`/g, '&#x60;');
    }

    // Log des événements de sécurité
    async logSecurityEvent(eventType, data = {}) {
        if (typeof firebase !== 'undefined') {
            try {
                await firebase.firestore().collection('security-logs').add({
                    type: eventType,
                    data: data,
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    ip: await this.getClientIP()
                });
            } catch (error) {
                console.warn('Erreur log sécurité:', error);
            }
        }
    }

    // Obtenir l'IP du client (via service externe)
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // Monitoring des erreurs JavaScript
    monitorErrors() {
        window.addEventListener('error', (e) => {
            this.logSecurityEvent('javascript_error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.logSecurityEvent('promise_rejection', {
                reason: e.reason?.toString()
            });
        });
    }
}

// Initialisation de la sécurité
const securityManager = new SecurityManager();