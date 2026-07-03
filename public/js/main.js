// Smooth scroll implementation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Hover effect for interactive elements
const cards = document.querySelectorAll('.bg-surface-container-lowest');
cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
        card.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0px)';
    });
});

// Password visibility toggle logic
const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');
const togglePasswordIcon = document.querySelector('#togglePasswordIcon');

if (togglePassword && password && togglePasswordIcon) {
    togglePassword.addEventListener('click', function () {
        // Toggle the type attribute
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        // Toggle the icon
        togglePasswordIcon.textContent = type === 'password' ? 'visibility_off' : 'visibility';
    });
}
