"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  Circle,
  User
} from "lucide-react";

interface LiveKitPlayerProps {
  src: string;
  poster?: string;
  candidateName?: string;
  autoPlay?: boolean;
}

export default function LiveKitPlayer({ 
  src, 
  poster, 
  candidateName = "Candidate", 
  autoPlay = false 
}: LiveKitPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (Number(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative group bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Main Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top HUD Overlay - LiveKit Style */}
      <div className={`absolute top-4 left-4 right-4 flex justify-between items-start transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-bold tracking-tight uppercase opacity-60">Candidate</span>
            <span className="text-white text-sm font-semibold leading-tight">{candidateName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-red-600/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-red-500/30">
          <Circle className="w-2 h-2 fill-red-500 text-red-500 animate-pulse" />
          <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Recorded Session</span>
        </div>
      </div>

      {/* Center Play Button Overlay (Show on pause) */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] cursor-pointer group"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-2xl">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Bottom Controls Bar - Glassmorphism */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500 transform ${showControls ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}>
        
        {/* Customized Seek Bar */}
        <div className="relative mb-6 group/progress">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-indigo-500 relative z-10 hover:h-2 transition-all"
          />
          <div 
            className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full pointer-events-none group-hover/progress:h-2 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={togglePlay}
              className="text-white hover:text-indigo-400 transition-colors drop-shadow-lg"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>

            <div className="flex items-center gap-3 group/volume">
              <button 
                onClick={toggleMute}
                className="text-white hover:text-indigo-400 transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  if (videoRef.current) videoRef.current.volume = val;
                  setIsMuted(val === 0);
                }}
                className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/20 rounded-full appearance-none accent-indigo-500 opacity-0 group-hover/volume:opacity-100"
              />
            </div>

            <div className="text-white/80 font-mono text-sm tracking-wider">
              <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
              <span className="mx-2 opacity-30">/</span>
              <span className="opacity-60">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group">
              <Settings className="w-5 h-5 text-white/60 group-hover:text-white group-hover:rotate-45 transition-all duration-500" />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white/60 group-hover:text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white/60 group-hover:text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Styles for custom range slider reset */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 0;
          width: 0;
          box-shadow: -100vw 0 0 100vw transparent;
        }
        input[type="range"]::-moz-range-thumb {
          appearance: none;
          height: 0;
          width: 0;
          border: none;
        }
      `}</style>
    </div>
  );
}
