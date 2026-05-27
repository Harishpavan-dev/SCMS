import { useState, useEffect } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon, 
  PlusIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  TagIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FolderIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const SubjectsPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'hod';
  
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); 

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credit_hours: 2,
    semester_id: ''
  });

  useEffect(() => {
    fetchData();
  }, [search, selectedSemester]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, semRes] = await Promise.all([
        api.get('/subjects', {
          params: { 
            search: search || undefined,
            semester_id: selectedSemester !== 'all' ? selectedSemester : undefined
          }
        }),
        api.get('/public/semesters')
      ]);
      setSubjects(subRes.data.data || []);
      setSemesters(semRes.data.data || []);
      
      if (semRes.data.data.length > 0 && !formData.semester_id) {
        setFormData(prev => ({ ...prev, semester_id: semRes.data.data[0].id }));
      }
    } catch (error) {
      toast.error('Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        code: subject.code,
        name: subject.name,
        credit_hours: subject.credit_hours,
        semester_id: subject.semester_id
      });
    } else {
      setEditingSubject(null);
      setFormData({
        code: '',
        name: '',
        credit_hours: 2,
        semester_id: semesters[0]?.id || ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, formData);
        toast.success('Subject updated');
      } else {
        await api.post('/subjects', formData);
        toast.success('Subject registered');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
       const msg = error.response?.data?.message || 'Operation failed';
       toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to purge this subject node?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject purged');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      {/* COMMAND HEADER */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-sm relative overflow-hidden border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
           <div className="p-3 sm:p-4 bg-indigo-50 rounded-2xl">
              <BookOpenIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
           </div>
           <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Curriculum Registry</h1>
              <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Manage HNDIT academic subjects</p>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
           <div className="relative w-full sm:w-80 group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search subjects..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold"
              />
           </div>
           {isAdmin && (
              <button 
                onClick={() => handleOpenModal()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-xs font-black uppercase tracking-widest"
              >
                 <PlusIcon className="w-5 h-5" />
                 <span className="sm:hidden">Add Subject</span>
              </button>
           )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
         <div className="w-full overflow-x-auto pb-2 -mb-2">
            <div className="flex gap-2 min-w-max">
               <button 
                  onClick={() => setSelectedSemester('all')}
                  className={clsx(
                     "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                     selectedSemester === 'all' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                  )}
               >
                  All Semesters
               </button>
               {semesters.map(sem => (
                  <button 
                     key={sem.id}
                     onClick={() => setSelectedSemester(sem.id)}
                     className={clsx(
                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        selectedSemester === sem.id ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-50" : "bg-white text-slate-500 border-slate-100 hover:text-indigo-600 hover:border-indigo-100"
                     )}
                  >
                     {sem.name}
                  </button>
               ))}
            </div>
         </div>

         <div className="bg-white p-1 rounded-xl border border-slate-100 flex">
            <button 
               onClick={() => setViewMode('grid')}
               className={clsx("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-indigo-50 text-indigo-600" : "text-slate-400")}
            >
               <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button 
               onClick={() => setViewMode('list')}
               className={clsx("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-indigo-50 text-indigo-600" : "text-slate-400")}
            >
               <ListBulletIcon className="w-5 h-5" />
            </button>
         </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
           <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
           <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Accessing Node...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {subjects.map(subject => (
                  <div key={subject.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold tracking-wider">
                           {subject.code}
                        </div>
                        {isAdmin && (
                           <div className="flex gap-2">
                              <button onClick={() => handleOpenModal(subject)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                 <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(subject.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                 <TrashIcon className="w-4 h-4" />
                              </button>
                           </div>
                        )}
                     </div>
                     
                     <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                        {subject.name}
                     </h3>
                     <p className="text-xs text-slate-400 font-medium mb-6">
                        {subject.semester?.name} • {subject.credit_hours} Credits
                     </p>
                     
                     <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Active</span>
                        <FolderIcon className="w-5 h-5 text-slate-200" />
                     </div>
                  </div>
               ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                     <tr>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject Name</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Credits</th>
                        {isAdmin && <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {subjects.map(subject => (
                        <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6 font-mono text-xs font-bold text-slate-900">{subject.code}</td>
                           <td className="px-8 py-6 font-bold text-slate-900 text-sm whitespace-nowrap">{subject.name}</td>
                           <td className="px-8 py-6 text-xs text-slate-500">{subject.semester?.name}</td>
                           <td className="px-8 py-6 text-center">
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{subject.credit_hours}</span>
                           </td>
                           {isAdmin && (
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-1">
                                    <button onClick={() => handleOpenModal(subject)} className="p-2 text-slate-400 hover:text-indigo-600">
                                       <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(subject.id)} className="p-2 text-slate-400 hover:text-red-600">
                                       <TrashIcon className="w-4 h-4" />
                                    </button>
                                 </div>
                              </td>
                           )}
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}
        </>
      )}

      {/* SUBJECT MODAL */}
      {showModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">{editingSubject ? 'Modify Subject' : 'New Subject Registration'}</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
                     <XMarkIcon className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject Code</label>
                     <input 
                        required
                        type="text" 
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="e.g. IT1101"
                     />
                  </div>
                  
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                     <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="e.g. Database Management Systems"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Credits</label>
                        <input 
                           required
                           type="number" 
                           min="1"
                           max="6"
                           value={formData.credit_hours}
                           onChange={(e) => setFormData({...formData, credit_hours: e.target.value})}
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                        <select 
                           value={formData.semester_id}
                           onChange={(e) => setFormData({...formData, semester_id: e.target.value})}
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                        >
                           {semesters.map(sem => (
                              <option key={sem.id} value={sem.id}>{sem.name}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  <button 
                     type="submit" 
                     className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all mt-4"
                  >
                     {editingSubject ? 'Synchronize Updates' : 'Execute Registration'}
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
