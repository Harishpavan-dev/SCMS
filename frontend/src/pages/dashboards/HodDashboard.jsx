import { useState, useEffect } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { 
  ChartPieIcon, 
  UsersIcon, 
  AcademicCapIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const HodDashboard = () => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [filters, setFilters] = useState({
    batch_id: '',
    semester_id: '',
    subject_id: ''
  });

  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResources();
    fetchAnalytics();
  }, [filters]);

  const fetchResources = async () => {
    try {
      const [b, sem, sub] = await Promise.all([
        api.get('/public/batches'),
        api.get('/public/semesters'),
        api.get('/subjects')
      ]);
      setBatches(b.data.data || []);
      setSemesters(sem.data.data || []);
      setSubjects(sub.data.data || []);
    } catch (error) {
      console.error('Failed to load metadata');
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance/hod-analytics', { params: filters });
      setAnalytics(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load HOD analytics');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalytics = analytics.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.registration_number.toLowerCase().includes(search.toLowerCase())
  );

  const overallAvg = analytics.length > 0 
    ? (analytics.reduce((acc, curr) => acc + curr.percentage, 0) / analytics.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-700 pb-20">
      <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <ChartPieIcon className="w-12 h-12 text-blue-500" />
            HOD Intelligence Dashboard
          </h1>
          <p className="text-slate-400 mt-2 font-medium tracking-wide">Monitoring departmental attendance across all batches</p>
          
          <div className="flex flex-wrap gap-4 mt-8">
             <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Strength</p>
                <p className="text-2xl font-black">{analytics.length}</p>
             </div>
             <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Average Attendance</p>
                <p className={clsx("text-2xl font-black", Number(overallAvg) >= 80 ? "text-emerald-400" : "text-amber-400")}>{overallAvg}%</p>
             </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-200 flex flex-wrap gap-6 items-center">
        <div className="flex-1 min-w-[250px] relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by student name or registration number..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <select 
            className="bg-slate-100 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.batch_id}
            onChange={(e) => setFilters({...filters, batch_id: e.target.value})}
          >
            <option value="">All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select 
            className="bg-slate-100 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.semester_id}
            onChange={(e) => setFilters({...filters, semester_id: e.target.value})}
          >
            <option value="">All Semesters</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select 
            className="bg-slate-100 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.subject_id}
            onChange={(e) => setFilters({...filters, subject_id: e.target.value})}
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <AcademicCapIcon className="w-6 h-6 text-blue-600" />
             Student-Wise Analysis
          </h3>
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-black uppercase transition-all">
             <ArrowDownTrayIcon className="w-4 h-4" />
             Export PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-10 py-5">Rank</th>
                <th className="px-10 py-5">Student Details</th>
                <th className="px-10 py-5">Present/Total</th>
                <th className="px-10 py-5">Progress</th>
                <th className="px-10 py-5 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-300 font-bold uppercase tracking-widest">Compiling Analytics Data...</td></tr>
              ) : filteredAnalytics.map((s, idx) => (
                <tr key={s.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-10 py-6">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-900 group-hover:text-blue-700 transition-colors">{s.name}</p>
                    <p className="text-[10px] font-black text-slate-400 font-mono italic">{s.registration_number}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-slate-700">{s.present_count}</span>
                       <span className="text-slate-300">/</span>
                       <span className="text-sm font-bold text-slate-400">{s.total_sessions}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="w-48 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={clsx("h-full", s.percentage >= 80 ? "bg-emerald-500" : "bg-red-500")}
                        style={{ width: `${s.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className={clsx(
                      "text-lg font-black tracking-tighter",
                      s.percentage >= 80 ? "text-emerald-600" : "text-red-500"
                    )}>
                      {s.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
