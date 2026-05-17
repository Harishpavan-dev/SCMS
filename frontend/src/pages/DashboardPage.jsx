import { useEffect, useState } from 'react';
import useAuthStore from '../stores/authStore';
import api from '../api/client';
import {
  UsersIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BellAlertIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  BookOpenIcon,
  QrCodeIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';

// ─── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, accent }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow duration-300">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${accent}18` }}>
      <Icon className="h-6 w-6" style={{ color: accent }} />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-800 leading-none">{value ?? '—'}</p>
    </div>
  </div>
);

// ─── Notification Item ──────────────────────────────────────────────────────────
const NOTIF_STYLES = {
  info:    { icon: InformationCircleIcon,  bg: '#EFF6FF', color: '#3B82F6' },
  warning: { icon: ExclamationTriangleIcon, bg: '#FFFBEB', color: '#F59E0B' },
  success: { icon: CheckCircleIcon,         bg: '#F0FDF4', color: '#22C55E' },
  alert:   { icon: BellAlertIcon,           bg: '#FFF1F2', color: '#F43F5E' },
  danger:  { icon: BellAlertIcon,           bg: '#FFF1F2', color: '#F43F5E' },
};

const NotifItem = ({ type = 'info', text, time }) => {
  const s = NOTIF_STYLES[type] || NOTIF_STYLES.info;
  const Icon = s.icon;
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-slate-50 last:border-0">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: s.bg }}>
        <Icon className="w-4 h-4" style={{ color: s.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 font-medium leading-snug">{text}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

// ─── Activity Item ──────────────────────────────────────────────────────────────
const ActivityItem = ({ icon: Icon, color, bg, title, subtitle }) => (
  <div className="flex items-center gap-4 py-3.5 border-b border-slate-50 last:border-0">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: bg }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    <ArrowRightIcon className="w-4 h-4 text-slate-200 shrink-0" />
  </div>
);

// ─── Chart Tooltip ──────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl shadow-lg px-4 py-3">
        <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-indigo-600">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data.data))
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setError('Could not load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
        <ExclamationTriangleIcon className="w-10 h-10 text-amber-400" />
        <p className="text-sm font-semibold text-slate-600">{error}</p>
        <button onClick={() => window.location.reload()}
          className="text-xs text-indigo-600 underline">Try again</button>
      </div>
    );
  }

  const isRep     = user?.role === 'rep';
  const isAdmin   = user?.role === 'admin' || user?.role === 'hod';
  const isStudent = user?.role === 'student';

  // ── Derived values ──────────────────────────────────────────────────────────
  // Weekly chart: use real data from API, fallback to zeros if empty
  const weeklyData = (data?.weekly_attendance?.length > 0)
    ? data.weekly_attendance
    : [
        { day: 'Mon', attendance: 0 },
        { day: 'Tue', attendance: 0 },
        { day: 'Wed', attendance: 0 },
        { day: 'Thu', attendance: 0 },
        { day: 'Fri', attendance: 0 },
        { day: 'Sat', attendance: 0 },
        { day: 'Sun', attendance: 0 },
      ];

  // Notifications: use real API notifications array
  const notifications = data?.notifications ?? [];

  // No-data placeholder for notifications
  const emptyNotif = notifications.length === 0;

  // ── Stat card config per role ───────────────────────────────────────────────
  const statCards = isAdmin
    ? [
        { title: 'Total Students',          value: data?.total_students,    icon: UsersIcon,                   accent: '#6366F1' },
        { title: 'Attendance Today',         value: `${data?.attendance_today_percentage ?? 0}%`, icon: ClipboardDocumentCheckIcon, accent: '#10B981' },
      ]
    : isRep
    ? [
        { title: 'Batch Students',           value: data?.total_students,    icon: UsersIcon,                   accent: '#6366F1' },
        { title: "Today's Avg Attendance",   value: `${data?.attendance_today_percentage ?? 0}%`, icon: ClipboardDocumentCheckIcon, accent: '#10B981' },
      ]
    : [
        { title: 'My Attendance Rate',       value: `${data?.attendance_percentage ?? 0}%`, icon: ChartBarIcon,  accent: '#6366F1' },
        { title: 'Classes Attended',         value: `${data?.classes_attended ?? 0} / ${data?.total_classes ?? 0}`, icon: CalendarDaysIcon, accent: '#10B981' },
      ];

  // ── Activity items for non-admin ────────────────────────────────────────────
  const activityItems = [
    { icon: ClipboardDocumentCheckIcon, color: '#6366F1', bg: '#EEF2FF', title: 'Attendance Marked',    subtitle: 'Last session recorded successfully' },
    { icon: DocumentCheckIcon,          color: '#10B981', bg: '#ECFDF5', title: 'Result Published',      subtitle: data?.recent_results?.[0]?.subject?.name ?? 'Check your latest results' },
    { icon: UserPlusIcon,               color: '#F59E0B', bg: '#FFFBEB', title: isAdmin ? 'New Student Registered' : 'Profile Updated', subtitle: isAdmin ? (data?.recent_students?.[0]?.user?.name ?? 'Recent registration') : 'Your profile is up to date' },
  ];

  return (
    <div className="space-y-7 pb-16 animate-fade-in" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Welcome Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back,{' '}
            <span className="text-indigo-600">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">Here's your overview for today</p>
        </div>

        {/* Mark Attendance CTA */}
        {isAdmin && (
          <Link to="/attendance/admin-scan"
            className="inline-flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-sm hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 active:scale-95 self-start sm:self-auto">
            <ClipboardDocumentCheckIcon className="w-4 h-4" />
            Mark Attendance
          </Link>
        )}
        {isRep && (
          <Link to="/rep-login"
            className="inline-flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-sm hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 active:scale-95 self-start sm:self-auto">
            <ClipboardDocumentCheckIcon className="w-4 h-4" />
            Mark Attendance
          </Link>
        )}
        {isStudent && (
          <div className="flex flex-wrap gap-3">
            <Link to="/attendance/my"
              className="inline-flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-sm hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 active:scale-95 self-start sm:self-auto">
              <ChartBarIcon className="w-4 h-4" />
              My Attendance
            </Link>
            <Link to="/my-id-card"
              className="inline-flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-sm hover:shadow-lg hover:shadow-slate-200 transition-all duration-200 active:scale-95 self-start sm:self-auto">
              <IdentificationIcon className="w-4 h-4" />
              My ID Card
            </Link>
          </div>
        )}
      </div>

      {/* ── Low Attendance Warning (Student) ───────────────────────────────────── */}
      {(isStudent || isRep) && data?.attendance_warning && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-4">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm font-medium">
            Your attendance is below <strong>75%</strong>. Please attend upcoming classes to avoid academic issues.
          </p>
        </div>
      )}

      {/* ── Summary Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* ── Chart + Notifications ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Attendance Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Weekly Attendance</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAdmin ? 'Overall attendance this week' : isRep ? 'Batch attendance this week' : 'Your attendance this week'}
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              This Week
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                  tickFormatter={v => `${v}%`} width={42} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F8FAFC', radius: 8 }} />
                <Bar dataKey="attendance" fill="#6366F1" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-800">Notifications</h2>
            <Link to="/notifications"
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
              View all
            </Link>
          </div>

          {emptyNotif ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                <BellAlertIcon className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
              <p className="text-xs text-slate-300 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="overflow-y-auto">
              {notifications.slice(0, 4).map((n, i) => (
                <NotifItem key={n.id ?? i} type={n.type} text={n.text ?? n.message} time={n.time ?? n.created_at} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Rep Subject Matrix / Admin Quick Stats / Student Info ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

          {/* REP: Today's subject analytics */}
          {isRep && (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Today's Classes</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Subject-wise attendance for today</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-400 font-medium">Live</span>
                </div>
              </div>
              {data?.today_subject_analytics?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.today_subject_analytics.map((s, i) => {
                    const pct   = s.percentage ?? 0;
                    const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#F43F5E';
                    const bg    = pct >= 80 ? '#ECFDF5' : pct >= 50 ? '#FFFBEB' : '#FFF1F2';
                    return (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 border border-transparent hover:border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.code}</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{s.subject}</p>
                          <p className="text-xs text-slate-400 mt-1">{s.present} / {s.total} present</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ color, backgroundColor: bg }}>
                          {pct}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <ClipboardDocumentCheckIcon className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-3">No classes scheduled today</p>
                  <Link to="/Rep_login" className="text-sm font-semibold text-indigo-600 hover:underline">
                    Mark attendance →
                  </Link>
                </div>
              )}
            </>
          )}

          {/* ADMIN: Quick Stats */}
          {isAdmin && (
            <>
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-800">System Overview</h2>
                <p className="text-xs text-slate-400 mt-0.5">Live system metrics</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-indigo-50 rounded-xl">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Lecturers</p>
                  <p className="text-3xl font-bold text-indigo-700">{data?.total_lecturers ?? '—'}</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Subjects</p>
                  <p className="text-3xl font-bold text-emerald-700">{data?.total_subjects ?? '—'}</p>
                </div>
                <div className="p-5 bg-amber-50 rounded-xl">
                  <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Records Today</p>
                  <p className="text-3xl font-bold text-amber-700">{data?.attendance_today ?? '—'}</p>
                </div>
              </div>

              {/* Recent Students */}
              {data?.recent_students?.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recently Registered</p>
                  <div className="space-y-2">
                    {data.recent_students.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shrink-0">
                          {s.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{s.user?.name}</p>
                          <p className="text-xs text-slate-400">{s.registration_number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* STUDENT: Academic snapshot */}
          {isStudent && (
            <>
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-800">Academic Snapshot</h2>
                <p className="text-xs text-slate-400 mt-0.5">Your current semester overview</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-indigo-50 rounded-xl">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Semester</p>
                  <p className="text-3xl font-bold text-indigo-700">
                    {data?.current_semester ? `Sem ${data.current_semester.number}` : '—'}
                  </p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">GPA</p>
                  <p className="text-3xl font-bold text-emerald-700">{data?.current_gpa ?? 'N/A'}</p>
                </div>
                {data?.recent_results?.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Results</p>
                    <div className="space-y-2">
                      {data.recent_results.slice(0, 3).map((r) => (
                        <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{r.subject?.name}</p>
                            <p className="text-xs text-slate-400">{r.subject?.code}</p>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                            {r.grade ?? 'N/A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Recent Activity</h2>

          {/* Admin: recent students as activities */}
          {isAdmin && data?.recent_students?.length > 0 ? (
            <div>
              {data.recent_students.slice(0, 4).map((s) => (
                <ActivityItem
                  key={s.id}
                  icon={UserPlusIcon}
                  color="#6366F1"
                  bg="#EEF2FF"
                  title={s.user?.name ?? 'New Student'}
                  subtitle={`Reg: ${s.registration_number}`}
                />
              ))}
            </div>
          ) : isStudent && data?.recent_results?.length > 0 ? (
            <div>
              {data.recent_results.slice(0, 4).map((r) => (
                <ActivityItem
                  key={r.id}
                  icon={DocumentCheckIcon}
                  color="#10B981"
                  bg="#ECFDF5"
                  title={`${r.subject?.code ?? 'Result'} — Grade: ${r.grade ?? r.grade_point ?? 'N/A'}`}
                  subtitle={r.semester?.name ?? 'Recent result published'}
                />
              ))}
            </div>
          ) : (
            <div>
              {activityItems.map((a, i) => (
                <ActivityItem key={i} {...a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
