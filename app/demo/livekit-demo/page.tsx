import LiveKitPlayer from "@/app/components/video-tools/LiveKitPlayer";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function LiveKitDemoPage() {
  // A reliable public sample video for the demo
  const sampleVideoUrl = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 md:p-12 selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to App
            </Link>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                LiveKit Style Player
              </h1>
              <p className="text-white/40 text-lg max-w-xl leading-relaxed">
                A premium, high-fidelity video experience replacing standard PeerTube embeds with custom glassmorphism components.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-400 text-sm font-bold uppercase tracking-wider">Experimental UI</span>
          </div>
        </div>

        {/* Player Showcase */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative">
            <LiveKitPlayer 
              src={sampleVideoUrl}
              candidateName="Alexander Pierce"
              autoPlay={false}
            />
          </div>
        </div>

        {/* Features List */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-white/90">Glassmorphism UI</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Fully custom control bar with backdrop-blur and dynamic opacity transitions for a seamless experience.
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-white/90">Native Performance</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Uses the native browser &lt;video&gt; engine for zero-lag playback and hardware acceleration.
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-white/90">Contextual HUD</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Floating participant labels and recording status indicators that mimic the LiveKit "live session" look.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
