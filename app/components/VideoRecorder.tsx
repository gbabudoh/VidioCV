"use client";

import { useState, useRef, useEffect } from "react";
import {
  Video,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Camera,
} from "lucide-react";

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  maxDuration?: number; // in seconds
}

export default function VideoRecorder({
  onRecordingComplete,
  maxDuration = 300, // 5 minutes default
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [hasPermission, setHasPermission] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setError("");
    } catch (err) {
      setError(
        "Camera/microphone access denied. Please allow access to record your video.",
      );
      console.error("Permission error:", err);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Request camera/mic permission on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      requestPermissions();
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      stopStream();
    };
  }, []);

  const startRecording = () => {
    if (!streamRef.current) {
      requestPermissions();
      return;
    }

    try {
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp9,opus",
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

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

        onRecordingComplete(blob, duration);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
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
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const resetRecording = () => {
    stopRecording();
    setRecordedBlob(null);
    setPreviewUrl("");
    setDuration(0);
    chunksRef.current = [];

    // Restart stream
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!hasPermission && !error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
        <Camera className="h-16 w-16 text-secondary-400 mb-4" />
        <p className="text-secondary-600 dark:text-secondary-400 mb-4">
          Requesting camera and microphone access...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
        <p className="text-error-700 dark:text-error-400">{error}</p>
        <button
          onClick={requestPermissions}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          src={previewUrl || undefined}
        />

        {/* Recording Indicator */}
        {isRecording && !isPaused && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-error-600 px-3 py-1 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-medium text-sm">REC</span>
          </div>
        )}

        {/* Timer */}
        {(isRecording || recordedBlob) && (
          <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full">
            <span className="text-white font-mono text-sm">
              {formatTime(duration)}
            </span>
            <span className="text-secondary-400 text-sm">
              {" "}
              / {formatTime(maxDuration)}
            </span>
          </div>
        )}

        {/* Paused Overlay */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-xl font-bold">PAUSED</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!recordedBlob ? (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-3 bg-error-600 hover:bg-error-700 text-white rounded-lg font-medium transition-colors"
              >
                <Video className="h-5 w-5" />
                Start Recording
              </button>
            ) : (
              <>
                <button
                  onClick={pauseRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-5 w-5" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-5 w-5" /> Pause
                    </>
                  )}
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg font-medium"
                >
                  <Square className="h-5 w-5" />
                  Stop
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button
              onClick={resetRecording}
              className="flex items-center gap-2 px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg font-medium"
            >
              <RotateCcw className="h-5 w-5" />
              Re-record
            </button>
            <button
              onClick={() => onRecordingComplete(recordedBlob, duration)}
              className="flex items-center gap-2 px-6 py-3 bg-success-600 hover:bg-success-700 text-white rounded-lg font-medium"
            >
              <Upload className="h-5 w-5" />
              Use This Recording
            </button>
          </>
        )}
      </div>

      {/* Tips */}
      {!isRecording && !recordedBlob && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
            Recording Tips:
          </h4>
          <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1">
            <li>• Find a quiet location with good lighting</li>
            <li>• Look directly at the camera and speak clearly</li>
            <li>
              • Keep your recording under {Math.floor(maxDuration / 60)} minutes
            </li>
            <li>• Introduce yourself and highlight your key skills</li>
          </ul>
        </div>
      )}
    </div>
  );
}
