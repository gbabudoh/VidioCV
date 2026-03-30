import LiveKitPlayer from "./LiveKitPlayer";

interface VideoPlayerProps {
  src: string;
  title?: string;
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  return (
    <div className="w-full space-y-4">
      {title && <h3 className="text-lg font-semibold text-white/90 tracking-tight">{title}</h3>}
      <LiveKitPlayer src={src} candidateName={title} />
    </div>
  );
}
