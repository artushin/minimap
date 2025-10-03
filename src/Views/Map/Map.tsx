import { useEffect, useRef, useState } from "react";
import WebRTCViewer from "../../utils/webrtcViewer";
import useGetStreamData from "../../hooks/useGetStreamData";
import { HLS_URL } from "../../config";

function Map() {
  const { muteVideo } = useGetStreamData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewerRef = useRef<WebRTCViewer | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detect Chrome browser
  const isChrome = () => {
    const userAgent = navigator.userAgent;
    return /Chrome/.test(userAgent);
  };

  useEffect(() => {
    const handleStream = async () => {
      if (!videoRef.current) return;

      if (isChrome()) {
        // Use WebRTC for Chrome
        viewerRef.current = new WebRTCViewer();
        const streamKey = "map_composite";

        try {
          await viewerRef.current.startWebRTCViewer(
            videoRef.current,
            streamKey
          );
        } catch (err: unknown) {
          console.error("Auto-connect stream error:", err);

          if (
            err &&
            typeof err === "object" &&
            "message" in err &&
            "stack" in err
          ) {
            setError(
              `Failed to connect to the map stream ${JSON.stringify(
                (err as { message?: string }).message
              )} ${JSON.stringify((err as { stack?: string }).stack)}`
            );
          } else {
            setError(
              `Failed to connect to the map stream ${JSON.stringify(err)}`
            );
          }
        }
      } else {
        // Use HLS for all other browsers - using hardcoded config
        videoRef.current.src = HLS_URL;
      }
    };

    handleStream();

    // Cleanup on unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.stopViewer();
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-transparent">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        muted={muteVideo}
        controls={false}
      />
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg break-all overflow-scroll w-full text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

export default Map;
