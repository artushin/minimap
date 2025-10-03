interface StreamData {
  id: string;
  currentPlayer?: boolean;
  longitude: number;
  latitude: number;
  heading: number;
}

export default function calculateRelativePosition(
  currentPlayer: StreamData,
  otherPlayer: StreamData
) {
  // Calculate longitude/latitude differences
  const deltaLng = otherPlayer.longitude - currentPlayer.longitude;
  const deltaLat = otherPlayer.latitude - currentPlayer.latitude;

  // Convert to relative bearing (0° = North, clockwise)
  let bearing = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);

  // Adjust for current player's heading
  bearing = bearing - currentPlayer.heading;

  // Normalize bearing to 0-360°
  bearing = ((bearing % 360) + 360) % 360;

  // Calculate distance (simplified, not accurate but good for relative positioning)
  const distance = Math.sqrt(deltaLng * deltaLng + deltaLat * deltaLat);

  return { bearing, distance };
}
