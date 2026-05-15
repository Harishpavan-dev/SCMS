import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { 
  ChartBarIcon, 
  CalendarDaysIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  AcademicCapIcon,
  ArrowUpRightIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { format, isWithinInterval, startOfToday, startOfWeek, startOfMonth, subDays } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const MyAttendancePage = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [historyFilter, setHistoryFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const printableRef = useRef(null);

  useEffect(() => {
    if (!user?.student?.id) return;
    
    const fetchAttendance = async () => {
      try {
        const response = await api.get(`/students/${user.student.id}/attendance`);
        setData(response.data.data);
      } catch (error) {
        console.error('Attendance fetch error:', error);
        toast.error('Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user]);

  const { 
    records, 
    summary, 
    overall_percentage, 
    total_present, 
    total_sessions, 
    total_absent 
  } = data || { 
    records: { data: [] }, 
    summary: [], 
    overall_percentage: 0, 
    total_present: 0, 
    total_sessions: 0, 
    total_absent: 0 
  };

  const getStatusColor = (percent) => {
    if (percent >= 75) return 'text-emerald-600';
    if (percent >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const pieData = [
    { name: 'Present', value: total_present, color: '#10b981' },
    { name: 'Absent', value: total_absent, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const filteredRecords = useMemo(() => {
    let filtered = records.data;

    // 1. Time Preset Filter
    if (historyFilter !== 'all') {
      const today = startOfToday();
      let start;
      if (historyFilter === 'today') start = today;
      else if (historyFilter === 'week') start = startOfWeek(new Date());
      else if (historyFilter === 'month') start = startOfMonth(new Date());
      
      filtered = filtered.filter(r => isWithinInterval(new Date(r.marked_at), { start, end: new Date() }));
    }

    // 2. Specific Date Filter
    if (dateFilter) {
      filtered = filtered.filter(r => format(new Date(r.marked_at), 'yyyy-MM-dd') === dateFilter);
    }

    // 3. Subject Filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(r => r.attendance_session?.class_session?.subject?.id === parseInt(subjectFilter));
    }

    return filtered;
  }, [records, historyFilter, subjectFilter, dateFilter]);

  const prediction = useMemo(() => {
    if (total_sessions === 0) return null;
    const target = 75;
    if (overall_percentage >= target) {
      const safeToMiss = Math.floor((total_present / 0.75) - total_sessions);
      return { type: 'safe', count: Math.max(0, safeToMiss), msg: `You can miss up to ${safeToMiss} more classes and stay eligible.` };
    } else {
      const needToAttend = Math.ceil((0.75 * total_sessions - total_present) / 0.25);
      return { type: 'risk', count: Math.max(0, needToAttend), msg: `You need to attend the next ${needToAttend} classes to reach 75%.` };
    }
  }, [total_sessions, total_present, overall_percentage]);

  const handleDownloadPDF = async () => {
    const loadingToast = toast.loading('Exporting Attendance Report...');
    try {
      const canvas = await html2canvas(printableRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Attendance_Report_${user?.name}.pdf`);
      toast.success('Report saved successfully');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // --- ELITE SENIOR LOGIC: CONSISTENCY TRACKING ---
  const consistencyData = useMemo(() => {
    if (!records.data.length) return [];
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayRecords = records.data.filter(r => format(new Date(r.marked_at), 'yyyy-MM-dd') === d);
      const rate = dayRecords.length ? (dayRecords.filter(r => r.status === 'present').length / dayRecords.length) * 100 : 0;
      days.push({ day: format(new Date(d), 'MMM dd'), rate });
    }
    return days;
  }, [records]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-[3px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Synchronizing Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-16 animate-in fade-in duration-700" ref={printableRef}>
      
      {/* 01. MINIMAL HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Registry</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Dashboard</h1>
          <p className="text-slate-400 text-sm font-medium">
            Academic Status for {user?.name} 
            <span className="mx-3 opacity-20">/</span> 
            {user?.student?.batch?.name} • Semester {user?.student?.current_semester?.number || '3'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={handleDownloadPDF}
             className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-full hover:border-indigo-600 hover:text-indigo-600 transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
           >
             <ArrowDownTrayIcon className="w-4 h-4" />
             Export Audit
           </button>
        </div>
      </header>

      {/* 02. CLEAN NAVIGATION */}
      <nav className="flex gap-12 border-b border-slate-100">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'subjects', label: 'Unit Analysis' },
          { id: 'history', label: 'Registry Logs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-500'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-full"></div>}
          </button>
        ))}
      </nav>

      {/* 03. CORE CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-16">
          
          {/* Elite Mini Stats Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Global Yield</span>
                <p className={`text-5xl font-black ${getStatusColor(overall_percentage)} tracking-tighter`}>{overall_percentage}%</p>
                <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold ${overall_percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                   {overall_percentage >= 75 ? <ShieldCheckIcon className="w-4 h-4" /> : <ExclamationTriangleIcon className="w-4 h-4" />}
                   {overall_percentage >= 75 ? 'Eligibility Target Met' : 'Eligibility Target Missed'}
                </div>
            </div>

            <div className="md:col-span-2 bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-12">
               <div className="w-full h-24 max-w-[400px]">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Metric Consistency (14D)</span>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={consistencyData}>
                      <Bar dataKey="rate" radius={[4, 4, 4, 4]}>
                        {consistencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.rate > 0 ? '#6366f1' : '#f1f5f9'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
               <div className="space-y-2 border-l border-slate-100 pl-8 hidden lg:block">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Strategy Insight</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[200px]">{prediction?.msg}</p>
               </div>
            </div>
          </div>

          {/* Unit Progress Grid */}
          <div className="space-y-10">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight pl-2 border-l-4 border-slate-100">Subject Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {summary.map((s) => (
                <div key={s.subject_id} className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-600/20 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group">
                   <div className="flex flex-col items-center">
                     <div className="w-28 h-28 relative mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={s.total === 0 ? [{ value: 1, color: '#f8fafc' }] : [
                                { name: 'Present', value: s.present, color: '#10b981' },
                                { name: 'Absent', value: s.total - s.present, color: '#f43f5e' }
                              ].filter(d => d.value > 0)}
                              cx="50%" cy="50%" innerRadius={35} outerRadius={48} stroke="none" dataKey="value"
                            >
                              {(s.total === 0 ? [{ color: '#f8fafc' }] : [
                                { name: 'Present', value: s.present, color: '#10b981' },
                                { name: 'Absent', value: (s.total - s.present), color: '#f43f5e' }
                              ].filter(d => d.value > 0)).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className={`text-base font-black ${s.total === 0 ? 'text-slate-200' : getStatusColor(s.percentage)}`}>{s.percentage}%</span>
                        </div>
                     </div>
                     <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest text-center h-8 flex items-center">{s.subject_name}</h4>
                     <p className="text-[10px] font-bold text-slate-400 mt-2">{s.present} / {s.total} Sessions</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Knowledge Area</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sessions</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Success</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yield %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {summary.map(s => (
                <tr key={s.subject_id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-7 text-sm font-bold text-slate-700 uppercase tracking-tight">{s.subject_name}</td>
                  <td className="px-10 py-7 text-center text-slate-400 font-medium text-sm">{s.total}</td>
                  <td className="px-10 py-7 text-center text-indigo-600 font-bold text-sm tracking-tight">{s.present} <span className="text-slate-300 font-medium ml-1">Attended</span></td>
                  <td className="px-10 py-7 text-right">
                    <span className={`text-sm font-black ${getStatusColor(s.percentage)}`}>{s.percentage}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
             <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Log</h3>
             
             <div className="flex flex-wrap items-center gap-6">
                <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="text-[11px] font-bold bg-white border border-slate-200 rounded-full px-6 py-2.5 outline-none focus:border-indigo-600 transition-all shadow-sm" />
                
                <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="text-[11px] font-bold bg-white border border-slate-200 rounded-full px-6 py-2.5 outline-none focus:border-indigo-600 transition-all shadow-sm cursor-pointer">
                   <option value="all">Full Curriculum</option>
                   {summary.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                </select>

                <div className="flex bg-slate-100/50 p-1.5 rounded-full border border-slate-100">
                   {['all', 'today', 'week', 'month'].map(f => (
                     <button key={f} onClick={() => setHistoryFilter(f)} className={`px-5 py-2 text-[10px] font-black rounded-full capitalize transition-all ${historyFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                       {f}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
             {filteredRecords.length === 0 ? (
               <div className="p-24 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Synchronization Empty</p>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-100">
                       <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest uppercase">Registry Date</th>
                       <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest uppercase">Knowledge Point</th>
                       <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest uppercase text-right">Observation</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {filteredRecords.map(r => (
                       <tr key={r.id} className="hover:bg-slate-50/20 transition-all group">
                         <td className="px-10 py-6 text-sm font-medium text-slate-400">{format(new Date(r.marked_at), 'yyyy • MM • dd')}</td>
                         <td className="px-10 py-6 text-sm font-bold text-slate-800 uppercase tracking-tight">{r.attendance_session?.class_session?.subject?.name || 'Unit Analysis'}</td>
                         <td className="px-10 py-6 text-right">
                           <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${r.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                             {r.status === 'present' ? 'Verified' : 'Absent'}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};


