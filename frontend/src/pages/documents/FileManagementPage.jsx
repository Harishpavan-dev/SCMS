import { useState, useEffect } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { DocumentTextIcon, ArrowDownTrayIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const FileManagementPage = () => {
  const { user } = useAuthStore();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  
  const [formData, setFormData] = useState({
    file: null,
    title: '',
    type: 'note',
    subject_id: ''
  });

  useEffect(() => {
    fetchFiles();
    if (user?.role === 'lecturer' || user?.role === 'admin') {
      fetchSubjects();
    }
  }, [user]);

  const fetchFiles = async () => {
    try {
      const response = await api.get('/files');
      setFiles(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/public/subjects'); // Assuming accessible, or /subjects
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) return toast.error('Please select a file');
    
    setUploading(true);
    const data = new FormData();
    data.append('file', formData.file);
    data.append('title', formData.title);
    data.append('type', formData.type);
    if (formData.subject_id) data.append('subject_id', formData.subject_id);

    try {
      await api.post('/files', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('File uploaded successfully');
      setFormData({ file: null, title: '', type: 'note', subject_id: '' });
      document.getElementById('file-upload').value = '';
      fetchFiles();
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await api.delete(`/files/${id}`);
      toast.success('File deleted');
      fetchFiles();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const getFileIconColor = (type) => {
    switch(type) {
      case 'note': return 'text-blue-500 bg-blue-50';
      case 'assignment': return 'text-amber-500 bg-amber-50';
      case 'material': return 'text-emerald-500 bg-emerald-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Resource Center</h1>
        <p className="text-slate-500">Access and share academic materials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form (Lecturers & Admins) */}
        {(user?.role === 'lecturer' || user?.role === 'admin') && (
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <CloudArrowUpIcon className="w-5 h-5 mr-2 text-blue-600" />
                Upload Resource
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Document Title</label>
                  <input 
                    type="text" required value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="input-field mt-1" placeholder="e.g. Database Normalization Notes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Type</label>
                  <select 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="input-field mt-1"
                  >
                    <option value="note">Lecture Note</option>
                    <option value="material">Study Material</option>
                    <option value="assignment">Assignment Brief</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Select File</label>
                  <input 
                    id="file-upload" type="file" required onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <button type="submit" disabled={uploading} className="btn btn-primary w-full shadow-md mt-4">
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* File List */}
        <div className={`lg:col-span-${(user?.role === 'lecturer' || user?.role === 'admin') ? '2' : '3'}`}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Available Files</h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading files...</div>
            ) : files.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No resources have been uploaded yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {files.map(file => (
                  <div key={file.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getFileIconColor(file.type)} shrink-0`}>
                        <DocumentTextIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{file.title}</p>
                        <div className="flex text-xs text-slate-500 space-x-2 mt-1">
                          <span className="uppercase font-semibold text-slate-600">{file.type}</span>
                          <span>•</span>
                          <span>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>By {file.uploader?.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <a 
                        href={`http://127.0.0.1:8000/storage/${file.file_path}`} 
                        target="_blank" rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors tooltip"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </a>
                      
                      {(user?.role === 'admin' || user?.id === file.uploader?.id) && (
                        <button 
                          onClick={() => handleDelete(file.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors tooltip"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};
