import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import { LockClosedIcon, EnvelopeIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] py-12 px-6 relative overflow-hidden font-sans">
      {/* ── BACKGROUND ORBS ──────────────────────────────────────────────────────── */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
      <div className="absolute top-[40%] right-[10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>

      <div className="max-w-md w-full relative z-10 transition-all duration-700">
        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg shadow-indigo-500/20 mb-6 group cursor-default">
              <span className="text-white font-black text-2xl group-hover:scale-110 transition-transform">S</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-slate-400 text-sm font-medium">Access your ATI Jaffna academic node</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="relative group">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all"
                  placeholder="Official Email"
                />
              </div>
              <div className="relative group">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all"
                  placeholder="Master Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-0 cursor-pointer" />
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300 transition-colors">Keep me signed in</span>
              </label>
              <a href="#" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Recover Key?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-70"
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
              New Batch? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Submit Registration</Link>
            </p>
          </form>
        </div>

        {/* ── DEMO HINT ─────────────────────────────────────────────────────────── */}
        <div className="mt-10 p-6 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/5">
           <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Demo Credentials</span>
           </div>
           <div className="grid grid-cols-1 gap-2 text-[10px] font-bold">
              <div className="flex justify-between items-center py-2 px-4 bg-white/5 rounded-lg border border-white/5 group hover:bg-white/10 transition-colors">
                 <span className="text-slate-500">ADMIN</span>
                 <span className="text-slate-300">admin@atijaffna.lk / password</span>
              </div>
              <div className="flex justify-between items-center py-2 px-4 bg-white/5 rounded-lg border border-white/5 group hover:bg-white/10 transition-colors">
                 <span className="text-slate-500">STUDENT</span>
                 <span className="text-slate-300">student2@atijaffna.lk / password</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

