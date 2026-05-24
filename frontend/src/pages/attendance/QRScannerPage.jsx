import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    // Only initialize scanner if not already marked
    if (marked) return;

    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
    });

    let currentScanned = null;

    const success = async (result) => {
      if (currentScanned === result) return;

      if (result.length > 50 || result.startsWith('http')) {
         if (currentScanned !== 'INVALID') {
            toast.error('Invalid Class QR Code format.');
            currentScanned = 'INVALID';
            setTimeout(() => { currentScanned = null; }, 3000);
         }
         return;
      }

      currentScanned = result;
      scanner.clear();
      setScanResult(result);
      handleMarkAttendance(result);
    };

    const error = (err) => {
      // Ignored for UX purposes as it scans continuously
    };

    scanner.render(success, error);

    return () => {
      if (document.getElementById('reader')) {
        scanner.clear().catch(e => console.error(e));
      }
    };
  }, [marked]);

  const handleMarkAttendance = async (qrCode) => {
    setLoading(true);
    try {
      await api.post('/attendance/mark', { qr_code: qrCode });
      setMarked(true);
      toast.success('Attendance marked successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
      // Let them try again
      setScanResult(null); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Mark Attendance</h1>
        <p className="text-slate-500">Scan the QR code displayed by your lecturer</p>
      </div>

      <div className="card bg-white p-6 shadow-sm border border-slate-200 relative overflow-hidden">
        {marked ? (
          <div className="text-center py-12 px-4 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shrink-0">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Success!</h2>
            <p className="text-slate-600 mb-8">Your attendance has been recorded.</p>
            <button 
              onClick={() => { setMarked(false); setScanResult(null); }}
              className="btn btn-secondary w-full"
            >
              Scan Another Class
            </button>
          </div>
        ) : (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 font-medium text-slate-700">Verifying...</p>
              </div>
            )}
            
            {/* The div where html5-qrcode renders the video element */}
            <div id="reader" className="w-full rounded-lg overflow-hidden bg-slate-900 mx-auto" style={{ minHeight: '300px' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};
