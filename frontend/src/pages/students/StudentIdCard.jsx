import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import {
  PrinterIcon,
  ShieldCheckIcon,
  ClockIcon,
  AcademicCapIcon,
  ArrowDownTrayIcon,
  UserIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';

export const StudentIdCard = () => {
  const { user } = useAuthStore();
  const student = user?.student;
  const isApproved = student?.status === 'active';

  // Data mapping with fallbacks
  const fullName = user?.name || 'Student Name';
  const regNumber = student?.registration_number || 'REG-PENDING';
  const _originalAvatarUrl = user?.avatar || null;
  // Convert absolute Backend URL to a relative path so it routes through Vite's /storage proxy avoiding CORS blocks
  const avatarUrl = _originalAvatarUrl ? _originalAvatarUrl.replace(/^(https?:\/\/[^\/]+)/i, '') : null;
  
  const batchName = student?.batch?.name || 'Batch N/A';
  const semesterName = student?.current_semester?.name || student?.currentSemester?.name || 'Semester N/A';

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const cardElement = document.getElementById('id-card-element');
    if (!cardElement) return;
    
    try {
      setDownloading(true);
      const loadingToast = toast.loading('Generating CR80 Premium PDF...');
      
      const canvas = await html2canvas(cardElement, {
        scale: 4, // High-res export
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Standard CR80 ID Card dimensions (54mm x 86mm portrait)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [54, 86]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 54, 86);
      pdf.save(`SCMS-ID-${regNumber}.pdf`);
      
      toast.dismiss(loadingToast);
      toast.success('Digital ID Card downloaded successfully!');
    } catch (error) {
      console.error("PDF gen error:", error);
      toast.dismiss();
      toast.error('Failed to generate PDF document');
    } finally {
      setDownloading(false);
    }
  };



  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-12 rounded-[3.5rem] shadow-xl text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <ClockIcon className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h1 className="text-3xl font-black tracking-tighter italic">Awaiting Approval</h1>
            <p className="mt-4 text-amber-100 font-medium">Ungaloda account innum admin approval la iruku. Approve aanathu pinbu official ID card display aagum.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 pt-4">
      {/* ── CONTROLS ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 no-print px-4">
        <div className="text-left">
           <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">
                 <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase font-serif">Campus Identity</h1>
           </div>
           <p className="text-slate-400 font-medium ml-1">Higher National Diploma in Information Technology</p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={handleDownloadPDF}
             disabled={downloading}
             className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
           >
              <ArrowDownTrayIcon className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
              {downloading ? 'PROCESSING...' : 'DOWNLOAD PDF'}
           </button>
        </div>
      </div>

      {/* ── PORTRAIT ID CARD (Single Sided) ─────────────────────────── */}
      <div className="flex justify-center px-4">
        <div 
          id="id-card-element"
          className="w-[320px] h-[505px] bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(30,27,75,0.15)] border border-slate-200 relative overflow-hidden flex flex-col items-center"
        >
          {/* Header BG */}
          <div className="absolute top-0 left-0 w-full h-[120px] bg-indigo-700" />
          <div className="absolute top-[100px] left-0 w-full h-[40px] bg-indigo-700 skew-y-6 origin-top-right transform -translate-y-1" />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
             <AcademicCapIcon className="w-64 h-64 rotate-12" />
          </div>

          {/* 1. Header Details */}
          <div className="w-full relative z-10 pt-5 text-center flex flex-col items-center">
             <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/20 mb-2 shadow-inner shadow-white/30">
                <AcademicCapIcon className="w-6 h-6 text-white" />
             </div>
             <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em] leading-none mb-1">SLIATE-ATI Jaffna</h2>
             <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-widest">HND in Information Technology</p>
          </div>

          {/* 2. Photo Section */}
          <div className="relative z-20 mt-4">
             <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden shadow-indigo-900/20">
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                       <UserIcon className="w-12 h-12 text-slate-300" />
                    </div>
                )}
             </div>
             <div className="absolute -bottom-2.5 -right-2.5 bg-emerald-500 text-white p-2 rounded-xl border-4 border-white shadow-lg">
                <ShieldCheckIcon className="w-4 h-4" />
             </div>
          </div>

          {/* 3. Main Details */}
          <div className="w-full px-6 flex-1 flex flex-col items-center mt-5 relative z-10 text-center">
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
               {fullName}
             </h3>
             <div className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg mb-4">
                <p className="text-[11px] font-black text-indigo-600 font-mono tracking-wider">{regNumber}</p>
             </div>

             <div className="w-full flex flex-col items-center mb-3">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Academic Batch</p>
                <p className="text-[11px] font-bold text-slate-700 truncate">{batchName}</p>
             </div>
          </div>

          {/* 4. Footer & QR Section */}
          <div className="w-full flex items-center justify-center px-6 pb-5 relative z-10 pt-1">
             {/* QR Code */}
             <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-slate-100 relative group">
                   <QRCodeCanvas value={regNumber || 'N/A'} size={110} level="H" fgColor="#1e1b4b" />
                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg">
                   <QrCodeIcon className="w-4 h-4" />
                </div>
             </div>
          </div>
          
          <div className="w-full h-1.5 bg-indigo-600 absolute bottom-0 left-0" />
        </div>
      </div>

      {/* ── PRINT ONLY (PVC SIZE) ─────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #id-card-element, #id-card-element * { visibility: visible; }
          #id-card-element { 
            position: absolute; 
            left: 50%; 
            top: 50%; 
            transform: translate(-50%, -50%);
            border: 1px solid #ccc;
            box-shadow: none;
          }
          @page { size: portrait; margin: 0; }
        }
      `}</style>
    </div>
  );
};
