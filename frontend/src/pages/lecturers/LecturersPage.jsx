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
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const LecturersPage = () => {
  const { user } = useAuthStore();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
              <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95">
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
           {lecturers.map(lecturer => (
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
    </div>
  );
};
