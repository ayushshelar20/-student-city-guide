/**
 * Auth Module — Login/Signup UI and session management
 */

/**
 * Initialize auth UI state based on current session
 */
function initAuth() {
  updateAuthUI();
}

/**
 * Update header UI based on login state
 */
function updateAuthUI() {
  const user = getCurrentUser();
  const authArea = document.getElementById('auth-area');
  if (!authArea) return;

  if (user) {
    authArea.innerHTML = `
      <div class="user-menu">
        <button class="user-avatar" id="user-menu-toggle" title="${user.name}">
          ${user.name.charAt(0).toUpperCase()}
        </button>
        <div class="user-dropdown" id="user-dropdown">
          <div class="dropdown-header">
            <strong>${user.name}</strong>
            <small>${user.email}</small>
          </div>
          <a href="#" onclick="showFavorites(); return false;" class="dropdown-item">❤️ My Favorites</a>
          <button onclick="logout()" class="dropdown-item logout-btn">🚪 Logout</button>
        </div>
      </div>`;

    document.getElementById('user-menu-toggle')?.addEventListener('click', () => {
      document.getElementById('user-dropdown')?.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-menu')) {
        document.getElementById('user-dropdown')?.classList.remove('show');
      }
    });
  } else {
    authArea.innerHTML = `<a href="/login.html" class="btn btn-primary btn-sm">Login / Sign Up</a>`;
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (data.token) {
    localStorage.setItem('scg_token', data.token);
    localStorage.setItem('scg_user', JSON.stringify(data.user));
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    window.location.href = '/';
  } else {
    showToast(data.error || 'Login failed', 'error');
  }
}

/**
 * Handle signup form submission
 */
async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (password !== confirm) {
    showToast('Passwords do not match', 'error');
    return;
  }

  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });

  if (data.token) {
    localStorage.setItem('scg_token', data.token);
    localStorage.setItem('scg_user', JSON.stringify(data.user));
    showToast(`Welcome, ${data.user.name}! Account created.`, 'success');
    window.location.href = '/';
  } else {
    showToast(data.error || 'Signup failed', 'error');
  }
}

/**
 * Logout — clear session and redirect
 */
function logout() {
  localStorage.removeItem('scg_token');
  localStorage.removeItem('scg_user');
  showToast('Logged out successfully', 'info');
  updateAuthUI();
  applyFilters(); // Re-fetch to remove favorite states
}

/**
 * Show user's favorited listings
 */
async function showFavorites() {
  const data = await apiFetch('/favorites');
  if (data.favorites) {
    // Update category tabs to show "Favorites" mode
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    renderListings(data.favorites);
    updateMarkers(data.favorites);
    updateResultCount(data.favorites.length);
    document.getElementById('result-count').textContent = `${data.favorites.length} saved place${data.favorites.length !== 1 ? 's' : ''}`;
  }
}
