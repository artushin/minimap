import { useEffect, useRef, useState } from "react";
import WebRTCViewer from "../../utils/webrtcViewer";
import useGetStreamData from "../../hooks/useGetStreamData";

function Map() {
  const { muteVideo } = useGetStreamData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewerRef = useRef<WebRTCViewer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const retryTimeoutRef = useRef<number | null>(null);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleStream = async () => {
      if (!videoRef.current) return;

      setIsLoading(true);
      viewerRef.current = new WebRTCViewer();
      const streamKey = "map_composite";

      try {
        await viewerRef.current.startWebRTCViewer(
          videoRef.current,
          streamKey
        );
        setIsLoading(false);
      } catch (err: unknown) {
        console.error("Auto-connect stream error:", err);

        // if (
        //   err &&
        //   typeof err === "object" &&
        //   "message" in err &&
        //   "stack" in err
        // ) {
        //   setError(
        //     `Failed to connect to the map stream ${JSON.stringify(
        //       (err as { message?: string }).message
        //     )} ${JSON.stringify((err as { stack?: string }).stack)}`
        //   );
        // } else {
        //   setError(
        //     `Failed to connect to the map stream ${JSON.stringify(err)}`
        //   );
        // }

        // Retry after 5 seconds
        retryTimeoutRef.current = window.setTimeout(() => {
          if (viewerRef.current) {
            viewerRef.current.stopViewer();
          }
          handleStream();
        }, 5000);
      }
    };

    handleStream();

    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (viewerRef.current) {
        viewerRef.current.stopViewer();
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-transparent relative">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        muted={muteVideo}
        controls={false}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <div className="text-white text-sm">Connecting to map stream...</div>
          </div>
        </div>
      )}

      {/* {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg break-all overflow-scroll w-full text-sm">
          {error}
        </div>
      )} */}
    </div>
  );
}

export default Map;
