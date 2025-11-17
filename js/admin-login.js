// ===== GESTION CONNEXION ADMIN SAVANIA =====

class AdminLogin {
    constructor() {
        this.auth = window.savaniaAuth;
        this.init();
    }

    init() {
        this.initEventListeners();
        this.checkExistingAuth();
        console.log('🔐 Module de connexion admin initialisé');
    }

    initEventListeners() {
        // Formulaire de connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Toggle mot de passe
        const passwordToggle = document.getElementById('passwordToggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => {
                this.togglePasswordVisibility();
            });
        }

        // Mot de passe oublié
        const forgotPassword = document.getElementById('forgotPassword');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPasswordModal();
            });
        }

        // Modal
        this.initModal();
    }

    // Vérifier si déjà connecté
    async checkExistingAuth() {
        try {
            const user = this.auth.currentUser;
            if (user) {
                // Vérifier si c'est un admin
                const isAdmin = await this.checkAdminStatus(user.uid);
                if (isAdmin) {
                    this.redirectToDashboard();
                }
            }
        } catch (error) {
            console.log('Aucune session active');
        }
    }

    // Connexion
    async handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validation
        if (!this.validateForm(email, password)) {
            return;
        }

        // État loading
        this.setLoadingState(true);

        try {
            const result = await this.auth.signInWithEmailAndPassword(email, password);
            
            // Vérifier les droits admin
            const isAdmin = await this.checkAdminStatus(result.user.uid);
            
            if (isAdmin) {
                this.showMessage('Connexion réussie! Redirection...', 'success');
                
                // Persistance de session
                if (rememberMe) {
                    await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                } else {
                    await this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
                }
                
                // Redirection après délai
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
                
            } else {
                await this.auth.signOut();
                this.showMessage('Accès non autorisé. Compte non administrateur.', 'error');
            }

        } catch (error) {
            this.handleLoginError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    // Validation du formulaire
    validateForm(email, password) {
        let isValid = true;
        
        // Reset errors
        this.clearErrors();

        // Validation email
        if (!email) {
            this.showError('emailError', 'L\'email est requis');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('emailError', 'Format d\'email invalide');
            isValid = false;
        }

        // Validation mot de passe
        if (!password) {
            this.showError('passwordError', 'Le mot de passe est requis');
            isValid = false;
        } else if (password.length < 6) {
            this.showError('passwordError', 'Le mot de passe doit contenir au moins 6 caractères');
            isValid = false;
        }

        return isValid;
    }

    // Vérification email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Vérification droits admin
    async checkAdminStatus(userId) {
        try {
            // Ici vous devriez vérifier dans votre base de données
            // Pour l'instant, on suppose que tous les comptes Firebase sont admin
            // À adapter selon votre logique métier
            return true;
        } catch (error) {
            console.error('Erreur vérification admin:', error);
            return false;
        }
    }

    // Gestion des erreurs de connexion
    handleLoginError(error) {
        console.error('Erreur connexion:', error);
        
        switch (error.code) {
            case 'auth/invalid-email':
                this.showMessage('Format d\'email invalide', 'error');
                break;
            case 'auth/user-disabled':
                this.showMessage('Ce compte administrateur a été désactivé', 'error');
                break;
            case 'auth/user-not-found':
                this.showMessage('Aucun compte administrateur trouvé avec cet email', 'error');
                break;
            case 'auth/wrong-password':
                this.showMessage('Mot de passe incorrect', 'error');
                break;
            case 'auth/too-many-requests':
                this.showMessage('Trop de tentatives. Veuillez réessayer plus tard.', 'error');
                break;
            default:
                this.showMessage('Erreur de connexion. Veuillez réessayer.', 'error');
        }
    }

    // Toggle visibilité mot de passe
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.getElementById('passwordToggle').querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }

    // Modal mot de passe oublié
    showForgotPasswordModal() {
        const modal = document.getElementById('forgotPasswordModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    initModal() {
        const modal = document.getElementById('forgotPasswordModal');
        const closeBtn = modal.querySelector('.close');
        const form = document.getElementById('resetPasswordForm');

        // Fermer modal
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Fermer en cliquant dehors
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Soumission formulaire reset
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePasswordReset();
            });
        }
    }

    // Réinitialisation mot de passe
    async handlePasswordReset() {
        const email = document.getElementById('resetEmail').value.trim();
        
        if (!email || !this.isValidEmail(email)) {
            this.showError('resetEmailError', 'Email invalide');
            return;
        }

        try {
            await this.auth.sendPasswordResetEmail(email);
            this.showMessage('Email de réinitialisation envoyé!', 'success');
            document.getElementById('forgotPasswordModal').style.display = 'none';
        } catch (error) {
            this.showError('resetEmailError', 'Erreur lors de l\'envoi de l\'email');
            console.error('Erreur reset password:', error);
        }
    }

    // Utilitaires d'interface
    setLoadingState(isLoading) {
        const btn = document.getElementById('loginBtn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');

        if (isLoading) {
            btn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
        } else {
            btn.disabled = false;
            btnText.style.display = 'flex';
            btnLoading.style.display = 'none';
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('loginMessage');
        messageEl.textContent = message;
        messageEl.className = `login-message ${type}`;
        messageEl.style.display = 'block';

        // Auto-hide pour les succès
        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        const inputEl = document.getElementById(elementId.replace('Error', ''));
        
        if (errorEl && inputEl) {
            errorEl.textContent = message;
            inputEl.classList.add('error');
        }
    }

    clearErrors() {
        // Clear all error messages
        document.querySelectorAll('.input-error').forEach(el => {
            el.textContent = '';
        });
        
        // Remove error classes
        document.querySelectorAll('input.error').forEach(el => {
            el.classList.remove('error');
        });
    }

    redirectToDashboard() {
        window.location.href = 'admin.html';
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier que Firebase est configuré
    if (!window.savaniaAuth) {
        console.error('Firebase Auth non disponible');
        document.getElementById('loginMessage').textContent = 'Erreur de configuration. Veuillez recharger la page.';
        document.getElementById('loginMessage').style.display = 'block';
        return;
    }

    window.adminLogin = new AdminLogin();
});

console.log('🔐 Page de connexion admin chargée');