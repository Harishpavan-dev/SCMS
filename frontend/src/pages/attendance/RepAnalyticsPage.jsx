import { useState, useEffect } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export const RepAnalyticsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], subjects: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance/rep-analytics');
      setData(response.data.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = data.students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.registration_number.toLowerCase().includes(search.toLowerCase())
  );

  const exportToCSV = () => {
    let csv = "Reg No,Name," + data.subjects.map(s => s.name).join(",") + ",Overall %\n";
    filteredStudents.forEach(s => {
      csv += `${s.registration_number},${s.name},` + 
             s.subject_stats.map(stat => `${stat.percentage}%`).join(",") + 
             `,${s.overall_percentage}%\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch_Report_${new Date().toLocaleDateString()}.csv`;
    a.click();
    toast.success('Report Downloaded');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 py-8 md:py-12 space-y-8 animate-in fade-in duration-700 pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeftIcon className="w-3 h-3" />
            Back to Terminal
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase italic">Academic Matrix</h1>
            <p className="text-slate-500 text-sm font-medium">Batch-wide attendance performance tracking.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-72 group">
              <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input 
                 type="text" 
                 placeholder="Search by identity..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all shadow-inner"
              />
           </div>
           <button 
             onClick={exportToCSV}
             className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center shrink-0"
           >
             <ArrowDownTrayIcon className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* DESKTOP MATRIX VIEW */}
      <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#4169E1] text-white">
              <tr className="text-[10px] font-black uppercase tracking-widest italic">
                <th className="px-8 py-6 border-r border-white/10 min-w-[180px]">Reg No</th>
                <th className="px-8 py-6 border-r border-white/10 min-w-[280px]">Student Name</th>
                {data.subjects.map(subject => (
                  <th key={subject.id} className="px-6 py-6 text-center border-r border-white/10 min-w-[110px]">
                    {subject.code}
                  </th>
                ))}
                <th className="px-10 py-6 text-center bg-slate-900 min-w-[140px]">Overall %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student, idx) => (
                <tr key={student.id} className={clsx(
                  "hover:bg-slate-50 transition-colors",
                  idx % 2 === 0 ? "bg-[#FFF0F0]/20" : "bg-white"
                )}>
                  <td className="px-8 py-5 font-mono text-[11px] text-slate-500 font-bold border-r border-slate-50">
                    {student.registration_number}
                  </td>
                  <td className="px-8 py-5 text-xs font-black text-slate-900 uppercase tracking-tight border-r border-slate-50">
                    {student.name}
                  </td>
                  {student.subject_stats.map((stat, sIdx) => (
                    <td key={sIdx} className="px-6 py-5 text-[11px] font-bold text-slate-600 text-center border-r border-slate-50">
                      {stat.percentage}%
                    </td>
                  ))}
                  <td className="px-10 py-5 text-center font-black">
                     <span className={clsx(
                       "px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-widest",
                       student.overall_percentage >= 80 ? "text-emerald-600 bg-emerald-50" : 
                       student.overall_percentage >= 50 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"
                     )}>
                       {student.overall_percentage}%
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="lg:hidden space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="py-20 text-center space-y-4">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">No Student Nodes Found</p>
          </div>
        ) : filteredStudents.map((student) => {
          const isExpanded = expandedStudent === student.id;
          return (
            <div key={student.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
               <div 
                  onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                  className="p-6 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
               >
                  <div className="flex gap-4 items-center">
                     <div className={clsx(
                        "w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-xs",
                        student.overall_percentage >= 80 ? "bg-emerald-50 text-emerald-600" : 
                        student.overall_percentage >= 50 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                     )}>
                        {student.overall_percentage}%
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-slate-900 leading-none uppercase tracking-tight mb-1">{student.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 font-mono italic tracking-tighter">{student.registration_number}</p>
                     </div>
                  </div>
                  {isExpanded ? <ChevronUpIcon className="w-4 h-4 text-slate-400" /> : <ChevronDownIcon className="w-4 h-4 text-slate-400" />}
               </div>
               
               {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                     <div className="grid grid-cols-1 gap-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Subject Breakdown</p>
                        {student.subject_stats.map((stat, sIdx) => {
                           const subject = data.subjects.find(sub => sub.id === stat.subject_id);
                           return (
                              <div key={sIdx} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 px-1">
                                 <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{subject?.name}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{subject?.code}</span>
                                 </div>
                                 <span className={clsx(
                                    "text-xs font-black",
                                    stat.percentage >= 80 ? "text-emerald-500" : 
                                    stat.percentage >= 50 ? "text-amber-500" : "text-red-500"
                                 )}>{stat.percentage}%</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               )}
            </div>
          );
        })}
      </div>

      {/* FOOTER LEGEND */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white/90">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Live Intelligence Node</p>
               </div>
               <p className="text-slate-400 text-[10px] font-medium max-w-sm">Data refreshes dynamically based on verified attendance sessions in the current academic period.</p>
            </div>
            <div className="flex gap-8 px-4">
               <div><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Satisfactory</p><p className="text-sm font-black text-emerald-400">≥ 80%</p></div>
               <div className="w-px h-8 bg-white/10"></div>
               <div><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Warning</p><p className="text-sm font-black text-amber-400">50-79%</p></div>
               <div className="w-px h-8 bg-white/10"></div>
               <div><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Critical</p><p className="text-sm font-black text-red-400">&lt; 50%</p></div>
            </div>
         </div>
      </div>

    </div>
  );
};
