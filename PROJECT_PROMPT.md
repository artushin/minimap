# Mobile Overlay Compass App - Project Prompt

## Overview
This is a React + TypeScript + Vite application designed to be a transparent overlay for mobile apps.
The app provides a video game-style compass that shows the positions of other streamers relative to the current user's position and heading.

## Core Requirements

### Mobile Overlay Design
- Transparent background throughout the application
- Full viewport dimensions (100vw x 100vh)
- No scrolling - everything must fit within the window view
- Designed to overlay on top of mobile app content

### Two Main Features
1. **Map Stream View** - Shows a live map stream consumed via video player
2. **Streams Compass View** - Shows directional indicators pointing to other active streamers

### Navigation
- Two always-visible buttons at the bottom of the screen
- Buttons have semi-transparent black background for visibility
- Toggle between "Map Stream" and "Streams Compass" views

## Technology Stack
- **React 19** with TypeScript
- **Vite** with rolldown bundler
- **Tailwind CSS** for styling
- **@video/video-client-react** for video streaming
- **@heroicons/react** for icons
- **Yarn** package manager

## Key Design Principles
- Mobile-first responsive design
- Transparent overlay functionality
- Video game aesthetic for compass elements
- Real-time streaming data integration
- GPS coordinate-based positioning

## Data Structure
The app works with streamer data containing:
- `id`: Unique identifier
- `currentPlayer`: Boolean flag for the current user
- `color`: Display color for visual indicators
- `longitude`/`latitude`: GPS coordinates
- `heading`: Direction the user is facing (0-360 degrees)

## Visual Style
- Dark, semi-transparent UI elements
- Glowing orb effects for compass indicators
- Video game-inspired visual design
- Smooth animations and transitions