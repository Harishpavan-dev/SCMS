import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { 
  QrCodeIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { format } from 'date-fns';

export const AdminQrAttendance = () => {
  const { user } = useAuthStore();
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  
  // Selection state
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [subjectOverrides, setSubjectOverrides] = useState({}); // slotId -> subjectId
  
  // Active session state
  const [activeSession, setActiveSession] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [totalMarked, setTotalMarked] = useState(0);
  
  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSemester && selectedBatch) {
      fetchTimetable();
    }
    if (selectedSemester) {
        fetchSubjects();
    }
  }, [selectedSemester, selectedBatch]);

  const fetchInitialData = async () => {
    try {
      const [semRes, batchRes] = await Promise.all([
        api.get('/public/semesters'),
        api.get('/public/batches')
      ]);
      setSemesters(semRes.data.data || []);
      setBatches(batchRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load initial data');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get(`/semesters/${selectedSemester}/subjects`);
      // Adapt based on API: might be { data: [...] } or { data: { subjects: [...] } }
      const subjects = response.data.data || [];
      setAvailableSubjects(subjects.map(s => s.subject || s));
    } catch (error) {
      console.error('Failed to load subjects', error);
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'eeee').toLowerCase();
      const response = await api.get('/timetable', {
        params: { 
          semester_id: selectedSemester, 
          batch_id: selectedBatch,
          day_of_week: today
        }
      });
      const todayEntries = response.data.data[today] || [];
      setTimetable(todayEntries);
    } catch (error) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (slotId, subjectId) => {
    setSubjectOverrides(prev => ({ ...prev, [slotId]: subjectId }));
  };

  const startSession = async (slot) => {
    const subjectId = subjectOverrides[slot.id] || slot.subject_id;
    
    if (!subjectId) {
      toast.error('Please select a subject for this session');
      return;
    }

    setInitializing(true);
    try {
      const response = await api.post('/attendance/initialize', {
        semester_id: selectedSemester,
        batch_id: selectedBatch,
        subject_id: subjectId,
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: slot.start_time,
        end_time: slot.end_time
      });
      
      setActiveSession(response.data.data);
      setRecentScans([]);
      setTotalMarked(0);
      setScannerActive(true);
      toast.success('Attendance session started');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start session');
    } finally {
      setInitializing(false);
    }
  };

  const stopSession = async () => {
    if (!activeSession) return;
    try {
      await api.post(`/attendance/sessions/${activeSession.id}/close`);
      setScannerActive(false);
      setActiveSession(null);
      toast.success('Session closed successfully');
    } catch (error) {
      toast.error('Failed to close session');
    }
  };

  useEffect(() => {
    if (scannerActive && activeSession) {
      const scanner = new Html5QrcodeScanner('admin-scanner', {
        fps: 15,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
      });

      // Use a local variable to track the last scanned text inside the specific scanner instance
      let currentScanned = null;

      const onScanSuccess = async (decodedText) => {
        if (currentScanned === decodedText) return;
        
        // Error handling for generic/wrong QR codes
        if (decodedText.length > 50 || decodedText.startsWith('http')) {
            if (currentScanned !== 'INVALID') {
               toast.error('Invalid ID QR Code format detected');
               currentScanned = 'INVALID';
               setTimeout(() => { currentScanned = null; }, 3000);
            }
            return;
        }

        currentScanned = decodedText;
        setLastScanned(decodedText); // Update UI state
        
        try {
          const response = await api.post('/attendance/mark-scan', {
            attendance_session_id: activeSession.id,
            registration_number: decodedText
          });
          
          const scanInfo = response.data.data;
          setRecentScans(prev => [
            { id: Date.now(), name: scanInfo.student_name, reg: scanInfo.reg_number, time: format(new Date(), 'HH:mm:ss'), status: 'success' },
            ...prev
          ].slice(0, 10));
          setTotalMarked(prev => prev + 1);
          
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {});
          
        } catch (error) {
          toast.error(error.response?.data?.message || 'Scan failed');
          setRecentScans(prev => [
            { id: Date.now(), name: 'Error', reg: decodedText, time: format(new Date(), 'HH:mm:ss'), status: 'fail' },
            ...prev
          ].slice(0, 10));
        }
        
        // Reset the tracker after a delay
        setTimeout(() => {
           if (currentScanned === decodedText) currentScanned = null;
           setLastScanned(null);
        }, 2000);
      };

      scanner.render(onScanSuccess, (e) => {});
      
      return () => {
        scanner.clear().catch(err => console.error(err));
      };
    }
  }, [scannerActive, activeSession]);

  if (user?.role !== 'admin' && user?.role !== 'lecturer') {
    return <div className="p-20 text-center text-slate-500 font-bold">Access Denied</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header Container */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-8">
          <div className="text-center xl:text-left">
            <h1 className="text-4xl font-black tracking-tighter flex items-center justify-center xl:justify-start gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <QrCodeIcon className="w-10 h-10 text-indigo-400" />
              </div>
              Attendance Radar
            </h1>
            <p className="text-indigo-200 mt-3 font-medium text-lg opacity-80">Next-gen classroom presence verification</p>
          </div>
          
          {!activeSession ? (
            <div className="flex flex-wrap justify-center gap-6 bg-white/5 p-6 rounded-3xl backdrop-blur-xl border border-white/10 shadow-inner">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest px-1">Program Semester</span>
                <select 
                  className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold min-w-[180px] focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="">Choose Semester</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest px-1">Active Batch</span>
                <select 
                  className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold min-w-[180px] focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <option value="">Choose Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <button 
                onClick={fetchTimetable}
                className="self-end p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg transition-transform active:scale-90"
              >
                <ArrowPathIcon className={clsx("w-6 h-6", loading && "animate-spin")} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-8 bg-emerald-500/10 px-8 py-5 rounded-[2rem] border border-emerald-400/20 backdrop-blur-xl animate-in fade-in duration-700">
               <div>
                  <p className="text-xs font-black uppercase text-emerald-400 tracking-[0.2em] mb-1">Live Presence Count</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-black text-white">{totalMarked}</span>
                     <span className="text-emerald-400/60 font-medium">Students</span>
                  </div>
               </div>
               <button 
                onClick={stopSession}
                className="bg-red-500 hover:bg-red-400 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95 group"
               >
                 <StopIcon className="w-8 h-8 group-hover:rotate-90 transition-transform" />
               </button>
            </div>
          )}
        </div>
      </div>

      {!activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Timetable Slots */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Daily Schedule Logs</h3>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-indigo-500 animate-pulse rounded-full"></div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{format(new Date(), 'eeee')}</span>
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="py-20 flex flex-col items-center opacity-40">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 font-black uppercase text-xs tracking-widest">Synthesizing Schedule...</p>
                  </div>
                ) : timetable?.length > 0 ? (
                  timetable.map((slot) => (
                    <div key={slot.id} className="flex flex-col xl:flex-row items-center justify-between p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 bg-slate-50/20 hover:bg-indigo-50/20 transition-all gap-6">
                       <div className="flex flex-wrap items-center gap-6 flex-1">
                          <div className="text-center bg-white shadow-sm border border-slate-100 p-4 rounded-2xl min-w-[110px]">
                             <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-2">Time Slot</p>
                             <p className="text-lg font-black text-slate-800 tracking-tighter">{slot.start_time}</p>
                          </div>
                          <div className="flex-1 min-w-[200px]">
                             <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Select Subject </label>
                                <select 
                                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none w-full"
                                  value={subjectOverrides[slot.id] || slot.subject_id}
                                  onChange={(e) => handleSubjectChange(slot.id, e.target.value)}
                                >
                                  <option value={slot.subject_id}>{slot.subject.name} (Scheduled)</option>
                                  {availableSubjects.filter(s => s.id !== slot.subject_id).map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                             </div>
                          </div>
                       </div>
                       
                       <button 
                        onClick={() => startSession(slot)}
                        disabled={initializing}
                        className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:translate-x-1 active:translate-y-1"
                       >
                         Launch Session
                       </button>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-30">
                     <CalendarIcon className="w-20 h-20 mx-auto mb-4" />
                     <p className="text-lg font-black uppercase tracking-tighter">No Active Slots Found</p>
                     <p className="text-sm font-medium">Select criteria to sync your timetable records</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl text-white">
              <h4 className="font-black text-xl mb-6">Workflow Intelligence</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-white/20 p-2 rounded-lg h-fit"><AcademicCapIcon className="w-5 h-5"/></div>
                  <div>
                    <p className="font-bold text-sm">Semester Scoping</p>
                    <p className="text-xs text-indigo-100 mt-1 opacity-70">Strict matching between student records and session metadata.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/20 p-2 rounded-lg h-fit"><ClockIcon className="w-5 h-5"/></div>
                  <div>
                    <p className="font-bold text-sm">Real-time Logging</p>
                    <p className="text-xs text-indigo-100 mt-1 opacity-70">Instant synchronization with master attendance records.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Scanning Component */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in zoom-in-95 duration-500">
           <div className="lg:col-span-8">
              <div className="bg-slate-900 rounded-[3rem] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-8 border-slate-800 relative group overflow-hidden">
                 <div id="admin-scanner" className="w-full aspect-square md:aspect-[16/10] bg-black rounded-[2.5rem] overflow-hidden"></div>
                 <div className="absolute inset-0 border-[30px] border-slate-900 rounded-[2.5rem] pointer-events-none"></div>
                 
                 {/* Decorative HUD Elements */}
                 <div className="absolute top-10 left-10 p-4 border-l-2 border-t-2 border-indigo-500 rounded-tl-3xl opacity-50"></div>
                 <div className="absolute top-10 right-10 p-4 border-r-2 border-t-2 border-indigo-500 rounded-tr-3xl opacity-50"></div>
                 <div className="absolute bottom-10 left-10 p-4 border-l-2 border-b-2 border-indigo-500 rounded-bl-3xl opacity-50"></div>
                 <div className="absolute bottom-10 right-10 p-4 border-r-2 border-b-2 border-indigo-500 rounded-br-3xl opacity-50"></div>

                 <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Scanning Active Segment</p>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden flex-1 flex flex-col">
                 <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Entry Stream</h3>
                    <div className="flex items-center gap-1.5 bg-emerald-100 px-3 py-1 rounded-full">
                       <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></div>
                       <span className="text-[10px] font-black text-emerald-800">{totalMarked} Rec</span>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                    {recentScans.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-10">
                        <QrCodeIcon className="w-20 h-20 mb-4" />
                        <p className="font-medium">Awaiting incoming signals</p>
                      </div>
                    ) : (
                      recentScans.map(scan => (
                        <div key={scan.id} className={clsx("flex items-center gap-4 p-4 rounded-2xl border transition-all animate-in slide-in-from-right-4", scan.status === 'success' ? "bg-white border-slate-100 shadow-sm" : "bg-red-50 border-red-100")}>
                           <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", scan.status === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                              {scan.status === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <XCircleIcon className="w-6 h-6" />}
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="text-sm font-black text-slate-800 truncate leading-tight uppercase tracking-tighter">{scan.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 font-mono italic">{scan.reg}</p>
                           </div>
                           <span className="text-[10px] font-black text-slate-300">{scan.time}</span>
                        </div>
                      ))
                    )}
                 </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2rem] text-center shadow-2xl relative overflow-hidden">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Live Radar Feed</p>
                 <div className="h-12 flex items-center justify-center">
                    {lastScanned ? (
                      <p className="text-xl font-black text-white tracking-[0.1em] animate-in zoom-in duration-300 uppercase">{lastScanned}</p>
                    ) : (
                      <div className="flex gap-2">
                        {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-slate-700 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>)}
                      </div>
                    )}
                 </div>
                 {/* Background Glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 blur-[50px] rounded-full"></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
