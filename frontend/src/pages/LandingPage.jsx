import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { 
  AcademicCapIcon, 
  CodeBracketIcon, 
  ServerStackIcon, 
  GlobeAltIcon,
  ArrowRightIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  BookOpenIcon,
  TrophyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div className={`p-8 bg-white border border-slate-100 rounded-[2rem] shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-8 ${delay}`}>
    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:rotate-6 transition-all duration-500">
      <Icon className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-500" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm font-medium">{description}</p>
  </div>
);

export const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-200 selection:text-indigo-900">
      {/* ── NAVIGATION (GLASSMORPHISM) ───────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-indigo-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="flex items-center gap-2">
                {/* Embedded generic SLIATE crest placeholder (SVG) */}
                <div className="w-14 h-14 bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:rotate-[360deg] transition-transform duration-1000 ease-in-out">
                   <AcademicCapIcon className="w-8 h-8 text-white" />
                </div>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-black text-2xl leading-none text-slate-900 tracking-tighter uppercase">SLIATE</h1>
              <p className="text-[10px] uppercase font-black tracking-widest text-indigo-600 mt-0.5">ATI Jaffna</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-slate-600 uppercase tracking-wider">
            <a href="#hndit" className="hover:text-amber-500 transition-colors duration-300">The Program</a>
            <a href="#modules" className="hover:text-amber-500 transition-colors duration-300">Curriculum</a>
            <a href="#campus" className="hover:text-amber-500 transition-colors duration-300">Campus</a>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-8 py-3.5 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-slate-900 hover:shadow-slate-200 hover:scale-105 active:scale-95 transition-all duration-300">
                Go to Portal
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-900 px-4 hover:text-indigo-600 transition-colors">Login</Link>
                <Link to="/register" className="px-8 py-3.5 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all duration-300">
                  Join Batch
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* ── PREMIUM HERO SECTION ───────────────────────────────────────────────────────── */}
        <section className="relative pt-44 pb-32 overflow-hidden bg-slate-900">
          {/* Abstract deep background grids and colors */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e520_1px,transparent_1px),linear-gradient(to_bottom,#4f46e520_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-30"></div>
          <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[150px] opacity-20 animate-pulse" />
          <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[150px] opacity-20" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Content */}
                <div className="text-left space-y-8">
                  <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-black tracking-widest uppercase animate-in fade-in slide-in-from-bottom-4 duration-1000 backdrop-blur-md">
                    <TrophyIcon className="w-5 h-5 text-amber-400" />
                    <span>Sri Lanka Institute of Advanced Technological Education</span>
                  </div>
                  
                  <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-[1.05] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    Higher National Diploma in <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">Information Technology</span>
                  </h1>
                  
                  <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    Empowering the next generation of middle-level IT professionals. Master software development, networking, and quality assurance at ATI Jaffna.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <Link to="/register" className="group px-10 py-5 bg-amber-500 text-slate-900 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center justify-center gap-4 w-full sm:w-auto hover:w-[105%] duration-300 relative overflow-hidden">
                      <span className="relative z-10 flex items-center gap-3">Student Portal <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                    <a href="#hndit" className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all flex justify-center w-full sm:w-auto backdrop-blur-md">
                      Explore Curriculum
                    </a>
                  </div>
                </div>

                {/* Right Visuals */}
                <div className="relative aspect-square lg:aspect-auto lg:h-[600px] animate-in zoom-in-95 fade-in duration-1000 delay-700">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-[3rem] rotate-6 opacity-20 blur-xl" />
                    <div className="absolute inset-0 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                        <img 
                            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                            alt="Students Coding" 
                            className="w-full h-full object-cover object-center grayscale-[20%] hover:grayscale-0 hover:scale-105 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-10 left-10 right-10">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl">
                                <p className="text-white font-bold text-lg mb-1">Duration: 2½ Years</p>
                                <p className="text-slate-300 text-sm font-medium">Academic study + 6 months NAITA industrial training.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* ── COURSE INFO SECTION ───────────────────────────────────────────────────── */}
        <section id="hndit" className="py-32 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-20 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-1 h-1 bg-amber-500 rounded-full" />
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-widest">Why HNDIT?</h2>
               </div>
               <h3 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">Structured to build <br /> Software Engineers.</h3>
               <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
                 Designed by the Sri Lanka Institute of Advanced Technological Education, the HNDIT program perfectly bridges the gap between G.C.E. Advanced Level and professional IT careers.
               </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                delay="delay-100"
                icon={CodeBracketIcon}
                title="Software Dev"
                description="Master C#, Java, PHP, and modern web frameworks like Laravel & React."
              />
              <FeatureCard 
                delay="delay-200"
                icon={ServerStackIcon}
                title="Databases"
                description="Expertise in SQL, relational database design, and architecture."
              />
              <FeatureCard 
                delay="delay-300"
                icon={GlobeAltIcon}
                title="Web & Mobile"
                description="Responsive web programming and mobile application deployment."
              />
              <FeatureCard 
                delay="delay-400"
                icon={ShieldCheckIcon}
                title="Quality Assurance"
                description="Software testing methodologies, QA principles, and lifecycle management."
              />
            </div>
          </div>
        </section>

        {/* ── CAMPUS DETAILS SECTION ────────────────────────────────────────────────── */}
        <section id="campus" className="py-32 bg-slate-900 text-white relative">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center bg-fixed opacity-10 mix-blend-overlay"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
           
           <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-20">
              <div className="lg:w-1/2 space-y-10">
                 <div className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-amber-400 text-xs font-black inline-block uppercase tracking-widest backdrop-blur-md">
                    ATI Jaffna Campus
                 </div>
                 <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter">
                    Center of <br/> Academic Excellence.
                 </h2>
                 <p className="text-lg text-slate-300 leading-relaxed font-medium">
                    The Advanced Technological Institute in Jaffna provides a thriving environment for future IT professionals. With dedicated faculty and a state-of-the-art syllabus, students are molded for the modern tech industry.
                 </p>
                 
                 <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                       <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><BookOpenIcon className="w-6 h-6" /></div>
                       <div>
                          <p className="font-bold text-white tracking-wide">Full-Time & Part-Time Modes</p>
                          <p className="text-sm text-slate-400">Flexible learning options based on A/L merits.</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                       <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><AcademicCapIcon className="w-6 h-6" /></div>
                       <div>
                          <p className="font-bold text-white tracking-wide">Certified Industrial Training</p>
                          <p className="text-sm text-slate-400">Strictly monitored 6-month NAITA placements.</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="lg:w-1/2 w-full">
                  <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Contact Information</h3>
                      
                      <div className="space-y-8">
                         <div className="flex items-start gap-5 group">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300"><MapPinIcon className="w-6 h-6" /></div>
                            <div>
                               <p className="font-bold text-slate-900 text-lg">Address</p>
                               <p className="text-slate-500 font-medium">No. 665/5, Beach Road,<br/>Guru Nagar, Jaffna.</p>
                            </div>
                         </div>
                         
                         <div className="flex items-start gap-5 group">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300"><PhoneIcon className="w-6 h-6" /></div>
                            <div>
                               <p className="font-bold text-slate-900 text-lg">Telephone</p>
                               <p className="text-slate-500 font-medium">021-2222595 / 021-2229803</p>
                            </div>
                         </div>

                         <div className="flex items-start gap-5 group">
                            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300"><EnvelopeIcon className="w-6 h-6" /></div>
                            <div>
                               <p className="font-bold text-slate-900 text-lg">Email</p>
                               <p className="text-slate-500 font-medium">atijaffna@sliate.ac.lk</p>
                            </div>
                         </div>
                      </div>
                  </div>
              </div>
           </div>
        </section>

      </main>

      {/* ── PRREMIUM FOOTER ──────────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-50 pt-24 pb-12 overflow-hidden border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 relative z-10">
           <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <AcademicCapIcon className="w-7 h-7" />
                 </div>
                 <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">SLIATE <span className="text-indigo-600 font-medium">ATI Jaffna</span></span>
              </div>
              <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                 Sri Lanka Institute of Advanced Technological Education. Fostering innovation and technological mastery through the HNDIT program.
              </p>
           </div>
           <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Quick Links</p>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                 <li><Link to="/login" className="hover:text-indigo-600 transition-colors">Portal Login</Link></li>
                 <li><Link to="/register" className="hover:text-indigo-600 transition-colors">Student Registration</Link></li>
                 <li><a href="https://sliate.ac.lk" target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors">Official SLIATE Website</a></li>
              </ul>
           </div>
           <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Legal</p>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                 <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                 <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms & Conditions</a></li>
                 <li><a href="#" className="hover:text-indigo-600 transition-colors">Accessibility Statement</a></li>
              </ul>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} SLIATE ATI JAFFNA. All rights reserved.</p>
          <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-slate-300" />
             <div className="w-2 h-2 rounded-full bg-indigo-300" />
             <div className="w-2 h-2 rounded-full bg-amber-300" />
          </div>
        </div>
      </footer>
    </div>
  );
};
