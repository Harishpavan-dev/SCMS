import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import { LockClosedIcon, EnvelopeIcon, ArrowRightIcon, EyeIcon, EyeSlashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Access Granted - Welcome to SCMS');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Authentication Failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-6 relative overflow-hidden font-sans">
      {/* ── BACKGROUND ORBS ──────────────────────────────────────────────────────── */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/30 to-blue-200/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-amber-100/30 to-rose-100/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      <div className="absolute top-[40%] right-[15%] w-80 h-80 bg-indigo-100/20 rounded-full blur-[90px] animate-pulse delay-500"></div>

      <div className="max-w-md w-full relative z-10 transition-all duration-700">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-200/50 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08)] hover:shadow-[0_30px_70px_-10px_rgba(15,23,42,0.12)] transition-shadow duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-yellow-500 to-amber-400 rounded-2xl shadow-lg shadow-amber-500/25 mb-6 group cursor-default hover:scale-105 active:scale-95 transition-all duration-300">
              <AcademicCapIcon className="w-8 h-8 text-white group-hover:rotate-[360deg] transition-transform duration-1000 ease-in-out" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-slate-500 text-sm font-semibold">Access your ATI Jaffna academic node</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="relative group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1.5 inline-block">Official Email</label>
                <div className="relative rounded-2xl border border-slate-200/80 bg-white/70 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300 shadow-sm flex items-center">
                  <EnvelopeIcon className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-sm font-medium rounded-2xl"
                    placeholder="email@atijaffna.lk"
                  />
                </div>
              </div>
              
              <div className="relative group">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1.5 inline-block">Master Password</label>
                <div className="relative rounded-2xl border border-slate-200/80 bg-white/70 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300 shadow-sm flex items-center">
                  <LockClosedIcon className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-sm font-semibold rounded-2xl"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer" 
                />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Keep me signed in</span>
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Recover Key?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Initialize Portal</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <p className="text-center text-xs font-bold text-slate-500">
              New Batch? <Link to="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors">Submit Registration</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
