import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              SC
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none text-slate-900 tracking-tight">SCMS</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-blue-600">ATI Jaffna</p>
            </div>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About HNDIT</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact Support</a>
          </nav>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary text-sm px-6 py-2 shadow-md hover:shadow-lg">
                Go to Portal
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary text-sm px-6 py-2 shadow-md hover:shadow-lg">
                  Student Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 to-indigo-50/40 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
            <div className="w-[600px] h-[600px] bg-gradient-to-tr from-sky-100/40 to-emerald-50/40 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Now available for HNDIT Batch 2024
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                The Smart Way to Manage <br className="hidden md:block"/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Your Education.</span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Experience seamless attendance tracking, direct access to your results, 
                and dynamic timetables through the ATI Jaffna official smart portal.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-4 w-full sm:w-auto shadow-xl shadow-blue-500/20">
                    Open Student Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary text-lg px-8 py-4 w-full sm:w-auto shadow-xl shadow-blue-500/20">
                      Create Student Account
                    </Link>
                    <Link to="/login" className="btn bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-lg px-8 py-4 w-full sm:w-auto shadow-sm">
                      Login to Portal
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Application Mockup Graphic */}
            <div className="relative mt-20 mx-auto max-w-5xl rounded-2xl bg-slate-900 p-2 shadow-2xl animate-in zoom-in-95 fade-in duration-1000 delay-500">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent rounded-2xl z-10 pointer-events-none"></div>
              <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex flex-col aspect-video">
                {/* Mock Header */}
                <div className="h-12 bg-slate-800/80 border-b border-slate-700 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <div className="ml-4 bg-slate-900 px-3 py-1 rounded text-xs text-slate-400 font-mono w-64 text-center">
                    atijaffna.lk/dashboard
                  </div>
                </div>
                {/* Mock Body */}
                <div className="flex-1 bg-slate-100 p-6 flex gap-6">
                  {/* Mock Sidebar */}
                  <div className="w-48 bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                    <div className="h-8 bg-blue-100 rounded opacity-50"></div>
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                  </div>
                  {/* Mock Content */}
                  <div className="flex-1 space-y-4">
                    <div className="h-10 w-1/3 bg-white rounded-lg border border-slate-200"></div>
                    <div className="flex gap-4">
                      <div className="flex-1 h-32 bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
                         <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                         <div className="h-10 w-1/3 bg-blue-50 rounded"></div>
                      </div>
                      <div className="flex-1 h-32 bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
                         <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                         <div className="h-10 w-1/3 bg-emerald-50 rounded"></div>
                      </div>
                      <div className="flex-1 h-32 bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
                         <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                         <div className="h-10 w-1/3 bg-amber-50 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              SC
            </div>
            <span className="text-white font-semibold">SCMS ATI Jaffna</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Advanced Technological Institute, Jaffna. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
