let authToken = localStorage.getItem('chatAuthToken');
let currentUsername = localStorage.getItem('chatUsername');

const authContainer = document.getElementById('authContainer');
const chatContainer = document.getElementById('chatContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const API_URL = 'http://localhost:3000';

// Enhanced error handling function
const handleApiError = async (response) => {
    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } else {
            const text = await response.text();
            throw new Error(`Server error: ${text || response.status}`);
        }
    }
    return response;
};

// Tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        if (tab.dataset.tab === 'login') {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
    });
});

// Enhanced Login Handler
function toggleForms() {
    document.getElementById('signup-form').classList.toggle('hidden');
    document.getElementById('login-form').classList.toggle('hidden');
  }
  
  async function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
  
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
  
        const data = await response.json();
        
        if (response.ok) {
            alert('Signup successful!');
            toggleForms();
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error during signup');
    }
  }
  
  async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
  
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
  
        const data = await response.json();
        
        if (response.ok) {
            alert('Login successful!');
            // Redirect or update UI as needed
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error during login');
    }
  }
function checkAuth() {
    if (authToken && currentUsername) {
        authContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        initializeChat();
    } else {
        authContainer.style.display = 'flex';
        chatContainer.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('chatAuthToken');
    localStorage.removeItem('chatUsername');
    authToken = null;
    currentUsername = null;
    location.reload();
}

document.addEventListener('DOMContentLoaded', checkAuth);