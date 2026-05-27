import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import QRCode from 'react-qr-code';
import { 
  ClipboardDocumentCheckIcon, 
  FunnelIcon,
  ChartBarIcon,
  IdentificationIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    fetchAttendance();
    fetchSubjects();
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      if (user?.student?.current_semester_id) {
        const response = await api.get(`/semesters/${user.student.current_semester_id}/subjects`);
        setSubjects(response.data.data.map(s => s.subject || s) || []);
      }
    } catch (error) {
      console.error('Failed to load subjects');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/students/${user.student.id}/attendance`, {
        params: { subject_id: selectedSubject || undefined }
      });
      setAttendance(response.data.data.records.data || []);
      setSummary(response.data.data);
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 p-6 sm:p-10 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">Student Hub</h1>
            <p className="text-blue-100 mt-2 font-medium text-sm sm:text-base">Hello, {user.name}. Welcome back to your learning terminal.</p>
        </div>
        <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-10">
            <ChartBarIcon className="w-24 sm:w-40 h-24 sm:h-40" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Overall Rating</p>
          <p className={clsx("text-3xl sm:text-5xl font-black mt-2", (summary.overall_percentage || 0) >= 80 ? "text-emerald-500" : "text-amber-500")}>{summary.overall_percentage || 0}%</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
             <div className={clsx("h-full transition-all duration-1000", (summary.overall_percentage || 0) >= 80 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${summary.overall_percentage}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Present Count</p>
          <p className="text-3xl sm:text-5xl font-black text-slate-800 mt-2">{summary.total_present || 0}</p>
          <p className="text-xs font-bold text-slate-400 mt-1 sm:mt-2">Validated Sessions</p>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Absence Log</p>
          <p className="text-3xl sm:text-5xl font-black text-red-500 mt-2">{summary.total_absent || 0}</p>
          <p className="text-xs font-bold text-slate-400 mt-1 sm:mt-2">Check eligibility</p>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Segment</p>
          <p className="text-3xl sm:text-5xl font-black text-blue-600 mt-2">{summary.total_sessions || 0}</p>
          <p className="text-xs font-bold text-slate-400 mt-1 sm:mt-2">Active Class Load</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 px-2 uppercase tracking-tighter">
              <ChartBarIcon className="w-5 h-5 text-indigo-500" />
              Subject Breakdown
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {summary.summary?.map(sub => (
                <div key={sub.subject_id} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-300 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Module</p>
                         <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{sub.subject_name}</h4>
                      </div>
                      <span className={clsx(
                        "text-lg font-black",
                        sub.percentage >= 80 ? "text-emerald-500" : "text-amber-500"
                      )}>{sub.percentage}%</span>
                   </div>
                   <div className="flex items-center gap-4 text-[10px] sm:text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-1.5">
                         <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                         {sub.present} Present
                      </div>
                      <div className="flex items-center gap-1.5">
                         <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                         {sub.total} Total
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" />
                Records
              </h3>
              
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 sm:p-2 rounded-2xl border border-slate-200 w-full sm:w-auto">
                <FunnelIcon className="w-4 h-4 sm:w-5 h-5 text-slate-400 ml-2" />
                <select 
                  className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-bold text-slate-700 pr-8 w-full"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-4">Date & Time</th>
                      <th className="px-8 py-4">Subject</th>
                      <th className="px-8 py-4">Period</th>
                      <th className="px-8 py-4">Method</th>
                      <th className="px-8 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-12 text-center text-slate-400">Loading records...</td>
                      </tr>
                    ) : attendance.length > 0 ? (
                      attendance.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-5">
                            <p className="font-bold text-slate-900">{new Date(record.marked_at).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500">{new Date(record.marked_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="font-black text-slate-700">{record.attendance_session?.class_session?.subject?.name}</p>
                          </td>
                          <td className="px-8 py-5">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold text-xs uppercase">
                              P{record.attendance_session?.class_session?.period || 'N/A'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{record.method}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={clsx(
                              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                              record.status === 'present' ? "bg-emerald-100 text-emerald-700" : 
                              record.status === 'absent' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                            )}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-12 text-center text-slate-400">No records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden p-4 space-y-4">
                 {loading ? (
                   <p className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">Initialising Logs...</p>
                 ) : attendance.length > 0 ? (
                   attendance.map((record) => (
                      <div key={record.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                         <div className="flex justify-between items-start">
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(record.marked_at).toLocaleDateString()}</p>
                               <h4 className="font-black text-slate-900 leading-tight mt-1">{record.attendance_session?.class_session?.subject?.name}</h4>
                            </div>
                            <span className={clsx(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                              record.status === 'present' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                            )}>
                              {record.status}
                            </span>
                         </div>
                         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 pt-1">
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 uppercase">Period {record.attendance_session?.class_session?.period}</span>
                            <span className="opacity-50">•</span>
                            <span className="uppercase">{new Date(record.marked_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="opacity-50">•</span>
                            <span className="uppercase">{record.method}</span>
                         </div>
                      </div>
                   ))
                 ) : (
                   <p className="text-center py-10 text-slate-400 text-xs">No records available</p>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card & QR Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-2xl">
        {/* Mini ID Card Preview */}
        <Link to="/my-id-card" className="group">
          <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-indigo-200/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                <IdentificationIcon className="w-8 h-8 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">My ID Card</h3>
                <p className="text-sm text-indigo-200 font-medium mt-1">View your digital student ID with QR code</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-12 h-14 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-black text-white/60">{user?.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white/90">{user?.name}</p>
                  <p className="text-[10px] font-mono text-indigo-300">{user?.student?.registration_number}</p>
                </div>
              </div>
              <div className="ml-auto bg-white rounded-lg p-1.5 shadow-lg">
                <QRCode value={user?.student?.registration_number || ''} size={50} level="L" />
              </div>
            </div>
            <div className="absolute bottom-4 right-6 text-[10px] font-bold text-indigo-300/50 uppercase tracking-widest group-hover:text-indigo-200 transition-colors">
              Tap to view →
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
