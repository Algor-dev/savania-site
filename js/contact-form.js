// Gestion du formulaire de contact PUBLIC
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                nom: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                telephone: document.getElementById('phone').value.trim(),
                service: document.getElementById('service').value,
                sujet: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim(),
                newsletter: document.getElementById('newsletter').checked,
                date_soumission: new Date(),
                statut: 'nouveau',
                lu: false
            };
            
            // Loader
            const btnText = document.querySelector('.btn-text');
            const btnLoading = document.querySelector('.btn-loading');
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-block';
            
            try {
                await window.savaniaDB.collection('contacts').add(formData);
                
                alert('✅ Message envoyé avec succès !');
                contactForm.reset();
                
            } catch (error) {
                console.error('Erreur:', error);
                alert('❌ Erreur lors de l\'envoi');
            } finally {
                btnText.style.display = 'inline-block';
                btnLoading.style.display = 'none';
            }
        });
    }
});