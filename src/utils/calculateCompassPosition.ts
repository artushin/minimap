export default function calculateCompassPosition(
  bearing: number,
  screenWidth: number,
  screenHeight: number
) {
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;
  const orbSize = 64; // w-16 h-16 = 64px total
  const visiblePortion = orbSize / 3; // 1/3 of orb should be visible (≈21px)
  const hiddenPortion = (orbSize * 2) / 3; // 2/3 of orb should be hidden (≈43px)

  // Convert bearing to radians (0° = North, clockwise)
  const bearingRad = (bearing * Math.PI) / 180;

  // Calculate direction vector
  const dx = Math.sin(bearingRad);  // East-West component
  const dy = -Math.cos(bearingRad); // North-South component (negative because screen Y increases downward)

  // Use a large radius to extend to screen edges, then clamp
  const largeRadius = Math.max(screenWidth, screenHeight);

  // Calculate target position on a large circle
  const targetX = centerX + (dx * largeRadius);
  const targetY = centerY + (dy * largeRadius);

  let x, y;

  // Determine which screen edge we'll hit and position accordingly
  if (targetX <= 0) {
    // Left edge - position so orb extends left of screen
    // left = -43px means 43px is off-screen (left), 21px visible on right side of orb
    x = -hiddenPortion;
    y = centerY + (dy * (centerX / Math.abs(dx))) - (orbSize / 2); // Center vertically
  } else if (targetX >= screenWidth) {
    // Right edge - position so orb extends right of screen
    // left = screenWidth - 21px means 21px visible on left side, 43px off-screen (right)
    x = screenWidth - visiblePortion;
    y = centerY + (dy * ((screenWidth - centerX) / dx)) - (orbSize / 2); // Center vertically
  } else if (targetY <= 0) {
    // Top edge - position so orb extends above screen
    // top = -43px means 43px is off-screen (above), 21px visible on bottom side of orb
    x = centerX + (dx * (centerY / Math.abs(dy))) - (orbSize / 2); // Center horizontally
    y = -hiddenPortion;
  } else {
    // Bottom edge - position so orb extends below screen
    // top = screenHeight - 21px means 21px visible on top side, 43px off-screen (below)
    x = centerX + (dx * ((screenHeight - centerY) / dy)) - (orbSize / 2); // Center horizontally
    y = screenHeight - visiblePortion;
  }

  // Clamp Y position to prevent going completely off screen vertically
  if (x < 0 || x > screenWidth - orbSize) {
    y = Math.max(-hiddenPortion, Math.min(screenHeight - visiblePortion, y));
  }

  // Clamp X position to prevent going completely off screen horizontally
  if (y < 0 || y > screenHeight - orbSize) {
    x = Math.max(-hiddenPortion, Math.min(screenWidth - visiblePortion, x));
  }

  return { x, y };
}
