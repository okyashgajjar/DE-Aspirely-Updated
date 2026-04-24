import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Radar, 
  BookOpen, 
  BarChart3, 
  MessageSquare, 
  BrainCircuit, 
  Focus,
  ArrowRight,
  TrendingUp
} from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ASPIRELY | AI Career Navigation",
  description: "Personalized job matches, skill gap coaching, and career navigation.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen font-sans antialiased overflow-x-hidden bg-[#fbf8ff] dark:bg-[#0c0e18] text-slate-900 dark:text-slate-50 transition-colors duration-300">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-[#0c0e18]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
          <div className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
            ASPIRELY
          </div>
          <div className="hidden md:flex items-center space-x-12">
            <Link className="text-slate-600 dark:text-slate-300 font-semibold text-sm tracking-tight hover:text-[#2a50cd] dark:hover:text-[#5b8cff] transition-colors duration-300 border-b-2 border-[#2a50cd] dark:border-[#5b8cff]" href="#features">
              Features
            </Link>
            <Link className="text-slate-600 dark:text-slate-300 font-medium text-sm tracking-tight hover:text-[#2a50cd] dark:hover:text-[#5b8cff] transition-colors duration-300" href="#how-it-works">
              How it Works
            </Link>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <ThemeToggle />
            <Link className="font-medium text-sm tracking-tight text-slate-600 dark:text-slate-300 hover:text-[#2a50cd] dark:hover:text-[#5b8cff] transition-colors duration-300 hidden sm:block" href="/login">
              Log In
            </Link>
            <Button asChild className="rounded-full px-6 py-2.5 text-sm font-bold tracking-tight text-white bg-[#2a50cd] hover:bg-[#203ea6] dark:bg-[#5b8cff] dark:hover:bg-[#4a7aeb] dark:text-[#0c0e18] hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#2a50cd]/20 dark:shadow-[#5b8cff]/20">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 bg-[radial-gradient(circle_at_50%_50%,_#dde1ff_0%,_#fbf8ff_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,_rgba(91,140,255,0.15)_0%,_#0c0e18_70%)] transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest text-xs font-bold bg-[#dde1ff] dark:bg-[#5b8cff]/20 text-[#001453] dark:text-[#5b8cff]">
            AI-Driven Career Precision
          </div>
          <h1 className="text-5xl sm:text-7xl mb-8 leading-tight tracking-tighter font-extrabold text-slate-900 dark:text-white">
            Master Your Career. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#2a50cd] to-[#8d4b00] dark:from-[#5b8cff] dark:to-[#ffb77e]">
              One Focus at a Time.
            </span>
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 text-slate-600 dark:text-slate-300 leading-relaxed">
            ASPIRELY creates hyperfocus environments that filter the noise of modern job seeking, matching your unique skill signature to elite opportunities.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Button asChild className="w-full md:w-auto px-10 py-7 rounded-full text-base font-bold text-white bg-[#2a50cd] hover:bg-[#203ea6] dark:bg-[#5b8cff] dark:hover:bg-[#4a7aeb] dark:text-[#0c0e18] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#2a50cd]/30 dark:shadow-[#5b8cff]/20">
              <Link href="/signup">Begin Your Journey</Link>
            </Button>
            <Button asChild variant="outline" className="w-full md:w-auto border-2 px-10 py-7 rounded-full text-base font-bold transition-all border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent">
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
        </div>

        {/* Floating Glassmorphism Hero Element */}
        <div className="mt-20 w-full max-w-4xl px-6 relative z-10">
          <div className="rounded-[32px] p-8 shadow-2xl overflow-hidden border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-[20px] transition-colors duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#3fff8b] dark:bg-[#00e475]/20 text-[#007237] dark:text-[#00e475]">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Real-time Growth Trajectory</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Last update: 2 minutes ago</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 rounded-2xl bg-[#f4f2fd] dark:bg-slate-800/80 transition-colors">
                    <div className="text-2xl font-extrabold text-[#2a50cd] dark:text-[#5b8cff]">18</div>
                    <div className="text-xs uppercase tracking-wider font-bold mt-1 text-slate-600 dark:text-slate-400">Jobs Matched</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#f4f2fd] dark:bg-slate-800/80 transition-colors">
                    <div className="text-2xl font-extrabold text-[#8d4b00] dark:text-[#ffb77e]">24%</div>
                    <div className="text-xs uppercase tracking-wider font-bold mt-1 text-slate-600 dark:text-slate-400">Skill Gap</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#f4f2fd] dark:bg-slate-800/80 transition-colors">
                    <div className="text-2xl font-extrabold text-[#006d35] dark:text-[#00e475]">7</div>
                    <div className="text-xs uppercase tracking-wider font-bold mt-1 text-slate-600 dark:text-slate-400">Courses Active</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#f4f2fd] dark:bg-slate-800/80 transition-colors">
                    <div className="text-2xl font-extrabold text-[#486ae8] dark:text-[#7c5cff]">76</div>
                    <div className="text-xs uppercase tracking-wider font-bold mt-1 text-slate-600 dark:text-slate-400">Interview Score</div>
                  </div>
                </div>
              </div>
              <div className="relative w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/vaOQm3Y3tv8"
                  title="Aspirely Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 sm:py-32 px-6 max-w-7xl mx-auto" id="features">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">Engineered for Achievement</h2>
          <p className="text-lg max-w-2xl mx-auto text-slate-600 dark:text-slate-300">
            Focus on the path that matters. Our AI ecosystem handles the heavy lifting of career management.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Radar, title: "AI Job Matching", desc: "Precision algorithms that find positions matching your hidden potential, not just your keywords." },
            { icon: BookOpen, title: "Smart Courses", desc: "Dynamically generated learning paths designed to bridge your specific skill gaps in record time." },
            { icon: BarChart3, title: "Growth Analytics", desc: "Visualize your ascent with cinematic charts and trajectory forecasts based on market demand." },
            { icon: MessageSquare, title: "Mock Interviews", desc: "Realistic voice-enabled AI simulations that adapt to the specific company you're targeting." },
            { icon: BrainCircuit, title: "AI Career Coach", desc: "A 24/7 strategic partner providing feedback on networking, salary negotiations, and strategy." },
            { icon: Focus, title: "Focus Mode", desc: "A distractive-free workspace that prioritizes your daily career mission and silences the noise." }
          ].map((Feature, i) => (
            <div key={i} className="group p-8 rounded-[24px] shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-2xl dark:hover:shadow-[#5b8cff]/10 transition-all duration-500 border border-slate-100 dark:border-slate-800 hover:border-[#dde1ff] dark:hover:border-[#5b8cff]/30 bg-white dark:bg-slate-900/50">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors bg-[#2a50cd]/5 dark:bg-[#5b8cff]/10 text-[#2a50cd] dark:text-[#5b8cff] group-hover:bg-[#2a50cd] dark:group-hover:bg-[#5b8cff] group-hover:text-white dark:group-hover:text-[#0c0e18]">
                <Feature.icon className="w-7 h-7 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">{Feature.title}</h3>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">{Feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Focus Section */}
      <section className="py-24 sm:py-32 overflow-hidden bg-[#f4f2fd] dark:bg-[#11131e]" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10 relative z-20">
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight text-slate-900 dark:text-white">
                Built for <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#2a50cd] to-[#8d4b00] dark:from-[#5b8cff] dark:to-[#ffb77e]">
                  Deep Focus.
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                The modern professional is bombarded with infinite choices. ASPIRELY filters the world down to your next best move.
              </p>
              <div className="space-y-8">
                {[
                  { num: "1", title: "Define Your Horizon", desc: "Sync your profile and let our AI map your current standing against industry benchmarks." },
                  { num: "2", title: "Engage Hyperfocus", desc: "Receive a curated mission control daily. No infinite scrolling, just targeted actions." },
                  { num: "3", title: "Execute & Elevate", desc: "Complete missions, upgrade skills, and get introduced to roles that fit your life." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white dark:text-[#0c0e18] shadow-lg bg-[#2a50cd] dark:bg-[#5b8cff]">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-slate-900 dark:text-slate-100">{step.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative w-full">
              <div className="relative z-10 p-6 rounded-[40px] shadow-2xl border border-white/50 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-[20px]">
                <div className="aspect-square bg-slate-900 rounded-[24px] overflow-hidden relative group">
                  <Image 
                    src="/deep-focus.png" 
                    alt="Minimalist Workspace" 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-[3s]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="w-full h-1.5 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden mb-4">
                      <div className="w-2/3 h-full shadow-[0_0_15px_rgba(42,80,205,0.8)] dark:shadow-[0_0_15px_rgba(91,140,255,0.8)] bg-[#2a50cd] dark:bg-[#5b8cff]"></div>
                    </div>
                    <div className="flex justify-between text-white/90 text-xs font-bold tracking-widest uppercase">
                      <span>Focus Session Alpha</span>
                      <span>65% Complete</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Circles */}
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-[80px] z-0 pointer-events-none bg-[#2a50cd]/20 dark:bg-[#5b8cff]/10"></div>
              <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full blur-[100px] z-0 pointer-events-none bg-[#8d4b00]/15 dark:bg-[#ffb77e]/10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[#b7c4ff]/15 dark:bg-[#5b8cff]/5"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl sm:text-7xl font-extrabold mb-8 leading-none text-slate-900 dark:text-white">
            Ready to <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#2a50cd] to-[#8d4b00] dark:from-[#5b8cff] dark:to-[#ffb77e]">Focus?</span>
          </h2>
          <p className="text-lg mb-12 max-w-xl mx-auto text-slate-600 dark:text-slate-300">
            Join the elite cohort of professionals who have automated their trajectory. Your future self is waiting.
          </p>
          <Button asChild className="px-12 py-8 rounded-full text-lg font-bold text-white bg-[#2a50cd] hover:bg-[#203ea6] dark:bg-[#5b8cff] dark:hover:bg-[#4a7aeb] dark:text-[#0c0e18] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#2a50cd]/40 dark:shadow-[#5b8cff]/20 group">
            <Link href="/signup">
              Start Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <div className="mt-12 flex justify-center items-center gap-4 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e475] shadow-[0_0_10px_rgba(0,228,117,0.6)]"></span>
            Join 14,000+ Career Leaders
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e18] transition-colors duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-8">
          <div className="text-lg font-black tracking-tighter text-slate-900 dark:text-white">ASPIRELY</div>
          <div className="flex gap-8">
            <Link href="#" className="text-sm font-semibold hover:text-[#2a50cd] dark:hover:text-[#5b8cff] text-slate-600 dark:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm font-semibold hover:text-[#2a50cd] dark:hover:text-[#5b8cff] text-slate-600 dark:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm font-semibold hover:text-[#2a50cd] dark:hover:text-[#5b8cff] text-slate-600 dark:text-slate-400 transition-colors">Contact Us</Link>
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} ASPIRELY. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
