import { ref } from 'vue';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234';
const STORAGE_KEY = 'lf_is_admin';

const isAdmin = ref(localStorage.getItem(STORAGE_KEY) === 'true');

function loginAdmin(pin: string): boolean {
  if (pin === ADMIN_PIN) {
    isAdmin.value = true;
    localStorage.setItem(STORAGE_KEY, 'true');
    return true;
  }
  return false;
}

function logoutAdmin() {
  isAdmin.value = false;
  localStorage.removeItem(STORAGE_KEY);
}

export function useAdmin() {
  return { isAdmin, loginAdmin, logoutAdmin };
}
