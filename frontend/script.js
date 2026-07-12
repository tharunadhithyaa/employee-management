/**
 * Employee Management System — Frontend Logic
 * =============================================
 * 
 * This file contains ALL the JavaScript for the frontend:
 *   - Dummy login / logout
 *   - SPA-style page navigation
 *   - CRUD operations against the REST API
 *   - Dashboard statistics
 *   - Toast notifications
 *   - Edit & Delete modals
 *   - Employee search/filter
 * 
 * API Base URL:
 *   All API calls go through Nginx, so we just use "/api".
 *   Nginx reverse-proxies /api/* to the backend container.
 */


// ============================================================
// CONFIGURATION
// ============================================================

// Base URL for API calls.
// Since Nginx reverse-proxies /api → backend:5000/api,
// we can use a relative path here.
const API_BASE = '/api';

// In-memory cache of all employees (used for filtering)
let allEmployees = [];

// ID of the employee being deleted (for the confirmation modal)
let deleteTargetId = null;


// ============================================================
// ON PAGE LOAD
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is "logged in" (stored in sessionStorage)
  const isLoggedIn = sessionStorage.getItem('ems_logged_in');

  if (isLoggedIn === 'true') {
    showApp();
  } else {
    showLogin();
  }
});


// ============================================================
// AUTHENTICATION (Dummy — No real auth)
// ============================================================

/**
 * Handle the login form submission.
 * Accepts any username/password combo of "admin"/"admin".
 */
function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  // Simple dummy authentication
  if (username === 'admin' && password === 'admin') {
    sessionStorage.setItem('ems_logged_in', 'true');
    showApp();
    showToast('Welcome back, Admin! 👋', 'success');
  } else {
    showToast('Invalid credentials. Use admin / admin', 'error');
  }
}

/**
 * Log out the user: clear session and show login page.
 */
function handleLogout() {
  sessionStorage.removeItem('ems_logged_in');
  showLogin();
  showToast('Logged out successfully', 'info');
}

/**
 * Show the login page, hide the app.
 */
function showLogin() {
  document.getElementById('login-page').classList.add('active');
  document.getElementById('app-page').classList.remove('active');
}

/**
 * Show the app, hide the login page, and load dashboard data.
 */
function showApp() {
  document.getElementById('login-page').classList.remove('active');
  document.getElementById('app-page').classList.add('active');
  loadDashboard();
}


// ============================================================
// NAVIGATION (SPA-style page switching)
// ============================================================

/**
 * Navigate between Dashboard, Employees, and Add Employee views.
 * Updates the sidebar active state and page title.
 */
function navigateTo(page, event) {
  if (event) event.preventDefault();

  // Hide all content views
  document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));

  // Deactivate all sidebar nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Activate the target view
  const viewId = page + '-view';
  const view = document.getElementById(viewId);
  if (view) view.classList.add('active');

  // Activate the matching sidebar item
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  // Update the page title in the topbar
  const titles = {
    'dashboard': 'Dashboard',
    'employees': 'Employee List',
    'add-employee': 'Add Employee'
  };
  document.getElementById('page-title').textContent = titles[page] || 'Dashboard';

  // Load data for the selected view
  if (page === 'dashboard') loadDashboard();
  if (page === 'employees') loadEmployees();
  if (page === 'add-employee') resetForm();

  // Close sidebar on mobile after navigation
  document.getElementById('sidebar').classList.remove('open');
}


// ============================================================
// SIDEBAR TOGGLE (Mobile)
// ============================================================

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}


// ============================================================
// DASHBOARD — Load Stats & Recent Employees
// ============================================================

async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/employees`);
    const json = await res.json();

    if (!json.success) {
      showToast('Failed to load dashboard data', 'error');
      return;
    }

    const employees = json.data;
    allEmployees = employees;

    // --- Stat Cards ---
    // Total employees
    document.getElementById('stat-total').textContent = employees.length;

    // Unique departments
    const departments = [...new Set(employees.map(e => e.department))];
    document.getElementById('stat-departments').textContent = departments.length;

    // Average salary
    const avgSalary = employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length)
      : 0;
    document.getElementById('stat-avg-salary').textContent = '₹' + avgSalary.toLocaleString('en-IN');

    // Employees who joined this month
    const now = new Date();
    const thisMonth = employees.filter(e => {
      const d = new Date(e.joinDate || e.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    document.getElementById('stat-recent').textContent = thisMonth.length;

    // --- Recent Employees Table (top 5) ---
    const tbody = document.getElementById('recent-employees-tbody');
    if (employees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No employees yet. Add one to get started!</td></tr>';
      return;
    }

    tbody.innerHTML = employees.slice(0, 5).map(emp => `
      <tr>
        <td><strong>${escapeHtml(emp.name)}</strong></td>
        <td>${escapeHtml(emp.email)}</td>
        <td><span class="dept-badge">${escapeHtml(emp.department)}</span></td>
        <td>${escapeHtml(emp.designation)}</td>
        <td>₹${emp.salary.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Dashboard load error:', err);
    showToast('Unable to connect to the server', 'error');
  }
}


// ============================================================
// EMPLOYEE LIST — Load & Display All Employees
// ============================================================

async function loadEmployees() {
  try {
    const res = await fetch(`${API_BASE}/employees`);
    const json = await res.json();

    if (!json.success) {
      showToast('Failed to load employees', 'error');
      return;
    }

    allEmployees = json.data;
    renderEmployeeTable(allEmployees);

  } catch (err) {
    console.error('Load employees error:', err);
    showToast('Unable to connect to the server', 'error');
  }
}

/**
 * Render the employee table with the given array of employees.
 * Called by both loadEmployees() and filterEmployees().
 */
function renderEmployeeTable(employees) {
  const tbody = document.getElementById('employees-tbody');

  if (employees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No employees found.</td></tr>';
    return;
  }

  tbody.innerHTML = employees.map(emp => {
    const joinDate = emp.joinDate
      ? new Date(emp.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

    return `
      <tr>
        <td><strong>${escapeHtml(emp.name)}</strong></td>
        <td>${escapeHtml(emp.email)}</td>
        <td><span class="dept-badge">${escapeHtml(emp.department)}</span></td>
        <td>${escapeHtml(emp.designation)}</td>
        <td>₹${emp.salary.toLocaleString('en-IN')}</td>
        <td>${joinDate}</td>
        <td>
          <div class="actions-cell">
            <button class="btn btn-icon btn-icon-edit" title="Edit" onclick="openEditModal('${emp._id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-icon btn-icon-delete" title="Delete" onclick="openDeleteModal('${emp._id}', '${escapeHtml(emp.name)}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}


// ============================================================
// SEARCH / FILTER EMPLOYEES
// ============================================================

function filterEmployees() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();

  if (!query) {
    renderEmployeeTable(allEmployees);
    return;
  }

  const filtered = allEmployees.filter(emp =>
    emp.name.toLowerCase().includes(query) ||
    emp.email.toLowerCase().includes(query) ||
    emp.department.toLowerCase().includes(query) ||
    emp.designation.toLowerCase().includes(query)
  );

  renderEmployeeTable(filtered);
}


// ============================================================
// CREATE EMPLOYEE (Add Employee form)
// ============================================================

async function handleEmployeeSubmit(event) {
  event.preventDefault();

  // Gather form data
  const employee = {
    name:        document.getElementById('emp-name').value.trim(),
    email:       document.getElementById('emp-email').value.trim(),
    department:  document.getElementById('emp-department').value,
    designation: document.getElementById('emp-designation').value.trim(),
    salary:      parseFloat(document.getElementById('emp-salary').value),
    joinDate:    document.getElementById('emp-joindate').value || undefined
  };

  try {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });

    const json = await res.json();

    if (json.success) {
      showToast(`${employee.name} added successfully! 🎉`, 'success');
      resetForm();
      navigateTo('employees');
    } else {
      showToast(json.message || 'Failed to add employee', 'error');
    }
  } catch (err) {
    console.error('Create employee error:', err);
    showToast('Unable to connect to the server', 'error');
  }
}


// ============================================================
// EDIT EMPLOYEE (Modal)
// ============================================================

/**
 * Open the edit modal and populate it with the employee's data.
 */
async function openEditModal(id) {
  try {
    const res = await fetch(`${API_BASE}/employees/${id}`);
    const json = await res.json();

    if (!json.success) {
      showToast('Employee not found', 'error');
      return;
    }

    const emp = json.data;

    // Populate modal fields
    document.getElementById('modal-edit-id').value = emp._id;
    document.getElementById('modal-name').value = emp.name;
    document.getElementById('modal-email').value = emp.email;
    document.getElementById('modal-department').value = emp.department;
    document.getElementById('modal-designation').value = emp.designation;
    document.getElementById('modal-salary').value = emp.salary;

    // Format the date for the date input (YYYY-MM-DD)
    if (emp.joinDate) {
      document.getElementById('modal-joindate').value = emp.joinDate.split('T')[0];
    }

    // Show the modal
    document.getElementById('edit-modal').classList.add('active');

  } catch (err) {
    console.error('Edit modal error:', err);
    showToast('Unable to load employee data', 'error');
  }
}

/**
 * Handle the edit form submission.
 */
async function handleEditSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('modal-edit-id').value;
  const updatedData = {
    name:        document.getElementById('modal-name').value.trim(),
    email:       document.getElementById('modal-email').value.trim(),
    department:  document.getElementById('modal-department').value,
    designation: document.getElementById('modal-designation').value.trim(),
    salary:      parseFloat(document.getElementById('modal-salary').value),
    joinDate:    document.getElementById('modal-joindate').value || undefined
  };

  try {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    const json = await res.json();

    if (json.success) {
      showToast(`${updatedData.name} updated successfully! ✅`, 'success');
      closeEditModal();
      loadEmployees(); // Refresh the employee list
    } else {
      showToast(json.message || 'Failed to update employee', 'error');
    }
  } catch (err) {
    console.error('Update employee error:', err);
    showToast('Unable to connect to the server', 'error');
  }
}

/**
 * Close the edit modal.
 */
function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('active');
}


// ============================================================
// DELETE EMPLOYEE (Confirmation Modal)
// ============================================================

/**
 * Open the delete confirmation modal.
 */
function openDeleteModal(id, name) {
  deleteTargetId = id;
  document.getElementById('delete-emp-name').textContent = name;
  document.getElementById('delete-modal').classList.add('active');
}

/**
 * Close the delete confirmation modal.
 */
function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal').classList.remove('active');
}

/**
 * Confirm and execute the delete operation.
 */
async function confirmDelete() {
  if (!deleteTargetId) return;

  try {
    const res = await fetch(`${API_BASE}/employees/${deleteTargetId}`, {
      method: 'DELETE'
    });

    const json = await res.json();

    if (json.success) {
      showToast('Employee deleted successfully 🗑️', 'success');
      closeDeleteModal();
      loadEmployees(); // Refresh the table
    } else {
      showToast(json.message || 'Failed to delete employee', 'error');
    }
  } catch (err) {
    console.error('Delete employee error:', err);
    showToast('Unable to connect to the server', 'error');
  }
}


// ============================================================
// FORM UTILITIES
// ============================================================

/**
 * Reset the employee form to its initial state.
 */
function resetForm() {
  document.getElementById('employee-form').reset();
  document.getElementById('edit-employee-id').value = '';
  document.getElementById('form-title').textContent = 'Add New Employee';
  document.getElementById('form-submit-btn').querySelector('span').textContent = 'Save Employee';
}


// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

/**
 * Show a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type    - 'success', 'error', or 'info'.
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');

  // Create the toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Choose an icon based on type
  const icons = {
    success: '✅',
    error:   '❌',
    info:    'ℹ️'
  };

  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.classList.add('removing');
    // Wait for the exit animation, then remove from DOM
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Escape HTML special characters to prevent XSS.
 * Always use this when inserting user-supplied data into HTML.
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
