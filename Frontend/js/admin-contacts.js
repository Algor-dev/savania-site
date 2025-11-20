// ===== GESTION DES CONTACTS - SAVANIA ADMIN =====

class ContactsManager {
    constructor() {
        this.db = window.savaniaDB;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filters = {};
        this.init();
    }

    async init() {
        this.initEventListeners();
        await this.loadContacts();
    }

    initEventListeners() {
        // Filtres
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.statut = e.target.value;
            this.applyFilters();
        });

        document.getElementById('serviceFilter').addEventListener('change', (e) => {
            this.filters.service = e.target.value;
            this.applyFilters();
        });

        document.getElementById('dateFilter').addEventListener('change', (e) => {
            this.filters.date = e.target.value;
            this.applyFilters();
        });

        // Nouveau contact
        document.getElementById('addContact').addEventListener('click', () => {
            this.showAddContactModal();
        });
    }

    async loadContacts() {
        try {
            let query = this.db.collection('contacts')
                .orderBy('date_soumission', 'desc');

            // Appliquer les filtres
            if (this.filters.statut) {
                query = query.where('statut', '==', this.filters.statut);
            }
            if (this.filters.service) {
                query = query.where('service', '==', this.filters.service);
            }
            if (this.filters.date) {
                const date = new Date(this.filters.date);
                date.setHours(0, 0, 0, 0);
                const nextDay = new Date(date);
                nextDay.setDate(date.getDate() + 1);
                
                query = query.where('date_soumission', '>=', date)
                            .where('date_soumission', '<', nextDay);
            }

            const snapshot = await query.get();
            this.displayContacts(snapshot);
            this.setupPagination(snapshot.size);

        } catch (error) {
            console.error('Erreur chargement contacts:', error);
        }
    }

    displayContacts(snapshot) {
        const tbody = document.getElementById('contactsTableBody');
        tbody.innerHTML = '';

        snapshot.forEach(doc => {
            const contact = doc.data();
            const row = this.createContactRow(contact, doc.id);
            tbody.appendChild(row);
        });
    }

    createContactRow(contact, id) {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${contact.nom}</td>
            <td>${contact.email}</td>
            <td>${contact.telephone || 'N/A'}</td>
            <td>${this.formatService(contact.service)}</td>
            <td>${contact.date_soumission.toDate().toLocaleDateString('fr-FR')}</td>
            <td><span class="status-badge status-${contact.statut}">${this.formatStatus(contact.statut)}</span></td>
            <td>
                <button class="btn-action view-contact" data-id="${id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action edit-contact" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete-contact" data-id="${id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Ajouter les écouteurs d'événements
        tr.querySelector('.view-contact').addEventListener('click', () => {
            this.viewContact(id);
        });

        tr.querySelector('.edit-contact').addEventListener('click', () => {
            this.editContact(id);
        });

        tr.querySelector('.delete-contact').addEventListener('click', () => {
            this.deleteContact(id);
        });

        return tr;
    }

    async viewContact(contactId) {
        try {
            const doc = await this.db.collection('contacts').doc(contactId).get();
            const contact = doc.data();
            
            this.showContactModal(contact, doc.id);
        } catch (error) {
            console.error('Erreur vue contact:', error);
        }
    }

    showContactModal(contact, contactId) {
        const modal = document.getElementById('contactModal');
        const content = document.getElementById('contactModalContent');
        
        content.innerHTML = `
            <div class="contact-details">
                <div class="detail-group">
                    <label>Nom:</label>
                    <span>${contact.nom}</span>
                </div>
                <div class="detail-group">
                    <label>Email:</label>
                    <span>${contact.email}</span>
                </div>
                <div class="detail-group">
                    <label>Téléphone:</label>
                    <span>${contact.telephone || 'N/A'}</span>
                </div>
                <div class="detail-group">
                    <label>Service:</label>
                    <span>${this.formatService(contact.service)}</span>
                </div>
                <div class="detail-group">
                    <label>Sujet:</label>
                    <span>${contact.sujet}</span>
                </div>
                <div class="detail-group">
                    <label>Message:</label>
                    <div class="message-content">${contact.message}</div>
                </div>
                <div class="detail-group">
                    <label>Date:</label>
                    <span>${contact.date_soumission.toDate().toLocaleString('fr-FR')}</span>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-primary" onclick="contactsManager.editContact('${contactId}')">
                    Modifier
                </button>
                <button class="btn-secondary" onclick="contactsManager.updateStatus('${contactId}', 'en_cours')">
                    Marquer En Cours
                </button>
                <button class="btn-success" onclick="contactsManager.updateStatus('${contactId}', 'traite')">
                    Marquer Traité
                </button>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    async updateStatus(contactId, newStatus) {
        try {
            await this.db.collection('contacts').doc(contactId).update({
                statut: newStatus,
                date_dernier_suivi: new Date()
            });
            
            this.showToast('Statut mis à jour avec succès');
            this.loadContacts(); // Recharger la liste
            document.getElementById('contactModal').style.display = 'none';
            
        } catch (error) {
            console.error('Erreur mise à jour statut:', error);
            this.showToast('Erreur lors de la mise à jour', 'error');
        }
    }

    async deleteContact(contactId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
            try {
                await this.db.collection('contacts').doc(contactId).delete();
                this.showToast('Contact supprimé avec succès');
                this.loadContacts(); // Recharger la liste
            } catch (error) {
                console.error('Erreur suppression contact:', error);
                this.showToast('Erreur lors de la suppression', 'error');
            }
        }
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadContacts();
    }

    setupPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const pagination = document.getElementById('contactsPagination');
        
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="${i === this.currentPage ? 'active' : ''}" onclick="contactsManager.goToPage(${i})">${i}</button>`;
        }
        
        pagination.innerHTML = html;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadContacts();
    }

    // Utilitaires
    formatService(service) {
        const services = {
            'piscine': 'Piscine',
            'salle-jeux': 'Salle de Jeux',
            'bubble-tea': 'Bar Bubble Tea',
            'fast-food': 'Fast Food',
            'boulangerie': 'Boulangerie',
            'place-fetes': 'Place des Fêtes',
            'anniversaire': 'Packs Anniversaire'
        };
        return services[service] || service;
    }

    formatStatus(status) {
        const statuses = {
            'nouveau': 'Nouveau',
            'en_cours': 'En Cours',
            'traite': 'Traité',
            'annule': 'Annulé'
        };
        return statuses[status] || status;
    }

    showToast(message, type = 'success') {
        // Implémentation des toasts
        console.log(`${type}: ${message}`);
    }
}

// Initialisation
const contactsManager = new ContactsManager();



