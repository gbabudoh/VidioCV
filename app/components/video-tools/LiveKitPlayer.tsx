"use client";

import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";

interface LiveKitPlayerProps {
  src: string;
  poster?: string;
  candidateName?: string;
  showBranding?: boolean;
}

export default function LiveKitPlayer({
  src,
  poster,
  candidateName = "Candidate",
  showBranding = true,
}: LiveKitPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isEmbed = src.includes("/videos/embed/") || 
                  src.includes("/videos/watch/") || 
                  src.includes("/w/") || 
                  src.includes("youtube.com");

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported() && src.includes(".m3u8")) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => hls.destroy();
    } else {
      video.src = src;
      video.load();
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const handleCanPlay = () => {
      if (!cancelled) {
        video.play().catch(e => {
          if (e.name !== "AbortError") console.error("Video play failed:", e);
        });
      }
      video.removeEventListener("canplay", handleCanPlay);
    };

    if (isPlaying) {
      if (video.readyState >= 2) {
        video.play().catch(e => {
          if (e.name !== "AbortError") console.error("Video play failed:", e);
        });
      } else {
        video.addEventListener("canplay", handleCanPlay);
      }
    } else {
      video.pause();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [isPlaying]);

  useEffect(() => {
    // Sync with PeerTube Iframe (Standard API)
    if (iframeRef.current && isEmbed) {
      iframeRef.current.contentWindow?.postMessage({ method: 'setVolume', params: 1 }, "*");
      iframeRef.current.contentWindow?.postMessage({ method: 'setMuted', params: false }, "*");
    }
  }, [src, isEmbed]);

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    
    // Sync with PeerTube Iframe (Standard API)
    if (iframeRef.current && isEmbed) {
      iframeRef.current.contentWindow?.postMessage({ method: newState ? 'play' : 'pause' }, "*");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative group bg-[#0F172A] w-full rounded-none md:rounded-2xl overflow-hidden border-y-2 md:border-2 border-white/20 isolate shadow-[0_16px_40px_-8px_rgba(0,0,0,0.4)] aspect-video select-none transition-all duration-700"
    >
      {/* Main Video Engine */}
      <div className="w-full h-full" onClick={togglePlay}>
        {src ? (
          isEmbed ? (
            <iframe
              ref={iframeRef}
              src={(() => {
                let base = src;
                if (src.includes("/videos/watch/")) base = src.replace("/videos/watch/", "/videos/embed/");
                else if (src.includes("/w/")) base = src.replace("/w/", "/videos/embed/");

                base = base.split("?")[0];
                const params = new URLSearchParams(src.split("?")[1] || "");
                params.set("title", "0");
                params.set("warningTitle", "0");
                params.set("peertubeLink", "0");
                params.set("p2p", "0");
                params.set("logo", "0");
                params.set("autoplay", "1");
                params.set("muted", "1");
                return `${base}?${params.toString()}`;
              })()}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              poster={poster}
              playsInline
              className="w-full h-full object-contain cursor-pointer"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="text-white/40 text-sm font-bold uppercase tracking-[0.2em] animate-pulse">Waiting for Stream...</div>
          </div>
        )}
      </div>

      {/* Play / Pause overlay button */}
      {src && !isEmbed && (
        <div
          onClick={togglePlay}
          className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity duration-300 ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
        >
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <rect x="5" y="3" width="4" height="18" rx="1" />
                <rect x="15" y="3" width="4" height="18" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "2px" }}>
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Branding Tag */}
      {showBranding && (
        <div className="absolute top-3 left-3 md:top-5 md:left-5 z-[60] flex items-center gap-2 pointer-events-none drop-shadow-lg">
          <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-lg">
             <div className="w-4 h-4 bg-white rounded-md flex items-center justify-center transform -rotate-12">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
             </div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-sm tracking-tighter drop-shadow flex items-center gap-1.5">
              VidioCV
              <span className="text-[8px] bg-sky-500/80 px-1.5 py-0.5 rounded-full uppercase tracking-widest font-black">Pro</span>
            </span>
            <span className="text-white/40 text-[8px] uppercase tracking-[0.25em] font-bold">{candidateName}</span>
          </div>
        </div>
      )}
    </div>
  );
}
