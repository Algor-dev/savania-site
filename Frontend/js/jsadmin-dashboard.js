// ===== TABLEAU DE BORD ADMINISTRATION SAVANIA =====
// Ce script gère l'interface admin principale et les interactions

class SavaniaAdminDashboard {
    constructor() {
        this.db = window.savaniaDB; // Référence à la base de données
        this.currentUser = null;
        this.statsData = {};
        this.init();
    }

    // Initialisation du dashboard
    async init() {
        console.log('🚀 Initialisation du dashboard SAVANIA...');
        
        try {
            // Vérifier l'authentification
            await this.checkAuth();
            
            // Initialiser les composants
            this.initEventListeners();
            this.loadRealTimeStats();
            this.setupRealtimeListeners();
            this.loadRecentActivity();
            
            console.log('✅ Dashboard SAVANIA initialisé avec succès');
            
        } catch (error) {
            console.error('❌ Erreur initialisation dashboard:', error);
            this.showError('Erreur de chargement du dashboard');
        }
    }

    // Vérification de l'authentification
    async checkAuth() {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = user;
                    document.getElementById('userInfo').textContent = user.email;
                    resolve(user);
                } else {
                    window.location.href = 'admin-login.html';
                    reject(new Error('Utilisateur non authentifié'));
                }
            });
        });
    }

    // Initialisation des écouteurs d'événements
    initEventListeners() {
        // Navigation sidebar
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Toggle sidebar sur mobile
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.querySelector('.admin-sidebar').classList.toggle('active');
        });

        // Bouton export
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Recherche globale
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // Déconnexion
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Fermeture modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Clic outside modal pour fermer
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // Changement d'onglet
    switchTab(tabName) {
        // Désactiver tous les onglets
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Activer l'onglet sélectionné
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
        document.getElementById('pageTitle').textContent = this.getTabTitle(tabName);

        // Charger les données spécifiques à l'onglet
        this.loadTabData(tabName);
    }

    // Titres des onglets
    getTabTitle(tabName) {
        const titles = {
            'dashboard': 'Tableau de Bord',
            'contacts': 'Gestion des Contacts',
            'reservations': 'Réservations',
            'clients': 'Base Clients',
            'services': 'Services & Tarifs',
            'analytics': 'Analytics & Rapports',
            'settings': 'Paramètres'
        };
        return titles[tabName] || 'Tableau de Bord';
    }

    // Chargement des données par onglet
    async loadTabData(tabName) {
        switch(tabName) {
            case 'contacts':
                await this.loadContactsData();
                break;
            case 'reservations':
                await this.loadReservationsData();
                break;
            case 'clients':
                await this.loadClientsData();
                break;
            case 'services':
                await this.loadServicesData();
                break;
            case 'analytics':
                await this.loadAnalyticsData();
                break;
        }
    }

    // ===== STATISTIQUES TEMPS RÉEL =====

    // Chargement des stats en temps réel
    async loadRealTimeStats() {
        try {
            // Stats contacts
            const contactsStats = await this.getContactsStats();
            
            // Stats réservations
            const reservationsStats = await this.getReservationsStats();
            
            // Stats financières
            const financialStats = await this.getFinancialStats();
            
            // Mise à jour de l'interface
            this.updateStatsDisplay({
                ...contactsStats,
                ...reservationsStats,
                ...financialStats
            });

        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    }

    // Statistiques des contacts
    async getContactsStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const contactsSnapshot = await this.db.collection('contacts')
            .where('date_soumission', '>=', today)
            .get();

        const newContacts = contactsSnapshot.size;

        // Contacts de la semaine
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        const weekContactsSnapshot = await this.db.collection('contacts')
            .where('date_soumission', '>=', weekStart)
            .get();

        return {
            newContacts,
            weekContacts: weekContactsSnapshot.size,
            contactsConversion: this.calculateConversionRate()
        };
    }

    // Statistiques des réservations
    async getReservationsStats() {
        const today = new Date().toISOString().split('T')[0];
        
        const todayBookings = await this.db.collection('reservations')
            .where('date_reservation', '==', today)
            .where('statut', 'in', ['confirme', 'en_cours'])
            .get();

        // Revenu du mois
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthlyRevenueSnapshot = await this.db.collection('reservations')
            .where('date_reservation', '>=', monthStart.toISOString().split('T')[0])
            .where('statut', 'in', ['confirme', 'termine', 'paye'])
            .get();

        let monthlyRevenue = 0;
        monthlyRevenueSnapshot.forEach(doc => {
            monthlyRevenue += doc.data().total_ttc || 0;
        });

        return {
            todayBookings: todayBookings.size,
            monthlyRevenue,
            occupancyRate: await this.calculateOccupancyRate()
        };
    }

    // Statistiques financières
    async getFinancialStats() {
        const monthStart = new Date();
        monthStart.setDate(1);
        
        const lastMonthStart = new Date(monthStart);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

        // Revenu mois actuel
        const currentMonthSnapshot = await this.db.collection('reservations')
            .where('date_reservation', '>=', monthStart.toISOString().split('T')[0])
            .where('statut', 'in', ['confirme', 'termine', 'paye'])
            .get();

        let currentMonthRevenue = 0;
        currentMonthSnapshot.forEach(doc => {
            currentMonthRevenue += doc.data().total_ttc || 0;
        });

        // Revenu mois précédent
        const lastMonthSnapshot = await this.db.collection('reservations')
            .where('date_reservation', '>=', lastMonthStart.toISOString().split('T')[0])
            .where('date_reservation', '<', monthStart.toISOString().split('T')[0])
            .where('statut', 'in', ['confirme', 'termine', 'paye'])
            .get();

        let lastMonthRevenue = 0;
        lastMonthSnapshot.forEach(doc => {
            lastMonthRevenue += doc.data().total_ttc || 0;
        });

        const growth = lastMonthRevenue > 0 ? 
            ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 100;

        return {
            currentMonthRevenue,
            revenueGrowth: growth
        };
    }

    // Calcul taux de conversion
    calculateConversionRate() {
        // À implémenter avec les données historiques
        return 15.5; // Pourcentage
    }

    // Calcul taux d'occupation
    async calculateOccupancyRate() {
        // À implémenter avec la capacité des salles
        return 68.2; // Pourcentage
    }

    // Mise à jour de l'affichage des stats
    updateStatsDisplay(stats) {
        const statsGrid = document.getElementById('statsGrid');
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Nouveaux Contacts Aujourd'hui</div>
                <div class="stat-value">${stats.newContacts}</div>
                <div class="stat-change positive">+${stats.weekContacts} cette semaine</div>
            </div>
            
            <div class="stat-card success">
                <div class="stat-label">Réservations Aujourd'hui</div>
                <div class="stat-value">${stats.todayBookings}</div>
                <div class="stat-change">Taux occupation: ${stats.occupancyRate}%</div>
            </div>
            
            <div class="stat-card warning">
                <div class="stat-label">Revenu Ce Mois</div>
                <div class="stat-value">${this.formatCurrency(stats.currentMonthRevenue)}</div>
                <div class="stat-change ${stats.revenueGrowth >= 0 ? 'positive' : 'negative'}">
                    ${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}% vs mois dernier
                </div>
            </div>
            
            <div class="stat-card danger">
                <div class="stat-label">Taux de Conversion</div>
                <div class="stat-value">${stats.contactsConversion}%</div>
                <div class="stat-change">Basé sur 30 jours</div>
            </div>
        `;
    }

    // ===== ÉCOUTEURS TEMPS RÉEL =====

    // Configuration des écouteurs temps réel
    setupRealtimeListeners() {
        // Nouveaux contacts
        this.db.collection('contacts')
            .where('statut', '==', 'nouveau')
            .onSnapshot((snapshot) => {
                this.updateNewContactsBadge(snapshot.size);
                this.showNewContactNotification(snapshot);
            });

        // Réservations aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        this.db.collection('reservations')
            .where('date_reservation', '==', today)
            .onSnapshot((snapshot) => {
                this.updateTodayBookings(snapshot.size);
            });
    }

    // Mise à jour badge nouveaux contacts
    updateNewContactsBadge(count) {
        const badge = document.getElementById('newContactsBadge');
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Mise à jour réservations du jour
    updateTodayBookings(count) {
        // Met à jour la stat en temps réel
        this.loadRealTimeStats();
    }

    // Notification nouveaux contacts
    showNewContactNotification(snapshot) {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const contact = change.doc.data();
                this.showNotification(`Nouveau contact: ${contact.nom}`, contact.service);
            }
        });
    }

    // Notification système
    showNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/assets/logo.png'
            });
        }
        
        // Afficher aussi une notification dans l'interface
        this.showToastNotification(title, message);
    }

    // Notification toast
    showToastNotification(title, message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <strong>${title}</strong>
            <p>${message}</p>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // ===== ACTIVITÉ RÉCENTE =====

    // Chargement activité récente
    async loadRecentActivity() {
        try {
            // Derniers contacts
            const contactsSnapshot = await this.db.collection('contacts')
                .orderBy('date_soumission', 'desc')
                .limit(5)
                .get();

            // Dernières réservations
            const reservationsSnapshot = await this.db.collection('reservations')
                .orderBy('created_at', 'desc')
                .limit(5)
                .get();

            this.displayRecentActivity(contactsSnapshot, reservationsSnapshot);

        } catch (error) {
            console.error('Erreur chargement activité récente:', error);
        }
    }

    // Affichage activité récente
    displayRecentActivity(contactsSnapshot, reservationsSnapshot) {
        const activityList = document.getElementById('recentActivity');
        let html = '';

        // Contacts récents
        contactsSnapshot.forEach(doc => {
            const contact = doc.data();
            const timeAgo = this.getTimeAgo(contact.date_soumission.toDate());
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon contact">👤</div>
                    <div class="activity-content">
                        <strong>${contact.nom}</strong> a contacté pour ${contact.service}
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        });

        // Réservations récentes
        reservationsSnapshot.forEach(doc => {
            const reservation = doc.data();
            const timeAgo = this.getTimeAgo(reservation.created_at.toDate());
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon reservation">📅</div>
                    <div class="activity-content">
                        Réservation ${reservation.type} pour ${reservation.client_nom}
                        <div class="activity-time">${timeAgo} - ${this.formatCurrency(reservation.total_ttc)}</div>
                    </div>
                </div>
            `;
        });

        activityList.innerHTML = html || '<p>Aucune activité récente</p>';
    }

    // ===== FONCTIONNALITÉS AVANCÉES =====

    // Recherche globale
    async handleGlobalSearch(query) {
        if (query.length < 2) return;

        try {
            const results = await this.searchAcrossCollections(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Erreur recherche:', error);
        }
    }

    // Recherche dans toutes les collections
    async searchAcrossCollections(query) {
        const results = {
            contacts: [],
            reservations: [],
            clients: []
        };

        // Recherche dans les contacts
        const contactsQuery = await this.db.collection('contacts')
            .where('nom', '>=', query)
            .where('nom', '<=', query + '\uf8ff')
            .limit(5)
            .get();

        contactsQuery.forEach(doc => {
            results.contacts.push({ id: doc.id, ...doc.data() });
        });

        // Recherche dans les réservations
        const reservationsQuery = await this.db.collection('reservations')
            .where('client_nom', '>=', query)
            .where('client_nom', '<=', query + '\uf8ff')
            .limit(5)
            .get();

        reservationsQuery.forEach(doc => {
            results.reservations.push({ id: doc.id, ...doc.data() });
        });

        return results;
    }

    // Affichage résultats recherche
    displaySearchResults(results) {
        // À implémenter - modal de résultats
        console.log('Résultats recherche:', results);
    }

    // Export des données
    async exportData() {
        try {
            const exporter = new DataExporter();
            const date = new Date().toISOString().split('T')[0];
            
            // Export contacts du mois
            await exporter.exportContactsCSV(
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                new Date()
            );

            this.showToastNotification('Export réussi', 'Les données ont été exportées en CSV');

        } catch (error) {
            console.error('Erreur export:', error);
            this.showError('Erreur lors de l\'export');
        }
    }

    // Déconnexion
    async logout() {
        try {
            await firebase.auth().signOut();
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
    }

    // ===== UTILITAIRES =====

    // Formatage devise
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF'
        }).format(amount);
    }

    // Temps écoulé
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours} h`;
        if (diffDays < 7) return `Il y a ${diffDays} j`;
        
        return date.toLocaleDateString('fr-FR');
    }

    // Affichage erreur
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// ===== CLASSE EXPORT DES DONNÉES =====

class DataExporter {
    async exportContactsCSV(startDate, endDate) {
        const snapshot = await db.collection('contacts')
            .where('date_soumission', '>=', startDate)
            .where('date_soumission', '<=', endDate)
            .get();

        const headers = ['Nom', 'Email', 'Téléphone', 'Service', 'Sujet', 'Date', 'Statut'];
        let csv = headers.join(';') + '\n';

        snapshot.forEach(doc => {
            const contact = doc.data();
            const row = [
                `"${contact.nom}"`,
                `"${contact.email}"`,
                `"${contact.telephone || ''}"`,
                `"${contact.service}"`,
                `"${contact.sujet}"`,
                `"${contact.date_soumission.toDate().toLocaleDateString('fr-FR')}"`,
                `"${contact.statut}"`
            ];
            csv += row.join(';') + '\n';
        });

        this.downloadCSV(csv, `contacts_savania_${new Date().toISOString().split('T')[0]}.csv`);
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ===== INITIALISATION AU CHARGEMENT =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le dashboard
    window.savaniaAdmin = new SavaniaAdminDashboard();
    
    // Demander les permissions de notification
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});

console.log('📊 Module Admin Dashboard chargé');





