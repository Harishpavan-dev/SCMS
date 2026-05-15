import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nic_number: '',
    date_of_birth: '',
    gender: 'male',
    address: '',
    batch_id: '',
    current_semester_id: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/students/public-register', formData);
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
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 mb-6">
            <CheckCircleIcon className="h-16 w-16 text-emerald-600" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Registration Submitted!</h2>
          <p className="text-slate-600 mb-8 px-4">
            Thank you for registering. Your profile is currently <span className="font-bold text-amber-600">Pending Review</span>. 
            Once the administration approves your account, you will receive your login credentials.
          </p>
          <Link to="/" className="btn btn-secondary shadow-sm">
            Return to Landing Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-2xl leading-none">SC</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Registration</h2>
          <p className="mt-2 text-slate-600">Advanced Technological Institute, Jaffna - HNDIT</p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleChange}
                  className="input-field mt-1" placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="input-field mt-1" placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                <input 
                  type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                  className="input-field mt-1" placeholder="07XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">NIC Number</label>
                <input 
                  type="text" name="nic_number" required value={formData.nic_number} onChange={handleChange}
                  className="input-field mt-1" placeholder="1999XXXXXXXV"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                <input 
                  type="date" name="date_of_birth" required value={formData.date_of_birth} onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Batch (Year)</label>
                <select 
                  name="batch_id" required value={formData.batch_id} onChange={handleChange}
                  className="input-field mt-1 bg-white"
                >
                  <option value="">-- Select Batch --</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Current Semester</label>
                <select 
                  name="current_semester_id" required value={formData.current_semester_id} onChange={handleChange}
                  className="input-field mt-1 bg-white"
                >
                  <option value="">-- Select Semester --</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Gender</label>
                <div className="mt-2 flex gap-6">
                  {['male', 'female', 'other'].map(g => (
                    <label key={g} className="flex items-center">
                      <input 
                        type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="ml-2 text-sm text-slate-700 capitalize">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Permanent Address</label>
                <textarea 
                  name="address" rows={3} value={formData.address} onChange={handleChange}
                  className="input-field mt-1 resize-none" placeholder="Enter your full address"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center gap-4">
              <button 
                type="submit" disabled={loading}
                className="btn btn-primary w-full md:w-auto px-10 py-3 shadow-md"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
              <p className="text-sm text-slate-500 text-center w-full md:text-left">
                Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
