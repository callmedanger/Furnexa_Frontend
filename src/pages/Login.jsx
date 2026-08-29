import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import furnexaLogo from '../assets/furnexa.jpeg';

const VALID_ADMIN_CREDENTIALS = {
  'abdulrehman@admin.com': 'abdulcrm123',
  'hamza@admin.com': 'hamzafurnexa',
  'idraak@admin.com': 'idraakfurnexa',
};
const AUTH_STORAGE_KEY = 'furnexa-admin-authenticated';
const USER_NAME_KEY = 'furnexa-admin-user-name';
const USER_EMAIL_KEY = 'furnexa-admin-user-email';

const getDisplayNameFromEmail = (email) => {
  const localPart = (email || '').split('@')[0] || 'Admin';

  const nameMap = {
    abdulrehman: 'Abdul Rehman',
    hamza: 'Hamza',
    idraak: 'Idraak',
  };

  if (nameMap[localPart.toLowerCase()]) {
    return nameMap[localPart.toLowerCase()];
  }

  const formattedName = localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

  return formattedName || 'Admin';
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const storedPassword = VALID_ADMIN_CREDENTIALS[normalizedEmail];

    if (!storedPassword || password !== storedPassword) {
      setError('Invalid admin email or password.');
      return;
    }

    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    sessionStorage.setItem(USER_EMAIL_KEY, normalizedEmail);
    sessionStorage.setItem(USER_NAME_KEY, getDisplayNameFromEmail(normalizedEmail));
    navigate('/', { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#F6F2EC] flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={furnexaLogo} alt="Furnexa logo" className="w-16 h-16 rounded-xl object-cover mb-4" />
          <h1 className="text-2xl font-serif text-[#2E2118]">Furnexa Admin</h1>
          <p className="text-sm text-[#8A7C68] mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#5C4A3A] mb-2">
              Admin email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-[#EDE6DA] px-3 py-2.5 text-sm text-[#2E2118] outline-none focus:border-[#C98A3D]"
              placeholder="admin@furnexa.com"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#5C4A3A] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-[#EDE6DA] px-3 py-2.5 text-sm text-[#2E2118] outline-none focus:border-[#C98A3D]"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-[#C1694F]">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#2E2118] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4A3527]"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
};

export { AUTH_STORAGE_KEY, USER_NAME_KEY, USER_EMAIL_KEY, getDisplayNameFromEmail };
export default Login;