import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  AcademicCapIcon,
  QrCodeIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
  UserCircleIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const getNavItems = () => {
    const role = user?.role;

    if (role === 'admin') {
      return [
        { label: 'Main', items: [
          { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        ]},
        { label: 'Management', items: [
          { name: 'Students', path: '/students', icon: UsersIcon },
          { name: 'Lecturers', path: '/lecturers', icon: AcademicCapIcon },
          { name: 'Subjects', path: '/subjects', icon: BookOpenIcon },
        ]},
        { label: 'Attendance', items: [
          { name: 'Mark Attendance', path: '/attendance/admin-scan', icon: QrCodeIcon },
        ]},
        { label: 'Account', items: [
          { name: 'Settings', path: '/profile', icon: Cog6ToothIcon },
        ]},
      ];
    }

    if (role === 'hod') {
      return [
        { label: 'Main', items: [
          { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
          { name: 'Reports', path: '/dashboards/hod-dashboard', icon: DocumentChartBarIcon },
        ]},
        { label: 'Academic', items: [
          { name: 'Subjects', path: '/subjects', icon: BookOpenIcon },
        ]},
        { label: 'Account', items: [
          { name: 'Settings', path: '/profile', icon: Cog6ToothIcon },
        ]},
      ];
    }

    if (role === 'lecturer') {
      return [
        { label: 'Main', items: [
          { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
          { name: 'Mark Attendance', path: '/attendance', icon: ClipboardDocumentCheckIcon },
        ]},
        { label: 'Account', items: [
          { name: 'Settings', path: '/profile', icon: Cog6ToothIcon },
        ]},
      ];
    }

    if (role === 'rep') {
      return [
        { label: 'Main', items: [
          { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
          { name: 'Mark Attendance', path: '/rep-login', icon: ClipboardDocumentCheckIcon },
          { name: 'My Attendance', path: '/attendance/my', icon: ChartBarIcon },
        ]},
        { label: 'Identity', items: [
          { name: 'My ID Card', path: '/my-id-card', icon: IdentificationIcon },
        ]},
        { label: 'Account', items: [
          { name: 'Settings', path: '/profile', icon: Cog6ToothIcon },
        ]},
      ];
    }

    if (role === 'student') {
      return [
        { label: 'Main', items: [
          { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
          { name: 'My Attendance', path: '/attendance/my', icon: ChartBarIcon },
        ]},
        { label: 'Identity', items: [
          { name: 'My ID Card', path: '/my-id-card', icon: IdentificationIcon },
        ]},
        { label: 'Account', items: [
          { name: 'Settings', path: '/profile', icon: Cog6ToothIcon },
        ]},
      ];
    }

    return [
      { label: 'Main', items: [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
      ]},
    ];
  };

  const groups = getNavItems();

  return (
    <div className="w-full bg-white h-full flex flex-col border-r border-slate-100" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Brand ── */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
            <span className="text-white text-xs font-black tracking-tight">SC</span>
          </div>
          <span className="text-slate-800 text-sm font-bold tracking-tight">SCMS</span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ── User Greeting ── */}
      <div className="px-5 py-5 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.path === '/dashboard'
                    ? location.pathname === '/dashboard'
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.name + item.path}
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'h-4.5 w-4.5 shrink-0',
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      )}
                      style={{ width: '1.1rem', height: '1.1rem' }}
                    />
                    {item.name}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Sign Out ── */}
      <div className="p-4 border-t border-slate-100 shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
