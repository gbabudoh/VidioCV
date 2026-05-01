import LiveKitPlayer from "./LiveKitPlayer";

interface VideoPlayerProps {
  src: string;
  title?: string;
  isAnonymized?: boolean;
}

export default function VideoPlayer({ src, title, isAnonymized }: VideoPlayerProps) {
  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-white/90 tracking-tight">
          {isAnonymized ? "Anonymized Talent Mode Active" : title}
        </h3>
      )}
      <div 
        className="rounded-2xl overflow-hidden transition-all duration-700"
        style={{ filter: isAnonymized ? "blur(35px) grayscale(40%)" : "none" }}
      >
        <LiveKitPlayer src={src} candidateName={isAnonymized ? "Anonymized" : title} />
      </div>
      {isAnonymized && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Bias Shield Active — Identity Neutralized</p>
        </div>
      )}
    </div>
  );
}
