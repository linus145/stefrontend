import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[#0a0a0c] text-neutral-50 overflow-hidden min-h-screen font-sans selection:bg-[#b49cf8]/30">
      <Header />
      
      {/* Dynamic Background Layout globally */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(119,85,255,0.08)_0%,transparent_50%)] pointer-events-none" />

      <main className="relative z-10 w-full">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative flex flex-col items-center justify-center pt-32 sm:pt-40 md:pt-48 pb-20 sm:pb-32 px-4 sm:px-6 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-1.5 text-xs text-[#a1a1aa] backdrop-blur-md mb-8">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#b49cf8] mr-3 animate-pulse shadow-[0_0_10px_#b49cf8]"></span>
            Trusted by alumni from YC, Sequoia, and a16z.
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-tight">
            Where capital <br /> meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d9d1fe] to-[#a890fe]">execution.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            The private network for high-velocity founders and conviction-driven investors. Bypass the noise, find your partners, and scale.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-8 rounded-lg bg-gradient-to-r from-[#b49cf8] to-[#8061f2] text-white shadow-[0_0_20px_rgba(180,156,248,0.2)] hover:shadow-[0_0_30px_rgba(180,156,248,0.4)] transition-all font-semibold">
                Gain Access
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-lg border-white/[0.1] bg-[#121215]/50 text-[#d4d4d8] hover:bg-white/[0.05] hover:text-white transition-all">
                Explore the Network
              </Button>
            </Link>
          </div>
        </section>


        {/* ================= METRICS / SOCIAL PROOF ================= */}
        <section className="border-y border-white/[0.05] bg-[#0d0d10] py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
            <div className="pt-4 md:pt-0">
              <p className="text-4xl font-bold tracking-tight text-white mb-2">$1.2B</p>
              <p className="text-sm font-medium uppercase tracking-widest text-[#71717a]">Capital Managed</p>
            </div>
            <div className="pt-8 md:pt-0">
              <p className="text-4xl font-bold tracking-tight text-white mb-2">4,500+</p>
              <p className="text-sm font-medium uppercase tracking-widest text-[#71717a]">Active Builders</p>
            </div>
            <div className="pt-8 md:pt-0">
              <p className="text-4xl font-bold tracking-tight text-white mb-2">820</p>
              <p className="text-sm font-medium uppercase tracking-widest text-[#71717a]">Seed Deals Closed</p>
            </div>
          </div>
        </section>


        {/* ================= VALUE PROPOSITION ================= */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#121215] border border-white/[0.05] rounded-2xl p-8 relative overflow-hidden group hover:border-[#b49cf8]/30 transition-colors">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#b49cf8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-10 w-10 rounded-full bg-[#1a1a1f] border border-white/[0.05] flex items-center justify-center mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-[#b49cf8]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Built for momentum.</h3>
              <p className="text-[#a1a1aa] leading-relaxed">
                We eliminated the friction of cold outreach. Connect based on verified traction and concrete investment thesis.
              </p>
            </div>
            
            <div className="bg-[#121215] border border-white/[0.05] rounded-2xl p-8 relative overflow-hidden group hover:border-[#b49cf8]/30 transition-colors">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#b49cf8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-10 w-10 rounded-full bg-[#1a1a1f] border border-white/[0.05] flex items-center justify-center mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Signal over noise.</h3>
              <p className="text-[#a1a1aa] leading-relaxed">
                An ecosystem gated by verification. Engage only with active builders and deploying capital.
              </p>
            </div>

            <div className="bg-[#121215] border border-white/[0.05] rounded-2xl p-8 relative overflow-hidden group hover:border-[#b49cf8]/30 transition-colors">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#b49cf8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-10 w-10 rounded-full bg-[#1a1a1f] border border-white/[0.05] flex items-center justify-center mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Engineered by intelligence.</h3>
              <p className="text-[#a1a1aa] leading-relaxed">
                Advanced AI models run in the background, surfacing the exact operators and term sheets you need to see.
              </p>
            </div>
          </div>
        </section>


        {/* ================= FLOW & FEATURES GRID ================= */}
        <section className="py-24 px-6 bg-[#0d0d10] border-y border-white/[0.05]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* PLATFORM FLOW (Left Side) */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">The execution engine.</h2>
                <p className="text-[#a1a1aa] text-lg">Three steps to architecting your round and scaling your ecosystem.</p>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/[0.1] before:to-transparent">
                
                <div className="relative flex items-start gap-6">
                  <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-[#121215] border border-[#b49cf8]/50 text-[#b49cf8] font-bold text-sm shrink-0">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Identity</h4>
                    <p className="text-[#71717a] leading-relaxed">Claim your profile, verify your operating metrics, and set your funding or deployment status.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-6">
                  <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-[#121215] border border-white/[0.1] text-white font-bold text-sm shrink-0">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Network</h4>
                    <p className="text-[#71717a] leading-relaxed">Bypass the inbox. Initiate direct, high-signal conversations with verified ecosystem partners.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-6">
                  <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-[#121215] border border-white/[0.1] text-white font-bold text-sm shrink-0">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Scale</h4>
                    <p className="text-[#71717a] leading-relaxed">Leverage our proprietary models to frictionlessly discover capital, talent, and early adopters.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* FEATURES GRID (Right Side) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0a0a0c] border border-white/[0.05] p-6 rounded-xl hover:bg-[#121215] transition-colors">
                <h4 className="text-white font-semibold mb-2">Discovery.</h4>
                <p className="text-sm text-[#71717a]">Find technical operators and co-founders matching your exact velocity.</p>
              </div>
              <div className="bg-[#0a0a0c] border border-white/[0.05] p-6 rounded-xl hover:bg-[#121215] transition-colors">
                <h4 className="text-white font-semibold mb-2">Dealflow.</h4>
                <p className="text-sm text-[#71717a]">Capital intelligently routed to your traction model and funding stage.</p>
              </div>
              <div className="bg-[#0a0a0c] border border-white/[0.05] p-6 rounded-xl hover:bg-[#121215] transition-colors">
                <h4 className="text-white font-semibold mb-2">Signal.</h4>
                <p className="text-sm text-[#71717a]">High-fidelity, real-time encrypted channels. No spam, just execution.</p>
              </div>
              <div className="bg-[#0a0a0c] border border-white/[0.05] p-6 rounded-xl hover:bg-[#121215] transition-colors">
                <h4 className="text-white font-semibold mb-2">Intelligence.</h4>
                <p className="text-sm text-[#71717a]">Predictive AI matching evaluating burn rate, metrics, and thesis alignment.</p>
              </div>
            </div>

          </div>
        </section>


        {/* ================= AI SECTION ================= */}
        <section className="py-32 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#1a1a1f] to-[#0a0a0c] border border-white/[0.05] shadow-[0_0_30px_rgba(180,156,248,0.1)] mb-8">
            <svg className="w-8 h-8 text-[#b49cf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">The algorithm for growth.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
            <div className="bg-gradient-to-b from-[#121215] to-[#0a0a0c] border border-white/[0.05] rounded-2xl p-8">
              <h4 className="text-white font-semibold mb-3">Smart Routing</h4>
              <p className="text-[#71717a] text-sm leading-relaxed">Evaluates stage, sector, and check size to instantly align founders with deploying investors.</p>
            </div>
            <div className="bg-gradient-to-b from-[#121215] to-[#0a0a0c] border border-white/[0.05] rounded-2xl p-8">
              <h4 className="text-white font-semibold mb-3">Curated Feed</h4>
              <p className="text-[#71717a] text-sm leading-relaxed">Personalized updates featuring only the builders scaling in your exact market.</p>
            </div>
            <div className="bg-gradient-to-b from-[#121215] to-[#0a0a0c] border border-white/[0.05] rounded-2xl p-8">
              <h4 className="text-white font-semibold mb-3">Synthetic Insights</h4>
              <p className="text-[#71717a] text-sm leading-relaxed">Instantly distills 30-page pitch decks and monthly updates into 30-second read-outs.</p>
            </div>
          </div>
        </section>


        {/* ================= TESTIMONIALS ================= */}
        <section className="py-24 px-6 bg-[#0d0d10] border-y border-white/[0.05]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="bg-[#121215] border border-white/[0.05] p-8 rounded-2xl relative">
              <svg className="absolute top-8 left-8 w-8 h-8 text-white/[0.05]" fill="currentColor" viewBox="0 0 32 32"><path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.896 3.456-8.352 9.12-8.352 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"/></svg>
              <div className="relative z-10 pl-12">
                <p className="text-lg text-white mb-6 leading-relaxed">
                  "Pure signal. This is where I found our lead investor in under a week. We bypassed months of warm intro roulette."
                </p>
                <div>
                  <p className="font-semibold text-white">Sarah Jenkins</p>
                  <p className="text-sm text-[#71717a]">Founder, Series A FinTech</p>
                </div>
              </div>
            </div>

            <div className="bg-[#121215] border border-white/[0.05] p-8 rounded-2xl relative">
              <svg className="absolute top-8 left-8 w-8 h-8 text-white/[0.05]" fill="currentColor" viewBox="0 0 32 32"><path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.896 3.456-8.352 9.12-8.352 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"/></svg>
              <div className="relative z-10 pl-12">
                <p className="text-lg text-white mb-6 leading-relaxed">
                  "The AI dealflow matching cuts out 90% of our preliminary screening. It just hands us the operators we want to back."
                </p>
                <div>
                  <p className="font-semibold text-white">Marcus Torres</p>
                  <p className="text-sm text-[#71717a]">General Partner</p>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ================= CTA SECTION ================= */}
        <section className="py-32 px-6 text-center max-w-3xl mx-auto">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom,rgba(119,85,255,0.05)_0%,transparent_40%)] pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-6 relative z-10">
            Stop indexing. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d9d1fe] to-[#a890fe]">Start operating.</span>
          </h2>
          <p className="text-lg text-[#a1a1aa] mb-10 relative z-10">
            The ecosystem is moving fast. Reserve your handle and start building your network today.
          </p>
          <Link href="/register" className="inline-block relative z-10">
            <Button className="h-14 px-10 rounded-xl bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all font-bold text-base">
              Claim Your Profile
            </Button>
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
}
