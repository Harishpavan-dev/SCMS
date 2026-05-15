import { useState, useEffect } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { 
  UsersIcon, 
  MagnifyingGlassIcon, 
  CheckBadgeIcon, 
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const StudentsPage = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [activeTab, setActiveTab] = useState('active'); // active, pending
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    nic_number: '',
    batch_id: '',
    current_semester_id: '',
    status: ''
  });

  useEffect(() => {
    fetchData();
  }, [search, activeTab, selectedBatch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, batRes] = await Promise.all([
        api.get('/students', {
            params: { 
              search: search || undefined,
              status: activeTab === 'pending' ? 'pending' : undefined,
              batch_id: selectedBatch !== 'all' ? selectedBatch : undefined,
              per_page: 200
            }
        }),
        api.get('/public/batches')
      ]);
      let data = stuRes.data.data.data || [];
      if (activeTab === 'active') {
        data = data.filter(s => s.status !== 'pending');
      }
      setStudents(data);
      setBatches(batRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.user?.name || '',
      email: student.user?.email || '',
      phone: student.user?.phone || '',
      nic_number: student.nic_number || '',
      batch_id: student.batch_id || '',
      current_semester_id: student.current_semester_id || '',
      status: student.status || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(`/students/${selectedStudent.id}`, editForm);
      toast.success('Student updated successfully');
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : 'Failed to update student';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRep = async (id) => {
    try {
      const response = await api.put(`/students/${id}/toggle-rep`);
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      toast.error('Failed to update student role');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/students/${id}/approve`);
      toast.success('Student approved');
      fetchData();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleUpgradeCycle = async (e) => {
    e.preventDefault();
    setIsMigrating(true);
    try {
      await api.post('/students/upgrade-academic-cycle', { password: adminPassword });
      toast.success('Academic year upgraded');
      setShowUpgradeModal(false);
      setAdminPassword('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Migration failed');
    } finally {
      setIsMigrating(false);
    }
  };

  const getBatchRepCount = (batchId) => {
    return students.filter(s => s.batch_id === batchId && s.user?.role === 'rep').length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Management</h1>
          <p className="text-sm text-slate-500">Manage batches and student representatives</p>
        </div>
        
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all"
          >
            <ArrowTrendingUpIcon className="w-4 h-4" />
            Upgrade Academic Year
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedBatch('all')}
              className={clsx("px-4 py-2 rounded-xl text-xs font-bold transition-all border", selectedBatch === 'all' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
            >
              All Batches
            </button>
            {batches.map(batch => (
              <button 
                key={batch.id}
                onClick={() => setSelectedBatch(batch.id)}
                className={clsx("px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2", selectedBatch === batch.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
              >
                {batch.name}
                <span className="text-[10px] opacity-70">({getBatchRepCount(batch.id)} Reps)</span>
              </button>
            ))}
         </div>

         <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200">
            <button 
              className={clsx("px-4 py-2 rounded-lg text-xs font-bold transition-all", activeTab === 'active' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button 
              className={clsx("px-4 py-2 rounded-lg text-xs font-bold transition-all", activeTab === 'pending' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
           <div className="relative max-w-sm">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                 type="text" 
                 placeholder="Search student..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              />
           </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 font-medium">Loading records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Reg Number</th>
                  <th className="px-6 py-4">Current Semester</th>
                  <th className="px-6 py-4 text-right">Role</th>
                  {activeTab === 'pending' && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic-none">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleOpenEdit(student)}>
                      <div className="flex items-center gap-3">
                        {student.user?.avatar ? (
                          <img 
                            src={`${import.meta.env.VITE_API_URL}/storage/${student.user.avatar}`} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            alt=""
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs text-uppercase group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                            {student.user?.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-all">{student.user?.name}</p>
                          <p className="text-xs text-slate-400">{student.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {student.registration_number}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {student.current_semester?.name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {student.user?.role === 'rep' ? (
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Representative</span>
                      ) : (
                        <span className="text-slate-400 text-xs">Student</span>
                      )}
                    </td>
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(student.id);
                          }}
                          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Approve
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile & Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="bg-slate-50 p-10 border-b border-slate-100 flex justify-between items-start">
               <div className="flex items-center gap-6">
                  {selectedStudent.user?.avatar ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/storage/${selectedStudent.user.avatar}`} 
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
                      alt={editForm.name}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-indigo-200">
                      {selectedStudent.user?.name?.charAt(0)}
                    </div>
                  )}
                  <div className="pt-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editForm.name}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedStudent.registration_number}</p>
                    <div className="mt-3 flex items-center gap-2">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-[10px] font-black uppercase text-slate-500">
                          <CheckBadgeIcon className="w-3 h-3 text-indigo-600" />
                          Verified Identity
                       </div>
                       
                       <button 
                         type="button"
                         onClick={() => handleToggleRep(selectedStudent.id)}
                         className={clsx(
                           "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all",
                           selectedStudent.user?.role === 'rep' ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100"
                         )}
                       >
                         {selectedStudent.user?.role === 'rep' ? 'Revoke Rep Status' : 'Make Batch Rep'}
                       </button>
                    </div>
                  </div>
               </div>
               <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                  <LockClosedIcon className="w-5 h-5 text-slate-400" />
               </button>
            </div>

            <form onSubmit={handleUpdate} className="p-10 grid grid-cols-2 gap-8">
               <div className="space-y-1">
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
               </div>
               <div className="space-y-1">
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
               </div>
               <div className="space-y-1">
                  <input 
                    type="text" 
                    placeholder="NIC / National ID"
                    value={editForm.nic_number}
                    onChange={(e) => setEditForm({...editForm, nic_number: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
               </div>
               <div className="space-y-1">
                  <input 
                    type="text" 
                    placeholder="Phone Number"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
               </div>

               <div className="col-span-2 pt-10 flex gap-4">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-1 bg-indigo-600 text-white py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Processing Matrix...' : 'Save Profile Matrix'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-10 bg-slate-100 text-slate-500 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all font-bold"
                  >
                    Discard
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <form onSubmit={handleUpgradeCycle} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                 </div>
                 <h2 className="text-lg font-bold text-slate-900">Confirm Upgrade</h2>
              </div>
              
              <p className="text-sm text-slate-500 mb-6">Enter admin password to move all students to the next semester. S4 students will be graduated.</p>
              
              <div className="space-y-4">
                 <input 
                   type="password" 
                   required
                   placeholder="Admin Password" 
                   value={adminPassword}
                   onChange={(e) => setAdminPassword(e.target.value)}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                 />
                 <div className="flex gap-2">
                    <button type="submit" disabled={isMigrating} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50">
                       {isMigrating ? 'Upgrading...' : 'Confirm Upgrade'}
                    </button>
                    <button type="button" onClick={() => setShowUpgradeModal(false)} className="px-6 bg-slate-100 text-slate-500 py-3 rounded-xl text-sm font-bold">
                       Cancel
                    </button>
                 </div>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};
