import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-full text-[#5C4A3A] dark:text-[#E8DFD3] hover:bg-[#F6F2EC] dark:hover:bg-white/10 transition-colors"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
    </button>
  );
};

export default ThemeToggle;