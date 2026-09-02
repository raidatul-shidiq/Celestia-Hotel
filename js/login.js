const loginForm = document.getElementById('login-form');
const customModal = document.getElementById('custom-modal');
const modalOkBtn = document.getElementById('modal-ok-btn');

const STAFF_CREDENTIALS = {
    username: "resepsionis",
    password: "celestia2026",
    name: "Resepsionis Utama"
};

if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value.trim();

        if (usernameInput === STAFF_CREDENTIALS.username && 
            passwordInput === STAFF_CREDENTIALS.password) {
            
            const sessionData = {
                username: usernameInput,
                name: STAFF_CREDENTIALS.name,
                isLoggedIn: true,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('celestia_staff_session', JSON.stringify(sessionData));

            if (customModal) {
                customModal.classList.add('show-flex-element');
            }
        } else {
            showLoginError('Username atau Password salah!');
        }
    });
}

function showLoginError(message) {
    let errorElement = document.getElementById('login-error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'login-error-message';
        errorElement.classList.add('login-error-box'); 
        
        if (loginForm) loginForm.appendChild(errorElement);
    }
    
    errorElement.textContent = `❌ ${message}`;
    
    setTimeout(() => {
        if (errorElement) errorElement.remove();
    }, 4000);
}

if (modalOkBtn) {
    modalOkBtn.addEventListener('click', function() {
        if (customModal) customModal.classList.remove('show-flex-element');
        window.location.href = "../index.html";
    });
}

if (customModal) {
    customModal.addEventListener('click', function(event) {
        if (event.target === customModal) {
            customModal.classList.remove('show-flex-element');
        }
    });
}

const togglePasswordBtn = document.getElementById('toggle-password');
const passwordField = document.getElementById('password');

if (togglePasswordBtn && passwordField) {
    togglePasswordBtn.addEventListener('click', function() {
        const currentType = passwordField.getAttribute('type');
        const isPassword = currentType === 'password';
        
        passwordField.setAttribute('type', isPassword ? 'text' : 'password');
        togglePasswordBtn.textContent = isPassword ? '🔒' : '👁';
        togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Sembunyikan password' : 'Lihat password');
    });

    togglePasswordBtn.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.click();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const usernameField = document.getElementById('username');
    if (usernameField) usernameField.focus();
});