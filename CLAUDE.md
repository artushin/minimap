# Google Maps Live Tracking Overlay for OBS

## Project Overview
This project creates a real-time coordinate tracking visualization using Google Maps satellite imagery, designed specifically for OBS streaming. The display shows multiple moving coordinate points on a portrait-oriented (9:16) satellite map view.

## Current Implementation

### File Structure
- `google-maps-tracker.html` - Single HTML file containing all functionality

### Core Features
1. **OBS-Optimized Display**
   - Pure black background for easy keying/compositing
   - No UI elements - just the map and tracking points
   - 9:16 portrait aspect ratio (vertical orientation)
   - No user interaction controls

2. **Map Configuration**
   - Google Maps JavaScript API integration
   - Satellite imagery view
   - Maximum zoom level (19-21) for detailed view
   - Auto-bounds adjustment to keep all points visible
   - All labels and UI elements disabled

3. **Coordinate Tracking System**
   - 4 coordinate points with unique IDs: `foo`, `bar`, `baz`, `qux`
   - Each point has a distinct color:
     - foo: Red (#FF6B6B)
     - bar: Teal (#4ECDC4)
     - baz: Blue (#45B7D1)
     - qux: Green (#96CEB4)
   - Points rendered as colored circles with white borders

4. **Movement Simulation**
   - Realistic walking speed: 1-2 feet per second
   - Smooth updates every 100ms
   - Velocity-based movement with random direction changes
   - Natural variation in movement speed (80-120% of base velocity)
   - Points start in tight cluster (1-2 meters apart)

## Setup Requirements

### Google Maps API Key
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Maps JavaScript API
3. Create credentials (API Key)
4. Replace `YOUR_API_KEY_HERE` in the HTML file

### Browser Permissions
- Location access (will fall back to San Francisco if denied)

## Technical Details

### Coordinate System
- Uses latitude/longitude decimal degrees
- Movement calculated as degrees per update interval
- Approximately 0.0000045 degrees = 0.5 meters at equator

### Update Mechanism
- `getCoordinateUpdates()` function handles movement logic
- Currently a dummy function simulating random walk
- Designed to be replaced with real data polling

### Data Structure
```javascript
{
    id: string,           // Unique identifier
    latitude: number,     // Decimal degrees
    longitude: number,    // Decimal degrees
    color: string,       // Hex color code
    velocity: {          // Movement vector
        lat: number,
        lng: number
    }
}
```

## Integration Points

### For Real Data Integration
Replace the `getCoordinateUpdates()` function with actual data source:
- WebSocket connection for live updates
- REST API polling
- Server-sent events (SSE)
- External data feed integration

### OBS Configuration
1. Add as Browser Source in OBS
2. Set dimensions to match aspect ratio (e.g., 1080x1920)
3. Use black background for transparency/keying if needed
4. Can overlay on other video sources

## Current State
- Functional prototype with simulated movement
- Ready for OBS streaming
- Awaiting real data source integration
- All UI stripped for clean streaming display

## Next Steps Considerations
- Implement real coordinate data source
- Add WebSocket support for live updates
- Configure authentication if needed
- Adjust movement parameters based on actual use case
- Consider adding trail visualization for movement history
- Implement clustering for many points
- Add smooth interpolation for network latency

## Notes
- Browser geolocation API attempts to center map on user's actual location
- Falls back to San Francisco coordinates if geolocation fails
- Map automatically adjusts bounds to keep all points visible
- No user controls - fully automated display