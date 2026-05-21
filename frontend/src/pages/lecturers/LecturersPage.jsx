import { useState, useEffect } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { 
  AcademicCapIcon, 
  MagnifyingGlassIcon, 
  UserPlusIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  IdentificationIcon,
  TrashIcon,
  MicrophoneIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const LecturersPage = () => {
  const { user } = useAuthStore();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Register modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null); // holds { name, email, password }
  const [copied, setCopied] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
  });

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      const response = await api.get('/lecturers');
      setLecturers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load faculty registry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion of this faculty record?")) return;
    try {
      await api.delete(`/lecturers/${id}`);
      toast.success('Record purged successfully');
      fetchLecturers();
    } catch (error) {
      toast.error('Deletion protocol failed');
    }
  };

  const handleOpenRegister = () => {
    setRegisterForm({ name: '', email: '', phone: '', specialization: '' });
    setRegistrationSuccess(null);
    setCopied(false);
    setShowRegisterModal(true);
  };

  const handleCloseRegister = () => {
    setShowRegisterModal(false);
    setRegistrationSuccess(null);
    setCopied(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/lecturers', registerForm);
      const data = response.data.data;
      setRegistrationSuccess({
        name: registerForm.name,
        email: registerForm.email,
        password: data.temporary_password,
      });
      toast.success('Lecturer registered successfully!');
      fetchLecturers();
    } catch (error) {
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors).flat()[0];
        toast.error(firstError);
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!registrationSuccess) return;
    const text = `Lecturer Credentials\n---------------------\nName: ${registrationSuccess.name}\nEmail: ${registrationSuccess.email}\nTemporary Password: ${registrationSuccess.password}\n\nPlease change your password after first login.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredLecturers = lecturers.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.user?.name?.toLowerCase().includes(q) ||
      l.user?.email?.toLowerCase().includes(q) ||
      l.employee_id?.toLowerCase().includes(q) ||
      l.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      {/* COMMAND HEADER */}
      <div className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden text-white border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div>
             <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl shadow-xl shadow-indigo-600/20">
                   <MicrophoneIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                   <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Faculty Registry</h1>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Authorized HNDIT Domain Experts</p>
                </div>
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80 group">
              <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Query Faculty Identity..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-xs font-black text-indigo-100 placeholder:text-slate-700 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            
            {user?.role === 'admin' && (
              <button 
                onClick={handleOpenRegister}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                <UserPlusIcon className="w-5 h-5" />
                Register Expert
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FACULTY DIRECTORY */}
      {loading ? (
        <div className="p-32 text-center">
           <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Calibrating Staff Records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {filteredLecturers.map(lecturer => (
              <div key={lecturer.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] group-hover:bg-indigo-50 transition-colors"></div>
                 
                 <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-8">
                       <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center font-black text-3xl text-indigo-500 shadow-xl shadow-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {lecturer.user?.name?.charAt(0)}
                       </div>
                       <div>
                          <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-lg mb-2">
                             {lecturer.employee_id}
                          </div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                             {lecturer.user?.name}
                          </h3>
                       </div>
                    </div>

                    <div className="space-y-4 mb-8">
                       <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                          <EnvelopeIcon className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase lg:text-xs">{lecturer.user?.email}</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-400">
                          <IdentificationIcon className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{lecturer.department || 'Information Technology'}</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-400">
                          <MapPinIcon className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Jaffna Regional Center</span>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Credential Validated</span>
                        </div>
                        {user?.role === 'admin' && (
                           <button 
                              onClick={() => handleDelete(lecturer.id)}
                              className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100/50"
                           >
                              <TrashIcon className="w-5 h-5" />
                           </button>
                        )}
                    </div>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* REGISTER LECTURER MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
                    <UserPlusIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase">Register New Expert</h2>
                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Faculty Onboarding Protocol</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseRegister} 
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            {/* Success State */}
            {registrationSuccess ? (
              <div className="p-10 space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheckIcon className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Expert Registered!</h3>
                  <p className="text-sm text-slate-500 mt-2">Share the credentials below with the lecturer</p>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</span>
                    <span className="text-sm font-bold text-slate-900">{registrationSuccess.name}</span>
                  </div>
                  <div className="border-t border-slate-100"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                    <span className="text-sm font-bold text-slate-900">{registrationSuccess.email}</span>
                  </div>
                  <div className="border-t border-slate-100"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <KeyIcon className="w-4 h-4 text-amber-500" />
                      Temp Password
                    </span>
                    <span className="text-sm font-mono font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl tracking-wider">{registrationSuccess.password}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleCopyCredentials}
                    className={clsx(
                      "flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                      copied 
                        ? "bg-emerald-600 text-white shadow-xl shadow-emerald-100" 
                        : "bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-slate-200"
                    )}
                  >
                    {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                    {copied ? 'Copied!' : 'Copy Credentials'}
                  </button>
                  <button
                    onClick={handleCloseRegister}
                    className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleRegisterSubmit} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. John Doe"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="john@university.edu"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+94 77 123 4567"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                  </div>

                  {/* Specialization */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</label>
                    <input
                      type="text"
                      placeholder="Software Engineering"
                      value={registerForm.specialization}
                      onChange={(e) => setRegisterForm({...registerForm, specialization: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Info Banner */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                  <KeyIcon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">
                    A temporary password will be auto-generated. You'll be able to copy and share credentials after registration.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="w-5 h-5" />
                        Register Expert
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseRegister}
                    className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
