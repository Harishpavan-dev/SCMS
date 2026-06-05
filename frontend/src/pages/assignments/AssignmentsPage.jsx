import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import api from '../../api/client';
import toast from 'react-hot-toast';
import {
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  PaperClipIcon,
  ExclamationCircleIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export const AssignmentsPage = () => {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentDetail, setAssignmentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Lecturer states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [createForm, setCreateForm] = useState({
    subject_id: '',
    title: '',
    description: '',
    deadline: '',
    file: null,
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null); // Submission object being graded
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: '',
  });
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Student states
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submittingWork, setSubmittingWork] = useState(false);

  useEffect(() => {
    fetchAssignments();
    if (user?.role === 'lecturer') {
      fetchLecturerSubjects();
    }
  }, [user]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/assignments');
      if (response.data.success) {
        setAssignments(response.data.data);
        if (response.data.data.length > 0) {
          // Select first by default if nothing selected yet
          const firstId = response.data.data[0].id;
          handleSelectAssignment(firstId);
        }
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      toast.error('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturerSubjects = async () => {
    try {
      const response = await api.get('/lecturer/subjects');
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching lecturer subjects:', err);
    }
  };

  const handleSelectAssignment = async (id) => {
    setSelectedAssignment(id);
    setDetailLoading(true);
    try {
      const response = await api.get(`/assignments/${id}`);
      if (response.data.success) {
        setAssignmentDetail(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching assignment details:', err);
      toast.error('Failed to load assignment details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Create Assignment (Lecturer)
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!createForm.subject_id || !createForm.title || !createForm.deadline) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmittingCreate(true);
    const formData = new FormData();
    formData.append('subject_id', createForm.subject_id);
    formData.append('title', createForm.title);
    formData.append('description', createForm.description);
    formData.append('deadline', createForm.deadline);
    if (createForm.file) {
      formData.append('file', createForm.file);
    }

    try {
      const response = await api.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        toast.success('Assignment created successfully!');
        setShowCreateModal(false);
        setCreateForm({
          subject_id: '',
          title: '',
          description: '',
          deadline: '',
          file: null,
        });
        fetchAssignments();
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      toast.error(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Grade Submission (Lecturer)
  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!gradeForm.grade) {
      toast.error('Grade is required.');
      return;
    }

    setSubmittingGrade(true);
    try {
      const response = await api.post(`/submissions/${gradingSubmission.id}/grade`, {
        grade: gradeForm.grade,
        feedback: gradeForm.feedback,
      });
      if (response.data.success) {
        toast.success('Submission graded successfully!');
        setGradingSubmission(null);
        setGradeForm({ grade: '', feedback: '' });
        // Refresh details
        if (selectedAssignment) {
          handleSelectAssignment(selectedAssignment);
        }
      }
    } catch (err) {
      console.error('Error grading submission:', err);
      toast.error('Failed to grade submission.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  // Submit Work (Student)
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!submissionFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    setSubmittingWork(true);
    const formData = new FormData();
    formData.append('file', submissionFile);

    try {
      const response = await api.post(`/assignments/${selectedAssignment}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        toast.success('Assignment submitted successfully!');
        setSubmissionFile(null);
        handleSelectAssignment(selectedAssignment);
        fetchAssignments();
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      toast.error(err.response?.data?.message || 'Failed to submit assignment.');
    } finally {
      setSubmittingWork(false);
    }
  };

  // Format Helper
  const formatDeadline = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysRemaining = (deadlineStr) => {
    const diff = new Date(deadlineStr) - new Date();
    if (diff < 0) return 'Passed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Less than an hour left';
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-indigo-600" />
            Assignment Submission
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {user?.role === 'lecturer'
              ? 'Request new assignments, track student uploads, and grade submissions.'
              : 'View assigned coursework, submit files, and review lecturer feedback.'}
          </p>
        </div>

        {user?.role === 'lecturer' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Assignment
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-12 text-center max-w-xl mx-auto mt-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Assignments Found</h3>
          <p className="text-sm text-slate-500 mt-2">
            {user?.role === 'lecturer'
              ? 'You have not created any assignments yet. Click the "New Assignment" button to request one.'
              : 'There are no assignments requested for your subjects this semester.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ASSIGNMENT LIST COLUMN */}
          <div className="lg:col-span-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {assignments.map((assignment) => {
              const isSelected = selectedAssignment === assignment.id;
              const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
              const isGraded = hasSubmission && assignment.submissions[0].grade !== null;

              return (
                <div
                  key={assignment.id}
                  onClick={() => handleSelectAssignment(assignment.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'bg-white border-slate-100 hover:border-slate-300 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {assignment.subject?.code}
                    </span>
                    <span className={`text-[11px] font-semibold flex items-center gap-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      <ClockIcon className="w-3.5 h-3.5" />
                      {getDaysRemaining(assignment.deadline)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base mt-2.5 truncate">{assignment.title}</h3>
                  <p className={`text-xs mt-1 truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {assignment.subject?.name}
                  </p>

                  <div className="mt-4 pt-3 border-t border-dashed flex items-center justify-between gap-2 border-white/25">
                    {user?.role === 'lecturer' ? (
                      <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                        Lecturer Request
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {isGraded ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white text-indigo-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                            Graded: {assignment.submissions[0].grade}
                          </span>
                        ) : hasSubmission ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                            Submitted
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                            Pending
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ASSIGNMENT DETAIL COLUMN */}
          <div className="lg:col-span-8">
            {detailLoading ? (
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-12 h-[50vh] flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400 font-medium font-sans">Loading assignment details...</p>
              </div>
            ) : assignmentDetail ? (
              <div className="space-y-6">
                {/* ASSIGNMENT DETAILS CARD */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider">
                        {assignmentDetail.assignment?.subject?.code}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-2.5">
                        {assignmentDetail.assignment?.title}
                      </h2>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        Subject: {assignmentDetail.assignment?.subject?.name}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                      <CalendarDaysIcon className="w-8 h-8 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deadline</p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                          {formatDeadline(assignmentDetail.assignment?.deadline)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Instructions</h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {assignmentDetail.assignment?.description || 'No instructions provided.'}
                    </p>

                    {assignmentDetail.assignment?.file_path && (
                      <div className="mt-5 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <PaperClipIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">
                              {assignmentDetail.assignment?.original_name || 'attachment'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Instruction Material</p>
                          </div>
                        </div>
                        <a
                          href={assignmentDetail.assignment?.file_path}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4 text-slate-500" />
                          Download
                        </a>
                      </div>
                    )}
                  </div>

                  {/* LECTURER METADATA */}
                  <div className="pt-5 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                      {assignmentDetail.assignment?.lecturer?.user?.name?.charAt(0).toUpperCase() || 'L'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {assignmentDetail.assignment?.lecturer?.user?.name || 'Lecturer'}
                      </p>
                      <p className="text-[10px] text-slate-400">Requesting Lecturer</p>
                    </div>
                  </div>
                </div>

                {/* ROLE SPECIFIC SUBMISSION AREA */}
                {user?.role === 'lecturer' ? (
                  /* LECTURER: VIEW SUBMISSIONS MATRIX */
                  <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 text-left">
                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-slate-800">Student Submissions</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Track work uploads and assign grades</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <th className="pb-3.5 font-bold">Student</th>
                            <th className="pb-3.5 font-bold">Reg Number</th>
                            <th className="pb-3.5 font-bold">Uploaded File</th>
                            <th className="pb-3.5 font-bold">Submission Date</th>
                            <th className="pb-3.5 font-bold text-center">Grade</th>
                            <th className="pb-3.5 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {assignmentDetail.submissions?.map((item, idx) => {
                            const hasSubmitted = item.submission !== null;
                            const isGraded = hasSubmitted && item.submission.grade !== null;

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3.5 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shrink-0">
                                    {item.student?.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-semibold text-slate-800">{item.student?.name}</span>
                                </td>
                                <td className="py-3.5 text-slate-500 font-medium">{item.student?.registration_number}</td>
                                <td className="py-3.5">
                                  {hasSubmitted ? (
                                    <a
                                      href={item.submission.file_path}
                                      download
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                                    >
                                      <PaperClipIcon className="w-4 h-4" />
                                      View Upload
                                    </a>
                                  ) : (
                                    <span className="text-slate-300 font-medium">No file</span>
                                  )}
                                </td>
                                <td className="py-3.5 text-slate-500 text-xs">
                                  {hasSubmitted
                                    ? new Date(item.submission.submitted_at).toLocaleString()
                                    : '—'}
                                </td>
                                <td className="py-3.5 text-center">
                                  {isGraded ? (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                                      {item.submission.grade}
                                    </span>
                                  ) : hasSubmitted ? (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                      Pending
                                    </span>
                                  ) : (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-50 text-slate-400">
                                      No Submission
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 text-right">
                                  {hasSubmitted ? (
                                    <button
                                      onClick={() => {
                                        setGradingSubmission(item.submission);
                                        setGradeForm({
                                          grade: item.submission.grade || '',
                                          feedback: item.submission.feedback || '',
                                        });
                                      }}
                                      className="btn btn-secondary py-1.5 px-3 text-xs font-bold"
                                    >
                                      {isGraded ? 'Update Grade' : 'Grade'}
                                    </button>
                                  ) : (
                                    <button disabled className="btn btn-secondary py-1.5 px-3 text-xs font-bold opacity-30 cursor-not-allowed">
                                      Grade
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* STUDENT: SUBMISSION & GRADE AREA */
                  <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8 text-left">
                    <h3 className="text-lg font-bold text-slate-800 mb-5">Your Submission</h3>

                    {assignmentDetail.submission?.grade !== null && assignmentDetail.submission !== null ? (
                      /* GRADED STATE */
                      <div className="space-y-5">
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <CheckCircleIcon className="w-8 h-8 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-base font-bold text-slate-800">Your assignment has been graded</h4>
                              <p className="text-xs text-slate-400 mt-1">
                                Reviewed on {new Date(assignmentDetail.submission.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="bg-white border border-indigo-100 text-indigo-700 rounded-2xl px-6 py-3.5 text-center shrink-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Grade</p>
                            <p className="text-3xl font-black mt-0.5">{assignmentDetail.submission.grade}</p>
                          </div>
                        </div>

                        {assignmentDetail.submission.feedback && (
                          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <ChatBubbleLeftRightIcon className="w-4 h-4 text-slate-400" />
                              Feedback from Lecturer
                            </p>
                            <p className="text-slate-700 text-sm mt-3 leading-relaxed whitespace-pre-wrap">
                              {assignmentDetail.submission.feedback}
                            </p>
                          </div>
                        )}

                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <PaperClipIcon className="w-4 h-4 text-slate-400" />
                            <p className="text-xs text-slate-600 truncate font-semibold">
                              {assignmentDetail.submission.original_name}
                            </p>
                          </div>
                          <a
                            href={assignmentDetail.submission.file_path}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-600 hover:underline font-bold"
                          >
                            Download Submission
                          </a>
                        </div>
                      </div>
                    ) : assignmentDetail.submission ? (
                      /* SUBMITTED BUT PENDING GRADE STATE */
                      <div className="space-y-5">
                        <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-5 flex items-center gap-4">
                          <CheckCircleIcon className="w-8 h-8 text-indigo-500 shrink-0" />
                          <div>
                            <h4 className="text-base font-bold text-slate-800">Assignment Submitted</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              Successfully uploaded on {new Date(assignmentDetail.submission.submitted_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <PaperClipIcon className="w-4 h-4 text-slate-400" />
                            <p className="text-xs text-slate-600 truncate font-semibold">
                              {assignmentDetail.submission.original_name}
                            </p>
                          </div>
                          <a
                            href={assignmentDetail.submission.file_path}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-600 hover:underline font-bold"
                          >
                            Download Upload
                          </a>
                        </div>

                        {/* RESUBMIT WORK */}
                        <div className="border-t border-slate-100 pt-5 mt-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Resubmit Work</h4>
                          <form onSubmit={handleStudentSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors rounded-2xl p-6 text-center cursor-pointer relative">
                              <input
                                type="file"
                                onChange={(e) => setSubmissionFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <ArrowUpTrayIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-xs font-bold text-slate-600">
                                {submissionFile ? submissionFile.name : 'Choose a new file to replace submission'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">PDF, Word, ZIP files up to 20MB</p>
                            </div>

                            {submissionFile && (
                              <button
                                type="submit"
                                disabled={submittingWork}
                                className="btn btn-primary w-full py-3"
                              >
                                {submittingWork ? 'Replacing submission...' : 'Upload & Resubmit'}
                              </button>
                            )}
                          </form>
                        </div>
                      </div>
                    ) : (
                      /* NOT SUBMITTED STATE */
                      <div>
                        {new Date() > new Date(assignmentDetail.assignment?.deadline) ? (
                          <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-800">
                            <ExclamationCircleIcon className="w-8 h-8 text-red-500 shrink-0" />
                            <div>
                              <h4 className="text-base font-bold">Submission Closed</h4>
                              <p className="text-xs mt-1 text-red-600">The deadline for this assignment has passed. You cannot upload submissions anymore.</p>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleStudentSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors rounded-2xl p-8 text-center cursor-pointer relative">
                              <input
                                type="file"
                                onChange={(e) => setSubmissionFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <ArrowUpTrayIcon className="w-8 h-8 text-slate-400 mx-auto mb-3.5" />
                              <p className="text-sm font-bold text-slate-600">
                                {submissionFile ? submissionFile.name : 'Select or drag your submission file'}
                              </p>
                              <p className="text-xs text-slate-400 mt-1.5">PDF, Word, or ZIP documents up to 20MB</p>
                            </div>

                            <button
                              type="submit"
                              disabled={submittingWork || !submissionFile}
                              className="btn btn-primary w-full py-3.5 text-base font-bold shadow-lg"
                            >
                              {submittingWork ? 'Uploading submission...' : 'Submit Assignment'}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-12 text-center h-[50vh] flex flex-col items-center justify-center">
                <BookOpenIcon className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400 font-medium">Select an assignment to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LECTURER: CREATE ASSIGNMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg p-6 sm:p-8 relative overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Request New Assignment</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="input-label">Select Subject *</label>
                <select
                  required
                  value={createForm.subject_id}
                  onChange={(e) => setCreateForm({ ...createForm, subject_id: e.target.value })}
                  className="input-field py-3 text-slate-700"
                >
                  <option value="">Choose a subject...</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      [{sub.code}] {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Assignment Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Individual Project Phase 1"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Description / Instructions</label>
                <textarea
                  rows="4"
                  placeholder="Provide details about formatting, guidelines, or topics..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Deadline *</label>
                <input
                  required
                  type="datetime-local"
                  value={createForm.deadline}
                  onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                  className="input-field text-slate-700"
                />
              </div>

              <div>
                <label className="input-label">Attachment File</label>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between text-xs">
                  <input
                    type="file"
                    onChange={(e) => setCreateForm({ ...createForm, file: e.target.files[0] })}
                    className="text-slate-500 font-medium truncate"
                  />
                  {createForm.file && (
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, file: null })}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="btn btn-primary flex-1 py-3"
                >
                  {submittingCreate ? 'Creating...' : 'Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LECTURER: GRADE SUBMISSION MODAL */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg p-6 sm:p-8 relative overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Grade Submission</h3>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                <PaperClipIcon className="w-6 h-6 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{gradingSubmission.original_name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Uploaded on {new Date(gradingSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="input-label">Grade / Score *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. A+, B, 85/100, Pass"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Feedback / Notes</label>
                <textarea
                  rows="4"
                  placeholder="Provide comments or points for improvement..."
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="btn btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGrade}
                  className="btn btn-primary flex-1 py-3"
                >
                  {submittingGrade ? 'Saving...' : 'Submit Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
