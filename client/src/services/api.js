const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }

  return payload;
}

export async function login(email, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function createAccount(values) {
  return request('/accounts', {
    method: 'POST',
    body: JSON.stringify(values),
  });
}

export async function getIssues({ roleId, userId, mode = 'authorized' }) {
  return request(`/issues?roleId=${encodeURIComponent(roleId || '')}&userId=${encodeURIComponent(userId || '')}&mode=${encodeURIComponent(mode)}`);
}

export async function getIssue(id, { roleId, userId }) {
  return request(`/issues/${encodeURIComponent(id)}?roleId=${encodeURIComponent(roleId || '')}&userId=${encodeURIComponent(userId || '')}`);
}

export async function createIssue(values, user) {
  return request('/issues', {
    method: 'POST',
    body: JSON.stringify({ ...values, user }),
  });
}

export async function updateIssue(id, { status, team, note }, authorName) {
  return request(`/issues/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, team, note, authorName }),
  });
}

export async function getNotifications(roleId) {
  return request(`/notifications?roleId=${encodeURIComponent(roleId || '')}`);
}

export async function markNotificationRead(id) {
  return request(`/notifications/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}

export async function markAllNotificationsRead(roleId) {
  return request(`/notifications?roleId=${encodeURIComponent(roleId || '')}`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}

export async function dismissNotification(id, roleId) {
  return request(`/notifications/${encodeURIComponent(roleId)}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function getUsers() {
  return request('/users');
}

export async function addUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id, updates) {
  return request(`/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function getCategories() {
  return request('/categories');
}

export async function addCategory(payload) {
  return request('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id) {
  return request(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getTeams() {
  return request('/teams');
}

export async function addTeam(payload) {
  return request('/teams', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteTeam(id) {
  return request(`/teams/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getSettings() {
  return request('/settings');
}

export async function saveSettings(settings) {
  return request('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export async function resetDemoData() {
  return request('/reset-demo-data', { method: 'POST' });
}

