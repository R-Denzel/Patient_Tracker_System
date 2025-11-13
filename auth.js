// User Management System using localStorage

// Initialize users array in localStorage if it doesn't exist
function initUsers() {
    if (!localStorage.getItem('users')) {
        // Create default admin account
        const defaultUsers = [
            {
                username: 'admin',
                email: 'admin@patienttracker.com',
                password: 'admin123', // In production, this should be hashed
                role: 'system_admin',
                id: Date.now()
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Get all users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Add a new user
function registerUser(username, email, password, role) {
    const users = getUsers();
    
    // Check if username already exists
    if (users.find(user => user.username === username)) {
        return { success: false, message: 'Username already exists' };
    }
    
    // Check if email already exists
    if (users.find(user => user.email === email)) {
        return { success: false, message: 'Email already exists' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password, // In production, this should be hashed
        role: role,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'Registration successful!' };
}

// Authenticate user
function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store current user session
        const session = {
            id: user.id,
            username: user.username,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(session));
        return { success: true, user: session };
    } else {
        return { success: false, message: 'Invalid username or password' };
    }
}

// Get current user session
function getCurrentUser() {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
}

// Logout current user
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Get dashboard URL based on role
function getDashboardUrl(role) {
    const roleMap = {
        'receptionist': 'dashboard-receptionist.html',
        'doctor': 'dashboard-doctor.html',
        'system_admin': 'dashboard-admin.html'
    };
    return roleMap[role] || 'index.html';
}

// Initialize on page load
initUsers();

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
        
        if (!username || !password) {
            errorMessage.textContent = 'Please fill in all fields';
            errorMessage.classList.add('show');
            return;
        }
        
        const result = loginUser(username, password);
        
        if (result.success) {
            // Redirect to appropriate dashboard
            window.location.href = getDashboardUrl(result.user.role);
        } else {
            errorMessage.textContent = result.message;
            errorMessage.classList.add('show');
        }
    });
}

// Registration Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const role = document.getElementById('regRole').value;
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
        successMessage.textContent = '';
        successMessage.classList.remove('show');
        
        // Validation
        if (!username || !email || !password || !confirmPassword || !role) {
            errorMessage.textContent = 'Please fill in all fields';
            errorMessage.classList.add('show');
            return;
        }
        
        if (password.length < 6) {
            errorMessage.textContent = 'Password must be at least 6 characters long';
            errorMessage.classList.add('show');
            return;
        }
        
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            errorMessage.classList.add('show');
            return;
        }
        
        // Register user
        const result = registerUser(username, email, password, role);
        
        if (result.success) {
            successMessage.textContent = result.message + ' Redirecting to login...';
            successMessage.classList.add('show');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            errorMessage.textContent = result.message;
            errorMessage.classList.add('show');
        }
    });
}

