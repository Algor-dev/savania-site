// ===== SCRIPT DE CRÉATION ADMIN SAVANIA =====
// À exécuter UNE SEULE FOIS pour créer le premier admin

class AdminCreator {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.init();
    }

    async init() {
        console.log('🚀 Initialisation création admin...');
        
        // Créer l'interface
        this.createAdminInterface();
    }

    createAdminInterface() {
        // Créer un overlay pour la création admin
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            text-align: center;
        `;

        modal.innerHTML = `
            <h2 style="color: #e67e22; margin-bottom: 1rem;">🏢 Création Admin SAVANIA</h2>
            <p style="margin-bottom: 2rem; color: #666;">
                Créez votre premier compte administrateur
            </p>
            
            <form id="adminCreationForm">
                <div style="margin-bottom: 1rem; text-align: left;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email Admin</label>
                    <input type="email" id="adminEmail" required 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px;"
                           placeholder="admin@savania.tg">
                </div>
                
                <div style="margin-bottom: 1rem; text-align: left;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Mot de passe</label>
                    <input type="password" id="adminPassword" required 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px;"
                           placeholder="Mot de passe sécurisé">
                </div>
                
                <div style="margin-bottom: 2rem; text-align: left;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Confirmer le mot de passe</label>
                    <input type="password" id="adminPasswordConfirm" required 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px;"
                           placeholder="Confirmer le mot de passe">
                </div>
                
                <button type="submit" 
                        style="background: linear-gradient(45deg, #e67e22, #16a085); color: white; border: none; padding: 1rem 2rem; border-radius: 25px; font-weight: 600; cursor: pointer; width: 100%;">
                    Créer le Compte Admin
                </button>
            </form>
            
            <div id="creationMessage" style="margin-top: 1rem;"></div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Gérer la soumission
        document.getElementById('adminCreationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createAdminAccount();
        });
    }

    async createAdminAccount() {
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        const passwordConfirm = document.getElementById('adminPasswordConfirm').value;
        const messageEl = document.getElementById('creationMessage');

        // Validation
        if (password !== passwordConfirm) {
            this.showMessage(messageEl, 'Les mots de passe ne correspondent pas', 'error');
            return;
        }

        if (password.length < 8) {
            this.showMessage(messageEl, 'Le mot de passe doit faire au moins 8 caractères', 'error');
            return;
        }

        try {
            // Créer l'utilisateur dans Firebase Auth
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Créer le document admin dans Firestore
            await this.db.collection('admins').doc(user.uid).set({
                email: email,
                role: 'superadmin',
                active: true,
                created_at: new Date(),
                last_login: null,
                permissions: ['all']
            });

            this.showMessage(messageEl, '✅ Compte admin créé avec succès! Redirection...', 'success');
            
            // Redirection vers le dashboard après 2 secondes
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 2000);

        } catch (error) {
            console.error('Erreur création admin:', error);
            this.handleCreationError(error, messageEl);
        }
    }

    handleCreationError(error, messageEl) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                this.showMessage(messageEl, 'Cet email est déjà utilisé', 'error');
                break;
            case 'auth/invalid-email':
                this.showMessage(messageEl, 'Format d\'email invalide', 'error');
                break;
            case 'auth/weak-password':
                this.showMessage(messageEl, 'Le mot de passe est trop faible', 'error');
                break;
            default:
                this.showMessage(messageEl, 'Erreur lors de la création: ' + error.message, 'error');
        }
    }

    showMessage(element, message, type) {
        element.textContent = message;
        element.style.color = type === 'success' ? '#27ae60' : '#e74c3c';
        element.style.fontWeight = '500';
    }
}

// Démarrer la création admin si on est sur la page de setup
if (window.location.pathname.includes('setup-admin.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Vérifier la configuration Firebase
        if (typeof firebase === 'undefined') {
            alert('Firebase non chargé. Vérifiez la configuration.');
            return;
        }
        
        new AdminCreator();
    });
}