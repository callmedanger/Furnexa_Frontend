import { useState } from 'react';
import { Bell, Check, LockKeyhole, Palette, UserRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (event) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Settings</h1>
        <p className="text-sm text-[#A99A82] mt-1">Manage your admin account and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <section className="bg-white dark:bg-[#2A1F16] rounded-2xl border border-[#EDE6DA] dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[#F6F2EC] dark:bg-white/10 flex items-center justify-center text-[#C98A3D]"><UserRound size={18} /></div>
            <div>
              <h2 className="font-medium text-[#2E2118] dark:text-[#F0EAE0]">Admin profile</h2>
              <p className="text-xs text-[#A99A82]">Your account details</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-[#5C4A3A] dark:text-[#C9BBA4]">Name<input value="Admin" readOnly className="mt-2 w-full rounded-lg border border-[#EDE6DA] dark:border-white/10 bg-[#FAF8F5] dark:bg-white/5 px-3 py-2.5 text-sm text-[#2E2118] dark:text-[#F0EAE0] outline-none" /></label>
            <label className="text-sm text-[#5C4A3A] dark:text-[#C9BBA4]">Email<input value="furnexa@admin.com" readOnly className="mt-2 w-full rounded-lg border border-[#EDE6DA] dark:border-white/10 bg-[#FAF8F5] dark:bg-white/5 px-3 py-2.5 text-sm text-[#2E2118] dark:text-[#F0EAE0] outline-none" /></label>
          </div>
        </section>

        <section className="bg-white dark:bg-[#2A1F16] rounded-2xl border border-[#EDE6DA] dark:border-white/10 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F6F2EC] dark:bg-white/10 flex items-center justify-center text-[#C98A3D]"><Palette size={18} /></div>
            <div><h2 className="font-medium text-[#2E2118] dark:text-[#F0EAE0]">Preferences</h2><p className="text-xs text-[#A99A82]">Customize your workspace</p></div>
          </div>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span><span className="block text-sm text-[#2E2118] dark:text-[#F0EAE0]">Dark mode</span><span className="text-xs text-[#A99A82]">Use a darker color scheme</span></span>
            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="h-4 w-4 accent-[#C98A3D]" />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span><span className="block text-sm text-[#2E2118] dark:text-[#F0EAE0]">Email alerts</span><span className="text-xs text-[#A99A82]">Receive updates about new orders</span></span>
            <input type="checkbox" checked={emailAlerts} onChange={(event) => setEmailAlerts(event.target.checked)} className="h-4 w-4 accent-[#C98A3D]" />
          </label>
        </section>

        <div className="flex items-center gap-4">
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#2E2118] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4A3527] transition-colors"><Check size={16} /> Save changes</button>
          {saved && <span className="text-sm text-[#6B8E5E]">Settings saved</span>}
        </div>
      </form>

      <div className="flex items-center gap-2 text-xs text-[#A99A82]"><Bell size={14} /> Notifications are currently managed from the Notifications page.</div>
      <div className="flex items-center gap-2 text-xs text-[#A99A82]"><LockKeyhole size={14} /> This admin workspace is protected by your active session.</div>
    </div>
  );
};

export default Settings;
