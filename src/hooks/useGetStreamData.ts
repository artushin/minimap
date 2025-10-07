/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Test mode configuration
const TEST_MODE = false; // Set to false to use real API
const TEST_CURRENT_PLAYER_LAT = 30.284511;
const TEST_CURRENT_PLAYER_LNG = -97.717262;
const TEST_CIRCLE_RADIUS_KM = 0.5; // 500 meters radius

export interface StreamData {
  id: string;
  currentPlayer: boolean;
  longitude: number;
  latitude: number;
  heading: number;
  color: string;
}

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFA07A",
  "#98D8C8",
  "#F7B731",
  "#5F27CD",
];

// Generate test data for coordinates
const generateTestStreamData = (): { coords: StreamData[]; muteVideo: boolean } => {
  const coords: StreamData[] = [];
  const currentTime = Date.now();

  // Current player (stationary)
  coords.push({
    id: "test_current_player",
    currentPlayer: true,
    latitude: TEST_CURRENT_PLAYER_LAT,
    longitude: TEST_CURRENT_PLAYER_LNG,
    heading: 0,
    color: COLORS[0],
  });

  // console.log("Generating test data at time:", currentTime);
  // Generate 4 other players moving in a circle
  for (let i = 0; i < 4; i++) {
    // Each player starts at a different angle (0°, 90°, 180°, 270°)
    const baseAngle = (i * 90) * (Math.PI / 180);
    // Add rotation based on time (complete circle every 10 seconds)
    const timeRotation = (currentTime / 50) * (Math.PI / 180); // 200ms updates, 50 updates per second
    const currentAngle = baseAngle + timeRotation;

    // Convert radius from km to degrees (approximately)
    // 1 km ≈ 0.009° latitude, longitude varies by latitude but we'll use a rough approximation
    const radiusInDegrees = TEST_CIRCLE_RADIUS_KM * 0.009;

    const playerLat = TEST_CURRENT_PLAYER_LAT + (radiusInDegrees * Math.cos(currentAngle));
    const playerLng = TEST_CURRENT_PLAYER_LNG + (radiusInDegrees * Math.sin(currentAngle));

    // Calculate heading (direction of movement)
    const heading = ((currentAngle + Math.PI/2) * (180 / Math.PI)) % 360;

    coords.push({
      id: `test_player_${i + 1}`,
      currentPlayer: false,
      latitude: playerLat,
      longitude: playerLng,
      heading: heading,
      color: COLORS[(i + 1) % COLORS.length],
    });
  }

  return { coords, muteVideo: false };
};

const parseCoordinatesFromResponse = (
  data: any,
  currentStreamId: string
) => {
  if (!data.streams) return { coords: [], muteVideo: false };

  // Filter for video streams only
  const videoStreams = data.streams.filter(
    (stream: any) => stream.mediaType === "video"
  );

  const coords: StreamData[] = [];
  let muteVideo = false;

  videoStreams.forEach((stream: any, index: number) => {
    if (!stream.appData || stream.sourceType === 'rtp' || stream.streamName.indexOf('player') < 0) return;

    try {
      // Parse appData JSON
      const appData = JSON.parse(stream.appData);
      if (appData.latitude !== undefined && appData.longitude !== undefined) {
        const isCurrentPlayer = stream.streamName === currentStreamId;
        muteVideo = appData.ptt === true && isCurrentPlayer;

        coords.push({
          id: stream.streamName,
          currentPlayer: isCurrentPlayer,
          latitude: appData.latitude,
          longitude: appData.longitude,
          heading: appData.heading || appData.direction || 0,
          color: COLORS[index % COLORS.length],
        });
      }
    } catch (error) {
      console.error(
        "Error parsing appData for stream:",
        stream.streamName,
        error
      );
    }
  });

  return {  coords, muteVideo };
};

function useGetStreamData() {
  const [streamData, setStreamData] = useState<StreamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [muteVideo, setMuteVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestHeaders = useMemo(
    () => ((window as any).REQUEST_HEADERS || {}),
    []
  );
  const apiUrl = useMemo(() => {
    // Use headers from window (set by query params or defaults from config)
    const ctrlUrl = requestHeaders["x-ctrl-callback-url"];
    return ctrlUrl ? `${ctrlUrl}/api/v1/streams` : null;
  }, [requestHeaders]);
  const currentStreamId = requestHeaders["x-stream-id"];

  const fetchStreamData = useCallback(async () => {
    if (TEST_MODE) {
      // Use test data
      try {
        const testData = generateTestStreamData();
        setStreamData(testData.coords);
        setMuteVideo(testData.muteVideo);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to generate test data:", err);
        setError("Failed to generate test data");
        setIsLoading(false);
      }
      return;
    }

    // Real API mode
    if (!apiUrl || apiUrl.includes("undefined")) {
      setError("API URL not available from headers");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
        },
        // These can help with mixed content issues
        referrerPolicy: 'no-referrer',
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Parse coordinates from video streams with appData
      const transformedData = parseCoordinatesFromResponse(
        data,
        currentStreamId
      );

      setStreamData(transformedData.coords);
      setMuteVideo(transformedData.muteVideo);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch stream data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setIsLoading(false);
    }
  }, [apiUrl, currentStreamId]);

  useEffect(() => {
    // Initial fetch
    fetchStreamData();

    // Set up interval - 200ms for test mode, 250ms for real API
    const interval = TEST_MODE ? 200 : 250;
    intervalRef.current = setInterval(fetchStreamData, interval);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchStreamData]);

  return {
    streamData,
    muteVideo,
    isLoading,
    error,
    refetch: fetchStreamData,
  };
}

export default useGetStreamData;
