## Phase 1: Map Styling & Base Layer - Technical Implementation Steps

### Step 1: Replace Google Maps Styles Array
**Location**: In `setupMap()` function  
**Action**: Replace the current minimal styles array with a comprehensive game-style configuration

```javascript
// Replace current styles array with this dark, tactical game style
styles: [
  // Remove all labels globally
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  
  // Base geometry - dark blue/gray
  { elementType: 'geometry', stylers: [{ color: '#0f1419' }] },
  
  // Water - very dark blue, almost black
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050a0f' }] },
  
  // Land/terrain - dark military green
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1a2415' }] },
  
  // Parks - slightly lighter military green
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1f2b19' }] },
  
  // Roads - thin dark gray lines
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3038', weight: 0.3 }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1f25', weight: 0.5 }] },
  
  // Buildings - slightly lighter than base
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#141921' }] },
  
  // Administrative boundaries - subtle lines
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#3a4250', weight: 0.5 }] }
]
```

### Step 2: Add Grid Overlay System
**Location**: Create new div element and CSS  
**Action**: Add a tactical grid overlay on top of the map

1. **Modify HTML structure** - Add grid overlay div:
```html
<div id="map-container">
  <div id="map"></div>
  <div id="grid-overlay"></div>
</div>
```

2. **Add CSS for grid**:
```css
#map-container {
  width: 100vh;
  aspect-ratio: 9/16;
  position: relative;
}

#grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-image: 
    repeating-linear-gradient(0deg, 
      transparent, 
      transparent 49px, 
      rgba(0, 255, 200, 0.03) 49px, 
      rgba(0, 255, 200, 0.03) 50px),
    repeating-linear-gradient(90deg, 
      transparent, 
      transparent 49px, 
      rgba(0, 255, 200, 0.03) 49px, 
      rgba(0, 255, 200, 0.03) 50px);
  z-index: 10;
}
```

### Step 3: Implement Minimap Frame
**Location**: Add new CSS and HTML elements  
**Action**: Create the circular/hexagonal frame with game styling

1. **Add frame HTML wrapper**:
```html
<div id="minimap-frame">
  <div id="map-container">
    <div id="map"></div>
    <div id="grid-overlay"></div>
  </div>
  <svg id="frame-border" viewBox="0 0 100 100" preserveAspectRatio="none">
    <!-- Hexagonal frame path -->
    <path d="M 50,5 L 85,25 L 85,75 L 50,95 L 15,75 L 15,25 Z" 
          fill="none" 
          stroke="rgba(0, 255, 200, 0.5)" 
          stroke-width="0.5"/>
  </svg>
</div>
```

2. **Add frame CSS**:
```css
#minimap-frame {
  width: 100vh;
  aspect-ratio: 9/16;
  position: relative;
  filter: drop-shadow(0 0 20px rgba(0, 255, 200, 0.3));
}

#frame-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  pointer-events: none;
}
```

### Step 4: Add Edge Fade Effect
**Location**: Add CSS pseudo-elements  
**Action**: Create radial gradient fade at map edges

```css
#map-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(ellipse at center, 
    transparent 0%, 
    transparent 60%, 
    rgba(0, 0, 0, 0.4) 80%, 
    rgba(0, 0, 0, 0.8) 100%);
  z-index: 15;
}
```

### Step 5: Add Scan Line Animation
**Location**: Add new CSS animations and div  
**Action**: Create rotating radar sweep effect

1. **Add scan line HTML**:
```html
<div id="scan-line"></div>
```

2. **Add scan line CSS**:
```css
#scan-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 255, 200, 0.1) 45%, 
    rgba(0, 255, 200, 0.3) 50%, 
    rgba(0, 255, 200, 0.1) 55%, 
    transparent 100%);
  transform-origin: center;
  animation: radar-sweep 4s linear infinite;
  z-index: 12;
}

@keyframes radar-sweep {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
```

### Step 6: Modify Map Configuration
**Location**: `setupMap()` function  
**Action**: Update map options for game aesthetic

```javascript
map = new google.maps.Map(document.getElementById('map'), {
  center: center,
  zoom: 19, // Slightly less than max for better tile loading
  mapTypeId: 'roadmap', // Change from satellite to roadmap for styling
  disableDefaultUI: true,
  gestureHandling: 'none',
  keyboardShortcuts: false,
  clickableIcons: false,
  disableDoubleClickZoom: true,
  scrollwheel: false,
  backgroundColor: '#050a0f', // Dark background color
  // Add the comprehensive styles array from Step 1
});
```

### Step 7: Add Subtle Noise Overlay
**Location**: Add CSS for texture  
**Action**: Create static noise effect for tactical feel

```css
#map-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  z-index: 11;
  pointer-events: none;
  background-image: 
    repeating-linear-gradient(45deg, 
      transparent, 
      transparent 2px, 
      rgba(255, 255, 255, 0.03) 2px, 
      rgba(255, 255, 255, 0.03) 4px);
  animation: noise-shift 0.2s infinite;
}

@keyframes noise-shift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(1px, 1px); }
}
```

### Step 8: Final Color Adjustments
**Location**: Root body CSS  
**Action**: Add overall color filter for cohesion

```css
#minimap-frame {
  filter: 
    drop-shadow(0 0 20px rgba(0, 255, 200, 0.3))
    hue-rotate(10deg)
    saturate(0.7)
    contrast(1.2);
}
```

### Execution Order for Claude Code:
1. First update the Google Maps styles array and map configuration
2. Modify the HTML structure to add container divs
3. Add all CSS styling for the frame, grid, and overlays
4. Implement the scan line animation
5. Add noise and edge fade effects
6. Test and adjust colors/opacity values for optimal game aesthetic

This will transform the clean satellite view into a dark, tactical game-style minimap with all the visual elements expected in modern gaming interfaces.