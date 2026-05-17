import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { 
  AcademicCapIcon, 
  QrCodeIcon, 
  ChartBarIcon, 
  CalendarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  BuildingLibraryIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div className={`p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group`}>
    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
      <Icon className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
  </div>
);

export const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* ── NAVIGATION ───────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl group-hover:rotate-6 transition-transform">
              S
            </div>
            <div>
              <h1 className="font-black text-xl leading-none text-slate-900 tracking-tighter">SCMS.</h1>
              <p className="text-[10px] uppercase font-black tracking-widest text-indigo-600">ATI JAFFNA</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Platform</a>
            <a href="#curriculum" className="hover:text-slate-900 transition-colors">Curriculum</a>
            <a href="#about" className="hover:text-slate-900 transition-colors">Institution</a>
            <a href="#support" className="hover:text-slate-900 transition-colors">Support</a>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-6 py-3 bg-black text-white rounded-2xl text-sm font-bold shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all">
                Access Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-900 px-4">Sign In</Link>
                <Link to="/register" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all">
                  Join the Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* ── HERO SECTION ───────────────────────────────────────────────────────── */}
        <section className="relative pt-40 pb-24 overflow-hidden">
          {/* Decors */}
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px]" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-xs font-bold mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <SparklesIcon className="w-4 h-4 text-amber-500" />
                <span>Modernizing Education for HNDIT Batch 2024</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                The Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700">Student Success.</span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                Managing your academic journey at ATI Jaffna just got smarter. Seamless attendance, instant results, and dynamic scheduling—all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                <Link to="/register" className="group px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-lg font-bold shadow-2xl shadow-indigo-200 hover:bg-black transition-all flex items-center gap-3">
                  Start Registration
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex -space-x-3 items-center">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
                    </div>
                  ))}
                  <div className="pl-6 text-sm font-bold text-slate-400">
                     <span className="text-slate-900">500+</span> Students Joined
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-32 relative mx-auto max-w-6xl animate-in zoom-in-95 fade-in duration-1000 delay-700">
               <div className="absolute inset-0 bg-indigo-500/10 rounded-[3rem] blur-3xl -z-10" />
               <div className="bg-slate-950 p-2 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)]">
                  <div className="bg-white rounded-[3rem] overflow-hidden aspect-[16/9] flex flex-col">
                     <div className="h-14 bg-slate-50 border-b border-slate-100 flex items-center px-8 justify-between">
                        <div className="flex gap-2">
                           <div className="w-3 h-3 rounded-full bg-slate-200" />
                           <div className="w-3 h-3 rounded-full bg-slate-200" />
                           <div className="w-3 h-3 rounded-full bg-slate-200" />
                        </div>
                        <div className="bg-slate-100 px-6 py-1 rounded-full text-[10px] font-bold text-slate-400 tracking-wider">
                           SECURE PORTAL INTERFACE
                        </div>
                        <div className="w-10" />
                     </div>
                     <div className="flex-1 p-10 flex gap-10">
                        <div className="w-64 space-y-4">
                           <div className="h-12 bg-indigo-600 rounded-2xl w-full" />
                           <div className="h-10 bg-slate-50 rounded-2xl w-full" />
                           <div className="h-10 bg-slate-50 rounded-2xl w-full" />
                           <div className="h-10 bg-slate-50 rounded-2xl w-full" />
                        </div>
                        <div className="flex-1 space-y-8">
                           <div className="flex gap-6">
                              <div className="flex-1 h-32 bg-slate-50 rounded-3xl border border-slate-100" />
                              <div className="flex-1 h-32 bg-slate-50 rounded-3xl border border-slate-100" />
                              <div className="flex-1 h-32 bg-slate-50 rounded-3xl border border-slate-100" />
                           </div>
                           <div className="flex-1 h-64 bg-slate-50 rounded-3xl border border-slate-100" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ───────────────────────────────────────────────────── */}
        <section id="features" className="py-32 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
               <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest">Platform Core</h2>
               <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Everything you need to <br /> accelerate your learning.</h3>
               <p className="text-slate-500 font-medium">A unified workspace designed specifically for the HNDIT environment at ATI Jaffna.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={QrCodeIcon}
                title="QR Attendance"
                description="Instant attendance marking via secure, time-limited QR codes. No more manual logs or errors."
              />
              <FeatureCard 
                icon={ChartBarIcon}
                title="Smart Analytics"
                description="Visualize your progress with dynamic charts for attendance, results and overall GPA performance."
              />
              <FeatureCard 
                icon={CalendarIcon}
                title="Live Timetables"
                description="Always stay on track with real-time class schedules and instant notifications for changes."
              />
              <FeatureCard 
                icon={AcademicCapIcon}
                title="Academic ID"
                description="Digital student identity with built-in QR data for campus access and official identification."
              />
              <FeatureCard 
                icon={ShieldCheckIcon}
                title="Secure Auth"
                description="Enterprise-grade JWT authentication ensuring your academic data remains private and protected."
              />
              <FeatureCard 
                icon={SparklesIcon}
                title="Direct Messaging"
                description="Instant communication channel between students, representatives and the administration."
              />
            </div>
          </div>
        </section>

        {/* ── STATISTICS SECTION ─────────────────────────────────────────────────── */}
        <section className="py-24 bg-white border-y border-slate-100">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="text-center">
                 <p className="text-4xl font-black text-slate-900 mb-1">100%</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Logs</p>
              </div>
              <div className="text-center">
                 <p className="text-4xl font-black text-slate-900 mb-1">5k+</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Marked Presence</p>
              </div>
              <div className="text-center">
                 <p className="text-4xl font-black text-slate-900 mb-1">24/7</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portal Access</p>
              </div>
              <div className="text-center">
                 <p className="text-4xl font-black text-slate-900 mb-1">60ms</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">API Latency</p>
              </div>
           </div>
        </section>

        {/* ── INSTITUTION SECTION ────────────────────────────────────────────────── */}
        <section id="about" className="py-32 overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-20">
              <div className="lg:w-1/2 relative">
                 <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] rotate-3 -z-10 opacity-10" />
                 <img 
                    src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="Campus" 
                    className="rounded-[3rem] shadow-2xl object-cover h-[500px] w-full"
                 />
              </div>
              <div className="lg:w-1/2 space-y-8">
                 <div className="px-5 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black inline-block uppercase tracking-widest">
                    The Institution
                 </div>
                 <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Excellence in Technological Education.</h2>
                 <p className="text-lg text-slate-500 leading-relaxed">
                    ATI Jaffna remains at the forefront of HNDIT education in Sri Lanka. SCMS is our commitment to providing students with the best digital tools to succeed in a competitive world.
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="flex gap-4">
                       <BuildingLibraryIcon className="w-10 h-10 text-indigo-600 shrink-0" />
                       <div>
                          <p className="font-bold text-slate-900">Modern Labs</p>
                          <p className="text-sm text-slate-400 font-medium">State of the art computing facilities.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <UserGroupIcon className="w-10 h-10 text-indigo-600 shrink-0" />
                       <div>
                          <p className="font-bold text-slate-900">Expert Faculty</p>
                          <p className="text-sm text-slate-400 font-medium">Mentors with industry experience.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ── CTA SECTION ────────────────────────────────────────────────────────── */}
        <section className="py-24 px-6">
           <div className="max-w-7xl mx-auto bg-black rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 space-y-10">
                 <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">Ready to step into the <br /> modern classroom?</h2>
                 <p className="text-slate-400 max-w-xl mx-auto text-lg font-medium">Join hundreds of HNDIT students already using the SCMS portal to manage their academic life.</p>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link to="/register" className="px-12 py-5 bg-white text-black rounded-3xl text-lg font-black hover:scale-105 transition-all w-full sm:w-auto">
                       Register Now
                    </Link>
                    <Link to="/login" className="px-12 py-5 bg-white/10 text-white border border-white/20 rounded-3xl text-lg font-black hover:bg-white/20 transition-all w-full sm:w-auto">
                       Student Login
                    </Link>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-50 border-t border-slate-200 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
           <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">S</div>
                 <span className="text-xl font-black text-slate-900 tracking-tight">SCMS. <span className="text-indigo-600 font-medium">Portal</span></span>
              </div>
              <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                 The official Smart Classroom Management System for Advanced Technological Institute, Jaffna. Empowering students through technology.
              </p>
           </div>
           <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Quick Links</p>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                 <li><Link to="/login" className="hover:text-indigo-600">Student Portal</Link></li>
                 <li><Link to="/register" className="hover:text-indigo-600">Join Batch 2024</Link></li>
                 <li><a href="#" className="hover:text-indigo-600">Curriculum Docs</a></li>
                 <li><a href="#" className="hover:text-indigo-600">Academic Calendar</a></li>
              </ul>
           </div>
           <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Contact Us</p>
              <div className="space-y-4 text-sm font-bold text-slate-500">
                 <p>ATI Jaffna, Beach Road,</p>
                 <p>Jaffna, Sri Lanka</p>
                 <p className="text-indigo-600">support@atijaffna.lk</p>
                 <p>+94 21 222 2595</p>
              </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400">© {new Date().getFullYear()} ATI JAFFNA. All rights reserved.</p>
          <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
             <a href="#" className="hover:text-slate-900">Privacy Policy</a>
             <a href="#" className="hover:text-slate-900">Terms of Use</a>
             <a href="#" className="hover:text-slate-900">Faculty Access</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

