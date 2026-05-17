import { useState, useEffect } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { 
  AcademicCapIcon, 
  DocumentChartBarIcon, 
  TrophyIcon,
  ChartPieIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const ResultsPage = () => {
  const { user } = useAuthStore();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gpaData, setGpaData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resResponse, gpaResponse] = await Promise.all([
          api.get('/results'),
          api.get(`/students/${user?.student?.id}/gpa`).catch(() => ({ data: { data: { gpa: 'N/A' } } }))
        ]);
        setResults(resResponse.data.data.data || []);
        setGpaData(gpaResponse.data.data);
      } catch (error) {
        toast.error('Failed to load academic records');
      } finally {
        setLoading(false);
      }
    };
    if (user?.student?.id) fetchData();
    else setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Accessing Gradebook...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      {/* ── HEADER ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Records</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Official published grades and performance analytics for HNDIT</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
             <ArrowDownTrayIcon className="w-4 h-4" />
             Download Transcript
          </button>
        </div>
      </div>

      {/* ── GPA DASHBOARD ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <TrophyIcon className="w-32 h-32" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Cumulative GPA</p>
            <h2 className="text-6xl font-black mb-6">{gpaData?.gpa || 'N/A'}</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full w-fit">
               <CheckBadgeIcon className="w-4 h-4" />
               Current Standing: Excellent
            </div>
         </div>
         
         <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Credits</p>
               <h3 className="text-3xl font-black text-slate-900">{results.reduce((acc, curr) => acc + (curr.subject?.credit_hours || 0), 0)}</h3>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
               <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-3">65% of curriculum completed</p>
         </div>

         <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
            <ChartPieIcon className="w-8 h-8 opacity-50" />
            <div>
               <p className="text-xs font-bold opacity-80 mb-1">Latest Update</p>
               <p className="text-xl font-bold">Semester {results[0]?.semester?.number || '—'} Results Published</p>
            </div>
         </div>
      </div>

      {/* ── RESULTS TABLE ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {results.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
               <AcademicCapIcon className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Records Found</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">Your academic records will appear here once they are officially published by the department.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Node</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CA (40%)</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Final (60%)</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Outcome</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {results.map((result) => (
                  <tr key={result.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                             {result.subject?.code?.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 leading-none mb-1">{result.subject?.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{result.subject?.code}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">SEM {result.semester?.number}</span>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <span className="text-sm font-bold text-slate-600">{result.continuous_assessment || '—'}</span>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <span className="text-sm font-bold text-slate-600">{result.final_exam || '—'}</span>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="flex flex-col items-center">
                          <p className="text-base font-black text-slate-900 leading-none">{result.total_marks}%</p>
                          <div className="w-16 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                             <div className="h-full bg-emerald-500" style={{ width: `${result.total_marks}%` }} />
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-black shadow-lg">
                          {result.grade}
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
  );
};

