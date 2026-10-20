const DARK_KEY = 'nexus-dark-v1';
const COMPACT_KEY = 'nexus-compact-v1';

export function getDarkMode(): boolean {
  try {
    return localStorage.getItem(DARK_KEY) === '1';
  } catch {
    return false;
  }
}

export function setDarkMode(on: boolean) {
  try {
    localStorage.setItem(DARK_KEY, on ? '1' : '0');
  } catch {}
  applyUiPrefs();
}

export function getCompactMode(): boolean {
  try {
    return localStorage.getItem(COMPACT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setCompactMode(on: boolean) {
  try {
    localStorage.setItem(COMPACT_KEY, on ? '1' : '0');
  } catch {}
  applyUiPrefs();
}

/** Apply dark + compact classes on documentElement */
export function applyUiPrefs() {
  const root = document.documentElement;
  if (getDarkMode()) root.classList.add('nexus-dark');
  else root.classList.remove('nexus-dark');
  if (getCompactMode()) root.classList.add('nexus-compact');
  else root.classList.remove('nexus-compact');
}
