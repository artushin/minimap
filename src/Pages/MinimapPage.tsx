/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { CTRL_CALLBACK_URL } from '../config';

interface Coordinate {
  id: string;
  latitude: number;
  longitude: number;
  color: string;
  velocity: { lat: number; lng: number };
}

interface LatLngBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA07A', '#98D8C8', '#F7B731', '#5F27CD'];
const INITIAL_ZOOM = 18;
const MIN_ZOOM = 1;
const MAX_ZOOM = 19;
const POLL_INTERVAL = 500;
const TILE_SIZE = 256;

// Utility functions for tile math
const lon2tile = (lon: number, zoom: number): number => {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
};

const lat2tile = (lat: number, zoom: number): number => {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
};

function MinimapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordinatesRef = useRef<Coordinate[]>([]);
  const mapStreamInfoRef = useRef<{ fullName: string | null; channelId: string | null }>({
    fullName: null,
    channelId: null,
  });
  const [error, setError] = useState<string | null>(null);
  const zoomRef = useRef<number>(INITIAL_ZOOM);
  const centerRef = useRef<{ lat: number; lng: number }>({ lat: 30.284511, lng: -97.717262 });
  const tilesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const boundsRef = useRef<LatLngBounds | null>(null);

  const parseCoordinatesFromResponse = (data: any): Coordinate[] => {
    if (!data.streams) return [];

    // Find and store map stream info
    const mapStream = data.streams.find(
      (stream: any) =>
        stream.sourceType === 'rtp' &&
        stream.mediaType === 'video' &&
        stream.streamName === 'map'
    );

    if (mapStream) {
      mapStreamInfoRef.current.fullName = mapStream.fullName;
      mapStreamInfoRef.current.channelId = mapStream.channelId;
    }

    // Filter for video streams only
    const videoStreams = data.streams.filter((stream: any) => stream.mediaType === 'video');

    const coords: Coordinate[] = [];
    videoStreams.forEach((stream: any, index: number) => {
      if (stream.streamName.indexOf('player') < 0) return;
      if (stream.sourceType !== 'rtp') return;
      if (!stream.appData) return;

      try {
        const appData = JSON.parse(stream.appData);
        if (appData.latitude !== undefined && appData.longitude !== undefined) {
          const existingCoord = coordinatesRef.current.find((c) => c.id === stream.streamName);
          const color = existingCoord ? existingCoord.color : COLORS[index % COLORS.length];

          coords.push({
            id: stream.streamName,
            latitude: appData.latitude,
            longitude: appData.longitude,
            color: color,
            velocity: existingCoord ? existingCoord.velocity : { lat: 0, lng: 0 },
          });
        }
      } catch (error) {
        console.error('Error parsing appData for stream:', stream.streamName, error);
      }
    });

    return coords;
  };

  const fetchCoordinates = async (): Promise<Coordinate[]> => {
    try {
      const response = await fetch(`${CTRL_CALLBACK_URL}/api/v1/streams`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return parseCoordinatesFromResponse(data);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      setError(`Failed to fetch coordinates: ${error}`);
      return [];
    }
  };

  const loadTile = (x: number, y: number, zoom: number): Promise<HTMLImageElement> => {
    const key = `${zoom}-${x}-${y}`;

    if (tilesRef.current.has(key)) {
      return Promise.resolve(tilesRef.current.get(key)!);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        tilesRef.current.set(key, img);
        resolve(img);
      };
      img.onerror = reject;
      // Using OpenStreetMap tiles (dark style via Carto)
      img.src = `https://a.basemaps.cartocdn.com/dark_all/${zoom}/${x}/${y}.png`;
    });
  };

  const calculateBounds = (): LatLngBounds | null => {
    if (coordinatesRef.current.length === 0) return null;

    let north = -90,
      south = 90,
      east = -180,
      west = 180;

    coordinatesRef.current.forEach((coord) => {
      north = Math.max(north, coord.latitude);
      south = Math.min(south, coord.latitude);
      east = Math.max(east, coord.longitude);
      west = Math.min(west, coord.longitude);
    });

    // Add padding (10%)
    const latPadding = (north - south) * 0.1;
    const lngPadding = (east - west) * 0.1;

    return {
      north: north + latPadding,
      south: south - latPadding,
      east: east + lngPadding,
      west: west - lngPadding,
    };
  };

  const calculateZoomForBounds = (bounds: LatLngBounds, canvasWidth: number, canvasHeight: number): number => {
    // Calculate zoom based on how many tiles we need to fit the bounds
    // Start from max zoom and work down until everything fits
    let zoom = MIN_ZOOM;
    for (let z = MAX_ZOOM; z >= MIN_ZOOM; z--) {
      const latTiles = Math.abs(lat2tile(bounds.north, z) - lat2tile(bounds.south, z));
      const lngTiles = Math.abs(lon2tile(bounds.east, z) - lon2tile(bounds.west, z));

      const pixelHeight = latTiles * TILE_SIZE;
      const pixelWidth = lngTiles * TILE_SIZE;

      // If bounds fit within canvas at this zoom level, use it
      if (pixelWidth <= canvasWidth && pixelHeight <= canvasHeight) {
        zoom = z;
        break;
      }
    }

    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  };

  const latLngToPixel = (lat: number, lng: number, zoom: number, center: { lat: number; lng: number }, canvasWidth: number, canvasHeight: number) => {
    const centerTileX = lon2tile(center.lng, zoom);
    const centerTileY = lat2tile(center.lat, zoom);

    const pointTileX = lon2tile(lng, zoom);
    const pointTileY = lat2tile(lat, zoom);

    const x = (pointTileX - centerTileX) * TILE_SIZE + canvasWidth / 2;
    const y = (pointTileY - centerTileY) * TILE_SIZE + canvasHeight / 2;

    return { x, y };
  };

  const postMapBounds = async () => {
    if (!mapStreamInfoRef.current.fullName || !mapStreamInfoRef.current.channelId) {
      console.warn('Map stream info not yet loaded, skipping postMapBounds');
      return;
    }

    const bounds = boundsRef.current;
    if (!bounds) return;

    const payload = {
      tl: { lat: bounds.north, long: bounds.west },
      bl: { lat: bounds.south, long: bounds.west },
      tr: { lat: bounds.north, long: bounds.east },
      br: { lat: bounds.south, long: bounds.east },
      w: 720,
      h: 1080,
    };

    try {
      await fetch(`${CTRL_CALLBACK_URL}/api/v1/setchannelappdata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamFullName: mapStreamInfoRef.current.fullName,
          data: [
            {
              channelId: mapStreamInfoRef.current.channelId,
              appData: JSON.stringify(payload),
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Error posting map bounds:', error);
    }
  };

  const renderMap = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0f14';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Update bounds and zoom if we have coordinates
    if (coordinatesRef.current.length > 0) {
      const newBounds = calculateBounds();
      if (newBounds) {
        boundsRef.current = newBounds;
        const newZoom = calculateZoomForBounds(newBounds, canvasWidth, canvasHeight);
        zoomRef.current = newZoom;

        // Update center to be the center of bounds
        centerRef.current = {
          lat: (newBounds.north + newBounds.south) / 2,
          lng: (newBounds.east + newBounds.west) / 2,
        };
      }
    }

    const zoom = zoomRef.current;
    const center = centerRef.current;

    // Calculate which tiles we need
    const centerTileX = lon2tile(center.lng, zoom);
    const centerTileY = lat2tile(center.lat, zoom);

    const tilesWide = Math.ceil(canvasWidth / TILE_SIZE) + 2;
    const tilesHigh = Math.ceil(canvasHeight / TILE_SIZE) + 2;

    const startTileX = Math.floor(centerTileX - tilesWide / 2);
    const startTileY = Math.floor(centerTileY - tilesHigh / 2);

    // Load and draw tiles
    for (let y = 0; y < tilesHigh; y++) {
      for (let x = 0; x < tilesWide; x++) {
        const tileX = startTileX + x;
        const tileY = startTileY + y;

        const pixelX = (tileX - centerTileX) * TILE_SIZE + canvasWidth / 2;
        const pixelY = (tileY - centerTileY) * TILE_SIZE + canvasHeight / 2;

        try {
          const img = await loadTile(tileX, tileY, zoom);
          ctx.drawImage(img, pixelX, pixelY, TILE_SIZE, TILE_SIZE);
        } catch (error) {
          // Skip failed tiles
        }
      }
    }

    // Draw player markers
    coordinatesRef.current.forEach((coord) => {
      const pixel = latLngToPixel(coord.latitude, coord.longitude, zoom, center, canvasWidth, canvasHeight);

      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = coord.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const pollCoordinates = async () => {
    const newCoordinates = await fetchCoordinates();
    coordinatesRef.current = newCoordinates;

    if (newCoordinates.length > 0) {
      await renderMap();
    }
  };

  // Initialize canvas and start polling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match container
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        renderMap();
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initial fetch and render
    fetchCoordinates().then((coords) => {
      coordinatesRef.current = coords;
      if (coords.length > 0) {
        centerRef.current = {
          lat: coords[0].latitude,
          lng: coords[0].longitude,
        };
      }
      renderMap();
    });

    // Start polling
    const pollInterval = setInterval(pollCoordinates, POLL_INTERVAL);
    const boundsInterval = setInterval(postMapBounds, 5000);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      clearInterval(pollInterval);
      clearInterval(boundsInterval);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      <div className="relative" style={{ width: '100vh', aspectRatio: '9/16', filter: 'drop-shadow(0 0 10px rgba(0, 255, 200, 0.2))' }}>
        <div className="relative w-full h-full">
          <canvas ref={canvasRef} className="w-full h-full relative" />

          {/* Grid overlay */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(0, 255, 200, 0.05) 49px, rgba(0, 255, 200, 0.05) 50px),
                repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(0, 255, 200, 0.05) 49px, rgba(0, 255, 200, 0.05) 50px)
              `
            }}
          />

          {/* Scan line */}
          <div
            className="absolute top-1/2 left-1/2 w-full h-0.5 z-[12] opacity-50 animate-radar-sweep"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0, 255, 200, 0.1) 45%, rgba(0, 255, 200, 0.3) 50%, rgba(0, 255, 200, 0.1) 55%, transparent 100%)',
              transformOrigin: 'center',
            }}
          />

          {/* Noise overlay */}
          <div
            className="absolute top-0 left-0 w-full h-full opacity-[0.02] z-[11] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)'
            }}
          />

          {/* Vignette overlay */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-[15]"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, transparent 70%, rgba(0, 0, 0, 0.2) 85%, rgba(0, 0, 0, 0.4) 100%)'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes radar-sweep {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .animate-radar-sweep {
          animation: radar-sweep 4s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default MinimapPage;
