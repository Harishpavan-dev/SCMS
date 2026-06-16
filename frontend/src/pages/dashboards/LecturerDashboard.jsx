import { useState, useEffect } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { 
  ChartBarIcon, 
  AcademicCapIcon, 
  ArrowDownTrayIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const LecturerDashboard = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [batches, setBatches] = useState([]);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [batchId, setBatchId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Expanded student row states
  const [expandedStudents, setExpandedStudents] = useState({});

  useEffect(() => {
    fetchDashboard();
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchReport();
    }
  }, [selectedSubjectId, batchId, fromDate, toDate]);

  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const response = await api.get('/dashboard');
      const data = response.data.data;
      setDashboardData(data);
      
      // Auto-select first subject if available
      if (data.assigned_subjects && data.assigned_subjects.length > 0) {
        setSelectedSubjectId(data.assigned_subjects[0].id);
      }
    } catch {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await api.get('/public/batches');
      setBatches(response.data.data || []);
    } catch {
      console.error('Failed to fetch batches');
    }
  };

  const fetchReport = async () => {
    setLoadingReport(true);
    try {
      const params = {
        subject_id: selectedSubjectId,
        batch_id: batchId || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        search: search || undefined
      };
      
      const response = await api.get('/lecturer/attendance-report', { params });
      setReportData(response.data.data);
    } catch {
      toast.error('Failed to load attendance report');
    } finally {
      setLoadingReport(false);
    }
  };

  // Trigger search fetch
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (selectedSubjectId) {
      fetchReport();
    }
  };

  const toggleStudentExpand = (studentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.students || reportData.students.length === 0) {
      toast.error('No attendance records to export');
      return;
    }

    const subjectCode = reportData.subject?.code || 'subject';
    const filename = `${subjectCode}_attendance_report.csv`;

    let headers = ['Student Name', 'Registration Number', 'Present Sessions', 'Absent Sessions', 'Total Sessions', 'Attendance %'];
    
    const sessionsList = reportData.sessions || [];
    sessionsList.forEach(s => {
      headers.push(s.date || `Session ID ${s.id}`);
    });

    let csvRows = [headers.join(',')];

    reportData.students.forEach(student => {
      let row = [
        `"${student.name}"`,
        `"${student.registration_number}"`,
        student.present,
        student.absent,
        student.total,
        `"${student.percentage}%"`
      ];

      sessionsList.forEach(session => {
        const record = student.date_records?.find(r => r.session_id === session.id);
        row.push(record ? `"${record.status}"` : '"unmarked"');
      });

      csvRows.push(row.join(','));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n"); // Add UTF-8 BOM for Excel support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    toast.success('Attendance report exported successfully!');
  };

  // Safe checks for rendering
  const assignedSubjects = dashboardData?.assigned_subjects || [];
  const selectedSubjectData = assignedSubjects.find(s => s.id === selectedSubjectId);
  const studentsList = reportData?.students || [];
  
  // Calculate average attendance across subjects
  const overallAvg = assignedSubjects.length > 0
    ? (assignedSubjects.reduce((acc, curr) => acc + Number(curr.avg_percentage || 0), 0) / assignedSubjects.length).toFixed(1)
    : 0;

  // At-risk students summary list (from loaded report)
  const atRiskStudents = studentsList.filter(s => s.at_risk);

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-700 pb-20">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <ChartBarIcon className="w-12 h-12 text-indigo-400" />
              Lecturer Insights Console
            </h1>
            <p className="text-slate-300 mt-2 font-medium tracking-wide">
              Hello, {user?.name}. Managing attendance analysis for your academic modules.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Subjects</p>
                <p className="text-2xl font-black text-white">{assignedSubjects.length}</p>
             </div>
             <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Average Performance</p>
                <p className={clsx("text-2xl font-black", Number(overallAvg) >= 75 ? "text-emerald-400" : "text-amber-400")}>
                  {overallAvg}%
                </p>
             </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* 2. Subjects Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 px-2">
          <BookOpenIcon className="w-5 h-5 text-indigo-500" />
          Your Assigned Modules
        </h3>
        
        {loadingDashboard ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-100/50 border border-slate-200/60 p-6 rounded-3xl h-36 animate-pulse"></div>
            ))}
          </div>
        ) : assignedSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedSubjects.map(subject => {
              const isSelected = subject.id === selectedSubjectId;
              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={clsx(
                    "text-left p-6 rounded-3xl border transition-all duration-300 relative group flex flex-col justify-between h-40",
                    isSelected 
                      ? "bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border-indigo-400 shadow-lg ring-2 ring-indigo-400 ring-offset-2" 
                      : "bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md"
                  )}
                >
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <span className={clsx(
                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                        isSelected ? "bg-indigo-150 text-indigo-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {subject.semester || 'Active Semester'}
                      </span>
                      <span className={clsx(
                        "text-lg font-black tracking-tight",
                        subject.avg_percentage >= 75 ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {subject.avg_percentage}%
                      </span>
                    </div>
                    
                    <h4 className={clsx(
                      "font-black text-base mt-3 group-hover:text-indigo-600 transition-colors line-clamp-1",
                      isSelected ? "text-indigo-900" : "text-slate-800"
                    )}>
                      {subject.name}
                    </h4>
                    <p className="text-xs font-mono font-bold text-slate-400 mt-1">{subject.code}</p>
                  </div>
                  
                  <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100/60 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                      {subject.total_sessions} Sessions Taught
                    </span>
                    <span className="text-indigo-500 group-hover:translate-x-1 transition-transform text-[11px] font-black uppercase tracking-wider">
                      {isSelected ? 'Selected • Active' : 'Select module →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-200">
            <BookOpenIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-wider">No assigned subjects found</p>
            <p className="text-slate-400 text-xs mt-1">Please ask the Administrator/HOD to assign subjects to you.</p>
          </div>
        )}
      </div>

      {/* 3. At Risk Quick Panels */}
      {!loadingDashboard && selectedSubjectId && atRiskStudents.length > 0 && (
        <div className="bg-red-50/70 border border-red-200/60 p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex items-center gap-3 bg-red-500 text-white p-3 rounded-2xl">
            <ExclamationTriangleIcon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-red-950 tracking-tight text-lg">Alert: Low Attendance Registered</h4>
            <p className="text-red-700 text-sm font-medium mt-1">
              There are <strong className="font-extrabold">{atRiskStudents.length} student(s)</strong> with attendance below the required 75% threshold in this module.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 max-w-lg">
            {atRiskStudents.slice(0, 5).map(s => (
              <span key={s.id} className="bg-red-100 text-red-800 text-[10px] font-extrabold px-3 py-1.5 rounded-xl border border-red-200">
                {s.name} ({s.percentage}%)
              </span>
            ))}
            {atRiskStudents.length > 5 && (
              <span className="bg-red-200 text-red-900 text-[10px] font-black px-2 py-1 rounded-xl">
                +{atRiskStudents.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. Controls & Filters Dashboard */}
      {selectedSubjectId && (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-200 flex flex-col lg:flex-row gap-6 items-stretch lg:items-center">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[250px] relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by student name or reg number..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                type="button" 
                onClick={() => { setSearch(''); setTimeout(fetchReport, 0); }} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </form>

          {/* Filters Panel */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100/80 px-4 py-3 rounded-2xl">
              <FunnelIcon className="w-4 h-4 text-slate-400" />
              <select 
                className="bg-transparent border-none p-0 text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-0"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
              >
                <option value="">All Batches</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-150 px-4 py-3 rounded-2xl border border-slate-200">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                className="bg-transparent border-none p-0 text-xs font-bold text-slate-600 outline-none focus:ring-0 max-w-[110px]"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input 
                type="date" 
                className="bg-transparent border-none p-0 text-xs font-bold text-slate-600 outline-none focus:ring-0 max-w-[110px]"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              {(fromDate || toDate) && (
                <button 
                  onClick={() => { setFromDate(''); setToDate(''); }}
                  className="text-[10px] font-black uppercase text-red-500 ml-1 hover:text-red-700"
                >
                  Reset
                </button>
              )}
            </div>

            <button 
              onClick={exportToCSV}
              disabled={loadingReport || studentsList.length === 0}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase transition-all"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* 5. Detailed Attendance Table */}
      {selectedSubjectId && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
              Student Attendance Matrix
              {selectedSubjectData && (
                <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase">
                  {selectedSubjectData.name}
                </span>
              )}
            </h3>
            
            {reportData && (
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Showing {studentsList.length} Students
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 w-16">Rank</th>
                  <th className="px-8 py-5">Student Details</th>
                  <th className="px-8 py-5">Present / Sessions</th>
                  <th className="px-8 py-5">Matrix Bar</th>
                  <th className="px-8 py-5">Attendance %</th>
                  <th className="px-8 py-5 text-center">Status Badge</th>
                  <th className="px-8 py-5 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingReport ? (
                  <tr>
                    <td colSpan="7" className="px-10 py-20 text-center text-slate-350 font-bold uppercase tracking-widest animate-pulse">
                      Compiling Matrix Data...
                    </td>
                  </tr>
                ) : studentsList.length > 0 ? (
                  studentsList.map((student, idx) => {
                    const isExpanded = expandedStudents[student.id];
                    return (
                      <>
                        <tr key={student.id} className="hover:bg-indigo-50/20 transition-all group">
                          <td className="px-8 py-6">
                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                              {student.name}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 font-mono italic">
                              {student.registration_number}
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-800">{student.present}</span>
                              <span className="text-slate-300">/</span>
                              <span className="text-sm font-bold text-slate-400">{student.total}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="w-40 bg-slate-100 h-2 rounded-full overflow-hidden relative shadow-inner">
                              <div 
                                className={clsx(
                                  "h-full rounded-full transition-all duration-500", 
                                  student.percentage >= 75 ? "bg-emerald-500" : "bg-red-500"
                                )}
                                style={{ width: `${student.percentage}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={clsx(
                              "text-base font-black tracking-tight",
                              student.percentage >= 75 ? "text-emerald-600" : "text-red-500"
                            )}>
                              {student.percentage}%
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={clsx(
                              "px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block border",
                              student.percentage >= 75 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-red-50 text-red-700 border-red-200"
                            )}>
                              {student.percentage >= 75 ? 'ELIGIBLE' : '⚠️ AT-RISK'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() => toggleStudentExpand(student.id)}
                              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                            >
                              Details
                              {isExpanded ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded details showing date-wise grid logs */}
                        {isExpanded && (
                          <tr key={`${student.id}-expanded`}>
                            <td colSpan="7" className="bg-slate-50/60 px-8 py-6 border-y border-slate-100">
                              <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  Session-by-Session Attendance Logs
                                </h5>
                                
                                {student.date_records && student.date_records.length > 0 ? (
                                  <div className="flex flex-wrap gap-3">
                                    {student.date_records.map((record, rIdx) => {
                                      const isPresent = record.status === 'present';
                                      const isAbsent = record.status === 'absent';
                                      
                                      return (
                                        <div 
                                          key={record.session_id || rIdx} 
                                          className={clsx(
                                            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border shadow-xs bg-white",
                                            isPresent ? "border-emerald-200 text-emerald-800" :
                                            isAbsent ? "border-red-200 text-red-800" :
                                            "border-slate-200 text-slate-500"
                                          )}
                                        >
                                          {isPresent && <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />}
                                          {isAbsent && <XCircleIcon className="w-4 h-4 text-red-500 shrink-0" />}
                                          {!isPresent && !isAbsent && <div className="w-4 h-4 rounded-full bg-slate-300 shrink-0"></div>}
                                          <div>
                                            <p className="font-black leading-none">{record.date || 'Unspecified'}</p>
                                            <p className="text-[9px] font-black uppercase text-slate-400 mt-0.5">{record.status}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-400 font-bold italic">
                                    No sessions have been marked for this subject yet.
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-10 py-16 text-center text-slate-400 font-medium text-sm">
                      No student records found matching active criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
