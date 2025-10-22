/**
 * Geolocation and distance calculation utilities
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Get the user's current location using the browser's geolocation API
 * @returns Promise with coordinates or null if not available/denied
 */
export async function getCurrentLocation(): Promise<Coordinates | null> {
  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported by this browser.");
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Error getting current location:", error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
      },
    );
  });
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates,
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km" or "850 m")
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Sort an array of items by distance from a reference point
 * @param items Array of items with coordinates
 * @param reference Reference coordinates to measure distance from
 * @param getCoordinates Function to extract coordinates from an item
 * @returns Sorted array with distance property added
 */
export function sortByDistance<T>(
  items: T[],
  reference: Coordinates,
  getCoordinates: (item: T) => Coordinates | null,
): Array<T & { distance?: number }> {
  const itemsWithDistance = items.map((item) => {
    const coords = getCoordinates(item);
    if (!coords) {
      return { ...item, distance: undefined };
    }
    const distance = calculateDistance(reference, coords);
    return { ...item, distance };
  });

  // Sort by distance (items without coordinates go last)
  return itemsWithDistance.sort((a, b) => {
    if (a.distance === undefined) return 1;
    if (b.distance === undefined) return -1;
    return a.distance - b.distance;
  });
}
