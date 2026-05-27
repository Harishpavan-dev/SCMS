import { useState, useEffect } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import {
   ClipboardDocumentCheckIcon,
   UsersIcon,
   MagnifyingGlassIcon,
   ClockIcon,
   CheckCircleIcon,
   XCircleIcon,
   MinusCircleIcon,
   HandRaisedIcon,
   CalendarIcon,
   BookOpenIcon,
   ChevronRightIcon,
   ArrowLeftIcon,
   HashtagIcon,
   EllipsisVerticalIcon,
   XMarkIcon,
   UserCircleIcon,
   EnvelopeIcon,
   PhoneIcon,
   MapPinIcon,
   ChartBarIcon,
   ArrowRightIcon,
   DevicePhoneMobileIcon,
   ArrowDownTrayIcon,
   FunnelIcon,
   QrCodeIcon,
   StopIcon,
} from '@heroicons/react/24/outline';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { format, subDays, startOfWeek } from 'date-fns';
import { Link } from 'react-router-dom';

export const RepAttendancePage = () => {
   const { user } = useAuthStore();
   const [activeTab, setActiveTab] = useState('mark'); // mark or history

   const [subjects, setSubjects] = useState([]);
   const [students, setStudents] = useState([]);
   const [attendanceRecords, setAttendanceRecords] = useState({});
   const [loading, setLoading] = useState(false);

   // Mark Session Configuration
   const [selectedSubject, setSelectedSubject] = useState('');
   const [selectedPeriod, setSelectedPeriod] = useState(1);
   const [sessionId, setSessionId] = useState(null);

   // History Filters
   const [historyDate, setHistoryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
   const [historySubjectId, setHistorySubjectId] = useState('');
   const [historyPeriod, setHistoryPeriod] = useState(1);
   const [historicalRecords, setHistoricalRecords] = useState([]);

   // Search
   const [search, setSearch] = useState('');

   // Scanner State
   const [scannerActive, setScannerActive] = useState(false);
   const [lastScanned, setLastScanned] = useState(null);

   // Modals
   const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
   const [showAnalytics, setShowAnalytics] = useState(false);
   const [showWhatsAppSummary, setShowWhatsAppSummary] = useState(false);

   useEffect(() => {
      fetchSubjects();
   }, [user]);

   useEffect(() => {
      if (activeTab === 'history' && historySubjectId) {
         fetchHistoryRecords();
      }
   }, [activeTab, historyDate, historySubjectId, historyPeriod]);

   const fetchSubjects = async () => {
      if (subjects.length > 0 && user?.student?.current_semester_id === subjects[0].semester_id) return;

      try {
         const semesterId = user?.student?.current_semester_id;

         // Parallelize both attempts to avoid serial delay
         const promises = [api.get('/subjects')];
         if (semesterId) {
            promises.push(api.get(`/semesters/${semesterId}/subjects`));
         }

         const results = await Promise.all(promises);
         const allSubjects = results[0].data.data || [];
         const semesterSubjects = results[1]?.data.data || [];

         // Use semester subjects if available, otherwise fallback
         const finalData = semesterSubjects.length > 0 ? semesterSubjects : allSubjects;

         setSubjects(finalData);
         if (finalData.length > 0 && !historySubjectId) {
            setHistorySubjectId(finalData[0].id);
         }
      } catch (error) {
         console.error('Subject fetch error:', error);
      }
   };

   const fetchHistoryRecords = async () => {
      setLoading(true);
      try {
         // Parallelize student fetching and session discovery
         const studentPromise = students.length === 0
            ? api.get('/students', { params: { batch_id: user?.student?.batch_id, per_page: 200 } })
            : Promise.resolve(null);

         const sessionsPromise = api.get('/attendance/batch-sessions', {
            params: {
               subject_id: historySubjectId,
               period: historyPeriod,
               date: historyDate
            }
         });

         const [stuRes, sessRes] = await Promise.all([studentPromise, sessionsPromise]);

         // Update students if we fetched them
         let allStudents = students;
         if (stuRes) {
            allStudents = stuRes.data.data.data || [];
            setStudents(allStudents);
         }

         const session = (sessRes.data.data || [])[0];

         let recordMap = {};
         if (session) {
            const detailRes = await api.get(`/attendance/sessions/${session.id}`);
            const records = detailRes.data.data.records || [];
            records.forEach(r => {
               recordMap[r.student_id] = r.status;
            });
         }

         const mergedRecords = allStudents.map(student => ({
            student,
            status: recordMap[student.id] || 'unmarked'
         }));

         setHistoricalRecords(mergedRecords);
      } catch (error) {
         console.error('History fetch error:', error);
         toast.error('Query failed');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (scannerActive && sessionId) {
         const scanner = new Html5QrcodeScanner('rep-scanner', {
            fps: 15,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0,
         });

         let currentScanned = null;

         const onScanSuccess = async (decodedText) => {
            if (currentScanned === decodedText) return;

            // Pre-flight check: Prevent sending huge chunks of data or URLs to our backend
            if (decodedText.length > 50 || decodedText.startsWith('http')) {
               if (currentScanned !== 'INVALID') {
                  toast.error('Invalid ID Card QR format');
                  currentScanned = 'INVALID';
                  setTimeout(() => { currentScanned = null; }, 3000); // Wait 3s before allowing another invalid scan Error beep
               }
               return;
            }

            currentScanned = decodedText;
            
            try {
               const response = await api.post('/attendance/mark-scan', {
                  attendance_session_id: sessionId,
                  registration_number: decodedText
               });

               const scanInfo = response.data.data;
               setLastScanned(decodedText);
               toast.success(`Marked: ${scanInfo.student_name}`);

               // Update local status so UI reflects present state
               const student = students.find(s => s.registration_number === decodedText);
               if (student) {
                  setAttendanceRecords(prev => ({
                     ...prev,
                     [student.id]: 'present'
                  }));
               }

               const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
               audio.play().catch(() => { });

            } catch (error) {
               toast.error(error.response?.data?.message || 'Scan failed');
            }

            setTimeout(() => {
               if (currentScanned === decodedText) currentScanned = null;
               setLastScanned(null);
            }, 2000);
         };

         scanner.render(onScanSuccess, (e) => { });

         return () => {
            scanner.clear().then(() => {
               const el = document.getElementById('rep-scanner');
               if (el) el.innerHTML = '';
            }).catch(err => {
               console.error(err);
               const el = document.getElementById('rep-scanner');
               if (el) el.innerHTML = '';
            });
         };
      }
   }, [scannerActive, sessionId]); // Removed students from deps to avoid re-renders when state updates

   const initializeSession = async () => {
      if (!selectedSubject) {
         toast.error('Please select a subject');
         return;
      }
      setLoading(true);
      try {
         const response = await api.post('/attendance/initialize', {
            semester_id: user?.student?.current_semester_id,
            batch_id: user?.student?.batch_id,
            subject_id: selectedSubject,
            date: format(new Date(), 'yyyy-MM-dd'),
            period: selectedPeriod,
            start_time: format(new Date(), 'HH:mm'),
            end_time: format(new Date(new Date().setHours(new Date().getHours() + 2)), 'HH:mm')
         });

         const newSessionId = response.data.data.id;
         setSessionId(newSessionId);

         // Parallelize student list and existing records fetching
         const promises = [api.get(`/attendance/sessions/${newSessionId}`)];

         // Only fetch students if not already loaded
         if (students.length === 0) {
            promises.push(api.get('/students', { params: { batch_id: user.student.batch_id, per_page: 200 } }));
         }

         const results = await Promise.all(promises);
         const recRes = results[0];
         const stuRes = results[1];

         if (stuRes) setStudents(stuRes.data.data.data || []);

         const existing = {};
         (recRes.data.data.records || []).forEach(r => {
            existing[r.student_id] = r.status;
         });
         setAttendanceRecords(existing);
         toast.success('Session Ready');
      } catch (error) {
         console.error(error);
         toast.error('Failed to initialize session');
      } finally {
         setLoading(false);
      }
   };

   const updateStatus = async (studentId, status) => {
      try {
         const currentStatus = attendanceRecords[studentId];
         const newStatus = currentStatus === status ? 'unmarked' : status;

         setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: newStatus
         }));

         await api.post('/attendance/update-status', {
            attendance_session_id: sessionId,
            student_id: studentId,
            status: newStatus
         });

      } catch (error) {
         toast.error('Sync failed');
      }
   };

   const exportToExcel = () => {
      const subject = selectedHistorySubject?.name;
      let csv = `Reg No,Full Name,Status\n`;
      historicalRecords.forEach(r => {
         csv += `${r.student.registration_number},${r.student.user.name},${r.status}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Attendance_${subject}_${historyDate}.csv`;
      a.click();
      toast.success('Export Saved');
   };

   const filteredStudents = students.filter(s =>
      s.user.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registration_number.toLowerCase().includes(search.toLowerCase())
   );

   const activeSubject = subjects.find(s => s.id == selectedSubject);
   const selectedHistorySubject = subjects.find(s => s.id == historySubjectId);

   const getStats = (records) => {
      let present = 0, absent = 0, unmarked = 0;
      const total = Array.isArray(records) ? records.length : Object.keys(records).length;

      if (Array.isArray(records)) {
         records.forEach(r => {
            if (r.status === 'present') present++;
            else if (r.status === 'absent') absent++;
            else unmarked++;
         });
      } else {
         Object.values(records).forEach(s => {
            if (s === 'present') present++;
            else if (s === 'absent') absent++;
         });
         unmarked = students.length - (present + absent);
      }

      const percent = total > 0 ? Math.round((present / total) * 100) : 0;
      return { present, absent, unmarked, total, percent };
   };

   const liveStats = getStats(attendanceRecords);
   const historyStats = getStats(historicalRecords);

   const generateWhatsAppMessage = () => {
      const stats = activeTab === 'mark' ? liveStats : historyStats;
      const subject = activeTab === 'mark' ? activeSubject?.name : selectedHistorySubject?.name;
      const date = activeTab === 'mark' ? format(new Date(), 'yyyy-MM-dd') : historyDate;
      const period = activeTab === 'mark' ? selectedPeriod : historyPeriod;

      let msg = `📅 *ATTENDANCE SUMMARY*\n`;
      msg += `📚 Subject: ${subject}\n`;
      msg += `🗓️ Date: ${date}\n`;
      msg += `⏱️ Period: ${period}\n\n`;
      msg += `✅ Present: ${stats.present}\n`;
      msg += `❌ Absent: ${stats.absent}\n`;
      msg += `📊 Percentage: ${stats.percent}%\n\n`;
      msg += `_Sent via SCMS Terminal_`;
      return encodeURIComponent(msg);
   };

   if (user?.role !== 'rep' && user?.role !== 'admin' && user?.role !== 'hod') {
      return (
         <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center space-y-4">
               <div className="p-4 bg-slate-100 rounded-full inline-block">
                  <HandRaisedIcon className="w-8 h-8 text-slate-400" />
               </div>
               <h2 className="text-xl font-bold">Access Restricted</h2>
               <p className="text-slate-500 text-sm">You must be a Student Representative to access this module.</p>
            </div>
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-32 space-y-6 md:space-y-10 animate-in fade-in duration-500">

         {/* HEADER & TABS */}
         {!sessionId && (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
               <div className="space-y-1 text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">REP Terminal</h1>
                  <p className="text-slate-500 text-sm font-medium">Manage batch attendance and sync reports effortlessly.</p>
               </div>

               <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl w-full md:w-fit self-center md:self-auto shadow-inner">
                  <button
                     onClick={() => setActiveTab('mark')}
                     className={clsx(
                        "flex-1 px-6 py-2.5 rounded-xl text-xs font-bold transition-all truncate",
                        activeTab === 'mark' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                     )}
                  >
                     Live Session
                  </button>
                  <button
                     onClick={() => setActiveTab('history')}
                     className={clsx(
                        "flex-1 px-6 py-2.5 rounded-xl text-xs font-bold transition-all truncate",
                        activeTab === 'history' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                     )}
                  >
                     Archive Logs
                  </button>
                  <Link
                     to="/attendance/rep-analytics"
                     className="hidden md:flex px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 items-center gap-2"
                  >
                     Analytics
                     <ChartBarIcon className="w-4 h-4" />
                  </Link>
               </div>
            </div>
         )}

         {activeTab === 'mark' && (
            <div className="space-y-6">
               {!sessionId ? (
                  <div className="max-w-2xl mx-auto space-y-8 py-12 md:py-20 text-center">
                     <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                        <ClipboardDocumentCheckIcon className="w-10 h-10 text-indigo-600" />
                     </div>
                     <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 uppercase">Initialize Protocol</h2>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">Select the lecture details to boot the attendance marking terminal.</p>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1.5 text-left">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                           <select
                              value={selectedSubject}
                              onChange={(e) => setSelectedSubject(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none"
                           >
                              <option value="">Select Subject</option>
                              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1.5 text-left">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period</label>
                           <select
                              value={selectedPeriod}
                              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none"
                           >
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={p}>Period {p}</option>)}
                           </select>
                        </div>
                     </div>

                     <button
                        onClick={initializeSession}
                        disabled={loading}
                        className="w-full py-4.5 bg-indigo-600 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                     >
                        {loading ? 'Booting...' : 'Launch Terminal'}
                     </button>
                  </div>
               ) : (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                     {/* Session Context Bar */}
                     <div className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                        <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
                           <button onClick={() => { setSessionId(null); setStudents([]); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors">
                              <ArrowLeftIcon className="w-5 h-5" />
                           </button>
                           <div className="min-w-0">
                              <h2 className="text-lg font-black truncate">{activeSubject?.name}</h2>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">P{selectedPeriod} • Live Marking Segment</p>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-64 relative z-10">
                           <button
                              onClick={() => setScannerActive(!scannerActive)}
                              className={clsx("p-2 rounded-xl transition-all shadow-sm", scannerActive ? "bg-red-500 text-white" : "bg-indigo-500 text-white hover:bg-indigo-400")}
                              title={scannerActive ? "Stop Scanner" : "Start QR Scanner"}
                           >
                              {scannerActive ? <StopIcon className="w-5 h-5 flex-shrink-0" /> : <QrCodeIcon className="w-5 h-5 flex-shrink-0" />}
                           </button>
                           <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3 w-full">
                              <MagnifyingGlassIcon className="w-4 h-4 text-slate-500" />
                              <input
                                 type="text"
                                 placeholder="Search student..."
                                 className="w-full bg-transparent border-none outline-none text-xs font-bold text-white placeholder:text-slate-600 py-1.5"
                                 value={search}
                                 onChange={(e) => setSearch(e.target.value)}
                              />
                           </div>
                        </div>
                     </div>

                     {/* QR Scanner Display Box */}
                     {scannerActive && (
                        <div className="bg-slate-900 rounded-[2.5rem] p-4 shadow-xl border-4 border-slate-800 overflow-hidden relative animate-in slide-in-from-top-4">
                           <div id="rep-scanner" className="w-full max-w-md mx-auto bg-black rounded-[2rem] overflow-hidden"></div>

                           <div className="text-center mt-4 mb-2">
                              {lastScanned ? (
                                 <p className="text-xl font-black text-emerald-400 uppercase tracking-widest">{lastScanned}</p>
                              ) : (
                                 <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Scanning Student IDs...</p>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Desktop Table Layout */}
                     <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full border-collapse">
                           <thead className="bg-slate-50 border-b border-slate-100">
                              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                                 <th className="px-10 py-5 w-20">No</th>
                                 <th className="px-10 py-5">Student Identity</th>
                                 <th className="px-10 py-5 text-center">Status Control</th>
                                 <th className="px-10 py-5 text-right w-20">Edit</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {filteredStudents.map((student, idx) => {
                                 const status = attendanceRecords[student.id] || 'unmarked';
                                 return (
                                    <tr key={student.id} className={clsx("hover:bg-slate-50 transition-colors", status === 'present' ? "bg-emerald-50/20" : status === 'absent' ? "bg-red-50/20" : "")}>
                                       <td className="px-10 py-5 text-xs font-bold text-slate-300">{idx + 1}</td>
                                       <td className="px-10 py-5">
                                          <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-[10px] text-slate-500">{student.user.name.charAt(0)}</div>
                                             <div>
                                                <p className="text-sm font-black text-slate-900 leading-tight">{student.user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase italic">{student.registration_number}</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-10 py-5">
                                          <div className="flex justify-center gap-3">
                                             <button onClick={() => updateStatus(student.id, 'present')} className={clsx("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", status === 'present' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200")}>Present</button>
                                             <button onClick={() => updateStatus(student.id, 'absent')} className={clsx("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", status === 'absent' ? "bg-red-500 text-white shadow-lg shadow-red-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200")}>Absent</button>
                                          </div>
                                       </td>
                                       <td className="px-10 py-5 text-right"><button onClick={() => setSelectedStudentDetail(student)} className="p-2 text-slate-300 hover:text-slate-500"><EllipsisVerticalIcon className="w-5 h-5" /></button></td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>

                     {/* Mobile Card Layout */}
                     <div className="md:hidden space-y-4">
                        {filteredStudents.map((student, idx) => {
                           const status = attendanceRecords[student.id] || 'unmarked';
                           return (
                              <div key={student.id} className={clsx("p-4 sm:p-5 rounded-[2rem] border transition-all shadow-sm relative overflow-hidden group", status === 'present' ? "bg-emerald-50/50 border-emerald-100" : status === 'absent' ? "bg-red-50/50 border-red-100" : "bg-white border-slate-100 hover:border-slate-200")}>
                                 {/* Decorative accent for present/absent */}
                                 {status !== 'unmarked' && (
                                    <div className={clsx("absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full blur-2xl opacity-20", status === 'present' ? "bg-emerald-500" : "bg-red-500")} />
                                 )}
                                 
                                 <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex gap-3 sm:gap-4">
                                       <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl flex items-center justify-center font-black text-[10px] sm:text-xs text-indigo-600 shadow-sm border border-slate-50">{idx + 1}</div>
                                       <div className="min-w-0">
                                          <h3 className="text-sm font-black text-slate-900 leading-tight truncate">{student.user.name}</h3>
                                          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 font-mono italic">{student.registration_number}</p>
                                       </div>
                                    </div>
                                    <button onClick={() => setSelectedStudentDetail(student)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><EllipsisVerticalIcon className="w-5 h-5" /></button>
                                 </div>
                                 <div className="flex gap-2 sm:gap-3 relative z-10">
                                    <button onClick={() => updateStatus(student.id, 'present')} className={clsx("flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all", status === 'present' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>Present</button>
                                    <button onClick={() => updateStatus(student.id, 'absent')} className={clsx("flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all", status === 'absent' ? "bg-red-500 text-white shadow-lg shadow-red-100" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>Absent</button>
                                 </div>
                              </div>
                           );
                        })}
                     </div>

                     {/* Floating Action Bar */}
                     <div className="fixed bottom-6 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[92%] max-w-xl bg-slate-900/95 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/10 text-white flex items-center justify-between z-50 transition-all duration-300">
                        <div className="flex items-center gap-4 sm:gap-8 px-2 sm:px-4">
                           <div className="text-center group cursor-help shrink-0" onClick={() => setShowAnalytics(true)}>
                              <p className="text-[7px] font-black text-slate-500 uppercase">Rate</p>
                              <p className="text-xs sm:text-sm font-black text-indigo-400">{liveStats.percent}%</p>
                           </div>
                           <div className="w-px h-6 bg-white/10 shrink-0"></div>
                           <div className="flex gap-3 sm:gap-6 shrink-0">
                              <div className="text-center"><p className="text-[7px] font-black text-slate-500 uppercase">P</p><p className="text-xs sm:text-sm font-black text-emerald-400">{liveStats.present}</p></div>
                              <div className="text-center"><p className="text-[7px] font-black text-slate-500 uppercase">A</p><p className="text-xs sm:text-sm font-black text-red-400">{liveStats.absent}</p></div>
                           </div>
                        </div>
                        <button onClick={() => setShowWhatsAppSummary(true)} className="bg-indigo-600 hover:bg-indigo-500 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95">
                           Summary <ArrowRightIcon className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               )}
            </div>
         )}

         {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="bg-white p-5 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm space-y-8 md:space-y-12">

                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                     <div className="space-y-3">
                        <div className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest inline-block">Repository Archive</div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                           <button onClick={() => setHistoryDate(format(new Date(), 'yyyy-MM-dd'))} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all">Today</button>
                           <button onClick={() => setHistoryDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'))} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all">Yesterday</button>
                        </div>
                     </div>
                     <div className="md:text-right">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{selectedHistorySubject?.name || 'Class Log'}</h2>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{format(new Date(historyDate), 'dd MMMM yyyy')} • Period {historyPeriod}</p>
                     </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 items-center bg-slate-50/50 p-4 md:p-5 rounded-[2rem] md:rounded-[2.5rem]">
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto flex-1">
                        <input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none" />
                        <select value={historySubjectId} onChange={(e) => setHistorySubjectId(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none appearance-none">{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                        <select value={historyPeriod} onChange={(e) => setHistoryPeriod(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none appearance-none">{[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={p}>P{p}</option>)}</select>
                     </div>

                     <div className="flex gap-2 w-full lg:w-auto shrink-0">
                        <button onClick={() => setShowAnalytics(true)} className="flex-1 lg:flex-none px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl transition-all hover:bg-indigo-100"><ChartBarIcon className="w-5 h-5 mx-auto" /></button>
                        <button onClick={exportToExcel} className="flex-1 lg:flex-none px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 flex items-center justify-center gap-3">
                           <ArrowDownTrayIcon className="w-4 h-4" />
                           Export
                        </button>
                     </div>
                  </div>

                  {/* Responsive Archive View */}
                  <div className="rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-sm">
                     {/* Desktop History Table */}
                     <div className="hidden md:block">
                        <table className="w-full text-left">
                           <thead className="bg-[#4169E1] text-white italic">
                              <tr className="text-[10px] font-black uppercase tracking-widest">
                                 <th className="px-10 py-5 text-center border-r border-white/10 w-48">Registration</th>
                                 <th className="px-10 py-5 border-r border-white/10">Full Legal Name</th>
                                 <th className="px-10 py-5 text-center w-40">Status Code</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50 text-uppercase">
                              {loading ? (
                                 <tr><td colSpan="3" className="py-24 text-center text-slate-300 font-black uppercase text-[10px] tracking-[0.5em] animate-pulse italic">Connecting Node...</td></tr>
                              ) : historicalRecords.map(item => (
                                 <tr key={item.student.id} onClick={() => setSelectedStudentDetail(item.student)} className="hover:bg-slate-50/50 cursor-pointer transition-all">
                                    <td className="px-10 py-5 font-mono text-xs text-center text-slate-500 font-bold">{item.student.registration_number}</td>
                                    <td className="px-10 py-5 text-[11px] font-black text-slate-900 uppercase tracking-tighter">{item.student.user?.name}</td>
                                    <td className="px-10 py-5 text-center">
                                       <span className={clsx(
                                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                          item.status === 'present' ? "bg-emerald-100 text-emerald-600" : item.status === 'absent' ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-300"
                                       )}>
                                          {item.status === 'unmarked' ? 'Not Marked' : item.status}
                                       </span>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     {/* Mobile History Cards */}
                     <div className="md:hidden divide-y divide-slate-50">
                        {loading ? (
                            <div className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">Scanning History...</div>
                        ) : historicalRecords.length > 0 ? historicalRecords.map(item => (
                           <div key={item.student.id} onClick={() => setSelectedStudentDetail(item.student)} className="p-5 flex items-center justify-between active:bg-slate-50 transition-colors">
                              <div className="min-w-0">
                                 <p className="text-[9px] font-mono text-slate-400 uppercase italic font-bold">{item.student.registration_number}</p>
                                 <h4 className="text-xs font-black text-slate-900 uppercase truncate mt-0.5">{item.student.user?.name}</h4>
                              </div>
                              <span className={clsx(
                                 "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ml-4",
                                 item.status === 'present' ? "bg-emerald-500 text-white" : item.status === 'absent' ? "bg-red-500 text-white" : "bg-slate-100 text-slate-400"
                              )}>
                                 {item.status === 'unmarked' ? 'SKIP' : item.status}
                              </span>
                           </div>
                        )) : (
                          <p className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Empty Archive</p>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* REFINED POPUPS (MODALS) */}
         {selectedStudentDetail && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/20 animate-in zoom-in-95">
                  <button onClick={() => setSelectedStudentDetail(null)} className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/40 rounded-2xl z-20 transition-all backdrop-blur-md text-white">
                     <XMarkIcon className="w-5 h-5" />
                  </button>

                  <div className="h-32 bg-indigo-600 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-600 to-slate-900 opacity-90"></div>
                     <div className="absolute top-8 left-10 text-white z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic mb-1">Student Record</p>
                        <h3 className="text-xl font-black truncate max-w-sm tracking-tight">{selectedStudentDetail.user.name}</h3>
                     </div>
                     {/* Decorative mesh */}
                     <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                     <div className="absolute left-1/2 top-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -translate-x-1/2"></div>
                  </div>

                  {/* Profile Image Section */}
                  <div className="relative px-10 -mt-12 mb-6 z-10">
                     <div className="inline-block p-1.5 bg-white rounded-[2.2rem] shadow-2xl">
                        <div className="w-24 h-24 rounded-[1.8rem] overflow-hidden bg-slate-100 border-2 border-slate-50 flex items-center justify-center">
                           {selectedStudentDetail.user.avatar ? (
                              <img
                                 src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${selectedStudentDetail.user.avatar}`}
                                 alt={selectedStudentDetail.user.name}
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(selectedStudentDetail.user.name) + "&background=random";
                                 }}
                              />
                           ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
                                 <UserCircleIcon className="w-12 h-12 text-indigo-200" />
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="px-10 pb-10 space-y-6">
                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-0.5 hover:bg-slate-50 transition-colors group">
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider group-hover:text-indigo-500 transition-colors">Registration</p>
                           <p className="text-xs font-black text-slate-900">{selectedStudentDetail.registration_number}</p>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-0.5 hover:bg-slate-50 transition-colors group">
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider group-hover:text-indigo-500 transition-colors">NIC Number</p>
                           <p className="text-xs font-black text-slate-900">{selectedStudentDetail.nic_number || '---'}</p>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-0.5 hover:bg-slate-50 transition-colors group">
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider group-hover:text-indigo-500 transition-colors">Batch Node</p>
                           <p className="text-xs font-black text-indigo-600 uppercase italic">{selectedStudentDetail.batch?.name || 'SENIOR-24'}</p>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-0.5 hover:bg-slate-50 transition-colors group">
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider group-hover:text-indigo-500 transition-colors">Phone</p>
                           <p className="text-xs font-black text-slate-900">{selectedStudentDetail.user.phone || 'N/A'}</p>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 col-span-2 flex flex-col gap-0.5 hover:bg-slate-50 transition-colors group">
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider group-hover:text-indigo-500 transition-colors">Communication Line</p>
                           <p className="text-xs font-bold text-slate-800 italic">{selectedStudentDetail.user.email}</p>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 col-span-2 flex flex-col gap-0.5 hover:bg-slate-50 transition-colors group">
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider group-hover:text-indigo-500 transition-colors">Location Node</p>
                           <p className="text-xs font-bold text-slate-700 leading-relaxed">{selectedStudentDetail.address || 'Physical address not indexed.'}</p>
                        </div>
                     </div>

                     <div className="flex gap-3">
                        <button className="flex-1 py-4.5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95 group">
                           Academic Matrix
                           <ChevronRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                           href={`tel:${selectedStudentDetail.user.phone}`}
                           className="p-4.5 bg-indigo-50 text-indigo-600 rounded-[2rem] hover:bg-indigo-100 transition-all active:scale-95"
                        >
                           <PhoneIcon className="w-5 h-5" />
                        </a>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* WHATSAPP SYNC MODAL */}
         {showWhatsAppSummary && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 relative animate-in zoom-in-95">
                  <button onClick={() => setShowWhatsAppSummary(false)} className="absolute top-8 right-8 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"><XMarkIcon className="w-5 h-5" /></button>
                  <div className="space-y-10 text-center">
                     <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner"><DevicePhoneMobileIcon className="w-10 h-10 text-emerald-600" /></div>
                     <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Sync WhatsApp</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pushing class logs to batch terminal group.</p>
                     </div>
                     <div className="bg-slate-950 text-emerald-400/90 p-6 rounded-3xl text-left font-mono text-[11px] overflow-auto max-h-48 shadow-inner border border-white/5"><pre className="whitespace-pre-wrap leading-relaxed">{decodeURIComponent(generateWhatsAppMessage())}</pre></div>
                     <a href={`https://wa.me/?text=${generateWhatsAppMessage()}`} target="_blank" rel="noreferrer" className="block w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200/50 hover:bg-emerald-600 transition-all">Execute Protocol</a>
                  </div>
               </div>
            </div>
         )}

         {/* ANALYTICS MODAL */}
         {showAnalytics && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
               <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in-95">
                  <button onClick={() => setShowAnalytics(false)} className="absolute top-8 right-8 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100"><XMarkIcon className="w-5 h-5" /></button>
                  <div className="space-y-12">
                     <div className="flex items-center gap-6">
                        <div className="p-5 bg-indigo-50 rounded-3xl text-indigo-600 shadow-sm"><ChartBarIcon className="w-10 h-10" /></div>
                        <div><h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Session Analytics</h2><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Performance node statistics</p></div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-6 bg-slate-50 rounded-[2rem] text-center border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase mb-2 italic">Total</p><p className="text-3xl font-black text-slate-900 italic">{(activeTab === 'mark' ? liveStats : historyStats).total}</p></div>
                        <div className="p-6 bg-emerald-50 rounded-[2rem] text-center border border-emerald-100"><p className="text-[9px] font-black text-emerald-400 uppercase mb-2 italic">Present</p><p className="text-3xl font-black text-emerald-600 italic">{(activeTab === 'mark' ? liveStats : historyStats).present}</p></div>
                        <div className="p-6 bg-red-50 rounded-[2rem] text-center border border-red-100"><p className="text-[9px] font-black text-red-400 uppercase mb-2 italic">Absent</p><p className="text-3xl font-black text-red-600 italic">{(activeTab === 'mark' ? liveStats : historyStats).absent}</p></div>
                        <div className="p-6 bg-indigo-50 rounded-[2rem] text-center border border-indigo-100"><p className="text-[9px] font-black text-indigo-400 uppercase mb-2 italic">Rate %</p><p className="text-3xl font-black text-indigo-600 italic">{(activeTab === 'mark' ? liveStats : historyStats).percent}</p></div>
                     </div>
                     <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-widest italic">Presence Efficiency Gradient</p>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200">
                           <div className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ width: `${(activeTab === 'mark' ? liveStats : historyStats).percent}%` }}></div>
                           <div className="bg-red-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(239,68,68,0.3)]" style={{ width: `${100 - (activeTab === 'mark' ? liveStats : historyStats).percent}%` }}></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
