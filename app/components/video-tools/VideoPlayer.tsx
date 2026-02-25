import { getPeerTubeEmbedUrl } from "@/app/lib/video";

interface VideoPlayerProps {
  src: string;
  title?: string;
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  const embedUrl = getPeerTubeEmbedUrl(src);

  if (!embedUrl) return null;

  return (
    <div className="w-full space-y-4">
      {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <iframe
          src={embedUrl}
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          className="w-full h-full border-0 absolute inset-0"
          title={title || "Video player"}
        />
      </div>
    </div>
  );
}
