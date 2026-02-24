"use client";

import React, { useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title?: string;
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full space-y-4">
      {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
      <div className="relative bg-black rounded-lg overflow-hidden group">
        <video
          ref={videoRef}
          src={src}
          className="w-full aspect-video"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="p-4 bg-blue-500 hover:bg-blue-600 rounded-full transition"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white fill-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
