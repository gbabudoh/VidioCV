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
  FlipHorizontal,
  Wifi,
  WifiOff,
  Sun,
  Volume2,
  VolumeX,
  RefreshCw,
  Sliders
} from "lucide-react";
import { 
  Room, 
  RoomEvent, 
  VideoPresets, 
  createLocalVideoTrack,
  createLocalAudioTrack
} from "livekit-client";
import Modal from "@/app/components/common/Modal";
import LiveKitPlayer from "@/app/components/video-tools/LiveKitPlayer";
import type { ImageSegmenter, ImageSegmenterResult } from "@mediapipe/tasks-vision";

interface VideoCreatorProps {
  onVideoUpload?: (file: File, url?: string, streamingUrl?: string) => void;
  initialVideoUrl?: string;
  onVideoDelete?: () => void;
  maxDuration?: number;
}

export default function VideoCreator({ 
  onVideoUpload, 
  initialVideoUrl, 
  onVideoDelete,
  maxDuration = 90
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
  
  // LiveKit States
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<string>("excellent");
  
  // Advanced Recording Controls
  const [isMirrored, setIsMirrored] = useState(true);
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
  const [recordedMimeType, setRecordedMimeType] = useState<string>("");

  const getSupportedMimeType = () => {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/mp4;codecs=h264,aac",
      "video/mp4",
      "video/webm",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  };
  
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const vuRafRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Recording controls
  const [brightness, setBrightness] = useState(100);
  const [micVolume, setMicVolume] = useState(100);
  const [activeFilter, setActiveFilter] = useState("none");
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [activeControlTab, setActiveControlTab] = useState<"brightness" | "volume" | "filters" | "settings">("brightness");

  const FILTERS: { id: string; label: string; css: string }[] = [
    { id: "none",       label: "None",        css: "" },
    { id: "vivid",      label: "Vivid",       css: "saturate(1.6) contrast(1.1)" },
    { id: "cool",       label: "Cool",        css: "hue-rotate(20deg) saturate(1.2)" },
    { id: "warm",       label: "Warm",        css: "sepia(0.3) saturate(1.4)" },
    { id: "cinematic",  label: "Cinematic",   css: "contrast(1.2) saturate(0.85) brightness(0.95)" },
    { id: "bw",         label: "B&W",         css: "grayscale(1) contrast(1.1)" },
    { id: "soft",       label: "Soft",        css: "brightness(1.05) blur(0.4px) saturate(0.9)" },
  ];

  const connectToRoom = React.useCallback(async () => {
    if (isConnecting || room) return;
    setIsConnecting(true);
    try {
      const resp = await fetch("/api/livekit-token?room=vidiocv-studio");
      const data = await resp.json();

      const r = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
      });

      r.on(RoomEvent.ConnectionQualityChanged, (quality) => {
        setConnectionQuality(quality.toString());
      });

      r.on(RoomEvent.Disconnected, () => {
        setRoom(null);
      });

      await r.connect(data.url, data.token);
      setRoom(r);
      console.log("Connected to LiveKit room:", r.name);
    } catch (e) {
      console.error("Failed to connect to LiveKit:", e);
      setError("Failed to connect to professional recording studio.");
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, room]);

  const requestPermissions = React.useCallback(async () => {
    try {
      // If we don't have a room yet, connect first
      if (!room) {
        await connectToRoom();
      }

      // If we already have a stream and are changing devices, stop the old one first
      if (streamRef.current) {
         streamRef.current.getTracks().forEach(track => track.stop());
      }

      const videoTrack = await createLocalVideoTrack({
        facingMode: "user",
        resolution: VideoPresets.h720.resolution,
        deviceId: selectedCamera || undefined,
      });

      const audioTrack = await createLocalAudioTrack({
        deviceId: selectedMic || undefined,
      });

      const stream = new MediaStream([videoTrack.mediaStreamTrack, audioTrack.mediaStreamTrack]);
      streamRef.current = stream;

      if (videoRef.current) videoRef.current.srcObject = stream;

      // Start audio level analyser + gain node for mic volume control
      if (vuRafRef.current) cancelAnimationFrame(vuRafRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const gain = ctx.createGain();
      gain.gain.value = micVolume / 100;
      gainNodeRef.current = gain;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(gain);
      gain.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, (avg / 128) * 100));
        vuRafRef.current = requestAnimationFrame(tick);
      };
      vuRafRef.current = requestAnimationFrame(tick);

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
  }, [selectedCamera, selectedMic, room, connectToRoom, micVolume]);

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
      if (vuRafRef.current) cancelAnimationFrame(vuRafRef.current);
      if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const drawBranding = React.useCallback((ctx: CanvasRenderingContext2D, width: number, _height: number, mirrored: boolean) => {
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
    const video = videoRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !video || !ctx) return;

    // Only draw if video has valid dimensions to avoid blank frames
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

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
           const wasmFileset = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm");
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

  const startRecording = async () => {
    try {
      // If no stream or stream is inactive, try to re-acquire it
      if (!streamRef.current || !streamRef.current.active || streamRef.current.getTracks().length === 0) {
        await requestPermissions();
      }

      if (!streamRef.current || !streamRef.current.active) {
        setError("Camera stream is inactive. Please ensure your camera is connected.");
        return;
      }

      chunksRef.current = [];
      setVideoUrl(null);
      setUploadSuccess(false);
      const mimeType = getSupportedMimeType();
      setRecordedMimeType(mimeType);
      const options: MediaRecorderOptions = {
        mimeType: mimeType || undefined,
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000,
      };
      
      let recordStream = streamRef.current;
      // Only use canvas capture for virtual backgrounds — natural preset records directly
      // from the camera stream to avoid black frames from canvas readyState issues
      if (canvasRef.current && activePreset.id !== "natural") {
         const canvasStream = canvasRef.current.captureStream(30);
         // Ensure we have audio tracks from original stream
         const audioTracks = streamRef.current.getAudioTracks();
         recordStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
         compositionStreamRef.current = recordStream;
      }

      if (!recordStream.active) {
        throw new Error("Recording stream is inactive after initialization.");
      }

      const mediaRecorder = new MediaRecorder(recordStream, options);
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const finalMimeType = mediaRecorder.mimeType || recordedMimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type: finalMimeType });
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

  const handleMicVolume = (val: number) => {
    setMicVolume(val);
    if (gainNodeRef.current) gainNodeRef.current.gain.value = val / 100;
  };

  const restartRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordedBlob(null);
      setPreviewUrl("");
      setDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    // brief delay so stop fires before restart
    setTimeout(() => startRecording(), 150);
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

      const blobType = recordedBlob.type;
      const isMp4 = blobType.includes("mp4");
      const extension = isMp4 ? "mp4" : "webm";
      const file = new File([recordedBlob], `video-cv.${extension}`, { type: blobType });
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
      setVideoUrl(data.streamingUrl || data.videoUrl);
      if (onVideoUpload) onVideoUpload(file, data.videoUrl, data.streamingUrl);
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
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <LiveKitPlayer src={videoUrl} showBranding={false} />
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-400">Your current Video CV. Re-record to replace it.</p>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete &amp; Retake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="relative bg-black rounded-none md:rounded-[32px] overflow-hidden aspect-video border-y-4 md:border-4 border-white shadow-2xl group">
        <video
          ref={videoRef}
          autoPlay muted playsInline
          className={`w-full h-full object-cover ${activePreset.id !== "natural" ? "hidden" : ""}`}
          style={{ filter: `brightness(${brightness}%) ${FILTERS.find(f => f.id === activeFilter)?.css || ""}` }}
        />
        <canvas
          ref={canvasRef}
          width={1280} height={720}
          className={`w-full h-full object-cover bg-black ${activePreset.id === "natural" ? "hidden" : ""}`}
          style={{ filter: `brightness(${brightness}%) ${FILTERS.find(f => f.id === activeFilter)?.css || ""}` }}
        />
        
        {recordedBlob && previewUrl && (
          <div className="absolute inset-0 z-50 bg-black">
            <video
              src={previewUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        {isRecording && !isPaused && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-3 py-2 rounded-full shadow-lg z-20 pointer-events-none">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-black text-[10px] uppercase tracking-widest">RECORDING</span>
          </div>
        )}

        {/* LiveKit Connection Status */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 z-20 transition-all pointer-events-none">
          {room ? (
            <>
              <Wifi className={`w-3 h-3 ${connectionQuality === "excellent" ? "text-green-400" : "text-yellow-400"}`} />
              <span className="text-white font-bold text-[9px] uppercase tracking-tight">Studio Connected</span>
            </>
          ) : isConnecting ? (
            <>
              <div className="w-2 h-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white/60 font-bold text-[9px] uppercase tracking-tight">Connecting Studio...</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-400" />
              <span className="text-red-400 font-bold text-[9px] uppercase tracking-tight">Studio Offline</span>
            </>
          )}
        </div>

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
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-40 w-full px-4 pointer-events-none">

            {/* Expandable control panel */}
            {showControlPanel && (
              <div className="pointer-events-auto w-full max-w-sm bg-black/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                  {([
                    { id: "brightness", icon: <Sun className="w-3.5 h-3.5" />, label: "Brightness" },
                    { id: "volume",     icon: <Volume2 className="w-3.5 h-3.5" />, label: "Volume" },
                    { id: "filters",    icon: <Sliders className="w-3.5 h-3.5" />, label: "Filters" },
                    { id: "settings",   icon: <Settings className="w-3.5 h-3.5" />, label: "Settings" },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveControlTab(tab.id)}
                      className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${activeControlTab === tab.id ? "text-[#F7B980] border-b-2 border-[#F7B980]" : "text-white/40 hover:text-white/70"}`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Panel content */}
                <div className="p-4">
                  {activeControlTab === "brightness" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs font-bold flex items-center gap-2"><Sun className="w-3.5 h-3.5 text-yellow-400" /> Brightness</span>
                        <span className="text-white font-mono text-xs font-bold">{brightness}%</span>
                      </div>
                      <input type="range" min={40} max={180} value={brightness}
                        onChange={e => setBrightness(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: "#F7B980" }}
                      />
                      <div className="flex justify-between text-[9px] text-white/30 font-bold uppercase">
                        <span>Dark</span><span>Normal</span><span>Bright</span>
                      </div>
                    </div>
                  )}

                  {activeControlTab === "volume" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-xs font-bold flex items-center gap-2">
                            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-green-400" />}
                            Mic Volume
                          </span>
                          <span className="text-white font-mono text-xs font-bold">{micVolume}%</span>
                        </div>
                        <input type="range" min={0} max={200} value={micVolume}
                          onChange={e => handleMicVolume(Number(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{ accentColor: "#4ade80" }}
                        />
                      </div>
                      {/* VU meter */}
                      <div className="flex items-end justify-center gap-[3px] h-8 bg-white/5 rounded-xl px-3 py-2">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const threshold = (i + 1) * 6.25;
                          const active = !isMuted && audioLevel >= threshold;
                          return (
                            <div key={i} className="flex-1 rounded-full transition-all duration-75"
                              style={{
                                height: `${30 + i * 4.5}%`,
                                background: active ? (i < 10 ? "#4ade80" : i < 14 ? "#facc15" : "#f87171") : "rgba(255,255,255,0.1)",
                              }}
                            />
                          );
                        })}
                      </div>
                      <button onClick={toggleMute}
                        className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${isMuted ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"}`}>
                        {isMuted ? "Unmute Microphone" : "Mute Microphone"}
                      </button>
                    </div>
                  )}

                  {activeControlTab === "filters" && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-black uppercase text-white/30">Color Filter</p>
                      <div className="grid grid-cols-4 gap-2">
                        {FILTERS.map(f => (
                          <button key={f.id} onClick={() => setActiveFilter(f.id)}
                            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all border ${activeFilter === f.id ? "bg-[#F7B980]/20 border-[#F7B980]/50 text-[#F7B980]" : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"}`}>
                            {f.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] font-black uppercase text-white/30 pt-1">Background</p>
                      <div className="grid grid-cols-3 gap-1.5 max-h-28 overflow-y-auto">
                        {studioPresets.map(p => (
                          <button key={p.id} onClick={() => setActivePreset(p)}
                            className={`py-1.5 px-2 rounded-lg text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all border truncate ${activePreset.id === p.id ? "bg-[#F7B980]/20 border-[#F7B980]/50 text-[#F7B980]" : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"}`}>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeControlTab === "settings" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 text-white text-xs font-bold">
                          <FlipHorizontal className="w-3.5 h-3.5 text-[#F7B980]" /> Mirror Video
                        </div>
                        <button onClick={() => setIsMirrored(!isMirrored)} className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${isMirrored ? "bg-[#F7B980]" : "bg-white/10"}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMirrored ? "left-5" : "left-1"}`} />
                        </button>
                      </div>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        <p className="text-[9px] font-black uppercase text-white/30 mb-1">Camera</p>
                        {devices.filter(d => d.kind === "videoinput").map(d => (
                          <button key={d.deviceId} onClick={() => setSelectedCamera(d.deviceId)}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-[10px] font-bold text-left cursor-pointer transition-all ${selectedCamera === d.deviceId ? "bg-[#F7B980]/20 text-[#F7B980]" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                            <Camera className="w-3 h-3 shrink-0" /><span className="truncate">{d.label || "Camera"}</span>
                          </button>
                        ))}
                        <p className="text-[9px] font-black uppercase text-white/30 mt-2 mb-1">Microphone</p>
                        {devices.filter(d => d.kind === "audioinput").map(d => (
                          <button key={d.deviceId} onClick={() => setSelectedMic(d.deviceId)}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-[10px] font-bold text-left cursor-pointer transition-all ${selectedMic === d.deviceId ? "bg-[#F7B980]/20 text-[#F7B980]" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                            <Mic className="w-3 h-3 shrink-0" /><span className="truncate">{d.label || "Mic"}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main toolbar */}
            <div className="pointer-events-auto flex items-center gap-2 bg-black/85 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10">
              {/* Mic mute */}
              <button onClick={toggleMute} title={isMuted ? "Unmute" : "Mute mic"}
                className={`p-2 md:p-2.5 rounded-xl transition-all cursor-pointer ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>
                {isMuted ? <MicOff className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Mic className="h-3.5 w-3.5 md:h-4 md:w-4" />}
              </button>

              {/* Mini VU meter */}
              <div className="flex items-end gap-[2px] h-5">
                {Array.from({ length: 8 }).map((_, i) => {
                  const active = !isMuted && audioLevel >= (i + 1) * 12.5;
                  return (
                    <div key={i} className="w-1 rounded-full transition-all duration-75"
                      style={{
                        height: `${40 + i * 8}%`,
                        background: active ? (i < 5 ? "#4ade80" : i < 7 ? "#facc15" : "#f87171") : "rgba(255,255,255,0.15)",
                      }}
                    />
                  );
                })}
              </div>

              <div className="h-4 w-px bg-white/15 mx-1" />

              {/* Brightness shortcut */}
              <button onClick={() => { setActiveControlTab("brightness"); setShowControlPanel(p => activeControlTab === "brightness" ? !p : true); }}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${showControlPanel && activeControlTab === "brightness" ? "bg-yellow-500/30 text-yellow-300" : "bg-white/10 text-white hover:bg-white/20"}`}
                title="Brightness">
                <Sun className="h-4 w-4" />
              </button>

              {/* Volume shortcut */}
              <button onClick={() => { setActiveControlTab("volume"); setShowControlPanel(p => activeControlTab === "volume" ? !p : true); }}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${showControlPanel && activeControlTab === "volume" ? "bg-green-500/30 text-green-300" : "bg-white/10 text-white hover:bg-white/20"}`}
                title="Mic Volume">
                <Volume2 className="h-4 w-4" />
              </button>

              {/* Filters shortcut */}
              <button onClick={() => { setActiveControlTab("filters"); setShowControlPanel(p => activeControlTab === "filters" ? !p : true); }}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${showControlPanel && activeControlTab === "filters" ? "bg-[#F7B980]/30 text-[#F7B980]" : activeFilter !== "none" ? "bg-[#F7B980]/20 text-[#F7B980]" : "bg-white/10 text-white hover:bg-white/20"}`}
                title="Filters">
                <Sliders className="h-4 w-4" />
              </button>

              {/* Settings shortcut */}
              <button onClick={() => { setActiveControlTab("settings"); setShowControlPanel(p => activeControlTab === "settings" ? !p : true); }}
                className={`p-2 md:p-2.5 rounded-xl transition-all cursor-pointer ${showControlPanel && activeControlTab === "settings" ? "bg-white/20 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                title="Settings">
                <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>

              <div className="h-4 w-px bg-white/15 mx-1" />

              {/* Restart */}
              <button onClick={restartRecording} title="Restart recording"
                className="p-2 md:p-2.5 rounded-xl bg-white/10 text-white hover:bg-orange-500/30 hover:text-orange-300 transition-all cursor-pointer">
                <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>

              {/* Stop */}
              <button onClick={stopRecording} title="Stop recording"
                className="p-2 md:p-2.5 rounded-xl bg-red-500/80 text-white hover:bg-red-500 transition-all cursor-pointer">
                <Square className="h-3.5 w-3.5 md:h-4 md:w-4 fill-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        {!recordedBlob ? (
          !isRecording ? (
            <button onClick={startRecording} className="flex items-center gap-3 px-6 py-4 md:px-10 md:py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-base md:text-xl shadow-2xl transition-all transform hover:scale-105 uppercase tracking-widest cursor-pointer">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-pulse" />
              Start Studio Recording
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={pauseRecording} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl cursor-pointer hover:bg-slate-100 transition-all">
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? "Resume" : "Pause"}
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
