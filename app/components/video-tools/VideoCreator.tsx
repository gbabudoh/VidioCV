"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Video,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Trash2
} from "lucide-react";
import Modal from "@/app/components/common/Modal";
import { getPeerTubeEmbedUrl } from "@/app/lib/video";

interface VideoCreatorProps {
  onVideoUpload?: (file: File, url?: string) => void;
  initialVideoUrl?: string;
  onVideoDelete?: () => void;
  maxDuration?: number;
}

export default function VideoCreator({ 
  onVideoUpload, 
  initialVideoUrl, 
  onVideoDelete,
  maxDuration = 300
}: VideoCreatorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl || null);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error" | "default";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoUrl) {
      requestPermissions();
    }
    return () => {
      stopStream();
    };
  }, [videoUrl]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: "user"
        },
        audio: true // Simplify audio constraint to let the browser pick the best available defaults
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setError("");
    } catch (err) {
      setError("Camera/microphone access denied. Please allow access to record your video.");
      console.error("Permission error:", err);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      requestPermissions();
      return;
    }

    try {
      chunksRef.current = [];
      setVideoUrl(null);
      setUploadSuccess(false);
      
      const options: MediaRecorderOptions = {
        mimeType: "video/webm;codecs=vp9,opus",
        videoBitsPerSecond: 2500000
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = "video/webm;codecs=vp8,opus";
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        
        // Clear srcObject so the blob URL in src attribute takes effect for preview
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (err) {
      setError("Failed to start recording. Please try again.");
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        
        timerRef.current = setInterval(() => {
          setDuration(prev => {
            const newDuration = prev + 1;
            if (newDuration >= maxDuration) {
              stopRecording();
            }
            return newDuration;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const resetRecording = () => {
    stopRecording();
    setRecordedBlob(null);
    setPreviewUrl("");
    setDuration(0);
    chunksRef.current = [];
    setUploadSuccess(false);
    
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  };

  const stopStream = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const uploadVideo = async () => {
    if (!recordedBlob) return;
    
    setIsUploading(true);
    setError("");
    setUploadSuccess(false);

    try {
      const file = new File([recordedBlob], "video-cv.webm", { type: "video/webm" });

      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", "Candidate Video CV");
      formData.append("description", `Duration: ${duration}s`);

      const token = localStorage.getItem("token");
      if (!token) {
        // Try to redirect to login instead of just showing error
        const shouldRedirect = confirm("You need to be logged in to upload. Go to login page?");
        if (shouldRedirect) {
          window.location.href = "/auth/login";
        }
        throw new Error("No authentication token found. Please log in first.");
      }

      const response = await fetch("/api/upload-to-vidiocv", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || "Upload failed");
      }

      setUploadSuccess(true);
      setVideoUrl(data.embedUrl);
      if (onVideoUpload) {
        onVideoUpload(file, data.embedUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setModalConfig({
      isOpen: true,
      title: "Delete Video CV?",
      message: "Are you sure you want to delete your Video CV? This cannot be undone.",
      type: "warning",
      onConfirm: async () => {
        try {
          if (videoUrl) {
            const response = await fetch("/api/profile/video/delete", { 
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              }
            });
            
            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || data.details || "Failed to delete from server");
            }
          }
          
          setVideoUrl(null);
          setRecordedBlob(null);
          setPreviewUrl("");
          setUploadSuccess(false);
          if (onVideoDelete) onVideoDelete();
          requestPermissions();
          
          setModalConfig({
            isOpen: true,
            title: "Success",
            message: "Your Video CV has been deleted successfully.",
            type: "success"
          });
        } catch (error) {
          console.error("Deletion error:", error);
          setModalConfig({
            isOpen: true,
            title: "Error",
            message: error instanceof Error ? error.message : "Failed to delete video from server. Please try again.",
            type: "error"
          });
        }
      }
    });
  };

  if (videoUrl && !recordedBlob && !isRecording) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative w-full aspect-video bg-black flex flex-col justify-center">
          <iframe
             src={getPeerTubeEmbedUrl(videoUrl) || ""}
             allowFullScreen
             sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
             className="w-full h-full border-0 absolute inset-0"
             title="Video CV"
          />
        </div>
        <div className="bg-white/5 dark:bg-secondary-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-secondary-800 shadow-xl shadow-black/10">
           <button 
             onClick={handleDelete}
             className="w-full flex items-center justify-center gap-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300 font-semibold transition-colors cursor-pointer"
           >
              Delete Video CV & Retake
           </button>
        </div>
      </div>
    );
  }

  if (!hasPermission && !error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-secondary-50 dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800">
        <Camera className="h-16 w-16 text-secondary-400 mb-4 animate-pulse" />
        <p className="text-secondary-600 dark:text-secondary-400 mb-4">
          Requesting camera and microphone access...
        </p>
      </div>
    );
  }

  if (error && !recordedBlob && !isRecording) {
    return (
      <div className="p-6 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-center">
        <p className="text-error-700 dark:text-error-400 mb-4">{error}</p>
        <button
          onClick={requestPermissions}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors cursor-pointer"
        >
          Grant Permissions
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video border border-slate-700">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          controls={!!recordedBlob}
          className="w-full h-full object-cover"
          src={previewUrl || undefined}
        />
        
        {isRecording && !isPaused && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-error-600 px-3 py-2 rounded-full shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-semibold text-sm">RECORDING</span>
          </div>
        )}

        {(isRecording || recordedBlob) && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-4 py-2 rounded-full shadow-lg">
            <span className="text-white font-mono text-lg font-bold">
              {formatTime(duration)}
            </span>
            <span className="text-secondary-400 text-sm ml-2">
              / {formatTime(maxDuration)}
            </span>
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white/20 backdrop-blur px-8 py-4 rounded-lg">
              <Pause className="h-12 w-12 text-white mx-auto mb-2" />
              <div className="text-white text-xl font-bold">PAUSED</div>
            </div>
          </div>
        )}

        {isVideoOff && !recordedBlob && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary-900">
            <div className="text-center">
              <VideoOff className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-400">Camera is off</p>
            </div>
          </div>
        )}

        {isRecording && !recordedBlob && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur px-6 py-3 rounded-full shadow-lg transition-all">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-colors cursor-pointer ${
                isMuted 
                  ? "bg-error-600 hover:bg-error-700" 
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5 text-white" />
              ) : (
                <Mic className="h-5 w-5 text-white" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors cursor-pointer ${
                isVideoOff 
                  ? "bg-error-600 hover:bg-error-700" 
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? (
                <VideoOff className="h-5 w-5 text-white" />
              ) : (
                <Video className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        {!recordedBlob ? (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white dark:text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
              >
                <div className="w-4 h-4 bg-error-500 rounded-full flex-shrink-0 animate-pulse" />
                Start Recording
              </button>
            ) : (
              <>
                <button
                  onClick={pauseRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-lg transition-all cursor-pointer"
                >
                  {isPaused ? (
                    <><Play className="h-5 w-5" /> Resume</>
                  ) : (
                    <><Pause className="h-5 w-5" /> Pause</>
                  )}
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg font-medium shadow-lg transition-all cursor-pointer"
                >
                  <Square className="h-5 w-5" />
                  Stop
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full">
             <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
                <button
                  onClick={resetRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg font-medium shadow-lg transition-all cursor-pointer"
                >
                  <RotateCcw className="h-5 w-5" />
                  Re-record
                </button>
             </div>

             <div className="bg-white/5 dark:bg-secondary-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-secondary-800 shadow-xl shadow-black/10">
                <p className="text-secondary-900 dark:text-white mb-4 font-semibold text-center">
                  {uploadSuccess
                    ? "✅ Video Curriculum Vitae Successfully Uploaded!"
                    : "Recording saved. You can watch the preview above, or upload it now."}
                </p>
                
                {error && (
                   <div className="mb-4 text-center">
                     <p className="text-error-500 text-sm mb-2">{error}</p>
                     <button 
                       onClick={() => {
                         window.location.href = "/auth/login";
                       }}
                       className="text-xs text-primary-600 hover:underline cursor-pointer"
                     >
                       Go to login page
                     </button>
                   </div>
                )}

                {!uploadSuccess && (
                  <button 
                    onClick={uploadVideo} 
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-primary-500/30 cursor-pointer mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-5 h-5" />
                    {isUploading ? "Uploading to secure server..." : "Upload Video CV"}
                  </button>
                )}

                 <button 
                   onClick={handleDelete}
                   className="w-full flex items-center justify-center gap-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300 font-semibold py-3 transition-colors cursor-pointer"
                 >
                    <Trash2 className="w-5 h-5" /> Trash & Retake
                 </button>
              </div>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatTime(duration)}
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatTime(maxDuration - duration)}
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400">Remaining</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isPaused ? "text-warning-600 dark:text-warning-400" : "text-success-600 dark:text-success-400"
            }`}>
              {isPaused ? "PAUSED" : "LIVE"}
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-400">Status</div>
          </div>
        </div>
      )}

      {!isRecording && !recordedBlob && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
          <h4 className="font-bold text-primary-900 dark:text-primary-100 mb-3 flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Recording Tips
          </h4>
          <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span>Find a quiet location with good lighting (natural light works best)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span>Position the camera at eye level and look directly at it</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span>Keep your recording concise (2-3 minutes is ideal)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span>Introduce yourself, highlight key skills, and explain why you&apos;re a great fit</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600">•</span>
              <span>Smile and be confident - you&apos;ve got this! 😊</span>
            </li>
          </ul>
        </div>
      )}

      {/* Nice Popup Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        type={modalConfig.type}
        primaryAction={modalConfig.onConfirm ? {
          label: modalConfig.title?.includes("Delete") ? "Delete Permanently" : "Confirm",
          onClick: () => {
            modalConfig.onConfirm?.();
            setModalConfig({ ...modalConfig, isOpen: false });
          }
        } : undefined}
        closeActionLabel={modalConfig.onConfirm ? "Cancel" : "Close"}
      >
        <div className="py-2">
          {modalConfig.message}
        </div>
      </Modal>
    </div>
  );
}
