// LOCAL PROTOTYPE ONLY. This module is lazy-loaded exclusively by /login.
// Replace with server-side authentication and a protected admin subdomain before production.
const SESSION_KEY = 'sakhi.blog-admin.session';
export const AdminSession = {
  isAuthenticated() { try { return sessionStorage.getItem(SESSION_KEY) === 'local-preview'; } catch { return false; } },
  login(username, password) {
    if (username !== 'krish' || password !== '1153') return false;
    try { sessionStorage.setItem(SESSION_KEY, 'local-preview'); }
    catch { throw new Error('The session could not be started. Allow browser storage and try again.'); }
    return true;
  },
  logout() { try { sessionStorage.removeItem(SESSION_KEY); } catch {} },
};
