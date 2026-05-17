import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import api from '../api/client';
import toast from 'react-hot-toast';
import { CheckCircleIcon, PhotoIcon, ArrowsPointingOutIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import getCroppedImg from '../utils/cropImage';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    nic_number: '',
    date_of_birth: '',
    gender: 'male',
    address: '',
    batch_id: '',
    current_semester_id: ''
  });

  // Avatar and Cropping States
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [tempImage, setTempImage] = useState(null);

  useEffect(() => {
    // Fetch batches and semesters
    const fetchData = async () => {
      try {
        const [batchesRes, semestersRes] = await Promise.all([
          api.get('/public/batches'),
          api.get('/public/semesters')
        ]);
        setBatches(batchesRes.data.data || []);
        setSemesters(semestersRes.data.data || []);
      } catch (error) {
        toast.error('Failed to load form dependencies');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImage(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
      setAvatar(croppedImage);
      setAvatarPreview(URL.createObjectURL(croppedImage));
      setShowCropper(false);
      toast.success('Photo adjusted successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (avatar) {
        // Create a proper file object from the blob
        const avatarFile = new File([avatar], 'profile_photo.jpg', { type: 'image/jpeg' });
        data.append('avatar', avatarFile);
      }

      await api.post('/students/public-register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      toast.success('Registration submitted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-6 font-sans">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 mb-8 animate-bounce">
            <CheckCircleIcon className="h-16 w-16 text-emerald-500" aria-hidden="true" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Registration <br/> Successful!</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            Your application is being reviewed by the HNDIT department. You will receive an email once your account has been approved and activated.
          </p>
          <Link to="/" className="btn btn-dark w-full">
            Back to Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-6 shadow-xl shadow-indigo-100">
            <span className="text-white font-black text-2xl">S</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Create Student Account</h1>
          <p className="text-slate-500 font-medium">Join the Batch 2024 academic community at ATI Jaffna</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100 relative overflow-hidden">
          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* ── PHOTO UPLOAD SECTION ────────────────────────────────────────────── */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="h-32 w-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50/30">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                       <PhotoIcon className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Photo</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" accept="image/*" onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {avatarPreview && (
                   <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg animate-in zoom-in">
                      <CheckIcon className="w-4 h-4" />
                   </div>
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">Professional Profile Photo</p>
            </div>

            {/* ── FORM FIELDS ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="md:col-span-2">
                <label className="input-label">Student Full Name</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleChange}
                  className="input-field" placeholder="Full name as per NIC"
                />
              </div>

              <div>
                <label className="input-label">Academic Email</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="input-field" placeholder="Email for portal access"
                />
              </div>

              <div>
                <label className="input-label">Portal Password</label>
                <input 
                  type="password" name="password" required value={formData.password} onChange={handleChange}
                  className="input-field" placeholder="Min. 6 characters" minLength={6}
                />
              </div>

              <div>
                <label className="input-label">Mobile Number</label>
                <input 
                  type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                  className="input-field" placeholder="07XXXXXXXX"
                />
              </div>

              <div>
                <label className="input-label">NIC Number</label>
                <input 
                  type="text" name="nic_number" required value={formData.nic_number} onChange={handleChange}
                  className="input-field" placeholder="NIC Verification"
                />
              </div>

              <div>
                <label className="input-label">Date of Birth</label>
                <input 
                  type="date" name="date_of_birth" required value={formData.date_of_birth} onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="input-label">Batch</label>
                    <select 
                      name="batch_id" required value={formData.batch_id} onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="input-label">Semester</label>
                    <select 
                      name="current_semester_id" required value={formData.current_semester_id} onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select</option>
                      {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Gender Orientation</label>
                <div className="flex gap-4">
                  {['male', 'female', 'other'].map(g => (
                    <label key={g} className={`flex-1 relative cursor-pointer`}>
                      <input 
                        type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="py-3 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-xs font-bold text-slate-500 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 transition-all">
                        {g.toUpperCase()}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Permanent Residence</label>
                <textarea 
                  name="address" rows={3} value={formData.address} onChange={handleChange}
                  className="input-field resize-none" placeholder="Enter your full mailing address"
                />
              </div>

            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Verify Information</p>
                 <p className="text-[10px] text-slate-400">By submitting, you agree to academic policies at ATI Jaffna.</p>
              </div>
              <button 
                type="submit" disabled={loading}
                className="btn btn-primary px-12 py-4 text-base tracking-tight w-full md:w-auto"
              >
                {loading ? 'Processing Node...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-10 text-center text-sm font-bold text-slate-400">
           Part of an existing batch? <Link to="/login" className="text-indigo-600 hover:text-indigo-700">Access Portal</Link>
        </p>
      </div>

      {/* ── IMAGE CROPPER MODAL ────────────────────────────────────────────────── */}
      {showCropper && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Adjust Recognition Photo</h3>
                 <p className="text-xs font-medium text-slate-400 mt-0.5">Focus on your face for identification</p>
              </div>
              <button onClick={() => setShowCropper(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                 <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-[400px] w-full bg-slate-900">
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Zoom Control</span>
                    <ArrowsPointingOutIcon className="w-3 h-3 text-slate-300" />
                 </div>
                 <input
                   type="range"
                   value={zoom}
                   min={1}
                   max={3}
                   step={0.1}
                   aria-labelledby="Zoom"
                   onChange={(e) => setZoom(e.target.value)}
                   className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                 />
              </div>

              <div className="flex gap-4 pt-2">
                 <button 
                   onClick={() => setShowCropper(false)}
                   className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                 >
                    Discard
                 </button>
                 <button 
                   onClick={handleApplyCrop}
                   className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all border-none"
                 >
                    Apply Adjustment
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
