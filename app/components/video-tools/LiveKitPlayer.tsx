"use client";

import React, { useState, useRef, useEffect } from "react";
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
      className="relative group bg-slate-950 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] aspect-video select-none"
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
      </div>      {/* Glassmorphic Branding Tag */}
      {showBranding && (
        <div className="absolute top-8 left-8 z-[60] flex items-center gap-4 pointer-events-none drop-shadow-2xl translate-y-0 opacity-100 transition-all duration-700">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 shadow-2xl">
             <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-lg transform -rotate-12">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
             </div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-[Inter] font-black text-2xl tracking-tighter drop-shadow-xl flex items-center gap-2">
              VidioCV 
              <span className="text-[10px] bg-sky-500/80 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Pro</span>
            </span>
            <span className="text-white/40 text-[9px] uppercase tracking-[0.3em] font-black">{candidateName} Cinematic Hub</span>
          </div>
        </div>
      )}
    </div>
  );
}
