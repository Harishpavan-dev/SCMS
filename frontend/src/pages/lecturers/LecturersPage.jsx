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
  ShieldCheckIcon,
  PencilSquareIcon,
  BookOpenIcon,
  PlusIcon,
  PhoneIcon
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
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
  });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    department: '',
    subject_ids: [],
  });

  // All subjects for assignment
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

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

  const fetchSubjects = async () => {
    setSubjectsLoading(true);
    try {
      const response = await api.get('/subjects');
      setAllSubjects(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion of this faculty record?")) return;
    try {
      await api.delete(`/lecturers/${id}`);
      toast.success('Record deleted successfully');
      fetchLecturers();
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  // ===== REGISTER MODAL HANDLERS =====
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

  // ===== EDIT MODAL HANDLERS =====
  const handleOpenEdit = (lecturer) => {
    setEditingLecturer(lecturer);
    setEditForm({
      name: lecturer.user?.name || '',
      email: lecturer.user?.email || '',
      phone: lecturer.user?.phone || '',
      specialization: lecturer.specialization || '',
      department: lecturer.department || '',
      subject_ids: (lecturer.subjects || []).map(s => s.id),
    });
    setShowEditModal(true);
    fetchSubjects();
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingLecturer(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingLecturer) return;
    setIsUpdating(true);
    try {
      await api.put(`/lecturers/${editingLecturer.id}`, editForm);
      toast.success('Lecturer updated successfully!');
      fetchLecturers();
      handleCloseEdit();
    } catch (error) {
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors).flat()[0];
        toast.error(firstError);
      } else {
        toast.error(error.response?.data?.message || 'Update failed');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSubject = (subjectId) => {
    setEditForm(prev => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(subjectId)
        ? prev.subject_ids.filter(id => id !== subjectId)
        : [...prev.subject_ids, subjectId],
    }));
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
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      {/* PROFESSIONAL HEADER SECTON */}
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Faculty Registry</h1>
            </div>
            <p className="text-slate-500 text-sm ml-14">Manage and monitor academic staff and domain experts</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>

            {user?.role === 'admin' && (
              <button
                onClick={handleOpenRegister}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
              >
                <PlusIcon className="w-5 h-5" />
                Add Lecturer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FACULTY DIRECTORY */}
      {loading ? (
        <div className="py-32 text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLecturers.map(lecturer => (
            <div key={lecturer.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col">
              <div className="p-8 pb-4">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    {lecturer.user?.name?.charAt(0)}
                  </div>
                  <div className="px-3 py-1 bg-indigo-50/50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100/50">
                    {lecturer.employee_id}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {lecturer.user?.name}
                </h3>
                <p className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2">
                  <IdentificationIcon className="w-4 h-4 text-slate-400" />
                  {lecturer.department || 'Information Technology'}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <EnvelopeIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium truncate">{lecturer.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <MapPinIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">Jaffna Regional Center</span>
                  </div>
                </div>

                {/* ASSIGNED SUBJECTS */}
                {lecturer.subjects && lecturer.subjects.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-2">
                      {lecturer.subjects.slice(0, 3).map(subject => (
                        <span
                          key={subject.id}
                          className="inline-flex items-center px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-semibold border border-slate-200/60 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors"
                        >
                          {subject.code}
                        </span>
                      ))}
                      {lecturer.subjects.length > 3 && (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center">
                          +{lecturer.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Status</span>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(lecturer)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md"
                      title="Edit Lecturer"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lecturer.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md"
                      title="Delete Lecturer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== REGISTER LECTURER MODAL ==================== */}
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
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
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
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
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
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
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
                      onChange={(e) => setRegisterForm({ ...registerForm, specialization: e.target.value })}
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

      {/* ==================== EDIT LECTURER MODAL ==================== */}
      {showEditModal && editingLecturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-violet-900 p-8 relative overflow-hidden flex-shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-violet-600 rounded-2xl shadow-lg shadow-violet-600/30">
                    <PencilSquareIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase">Edit Expert Profile</h2>
                    <p className="text-violet-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                      {editingLecturer.employee_id} · {editingLecturer.user?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseEdit}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleEditSubmit} className="p-10 space-y-8 overflow-y-auto flex-1">

              {/* Personal Information Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <IdentificationIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Personal Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-violet-600 outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-violet-600 outline-none transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+94 77 123 4567"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-violet-600 outline-none transition-all"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                    <input
                      type="text"
                      placeholder="Information Technology"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-violet-600 outline-none transition-all"
                    />
                  </div>

                  {/* Specialization */}
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</label>
                    <input
                      type="text"
                      placeholder="Software Engineering"
                      value={editForm.specialization}
                      onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-violet-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Subject Assignment Section */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                    <BookOpenIcon className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Assign Subjects</h3>
                </div>
                <p className="text-xs text-slate-400 mb-6 ml-11">
                  Select the subjects this lecturer teaches. A lecturer can teach multiple subjects.
                </p>

                {subjectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin"></div>
                  </div>
                ) : allSubjects.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center">
                    <BookOpenIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">No subjects available</p>
                    <p className="text-xs text-slate-300 mt-1">Create subjects first to assign them here</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allSubjects.map(subject => {
                        const isSelected = editForm.subject_ids.includes(subject.id);
                        return (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => toggleSubject(subject.id)}
                            className={clsx(
                              "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                              isSelected
                                ? "bg-violet-50 border-violet-400 shadow-sm shadow-violet-100"
                                : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <div className={clsx(
                              "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                              isSelected
                                ? "bg-violet-600"
                                : "bg-slate-200"
                            )}>
                              {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={clsx(
                                "text-[10px] font-black uppercase tracking-widest",
                                isSelected ? "text-violet-600" : "text-slate-400"
                              )}>
                                {subject.code}
                              </div>
                              <div className={clsx(
                                "text-xs font-bold truncate",
                                isSelected ? "text-slate-900" : "text-slate-600"
                              )}>
                                {subject.name}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected count badge */}
                {editForm.subject_ids.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      {editForm.subject_ids.length} Subject{editForm.subject_ids.length > 1 ? 's' : ''} Selected
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-4 bg-violet-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-100 hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
