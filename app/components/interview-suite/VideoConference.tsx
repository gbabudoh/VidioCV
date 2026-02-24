"use client";

import React, { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Phone, Share2 } from "lucide-react";
import Button from "../common/Button";

interface VideoConferenceProps {
  interviewId: string;
  candidateName: string;
  onEndCall?: () => void;
}

export default function VideoConference({
  interviewId,
  candidateName,
  onEndCall,
}: VideoConferenceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        {/* Remote Video */}
        <div className="bg-slate-900 rounded-lg overflow-hidden relative">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mx-auto mb-4" />
              <p className="text-white font-medium">{candidateName}</p>
            </div>
          </div>
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
            Candidate
          </div>
        </div>

        {/* Local Video */}
        <div className="bg-slate-900 rounded-lg overflow-hidden relative">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full mx-auto mb-4" />
              <p className="text-white font-medium">You</p>
            </div>
          </div>
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex justify-center items-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition ${
            isMuted
              ? "bg-red-600 hover:bg-red-700"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`p-4 rounded-full transition ${
            !isVideoOn
              ? "bg-red-600 hover:bg-red-700"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          {isVideoOn ? (
            <Video className="w-6 h-6 text-white" />
          ) : (
            <VideoOff className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`p-4 rounded-full transition ${
            isScreenSharing
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          <Share2 className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
        >
          <Phone className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
