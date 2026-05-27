import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    EnvelopeIcon, 
    ArrowLeftIcon, 
    SparklesIcon, 
    ShieldCheckIcon, 
    KeyIcon, 
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../api/client';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: Code & Reset
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('Recovery code sent to ' + email);
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email,
                token,
                password,
                password_confirmation: passwordConfirmation
            });
            toast.success('Security layer updated! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid code or reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Brand */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-white text-xl font-black tracking-tighter">SC</span>
                        </div>
                        <div className="text-left">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1 uppercase italic">SCMS</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recovery Terminal</p>
                        </div>
                    </Link>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden transition-all duration-500">
                    
                    {/* Stepper UI */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                    </div>

                    {step === 1 ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-8">
                                <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Access Recovery</h1>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed">Enter your node email to receive a synchronization code.</p>
                            </div>

                            <form onSubmit={handleSendCode} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                            <EnvelopeIcon className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@atijaffna.lk"
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-indigo-600 shadow-xl shadow-indigo-100 transition-all duration-500 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? 'Transmitting...' : (
                                        <>
                                            <span>Generate Code</span>
                                            <SparklesIcon className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <button 
                                onClick={() => setStep(1)}
                                className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 hover:translate-x-[-4px] transition-transform"
                            >
                                <ArrowLeftIcon className="w-3 h-3" />
                                Correct Email
                            </button>

                            <div className="mb-8">
                                <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Terminal Sync</h1>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed">Enter the code sent to <span className="text-indigo-600">{email}</span></p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">6-Digit Code</label>
                                    <div className="relative group">
                                        <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={token}
                                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                            placeholder="000 000"
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black tracking-[0.5em] text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative group">
                                        <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-indigo-600"
                                        >
                                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Update</label>
                                    <div className="relative group">
                                        <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            required
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-indigo-600"
                                        >
                                            {showConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all duration-500 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                                >
                                    {loading ? 'Updating...' : (
                                        <>
                                            <span>Reset Security Node</span>
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center px-6">
                    <Link to="/login" className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        Abort and return to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
