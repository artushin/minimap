/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY, CTRL_CALLBACK_URL } from '../config';

// Google Maps types
declare const google: any;

interface Coordinate {
  id: string;
  latitude: number;
  longitude: number;
  color: string;
  velocity: { lat: number; lng: number };
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA07A', '#98D8C8', '#F7B731', '#5F27CD'];
const INITIAL_ZOOM = 20;
const MIN_ZOOM = 14;
const POLL_INTERVAL = 500;

function MinimapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const coordinatesRef = useRef<Coordinate[]>([]);
  const mapStreamInfoRef = useRef<{ fullName: string | null; channelId: string | null }>({
    fullName: null,
    channelId: null,
  });
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Setup callback
    (window as any).initMap = initMap;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      delete (window as any).initMap;
    };
  }, []);

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

  const shrinkBounds = (bounds: any, percentage: number) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const latRange = ne.lat() - sw.lat();
    const lngRange = ne.lng() - sw.lng();

    const latInset = latRange * percentage;
    const lngInset = lngRange * percentage;

    const newSW = new google.maps.LatLng(sw.lat() + latInset, sw.lng() + lngInset);
    const newNE = new google.maps.LatLng(ne.lat() - latInset, ne.lng() - lngInset);

    return new google.maps.LatLngBounds(newSW, newNE);
  };

  const updateMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentBounds = map.getBounds();
    let needsRefit = false;

    coordinatesRef.current.forEach((coord) => {
      const position = { lat: coord.latitude, lng: coord.longitude };

      if (currentBounds && !shrinkBounds(currentBounds, 0.1).contains(position)) {
        needsRefit = true;
      }

      if (markersRef.current[coord.id]) {
        markersRef.current[coord.id].setPosition(position);
      } else {
        markersRef.current[coord.id] = new google.maps.Marker({
          position: position,
          map: map,
          title: coord.id,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: coord.color || '#FF6B6B',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            strokeOpacity: 0.9,
          },
        });
        needsRefit = true;
      }
    });

    if (needsRefit) {
      fitMapToBounds();
    }
  };

  const fitMapToBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = new google.maps.LatLngBounds();

    coordinatesRef.current.forEach((coord) => {
      bounds.extend({ lat: coord.latitude, lng: coord.longitude });
    });

    map.fitBounds(bounds);

    const listener = google.maps.event.addListener(map, 'idle', () => {
      if (map.getZoom() < MIN_ZOOM) {
        map.setZoom(MIN_ZOOM);
      }
      google.maps.event.removeListener(listener);
    });
  };

  const postMapBounds = async () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!mapStreamInfoRef.current.fullName || !mapStreamInfoRef.current.channelId) {
      console.warn('Map stream info not yet loaded, skipping postMapBounds');
      return;
    }

    const bounds = map.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const nw = new google.maps.LatLng(ne.lat(), sw.lng());
    const se = new google.maps.LatLng(sw.lat(), ne.lng());

    const payload = {
      tl: { lat: nw.lat(), long: nw.lng() },
      bl: { lat: sw.lat(), long: sw.lng() },
      tr: { lat: ne.lat(), long: ne.lng() },
      br: { lat: se.lat(), long: se.lng() },
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

  const pollCoordinates = async () => {
    const newCoordinates = await fetchCoordinates();
    coordinatesRef.current = newCoordinates;

    // Remove markers that are no longer in the coordinate list
    const currentIds = new Set(newCoordinates.map((c) => c.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });

    if (newCoordinates.length > 0) {
      updateMarkers();
    }
  };

  const setupMap = async (center: { lat: number; lng: number }) => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: center,
      zoom: INITIAL_ZOOM,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      gestureHandling: 'none',
      keyboardShortcuts: false,
      clickableIcons: false,
      disableDoubleClickZoom: true,
      scrollwheel: false,
      backgroundColor: '#0a0f14',
      styles: [
        { elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { elementType: 'geometry', stylers: [{ color: '#1a2530' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1015' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#25303a' }] },
        { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#3a4550' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a3020' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3a4550' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#252f3a', weight: 0.5 }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4a5565' }] },
        { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#2a3540', weight: 0.5 }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#3a4555' }] },
        { featureType: 'poi.business', elementType: 'geometry', stylers: [{ color: '#404a5a' }] },
        { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#3a4555' }] },
        { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#404a5a' }] },
        { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#4a5560', weight: 0.5 }] },
        { featureType: 'administrative.land_parcel', elementType: 'geometry.stroke', stylers: [{ color: '#3a4550' }] },
      ],
    });

    mapInstanceRef.current = map;

    google.maps.event.addListenerOnce(map, 'idle', () => {
      updateMarkers();
      postMapBounds();
      google.maps.event.addListener(map, 'bounds_changed', postMapBounds);
    });

    // Start polling
    setInterval(pollCoordinates, POLL_INTERVAL);
    setInterval(postMapBounds, 5000);
  };

  const initMap = async () => {
    coordinatesRef.current = await fetchCoordinates();

    let center: { lat: number; lng: number };

    if (coordinatesRef.current.length > 0) {
      center = {
        lat: coordinatesRef.current[0].latitude,
        lng: coordinatesRef.current[0].longitude,
      };
    } else {
      // Fallback to San Diego coordinates
      center = { lat: 32.772652, lng: -117.246941 };
    }

    setupMap(center);
  };

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      <div className="relative" style={{ width: '100vh', aspectRatio: '9/16', filter: 'drop-shadow(0 0 10px rgba(0, 255, 200, 0.2))' }}>
        <div className="relative w-full h-full">
          <div ref={mapRef} className="w-full h-full relative" />

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

        {/* Frame border SVG */}
        <svg
          className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 50,5 L 85,25 L 85,75 L 50,95 L 15,75 L 15,25 Z"
            fill="none"
            stroke="rgba(0, 255, 200, 0.6)"
            strokeWidth="0.5"
          />
        </svg>
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
