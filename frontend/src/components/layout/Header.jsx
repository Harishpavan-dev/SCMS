import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { BellIcon } from '@heroicons/react/24/outline';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/lecturers': 'Lecturers',
  '/subjects': 'Subjects',
  '/notifications': 'Notifications',
  '/profile': 'Settings',
  '/attendance/my': 'My Attendance',
  '/attendance': 'Mark Attendance',
  '/Rep_login': 'Mark Attendance',
  '/attendance/admin-scan': 'QR Scanner',
  '/attendance/rep-analytics': 'Attendance Reports',
};

export const Header = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const getTitle = () => {
    const match = Object.keys(PAGE_TITLES).find((key) =>
      location.pathname === key || location.pathname.startsWith(key + '/')
    );
    return match ? PAGE_TITLES[match] : 'Dashboard';
  };

  // Today's date formatted nicely
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30">
      {/* Left — Page Title & Date */}
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">{getTitle()}</h2>
        <p className="text-[11px] font-bold text-slate-400 hidden sm:block uppercase tracking-wider">{today}</p>
      </div>

      {/* Right — Notification + Avatar */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <Link
          to="/notifications"
          className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-100" />

        {/* Avatar + Name */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-colors"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user?.role}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};
