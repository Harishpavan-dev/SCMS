import { useState, useCallback } from 'react';
import useAuthStore from '../../stores/authStore';
import api from '../../api/client';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/imageUtils';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  MapPinIcon, 
  PhoneIcon, 
  CameraIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  XMarkIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

export const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  
  // Basic Info States
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.student?.address || '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Avatar/Crop States
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation
      });
      toast.success('Password updated successfully');
      setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImage(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveCrop = async () => {
    try {
      setLoading(true);
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      
      const response = await api.put('/auth/profile', {
        avatar_base64: croppedImage
      });
      
      updateUser(response.data.data);
      toast.success('Profile picture updated');
      setShowCropper(false);
      setImage(null);
    } catch (error) {
      toast.error('Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', formData);
      updateUser(response.data.data);
      toast.success('Profile details updated');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update details';
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0][0];
        toast.error(`${msg}: ${firstError}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 px-4 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
           <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-indigo-100 flex items-center justify-center font-bold text-3xl text-indigo-600 overflow-hidden shadow-inner">
                 {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                 ) : (
                    user?.name?.charAt(0)
                 )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white cursor-pointer shadow-lg hover:bg-indigo-700 transition-all border-2 border-white">
                 <CameraIcon className="w-4 h-4" />
                 <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
           </div>
           <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                {user?.role} <span className="opacity-30 mx-1">•</span> {user?.student?.registration_number}
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Sidebar info */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Academic Info</h3>
               <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                     <CheckBadgeIcon className="w-5 h-5 text-indigo-500" />
                     <span className="text-slate-600 font-medium">{user?.student?.batch?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                     <ArrowPathIcon className="w-5 h-5 text-indigo-500" />
                     <span className="text-slate-600 font-medium">{user?.student?.current_semester?.name}</span>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white">
               <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Security Notice</h3>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">Keep your personal details updated to ensure proper communication from the SCMS terminal. Profile pictures must be clear for identity verification.</p>
            </div>
         </div>

         {/* Form */}
         <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
               <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-indigo-600" />
                  Personal Details
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                     <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transittion-all"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                     <div className="relative">
                        <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                           type="text" 
                           value={formData.phone}
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                           className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transittion-all"
                        />
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                     <div className="relative">
                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                           type="email" 
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transittion-all"
                        />
                     </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Home Address</label>
                     <div className="relative">
                        <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                           type="text" 
                           value={formData.address}
                           onChange={(e) => setFormData({...formData, address: e.target.value})}
                           className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transittion-all"
                        />
                     </div>
                  </div>
               </div>

               <div className="pt-6">
                  <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full md:w-auto px-10 py-3.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all font-bold"
                  >
                     {loading ? 'Processing...' : 'Save Configuration'}
                  </button>
               </div>
            </form>

            {/* Password Change Form */}
            <form onSubmit={handlePasswordSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
               <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
                  Security Calibration
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                     <div className="relative group">
                        <input 
                           type={showCurrent ? "text" : "password"} 
                           required
                           value={passwordData.current_password}
                           onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                           className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transittion-all font-bold"
                        />
                        <button
                           type="button"
                           onClick={() => setShowCurrent(!showCurrent)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                           {showCurrent ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                     <div className="relative group">
                        <input 
                           type={showNew ? "text" : "password"} 
                           required
                           value={passwordData.new_password}
                           onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                           className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transittion-all font-bold"
                        />
                        <button
                           type="button"
                           onClick={() => setShowNew(!showNew)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                           {showNew ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                     <div className="relative group">
                        <input 
                           type={showConfirm ? "text" : "password"} 
                           required
                           value={passwordData.new_password_confirmation}
                           onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                           className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transittion-all font-bold"
                        />
                        <button
                           type="button"
                           onClick={() => setShowConfirm(!showConfirm)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                           {showConfirm ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                     </div>
                  </div>
               </div>

               <div className="pt-6">
                  <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full md:w-auto px-10 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-100 hover:bg-indigo-600 active:scale-95 disabled:opacity-50 transition-all font-bold"
                  >
                     {loading ? 'Processing...' : 'Update Password'}
                  </button>
               </div>
            </form>
         </div>
      </div>

      {/* CROP MODAL */}
      {showCropper && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col items-center justify-center p-4">
           <div className="relative w-full max-w-lg aspect-square bg-slate-800 rounded-3xl overflow-hidden border-4 border-slate-700">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
           </div>
           
           <div className="w-full max-w-lg mt-8 flex flex-col gap-6">
              <input 
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(e.target.value)}
                className="w-full accent-indigo-500"
              />
              
              <div className="flex gap-4">
                 <button 
                    onClick={handleSaveCrop}
                    disabled={loading}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest"
                 >
                    Apply Crop
                 </button>
                 <button 
                    onClick={() => setShowCropper(false)}
                    className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold text-sm uppercase tracking-widest border border-white/10"
                 >
                    Cancel
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
