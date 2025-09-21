// script.js
const apiBase = '/api/users';

const userForm = document.getElementById('user-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const editingInput = document.getElementById('editing-id');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-edit');
const tbody = document.getElementById('users-tbody');

function escapeHTML(s = '') {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}

async function fetchUsers() {
  try {
    const res = await fetch(apiBase);
    if (!res.ok) throw new Error('Failed to fetch users');
    const users = await res.json();
    renderUsers(users);
  } catch (err) {
    console.error(err);
    alert('Could not load users. See console.');
  }
}

function renderUsers(users) {
  tbody.innerHTML = '';
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="4">No users yet</td></tr>';
    return;
  }
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${escapeHTML(u.name)}</td>
      <td>${escapeHTML(u.email)}</td>
      <td>
        <button class="action edit" data-id="${u.id}">Edit</button>
        <button class="action delete" data-id="${u.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// handle form submit (create or update)
userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  if (!name || !email) { alert('Enter name and email'); return; }

  const editingId = editingInput.value;
  try {
    if (editingId) {
      // update
      const res = await fetch(`${apiBase}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }
      resetForm();
    } else {
      // create
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Create failed');
      }
      resetForm();
    }
    await fetchUsers();
  } catch (err) {
    console.error(err);
    alert('Operation failed: ' + err.message);
  }
});

function resetForm() {
  nameInput.value = '';
  emailInput.value = '';
  editingInput.value = '';
  submitBtn.textContent = 'Add User';
  cancelBtn.classList.add('hidden');
}

// cancel edit
cancelBtn.addEventListener('click', resetForm);

// event delegation for edit/delete buttons
tbody.addEventListener('click', async (e) => {
  const btn = e.target;
  if (btn.classList.contains('edit')) {
    const id = btn.dataset.id;
    try {
      const res = await fetch(`${apiBase}/${id}`);
      if (!res.ok) throw new Error('Fetch single user failed');
      const user = await res.json();
      nameInput.value = user.name;
      emailInput.value = user.email;
      editingInput.value = user.id;
      submitBtn.textContent = 'Update User';
      cancelBtn.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      alert('Could not load user for editing');
    }
  } else if (btn.classList.contains('delete')) {
    const id = btn.dataset.id;
    if (!confirm('Delete this user?')) return;
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Delete failed');
      }
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }
});

// initial load
fetchUsers();
