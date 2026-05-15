import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../stores/authStore';
import api from '../../api/client';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import {
  IdentificationIcon,
  QrCodeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export const StudentIdCard = () => {
  const { user } = useAuthStore();
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef(null);
  const student = user?.student;
  const isApproved = student?.status === 'active';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const cardEl = cardRef.current;
    if (!cardEl || !printWindow) return;

    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n'); }
        catch { return ''; }
      })
      .join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>Student ID Card - ${user?.name}</title>
          <style>
            ${styles}
            @media print {
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${cardEl.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  // Pending approval state
  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-10 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <ClockIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">Pending Approval</h1>
            <p className="text-amber-100 mt-3 font-medium max-w-md mx-auto">
              Your registration is being reviewed by the admin. Your Student ID Card will be available here once approved.
            </p>
          </div>
          <div className="absolute top-0 right-0 opacity-10">
            <IdentificationIcon className="w-64 h-64 -mt-10 -mr-10" />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Account Under Review</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Please wait for the administrator to approve your registration. You'll receive a notification once your account is activated.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl text-sm font-bold border border-amber-100">
            <ClockIcon className="w-4 h-4" />
            Status: Pending
          </div>
        </div>
      </div>
    );
  }



  const displayData = { ...student, user };
  const qrValue = displayData?.registration_number || '';
  const batchYear = displayData?.batch?.year || new Date().getFullYear();
  const batchName = displayData?.batch?.name || '';
  const semesterName = displayData?.current_semester?.name || displayData?.currentSemester?.name || '';
  const gender = displayData?.gender || '';
  const avatarUrl = user?.avatar || null;
  const email = user?.email || '';
  const fullName = user?.name || '';
  const regNumber = displayData?.registration_number || '';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-800 to-indigo-900 p-10 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                <IdentificationIcon className="w-7 h-7 text-indigo-300" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">Student ID Card</h1>
            </div>
            <p className="text-blue-200 mt-2 font-medium">Your official digital identification card</p>
          </div>
          <div className="flex items-center gap-3 bg-emerald-500/20 px-6 py-3 rounded-2xl border border-emerald-400/30 backdrop-blur-sm">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-200">Verified & Active</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 opacity-5">
          <IdentificationIcon className="w-60 h-60 -mt-8 -mr-8" />
        </div>
      </div>

      {/* ID Card */}
      <div className="flex flex-col items-center gap-8">
        {/* Card with flip effect */}
        <div 
          className="relative w-full max-w-[420px] cursor-pointer group"
          style={{ perspective: '1200px' }}
          onClick={() => setFlipped(!flipped)}
        >
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            {flipped ? '← Click to see front' : 'Click to flip →'}
          </p>

          <div 
            className="relative w-full transition-transform duration-700"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* FRONT SIDE */}
            <div 
              ref={!flipped ? cardRef : null}
              className="w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-200/50"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Card Top Strip */}
              <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 px-8 pt-7 pb-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-white text-[10px] font-black">ATI</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em]">Advanced Technological Institute</p>
                      <p className="text-[9px] font-bold text-indigo-300/70 uppercase tracking-[0.2em]">Higher National Diploma in IT</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="bg-white px-8 py-6">
                <div className="flex gap-6">
                  {/* Photo */}
                  <div className="shrink-0">
                    <div className="w-24 h-28 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center">
                          <span className="text-3xl font-black text-indigo-400">{fullName.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</p>
                      <p className="text-base font-black text-slate-900 truncate leading-tight">{fullName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Registration No.</p>
                      <p className="text-sm font-black text-indigo-600 font-mono tracking-wider">{regNumber}</p>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Gender</p>
                        <p className="text-xs font-bold text-slate-700 capitalize">{gender}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Year</p>
                        <p className="text-xs font-bold text-slate-700">{batchYear}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 truncate">{email}</p>
                </div>
              </div>

              {/* Card Bottom Strip */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Batch</p>
                  <p className="text-xs font-bold text-slate-600">{batchName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Semester</p>
                  <p className="text-xs font-bold text-slate-600">{semesterName}</p>
                </div>
              </div>
            </div>

            {/* BACK SIDE */}
            <div 
              ref={flipped ? cardRef : null}
              className="absolute top-0 left-0 w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-200/50"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 p-8 relative overflow-hidden min-h-[360px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />

                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-6">Scan for Attendance</p>
                  
                  <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-black/30">
                    <QRCode value={qrValue} size={180} level="M" />
                  </div>

                  <p className="mt-6 text-sm font-black text-white tracking-widest font-mono">{regNumber}</p>
                  <p className="text-[10px] font-medium text-indigo-300 mt-2 text-center max-w-[250px]">
                    Present this QR code to the scanner for attendance verification
                  </p>

                  <div className="mt-6 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">SCMS Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95"
          >
            <PrinterIcon className="w-4 h-4" />
            Print Card
          </button>
        </div>

        {/* QR Prominence Section */}
        <div className="w-full max-w-lg bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <QrCodeIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Your Attendance QR</h3>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 inline-block">
            <QRCode value={qrValue} size={200} level="H" />
          </div>
          
          <p className="text-xs text-slate-500 mt-4 font-medium max-w-sm mx-auto">
            This QR code contains your registration number (<span className="font-bold text-indigo-600 font-mono">{regNumber}</span>). 
            Show it to the attendance scanner to mark your presence.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Method</p>
              <p className="text-sm font-bold text-slate-700 mt-1">QR Scan</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</p>
              <p className="text-sm font-bold text-slate-700 mt-1">Digital ID</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Status</p>
              <p className="text-sm font-bold text-emerald-700 mt-1">Active</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="w-full max-w-lg bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4" />
            How QR Attendance Works
          </h4>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="w-6 h-6 bg-blue-200 text-blue-800 rounded-lg flex items-center justify-center text-xs font-black shrink-0">1</span>
              <p className="text-xs text-blue-700 font-medium">Admin starts an attendance session for your class period</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-6 h-6 bg-blue-200 text-blue-800 rounded-lg flex items-center justify-center text-xs font-black shrink-0">2</span>
              <p className="text-xs text-blue-700 font-medium">Show your QR code (from this ID card or print it) to the scanner</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-6 h-6 bg-blue-200 text-blue-800 rounded-lg flex items-center justify-center text-xs font-black shrink-0">3</span>
              <p className="text-xs text-blue-700 font-medium">Your attendance is automatically marked as present</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
