import { useState, useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
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

  const filteredRecords = useMemo(() => {
    let filtered = records?.data || [];

    if (historyFilter !== 'all') {
      const today = startOfToday();
      let start;
      if (historyFilter === 'today') start = today;
      else if (historyFilter === 'week') start = startOfWeek(new Date());
      else if (historyFilter === 'month') start = startOfMonth(new Date());
      
      filtered = filtered.filter(r => isWithinInterval(new Date(r.marked_at), { start, end: new Date() }));
    }

    if (dateFilter) {
      filtered = filtered.filter(r => format(new Date(r.marked_at), 'yyyy-MM-dd') === dateFilter);
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(r => r.class_session?.subject?.id === parseInt(subjectFilter));
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

  const handleExportExcel = () => {
    try {
      const allRecords = records?.data || [];
      if (allRecords.length === 0) {
        toast.error('No records to export');
        return;
      }

      const csvRows = [
        ['Date', 'Subject', 'Time', 'Status'], // Header
        ...allRecords.map(r => [
          format(new Date(r.marked_at), 'yyyy-MM-dd'),
          `"${r.class_session?.subject?.name || 'N/A'}"`, // Quotes to handle commas in subject names
          format(new Date(r.marked_at), 'hh:mm a'),
          r.status.toUpperCase()
        ])
      ];

      const csvContent = csvRows.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Attendance_Records_${user?.name}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Excel file exported');
    } catch (error) {
      toast.error('Excel export failed');
    }
  };

  const consistencyData = useMemo(() => {
    if (!records?.data?.length) return [];
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
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Loading Attendance Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 font-sans" ref={printableRef}>
      
      {/* 01. INSTITUTIONAL HEADER */}
      <header className="bg-white border-b border-slate-200 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <AcademicCapIcon className="w-7 h-7" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Record</h1>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">SLIATE • ATI Jaffna</p>
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-slate-50 mt-4">
            <div className="space-y-0.5">
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Student Name</p>
               <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            </div>
            <div className="w-px h-8 bg-slate-100 hidden md:block"></div>
            <div className="space-y-0.5">
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Batch Identifier</p>
               <p className="text-sm font-bold text-slate-800">{user?.student?.batch?.name || 'N/A'}</p>
            </div>
            <div className="w-px h-8 bg-slate-100 hidden md:block"></div>
            <div className="space-y-0.5">
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Academic Term</p>
               <p className="text-sm font-bold text-slate-800">Semester {user?.student?.current_semester?.number || '03'}</p>
            </div>
          </div>
        </div>
        
         <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="px-5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center sm:items-end shrink-0 hidden md:flex">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Attendance</span>
               <span className={`text-xl font-black ${getStatusColor(overall_percentage)}`}>{overall_percentage}%</span>
            </div>
            <button 
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all text-xs font-bold uppercase tracking-wider active:scale-95 outline-none border border-indigo-100"
            >
              <DocumentTextIcon className="w-4 h-4" />
              PDF
            </button>
            <button 
              onClick={handleExportExcel}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 outline-none"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export Excel
            </button>
         </div>
      </header>

      {/* 02. CLEAN NAVIGATION */}
      <nav className="flex items-center gap-8 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Summary' },
          { id: 'subjects', label: 'Subject Performance' },
          { id: 'history', label: 'Detailed Logs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold transition-all relative shrink-0 ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-indigo-600 rounded-t-full"></div>}
          </button>
        ))}
      </nav>

      {/* 03. CORE CONTENT */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Academic Standing</h4>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-5xl font-bold ${getStatusColor(overall_percentage)} tracking-tight`}>{overall_percentage}%</p>
                      <span className="text-xs font-medium text-slate-400 italic">calculated yield</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold">
                       <span className="text-slate-500 uppercase tracking-widest">Eligibility Progress</span>
                       <span className="text-slate-900">{total_present} / {total_sessions} Sessions</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={clsx("h-full transition-all duration-1000", overall_percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500')} 
                        style={{ width: `${overall_percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 leading-tight">
                      Minimum requirement: <span className="text-slate-600 font-bold">75%</span> attendance per subject for exam eligibility.
                    </p>
                  </div>
              </div>

              <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start gap-8">
                 <div className="w-full md:w-[60%] h-48">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Last 14 Days Activity</h4>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={consistencyData}>
                        <Bar dataKey="rate" radius={[4, 4, 4, 4]}>
                          {consistencyData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.rate > 0 ? (entry.rate >= 75 ? '#10b981' : '#6366f1') : '#f1f5f9'} />
                          ))}
                        </Bar>
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                               return (
                                  <div className="bg-white p-2 px-3 rounded-lg shadow-lg border border-slate-200">
                                     <p className="text-[10px] font-bold text-slate-500">{payload[0].payload.day}</p>
                                     <p className="text-sm font-bold text-slate-900">{payload[0].value}% Attendance</p>
                                  </div>
                               )
                            }
                            return null;
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
                 
                 <div className="flex-1 space-y-4 pt-4 md:pt-0">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-widest">Eligibility Forecast</h4>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                         "{prediction?.msg}"
                       </p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5 h-6">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">On Track</span>
                       </div>
                       <div className="flex items-center gap-1.5 h-6">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Attention</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight px-1">Per-Module Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summary.map((s) => (
                  <div key={s.subject_id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-colors">
                     <div className="flex flex-col items-center">
                       <div className="w-28 h-28 relative mb-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={s.total === 0 ? [{ value: 1, color: '#f1f5f9' }] : [
                                  { name: 'Present', value: s.present, color: '#6366f1' },
                                  { name: 'Absent', value: s.total - s.present, color: '#e2e8f0' }
                                ].filter(d => d.value > 0)}
                                cx="50%" cy="50%" innerRadius={35} outerRadius={48} stroke="none" dataKey="value"
                                startAngle={90} endAngle={450}
                              >
                                 {(s.total === 0 ? [{ color: '#f1f5f9' }] : [
                                  { name: 'Present', value: s.present, color: '#6366f1' },
                                  { name: 'Absent', value: (s.total - s.present), color: '#e2e8f0' }
                                ].filter(d => d.value > 0)).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex items-center justify-center">
                             <span className={`text-lg font-bold ${s.total === 0 ? 'text-slate-300' : 'text-slate-900'} tracking-tight`}>{s.percentage}%</span>
                          </div>
                       </div>
                       <h4 className="text-xs font-bold text-slate-700 text-center uppercase tracking-wider mb-4 h-8 flex items-center">{s.subject_name}</h4>
                       <div className="w-full flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-4 px-2">
                          <span className="text-indigo-600 uppercase">Present: {s.present}</span>
                          <span className="uppercase">Total: {s.total}</span>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject Title</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Total Sessions</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Attended</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Yield Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.map((s) => (
                    <tr key={s.subject_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                         <span className="text-sm font-bold text-slate-700">{s.subject_name}</span>
                      </td>
                      <td className="px-8 py-5 text-center text-slate-500 font-medium text-sm">{s.total}</td>
                      <td className="px-8 py-5 text-center text-indigo-600 font-bold text-sm tracking-tight">{s.present}</td>
                      <td className="px-8 py-5 text-right">
                          <span className={`text-sm font-bold ${getStatusColor(s.percentage)}`}>{s.percentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
               <h3 className="text-lg font-bold text-slate-800">Verification Logs</h3>
               
               <div className="flex flex-wrap items-center gap-4">
                  <input 
                    type="date" 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)} 
                    className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-600 shadow-sm" 
                  />
                  
                  <select 
                    value={subjectFilter} 
                    onChange={(e) => setSubjectFilter(e.target.value)} 
                    className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-600 shadow-sm"
                  >
                     <option value="all">Every Subject</option>
                     {summary.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                  </select>

                  <div className="flex bg-slate-100 p-1 rounded-xl">
                     {['all', 'today', 'week', 'month'].map(f => (
                       <button 
                         key={f} 
                         onClick={() => setHistoryFilter(f)} 
                         className={clsx(
                           "px-3 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all",
                           historyFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                         )}
                       >
                         {f}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
               {filteredRecords.length === 0 ? (
                 <div className="p-20 text-center text-slate-400 font-medium italic text-sm">
                    No records found matching the specified criteria.
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-slate-50 border-b border-slate-200">
                         <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                         <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                         <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time</th>
                         <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {filteredRecords.map(r => (
                         <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-4 text-sm font-medium text-slate-600 tracking-tight">{format(new Date(r.marked_at), 'MMM dd, yyyy')}</td>
                           <td className="px-8 py-4 text-sm font-bold text-slate-800 tracking-tight">{r.class_session?.subject?.name || 'Attendance'}</td>
                           <td className="px-8 py-4 text-sm text-slate-400 font-medium">{format(new Date(r.marked_at), 'hh:mm a')}</td>
                           <td className="px-8 py-4 text-right">
                             <span className={clsx(
                               "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                               r.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                             )}>
                               {r.status === 'present' ? 'Present' : 'Absent'}
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
    </div>
  );
};
