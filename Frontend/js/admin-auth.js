// ===== AUTHENTIFICATION ADMIN SAVANIA =====

class AdminAuth {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.init();
    }

    init() {
        this.setupAuthListeners();
    }

    setupAuthListeners() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.handleSignedIn(user);
            } else {
                this.handleSignedOut();
            }
        });
    }

    async handleSignedIn(user) {
        // Vérifier si l'utilisateur est admin
        const isAdmin = await this.checkAdminStatus(user.uid);
        
        if (isAdmin) {
            console.log('✅ Admin authentifié:', user.email);
        } else {
            console.log('❌ Accès non autorisé');
            await this.auth.signOut();
            window.location.href = 'admin-login.html?error=unauthorized';
        }
    }

    handleSignedOut() {
        window.location.href = 'admin-login.html';
    }

    async checkAdminStatus(userId) {
        try {
            const doc = await this.db.collection('admins').doc(userId).get();
            return doc.exists && doc.data().active === true;
        } catch (error) {
            console.error('Erreur vérification admin:', error);
            return false;
        }
    }

    async login(email, password) {
        try {
            const result = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Erreur connexion:', error);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await this.auth.signOut();
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
    }
}

// Initialisation
const adminAuth = new AdminAuth();


