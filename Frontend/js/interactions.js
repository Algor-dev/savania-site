// ===== INTERACTIONS SPÉCIFIQUES PAGES =====

// FAQ Accordéon
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fermer tous les autres items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Basculer l'item actuel
            item.classList.toggle('active');
        });
    });
}

// Animation des packs au scroll
function initPackAnimations() {
    const packCards = document.querySelectorAll('.pack-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    packCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

// Gestion des formulaires de réservation
function initReservationForms() {
    const reserveButtons = document.querySelectorAll('.pack-actions .cta-button');
    
    reserveButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const packTitle = this.closest('.pack-card').querySelector('h3').textContent;
            localStorage.setItem('selectedPack', packTitle);
            window.location.href = 'contact.html';
        });
    });
}

// Pré-remplissage du formulaire de contact si pack sélectionné
function prefillContactForm() {
    const selectedPack = localStorage.getItem('selectedPack');
    if (selectedPack && document.getElementById('subject')) {
        document.getElementById('subject').value = `Réservation: ${selectedPack}`;
        localStorage.removeItem('selectedPack');
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    initFAQ();
    initPackAnimations();
    initReservationForms();
    prefillContactForm();
    
    // Animation spécifique à la page contact
    if (window.location.pathname.includes('contact.html')) {
        const formInputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (this.value === '') {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    }
});

// Export pour utilisation globale
window.SavaniaInteractions = {
    initFAQ,
    initPackAnimations,
    initReservationForms
};

// ===== INTERACTIONS FOOTER COMPACT =====
function initCompactFooter() {
    // Bouton Retour en Haut
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Animation des éléments au scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.footer-column').forEach(el => {
        observer.observe(el);
    });
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', initCompactFooter);