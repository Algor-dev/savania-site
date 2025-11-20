// ===== MAIN JAVASCRIPT FILE - SAVANIA COMPLEX =====
// Ce fichier contient toutes les fonctionnalités interactives du site

// Configuration globale
const CONFIG = {
    // Délais d'animation
    animationDelays: {
        fadeIn: 100,
        scroll: 200
    },
    // Paramètres de scroll
    scrollOffset: 100,
    // URLs des APIs (si nécessaire plus tard)
    apiEndpoints: {}
};

// ===== GESTIONNAIRE D'ÉVÉNEMENTS AU CHARGEMENT =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Site SAVANIA initialisé');
    
    // Initialisation de toutes les fonctionnalités
    initNavigation();
    initScrollEffects();
    initAnimations();
    initImageLazyLoading();
    initContactForm();
    initCounters();
    initTestimonialSlider();
    
    // Vérification de la performance
    monitorPerformance();
});

// ===== SYSTÈME DE NAVIGATION =====
// ===== NAVIGATION AVEC DISPARITION DU DROPDOWN AU SCROLL =====
function initNavigation() {
    const header = document.getElementById('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (!header) return;

    // ===== HEADER ET DROPDOWN QUI DISPARAISSENT AU SCROLL =====
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateHeaderVisibility() {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            // Scroll vers le bas - cacher le header et les dropdowns
            header.classList.add('header-hidden');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
            if (navMenu) navMenu.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('active');
        } else {
            // Scroll vers le haut - montrer le header
            header.classList.remove('header-hidden');
        }
        lastScrollY = window.scrollY;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeaderVisibility);
            ticking = true;
        }
    });

    // ===== MENU MOBILE =====
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Fermer les dropdowns quand on ferme le menu
            if (!navMenu.classList.contains('active')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }

    // ===== DROPDOWN MOBILE =====
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('a');
        
        trigger.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                
                // Fermer les autres dropdowns
                dropdowns.forEach(other => {
                    if (other !== dropdown) other.classList.remove('active');
                });
                
                // Ouvrir/fermer ce dropdown
                dropdown.classList.toggle('active');
            }
        });
    });

    // ===== FERMER LE MENU EN CLIQUANT AILLEURS (MOBILE) =====
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!e.target.closest('.nav-menu') && !e.target.closest('.menu-toggle')) {
                if (menuToggle) menuToggle.classList.remove('active');
                if (navMenu) navMenu.classList.remove('active');
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        }
        
        // Sur desktop, fermer les dropdowns si on clique ailleurs
        if (window.innerWidth > 768) {
            if (!e.target.closest('.dropdown')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        }
    });

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Ne pas scroll pour le dropdown sur mobile
            if (window.innerWidth <= 768 && this.closest('.dropdown')) {
                return;
            }
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Fermer le menu mobile après navigation
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        if (menuToggle) menuToggle.classList.remove('active');
                        if (navMenu) navMenu.classList.remove('active');
                        dropdowns.forEach(dropdown => {
                            dropdown.classList.remove('active');
                        });
                    }, 300);
                }
            }
        });
    });

    // ===== FERMER LES DROPDOWNS AU REDIMENSIONNEMENT =====
    window.addEventListener('resize', function() {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        if (menuToggle) menuToggle.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    });
}

// ===== EFFETS DE SCROLL ET ANIMATIONS =====
function initScrollEffects() {
    // Observer pour les animations au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animation progressive pour les éléments de grille
                if (entry.target.classList.contains('activity-card')) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                    entry.target.style.transitionDelay = `${delay}ms`;
                }
            }
        });
    }, observerOptions);

    // Observer tous les éléments avec la classe fade-in
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .zoom-in, .activity-card').forEach(el => {
        observer.observe(el);
    });
}

// ===== SYSTÈME D'ANIMATIONS AVANCÉES =====
function initAnimations() {
    // Animation au hover des cartes
    document.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Effet de parallaxe simple
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ===== CHARGEMENT DIFFÉRÉ DES IMAGES =====
function initImageLazyLoading() {
    // Vérifier si l'API Intersection Observer est supportée
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        // Observer toutes les images lazy
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback pour les vieux navigateurs
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// ===== FORMULAIRE DE CONTACT =====
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupération des données du formulaire
        const formData = new FormData(this);
        const formProps = Object.fromEntries(formData);
        
        // Validation basique
        if (validateForm(formProps)) {
            // Simulation d'envoi (à remplacer par une vraie API)
            simulateFormSubmission(this, formProps);
        }
    });

    // Validation en temps réel
    contactForm.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// Validation d'un champ individuel
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch(field.type) {
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            errorMessage = isValid ? '' : 'Veuillez entrer une adresse email valide';
            break;
        case 'tel':
            isValid = /^[\+]?[0-9\s\-\(\)]{10,}$/.test(value);
            errorMessage = isValid ? '' : 'Veuillez entrer un numéro de téléphone valide';
            break;
        default:
            isValid = value.length > 0;
            errorMessage = isValid ? '' : 'Ce champ est obligatoire';
    }

    // Affichage des erreurs
    const errorElement = field.parentNode.querySelector('.error-message') || createErrorElement(field);
    errorElement.textContent = errorMessage;
    field.classList.toggle('error', !isValid);

    return isValid;
}

// Création d'un élément d'erreur
function createErrorElement(field) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 0.25rem;';
    field.parentNode.appendChild(errorElement);
    return errorElement;
}

// Validation complète du formulaire
function validateForm(formData) {
    let isValid = true;
    
    Object.keys(formData).forEach(key => {
        const field = document.querySelector(`[name="${key}"]`);
        if (field) {
            isValid = validateField(field) && isValid;
        }
    });
    
    return isValid;
}

// Simulation d'envoi du formulaire
function simulateFormSubmission(form, data) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // État de chargement
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;
    
    // Simulation d'attente
    setTimeout(() => {
        // Ici, vous intégrerez votre véritable service d'envoi d'email
        console.log('📧 Données du formulaire:', data);
        
        // Message de succès
        showNotification('Message envoyé avec succès! Nous vous recontacterons rapidement.', 'success');
        
        // Réinitialisation du formulaire
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// ===== COMPTEURS ANIMÉS =====
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    if (counters.length === 0) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });

    counters.forEach(counter => observer.observe(counter));
}

// Animation des compteurs
function animateCounter(counter) {
    const target = parseInt(counter.dataset.target);
    const duration = 2000; // 2 secondes
    const step = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        counter.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// ===== SLIDER DE TÉMOIGNAGES =====
function initTestimonialSlider() {
    const slider = document.querySelector('.testimonials-slider');
    if (!slider) return;

    let currentSlide = 0;
    const slides = slider.querySelectorAll('.testimonial-slide');
    const totalSlides = slides.length;

    // Création des indicateurs de slide
    const indicators = document.createElement('div');
    indicators.className = 'slider-indicators';
    
    slides.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.addEventListener('click', () => goToSlide(index));
        indicators.appendChild(indicator);
    });
    
    slider.appendChild(indicators);

    function goToSlide(index) {
        currentSlide = (index + totalSlides) % totalSlides;
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateIndicators();
    }

    function updateIndicators() {
        indicators.querySelectorAll('button').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }

    // Navigation automatique
    setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 5000);

    updateIndicators();
}

// ===== SYSTÈME DE NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Couleurs selon le type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c', 
        info: '#3498db',
        warning: '#f39c12'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    
    // Suppression automatique
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ===== SURVEILLANCE DES PERFORMANCES =====
function monitorPerformance() {
    // Mesure du temps de chargement
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`⚡ Temps de chargement: ${loadTime}ms`);
        
        if (loadTime > 3000) {
            console.warn('🐢 Le site met trop de temps à charger. Optimisation nécessaire.');
        }
    });

    // Surveillance de la mémoire
    if ('memory' in performance) {
        setInterval(() => {
            const used = performance.memory.usedJSHeapSize;
            const limit = performance.memory.jsHeapSizeLimit;
            const percentage = (used / limit * 100).toFixed(2);
            
            if (percentage > 80) {
                console.warn(`⚠️ Utilisation mémoire élevée: ${percentage}%`);
            }
        }, 30000);
    }
}

// ===== FONCTIONS UTILITAIRES =====

// Formatage des prix
function formatPrice(price, currency = 'FCFA') {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
}

// Gestion des dates
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Détection du navigateur
function getBrowserInfo() {
    const ua = navigator.userAgent;
    return {
        isMobile: /Mobile|Android|iP(hone|od)/.test(ua),
        isTablet: /Tablet|iPad/.test(ua),
        browser: ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
    };
}

// Export des fonctions pour utilisation globale
window.SAVANIA = {
    showNotification,
    formatPrice,
    formatDate,
    getBrowserInfo
};

console.log('✅ Toutes les fonctionnalités JavaScript sont initialisées');




// Soumission du formulaire de contact
async function handleContactFormSubmit(formData) {
    try {
        // 1. Sauvegarde dans Firebase
        const contactRef = await db.collection('contacts').add({
            // Informations personnelles
            nom: formData.name,
            email: formData.email,
            telephone: formData.phone,
            
            // Détails de la demande
            service: formData.service,
            sujet: formData.subject,
            message: formData.message,
            
            // Métadonnées
            date_soumission: new Date(),
            source: 'site_web',
            statut: 'nouveau',
            priorite: determinePriority(formData.service),
            
            // Analytics
            ip_address: await getClientIP(),
            user_agent: navigator.userAgent,
            pages_visitees: getVisitedPages(),
            temps_site: getTimeOnSite()
        });

        // 2. Envoi d'email de notification
        await sendEmailNotification(formData);

        // 3. Création dans CRM si nécessaire
        await createCRMLead(formData);

        return {
            success: true,
            contactId: contactRef.id
        };

    } catch (error) {
        console.error('Erreur soumission formulaire:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Détermination priorité
function determinePriority(service) {
    const priorities = {
        'place-fetes': 'haute',
        'anniversaire': 'haute',
        'piscine': 'moyenne',
        'salle-jeux': 'moyenne',
        'general': 'basse'
    };
    return priorities[service] || 'moyenne';
}


// Soumission du formulaire de contact
async function handleContactFormSubmit(formData) {
    try {
        // 1. Sauvegarde dans Firebase
        const contactRef = await db.collection('contacts').add({
            // Informations personnelles
            nom: formData.name,
            email: formData.email,
            telephone: formData.phone,
            
            // Détails de la demande
            service: formData.service,
            sujet: formData.subject,
            message: formData.message,
            
            // Métadonnées
            date_soumission: new Date(),
            source: 'site_web',
            statut: 'nouveau',
            priorite: determinePriority(formData.service),
            
            // Analytics
            ip_address: await getClientIP(),
            user_agent: navigator.userAgent,
            pages_visitees: getVisitedPages(),
            temps_site: getTimeOnSite()
        });

        // 2. Envoi d'email de notification
        await sendEmailNotification(formData);

        // 3. Création dans CRM si nécessaire
        await createCRMLead(formData);

        return {
            success: true,
            contactId: contactRef.id
        };

    } catch (error) {
        console.error('Erreur soumission formulaire:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Détermination priorité
function determinePriority(service) {
    const priorities = {
        'place-fetes': 'haute',
        'anniversaire': 'haute',
        'piscine': 'moyenne',
        'salle-jeux': 'moyenne',
        'general': 'basse'
    };
    return priorities[service] || 'moyenne';
}