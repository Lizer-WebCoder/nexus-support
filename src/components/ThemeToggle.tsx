import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { THEME_EVENT, getDarkMode, setDarkMode } from '../lib/uiPrefs';

export default function ThemeToggle() {
  const [dark, setDark] = useState(getDarkMode);

  useEffect(() => {
    const sync = () => setDark(getDarkMode());
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  return (
    <button
      type="button"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      onClick={() => setDarkMode(!dark)}
      className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
