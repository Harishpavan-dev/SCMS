import { useState, useEffect } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { AcademicCapIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const ResultsPage = () => {
  const { user } = useAuthStore();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/results');
        setResults(response.data.data.data || []);
      } catch (error) {
        toast.error('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading results...</div>;
  }

  // Assuming it's the student view for now
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Results</h1>
          <p className="text-slate-500">View your published grades and performance</p>
        </div>
        <div>
          <button className="btn btn-secondary flex items-center">
            <DocumentChartBarIcon className="h-5 w-5 mr-2" />
            Download Transcript
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {results.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <AcademicCapIcon className="h-12 w-12 mb-3 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">No results published yet</p>
            <p className="text-sm">Grades will appear here once finalized by lecturers</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Semester</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold text-right">CA (40%)</th>
                  <th className="px-6 py-4 font-semibold text-right">Final (60%)</th>
                  <th className="px-6 py-4 font-semibold text-right">Total Marks</th>
                  <th className="px-6 py-4 font-semibold text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {result.semester?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{result.subject?.name}</div>
                      <div className="text-xs text-slate-500">{result.subject?.code}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {result.continuous_assessment || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {result.final_exam || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {result.total_marks}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {result.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
