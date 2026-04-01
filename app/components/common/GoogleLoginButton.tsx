"use client";

import React, { useEffect, useState, useCallback } from "react";

interface GoogleLoginResponse {
  credential: string;
  clientId: string;
  select_by: string;
}

interface GoogleLoginButtonProps {
  onSuccess: (response: GoogleLoginResponse) => void;
  onError: (error: string) => void;
  isLoading: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
          renderButton: (parent: HTMLElement | null, options: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
        };
      };
    };
  }
}

export function GoogleLoginButton({ onSuccess, onError, isLoading }: GoogleLoginButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Google script if not already loaded
    const scriptId = "google-gsi-client";
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      // Delay to avoid cascading render warning during mount
      setTimeout(() => setIsScriptLoaded(true), 0);
    }
  }, []);

  const handleGoogleSuccess = useCallback(async (response: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (isLoading) return;
    onSuccess(response);
  }, [onSuccess, isLoading]);

  const initGoogle = useCallback(() => {
    if (isScriptLoaded && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: handleGoogleSuccess,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-button-div"),
          { 
            theme: "outline", 
            size: "large", 
            width: "100%", 
            shape: "pill",
            text: "continue_with",
            logo_alignment: "left"
          } 
        );
      } catch (err) {
        onError(String(err));
      }
    }
  }, [isScriptLoaded, handleGoogleSuccess, onError]);

  useEffect(() => {
    initGoogle();
  }, [initGoogle]);

  return (
    <div className="w-full">
      <div id="google-button-div" className="w-full min-h-[44px]"></div>
      {isLoading && (
         <div className="mt-2 text-xs text-center text-[#ACBAC4] animate-pulse">
           Authenticating with Google...
         </div>
      )}
    </div>
  );
}
