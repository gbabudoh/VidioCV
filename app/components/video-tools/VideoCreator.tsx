"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Camera,
  Mic,
  MicOff,
  Trash2,
  Settings,
  FlipHorizontal
} from "lucide-react";
import Modal from "@/app/components/common/Modal";
import type { ImageSegmenter, ImageSegmenterResult } from "@mediapipe/tasks-vision";

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

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl || null);
  
  // Advanced Recording Controls
  const [isMirrored, setIsMirrored] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");
  
  // Virtual Studio States
  const studioPresets = [
    { id: "natural", name: "Natural View", type: "none", color: "from-slate-200 to-slate-300" },
    { id: "office", name: "Executive Suite", type: "image", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1280&q=80" },
    { id: "library", name: "Infinite Library", type: "image", url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1280&q=80" },
    { id: "loft", name: "Modern Loft", type: "image", url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1280&q=80" },
    { id: "tech", name: "Innovation Hub", type: "image", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1280&q=80" },
    { id: "zen", name: "Zen Garden", type: "image", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1280&q=80" },
    { id: "slate", name: "Professional Slate", type: "image", url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1280&q=80" },
    { id: "nebula", name: "Cosmic Future", type: "image", url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1280&q=80" },
    { id: "aura", name: "Vibrant Aura", type: "image", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80" },
    { id: "minimal", name: "Studio Canvas", type: "image", url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1280&q=80" }
  ];

  const [activePreset, setActivePreset] = useState(studioPresets[0]);
  const [studioReady, setStudioReady] = useState(false);
  
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const compositionStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const selfieSegmentationRef = useRef<ImageSegmenter | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const loopActiveRef = useRef(false);
  const isSegmentingRef = useRef(false);

  const requestPermissions = React.useCallback(async () => {
    try {
      // If we already have a stream and are changing devices, stop the old one first
      if (streamRef.current) {
         streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: "user",
          ...(selectedCamera ? { deviceId: { exact: selectedCamera } } : {})
        },
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      setHasPermission(true);
      setError("");

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices);
      
      const cameras = allDevices.filter(d => d.kind === "videoinput");
      const mics = allDevices.filter(d => d.kind === "audioinput");
      
      if (!selectedCamera && cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
      if (!selectedMic && mics.length > 0) setSelectedMic(mics[0].deviceId);

    } catch (err) {
      setError("Camera/microphone access denied. Please allow access to record your video.");
      console.error("Permission error:", err);
    }
  }, [selectedCamera, selectedMic]);

  useEffect(() => {
    // ONLY re-request if we are NOT recording and don't have a final video yet
    if (!videoUrl && !isRecording) {
      requestPermissions();
    }
  }, [videoUrl, requestPermissions, isRecording]);

  // Global cleanup for unmounting
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Handle Background Image Preloading
  useEffect(() => {
    if (activePreset.type === "image" && activePreset.url) {
       const img = new Image();
       img.crossOrigin = "anonymous";
       img.src = activePreset.url;
       
       const handleLoad = () => {
         bgImageRef.current = img;
         setStudioReady(true);
       };

       const handleError = () => {
         bgImageRef.current = null;
         setStudioReady(true);
       };

       img.onload = handleLoad;
       img.onerror = handleError;
       const timeout = setTimeout(() => { if (!studioReady) handleError(); }, 10000);
       return () => clearTimeout(timeout);
    } else {
       bgImageRef.current = null;
       setStudioReady(true);
    }
  }, [activePreset, studioReady]);

  // Branding Overlay Function - Burned into the video
  const drawBranding = React.useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, mirrored: boolean) => {
     const padding = 20;
     const logoWidth = 140;
     const logoHeight = 44;
     
     ctx.save();
     if (mirrored) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
     }
     const x = mirrored ? padding : width - logoWidth - padding;
     const y = padding;

     // Glassmorphism background for logo
     ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
     ctx.beginPath();
     ctx.roundRect(x, y, logoWidth, logoHeight, 12);
     ctx.fill();
     ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
     ctx.stroke();

     const iconPadding = 8;
     const iconSize = 28;
     ctx.fillStyle = "rgba(255, 255, 255, 1)";
     ctx.beginPath();
     ctx.roundRect(x + iconPadding, y + iconPadding, iconSize, iconSize, 6);
     ctx.fill();

     ctx.strokeStyle = "rgba(15, 23, 42, 1)";
     ctx.lineWidth = 2.5;
     ctx.lineCap = "round";
     ctx.lineJoin = "round";
     ctx.beginPath();
     ctx.moveTo(x + iconPadding + 18, y + iconPadding + 8);
     ctx.lineTo(x + iconPadding + 10, y + iconPadding + 14);
     ctx.lineTo(x + iconPadding + 18, y + iconPadding + 20);
     ctx.stroke();

     ctx.font = "black 16px 'Inter', sans-serif";
     ctx.fillStyle = "white";
     ctx.fillText("VidioCV", x + iconPadding + iconSize + 10, y + 28);
     ctx.restore();
  }, []);

  const onAIResults = React.useCallback((results: ImageSegmenterResult) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !videoRef.current) return;

    const video = videoRef.current;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
       canvas.width = video.videoWidth;
       canvas.height = video.videoHeight;
    }

    ctx.save();
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (results.confidenceMasks && results.confidenceMasks.length > 0) {
      const mask = results.confidenceMasks[0];
      const { width, height } = mask;
      const maskData = mask.getAsFloat32Array();
      
      if (!offscreenCanvasRef.current) offscreenCanvasRef.current = document.createElement("canvas");
      const offscreenCanvas = offscreenCanvasRef.current;
      if (offscreenCanvas.width !== width || offscreenCanvas.height !== height) {
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        offscreenCtxRef.current = offscreenCanvas.getContext("2d");
      }
      
      const offCtx = offscreenCtxRef.current;
      if (offCtx) {
         const imgData = offCtx.createImageData(width, height);
         const data32 = new Uint32Array(imgData.data.buffer);
         for (let i = 0; i < maskData.length; i++) {
           const backgroundConfidence = 1.0 - maskData[i];
           const alpha = backgroundConfidence > 0.1 ? Math.floor(backgroundConfidence * 255) : 0;
           data32[i] = (alpha << 24); 
         }
         offCtx.putImageData(imgData, 0, 0);

         if (!tempCanvasRef.current) tempCanvasRef.current = document.createElement("canvas");
         const tempCanvas = tempCanvasRef.current;
         if (tempCanvas.width !== canvas.width || tempCanvas.height !== canvas.height) {
           tempCanvas.width = canvas.width;
           tempCanvas.height = canvas.height;
           tempCtxRef.current = tempCanvas.getContext("2d");
         }
         const tempCtx = tempCtxRef.current;
         if (tempCtx) {
            tempCtx.globalCompositeOperation = "source-over";
            if (bgImageRef.current) {
              tempCtx.drawImage(bgImageRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
            } else {
              tempCtx.fillStyle = "#BFC9D1";
              tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            }
            tempCtx.globalCompositeOperation = "destination-in";
            tempCtx.drawImage(offscreenCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
         }
      }
    }
    drawBranding(ctx, canvas.width, canvas.height, isMirrored);
    ctx.restore();
  }, [isMirrored, drawBranding]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initMediaPipe = async () => {
         try {
           const vision = await import("@mediapipe/tasks-vision");
           const { FilesetResolver, ImageSegmenter } = vision;
           const wasmFileset = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
           const segmenter = await ImageSegmenter.createFromOptions(wasmFileset, {
             baseOptions: {
               modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
               delegate: "GPU"
             },
             runningMode: "VIDEO",
             outputCategoryMask: false,
             outputConfidenceMasks: true
           });
           selfieSegmentationRef.current = segmenter;
         } catch (err) { console.error("Failed to load AI Studio:", err); }
      };
      initMediaPipe();
    }
    return () => { if (selfieSegmentationRef.current) selfieSegmentationRef.current.close(); };
  }, []);

  const lastTimestampRef = useRef<number>(-1);

  useEffect(() => {
    if (hasPermission && videoRef.current) {
      loopActiveRef.current = true;
      const loop = (timestamp: number) => {
        if (!loopActiveRef.current) return;
        const video = videoRef.current;
        if (video && video.readyState >= 2) {
          const segmenter = selfieSegmentationRef.current;
          if (activePreset.id !== "natural" && segmenter && !isSegmentingRef.current) {
            const startTimeMs = Math.max(timestamp, lastTimestampRef.current + 1);
            lastTimestampRef.current = startTimeMs;
            isSegmentingRef.current = true;
            try {
              segmenter.segmentForVideo(video, startTimeMs, (result) => {
                isSegmentingRef.current = false;
                if (loopActiveRef.current) onAIResults(result);
              });
            } catch (err) {
              isSegmentingRef.current = false;
              console.error(err);
            }
          } else if (activePreset.id === "natural") {
            onAIResults({ confidenceMasks: [] } as unknown as ImageSegmenterResult);
          }
        }
        if (loopActiveRef.current) animationFrameRef.current = requestAnimationFrame(loop);
      };
      animationFrameRef.current = requestAnimationFrame(loop);
    } else {
      loopActiveRef.current = false;
    }
    return () => { loopActiveRef.current = false; };
  }, [hasPermission, activePreset, onAIResults]);

  const startRecording = () => {
    if (!streamRef.current) { requestPermissions(); return; }
    try {
      chunksRef.current = [];
      setVideoUrl(null);
      setUploadSuccess(false);
      const options: MediaRecorderOptions = { mimeType: "video/webm;codecs=vp9,opus", videoBitsPerSecond: 2500000 };
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) options.mimeType = "video/webm;codecs=vp8,opus";
      
      let recordStream = streamRef.current;
      if (canvasRef.current) {
         const canvasStream = canvasRef.current.captureStream(30);
         recordStream = new MediaStream([...canvasStream.getVideoTracks(), ...streamRef.current.getAudioTracks()]);
         compositionStreamRef.current = recordStream;
      }

      const mediaRecorder = new MediaRecorder(recordStream, options);
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        if (videoRef.current) videoRef.current.srcObject = null;
        if (timerRef.current) clearInterval(timerRef.current);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev + 1 >= maxDuration) stopRecording();
          return prev + 1;
        });
      }, 1000);
    } catch (err) { setError("Failed to start recording."); console.error(err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setDuration(prev => { if (prev + 1 >= maxDuration) stopRecording(); return prev + 1; });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
      setIsMuted(!isMuted);
    }
  };

  const resetRecording = () => {
    stopRecording();
    setRecordedBlob(null);
    setPreviewUrl("");
    setDuration(0);
    chunksRef.current = [];
    setUploadSuccess(false);
    if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const uploadVideo = async () => {
    if (!recordedBlob) return;
    setIsUploading(true);
    setUploadSuccess(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) { if (confirm("Please log in first.")) window.location.href = "/auth/login"; return; }

      const file = new File([recordedBlob], "video-cv.webm", { type: "video/webm" });
      const formData = new FormData();
      formData.append("video", file);
      formData.append("duration", String(duration));

      const response = await fetch("/api/upload-video", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || "Upload failed");

      setUploadSuccess(true);
      setVideoUrl(data.videoUrl);
      if (onVideoUpload) onVideoUpload(file, data.videoUrl);
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed"); } finally { setIsUploading(false); }
  };

  const handleDelete = async () => {
    setModalConfig({
      isOpen: true, title: "Delete Video CV?", message: "This cannot be undone.", type: "warning",
      onConfirm: async () => {
        try {
          if (videoUrl) {
            await fetch("/api/profile/video/delete", { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } });
          }
          setVideoUrl(null); setRecordedBlob(null); setPreviewUrl(""); setUploadSuccess(false);
          if (onVideoDelete) onVideoDelete();
          requestPermissions();
        } catch (e) { console.error(e); }
      }
    });
  };

  if (videoUrl && !recordedBlob && !isRecording) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 text-center">
        <div className="bg-black rounded-2xl overflow-hidden border border-slate-700 aspect-video relative">
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full h-full object-contain absolute inset-0"
          />
        </div>
        <button onClick={handleDelete} className="text-red-500 font-semibold hover:underline cursor-pointer">
          Delete Video CV &amp; Retake
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="relative bg-black rounded-[32px] overflow-hidden aspect-video border-4 border-white shadow-2xl group">
        <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${activePreset.id !== "natural" ? "hidden" : ""}`} />
        <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-cover bg-black" />
        
        {recordedBlob && <video autoPlay controls className="w-full h-full object-cover absolute inset-0 z-10" src={previewUrl} />}
        
        {isRecording && !isPaused && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-3 py-2 rounded-full shadow-lg z-20">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-black text-[10px] uppercase tracking-widest">RECORDING</span>
          </div>
        )}

        {(isRecording || recordedBlob) && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-lg z-20 border border-white/10 text-white font-mono font-bold">
            {formatTime(duration)} / {formatTime(maxDuration)}
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <div className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/20 text-white text-xl font-black uppercase tracking-widest">PAUSED</div>
          </div>
        )}

        {isRecording && !recordedBlob && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4 z-40 w-full px-8 pointer-events-none">
             <div className="flex items-center gap-3 bg-black/80 backdrop-blur-xl px-5 py-2 rounded-2xl shadow-2xl border border-white/10 pointer-events-auto">
               <button onClick={toggleMute} className={`p-2.5 rounded-xl transition-all cursor-pointer ${isMuted ? "bg-red-500" : "bg-white/10 text-white hover:bg-white/20"}`}>
                 {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
               </button>

               <button 
                 onClick={() => !isRecording && setShowSettings(!showSettings)} 
                 disabled={isRecording}
                 className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                   showSettings 
                     ? "bg-primary-500 text-white" 
                     : isRecording ? "bg-white/5 opacity-50 text-white/40 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20"
                 }`}
                 title={isRecording ? "Settings locked while recording" : "Studio Settings"}
               >
                 <Settings className="h-4 w-4" />
               </button>

               <div className="h-4 w-px bg-white/20 mx-1" />
               
               <div className="flex gap-2 py-1 px-2">
                 {studioPresets.filter(p => p.id === "natural").map((p) => (
                   <button key={p.id} onClick={() => setActivePreset(p)} className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase bg-white text-slate-900 border border-white cursor-pointer">
                     {p.name}
                   </button>
                 ))}
               </div>
             </div>

             {showSettings && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-80 bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl z-50 pointer-events-auto text-white">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Studio Settings</span>
                         <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white cursor-pointer"><RotateCcw className="w-3 h-3 rotate-45" /></button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10 px-4">
                         <div className="flex items-center gap-3">
                            <FlipHorizontal className="w-4 h-4 text-primary-400" />
                            <span className="text-xs font-bold">Mirror Video</span>
                         </div>
                         <button onClick={() => setIsMirrored(!isMirrored)} className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${isMirrored ? "bg-primary-500" : "bg-white/10"}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMirrored ? "left-6" : "left-1"}`} />
                         </button>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase text-white/40 ml-1">Camera input</label>
                         <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
                            {devices.filter(d => d.kind === "videoinput").map(d => (
                               <button key={d.deviceId} onClick={() => setSelectedCamera(d.deviceId)} className={`w-full flex items-center gap-3 p-3 rounded-xl border text-[10px] font-bold text-left cursor-pointer transition-all ${selectedCamera === d.deviceId ? "bg-primary-500/20 border-primary-500/40" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"}`}>
                                  <Camera className="w-3.5 h-3.5" /> <span className="truncate">{d.label || "Camera"}</span>
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase text-white/40 ml-1">Microphone input</label>
                         <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
                            {devices.filter(d => d.kind === "audioinput").map(d => (
                               <button key={d.deviceId} onClick={() => setSelectedMic(d.deviceId)} className={`w-full flex items-center gap-3 p-3 rounded-xl border text-[10px] font-bold text-left cursor-pointer transition-all ${selectedMic === d.deviceId ? "bg-primary-500/20 border-primary-500/40" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"}`}>
                                  <Mic className="w-3.5 h-3.5" /> <span className="truncate">{d.label || "Mic"}</span>
                                </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        {!recordedBlob ? (
          !isRecording ? (
            <button onClick={startRecording} className="flex items-center gap-3 px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xl shadow-2xl transition-all transform hover:scale-105 uppercase tracking-widest cursor-pointer">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              Start Studio Recording
            </button>
          ) : (
            <div className="flex gap-4">
              <button onClick={pauseRecording} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl cursor-pointer">
                {isPaused ? <Play className="w-5 h-5 mr-2 inline" /> : <Pause className="w-5 h-5 mr-2 inline" />}
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button onClick={stopRecording} className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95">
                <Square className="h-5 w-5 fill-white" />
                Finish
              </button>
            </div>
          )
        ) : (
          <div className="w-full space-y-4">
             <div className="flex items-center justify-center gap-4">
                <button onClick={resetRecording} className="flex items-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all cursor-pointer"><RotateCcw className="h-5 w-5" /> Retake</button>
             </div>
             <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] p-8 border border-white/20 dark:border-slate-800 shadow-2xl text-center">
                <p className="text-slate-900 dark:text-white mb-6 font-black uppercase tracking-[0.2em]">{uploadSuccess ? "✨ Recording Successfully Uploaded" : "Recording Completed. Preview Below."}</p>
                {error && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                    <p className="text-red-500 text-xs font-bold">{error}</p>
                  </div>
                )}
                {!uploadSuccess && (
                  <button onClick={uploadVideo} disabled={isUploading} className="w-full flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] mb-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Upload className="w-5 h-5" /> {isUploading ? "Uploading Recording..." : "Upload Video CV"}
                  </button>
                )}
                <button onClick={handleDelete} className="flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-widest cursor-pointer group">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Recording
                </button>
              </div>
          </div>
        )}
      </div>

      {!isRecording && !recordedBlob && (
        <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/50 rounded-[32px] p-8">
          <h4 className="font-black text-primary-900 dark:text-primary-100 mb-6 flex items-center gap-3 uppercase tracking-widest text-sm"><Camera className="h-5 w-5" /> Studio Recording Tips</h4>
          <ul className="text-sm font-medium text-primary-800/80 dark:text-primary-200/60 space-y-3">
             <li className="flex items-start gap-4"><div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5" /><span>Ensure good lighting for the best Studio quality results.</span></li>
             <li className="flex items-start gap-4"><div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5" /><span>Eye-level camera alignment creates natural authority.</span></li>
          </ul>
        </div>
      )}

      <Modal 
        isOpen={modalConfig.isOpen} 
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
        title={modalConfig.title} 
        type={modalConfig.type} 
        primaryAction={modalConfig.onConfirm ? { label: "Confirm", onClick: () => { modalConfig.onConfirm?.(); setModalConfig({ ...modalConfig, isOpen: false }); } } : undefined} 
        closeActionLabel="Cancel"
      >
        <div className="py-2 text-slate-500 font-medium">{modalConfig.message}</div>
      </Modal>
    </div>
  );
}
