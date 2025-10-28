const USER_KEY = 'current_user';

export async function isAuthenticated() {
  // Always consider the admin logged in (login removed to avoid conflicts)
  if (!localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, JSON.stringify({ name: 'Admin User', role: 'ADMIN' }));
  }
  return true;
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || '{}');
  } catch {
    return { name: 'Admin User', role: 'ADMIN' };
  }
}

export function logout() {
  localStorage.removeItem(USER_KEY);
  location.reload();
}