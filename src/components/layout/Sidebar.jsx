import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';

const NAV_ITEMS = [
  { to: '/',           label: '🗺️ Explorer',     end: true },
  { to: '/community',  label: '👥 Communauté' },
  { to: '/premium',    label: '✨ Premium' },
  { to: '/profile',    label: '👤 Profil',        authOnly: true },
];

/**
 * Sidebar de navigation latérale (desktop).
 * @returns {JSX.Element}
 */
export function Sidebar() {
  const { session } = useAuthStore();

  return (
    <aside className="hidden lg:flex flex-col gap-2 w-52 shrink-0 pt-6">
      {NAV_ITEMS.filter(item => !item.authOnly || session).map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              isActive
                ? 'bg-blue-500/20 text-blue-300'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
