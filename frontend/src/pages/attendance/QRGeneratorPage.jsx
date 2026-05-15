import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

export const QRGeneratorPage = () => {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [duration, setDuration] = useState(10);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Fetch today's classes for the lecturer
    const fetchClasses = async () => {
      try {
        const response = await api.get('/class-sessions', {
          params: { date: new Date().toISOString().split('T')[0] }
        });
        setClasses(response.data.data.data || []);
      } catch (error) {
        toast.error('Failed to load classes');
      }
    };
    if (user?.role === 'lecturer') {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    // Countdown timer
    if (session && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && session) {
      setSession(null); // Session expired UI update
    }
  }, [session, timeLeft]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedClass) return toast.error('Please select a class');
    
    setLoading(true);
    try {
      const response = await api.post('/attendance/generate-qr', {
        class_session_id: selectedClass,
        duration_minutes: duration
      });
      
      const payload = response.data.data;
      setSession(payload);
      setTimeLeft(payload.duration_minutes * 60);
      toast.success('QR Code generated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!session?.session?.id) return;
    try {
      await api.post(`/attendance/sessions/${session.session.id}/close`);
      setSession(null);
      setTimeLeft(0);
      toast.success('Session closed');
    } catch (error) {
      toast.error('Failed to close session');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Generate Attendance QR</h1>
      
      {!session ? (
        <div className="card p-6 bg-white">
          <form onSubmit={handleGenerate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700">Select Class Session</label>
              <select 
                className="input-field mt-1"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.start_time} - {c.subject.name} ({c.batch.name})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Validity Duration (Minutes)</label>
              <input 
                type="number" 
                min="1" 
                max="30"
                className="input-field mt-1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || classes.length === 0}
              className="btn btn-primary w-full"
            >
              {loading ? 'Generating...' : 'Generate New QR Code'}
            </button>
            {classes.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">No classes scheduled for today.</p>
            )}
          </form>
        </div>
      ) : (
        <div className="card bg-white overflow-hidden shadow-2xl">
          <div className="bg-slate-900 text-white p-6 text-center">
            <h2 className="text-3xl font-bold mb-2">Scan to mark attendance</h2>
            <p className="text-slate-300">Open the SCMS app or any QR scanner</p>
          </div>
          
          <div className="p-12 flex flex-col items-center justify-center relative">
            {/* Pulsing background effect */}
            <div className="absolute w-96 h-96 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            
            <div className="bg-white p-4 rounded-xl shadow-lg border-4 border-slate-100 z-10 relative">
              <QRCode 
                value={session.qr_code}
                size={300}
                level="M"
              />
            </div>
            
            <div className={`mt-8 text-4xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-slate-500 uppercase tracking-widest mt-2">{timeLeft < 60 ? 'Hurry up!' : 'Time Remaining'}</p>
          </div>
          
          <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-900">{session.session?.classSession?.subject?.name}</p>
              <p className="text-sm text-slate-500">Automatically expires when timer reaches zero</p>
            </div>
            <button 
              onClick={handleCloseSession}
              className="btn bg-slate-200 hover:bg-slate-300 text-slate-800"
            >
              Close Early
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
