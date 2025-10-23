import crypto from 'crypto';
import { getTimezone } from 'node-timezone';

/**
 * Get the local date for a hospital based on its coordinates
 * @param latitude Hospital latitude
 * @param longitude Hospital longitude
 * @returns Local date string in YYYY-MM-DD format
 */
function getHospitalLocalDate(
  latitude: string | null | undefined,
  longitude: string | null | undefined,
): string {
  if (!latitude || !longitude) {
    // Fallback to UTC if coordinates are not available
    return new Date().toISOString().split("T")[0]!;
  }

  try {
    // Get timezone for the coordinates
    const timezone = getTimezone(parseFloat(latitude), parseFloat(longitude));

    // Get current date in the hospital's timezone
    const now = new Date();
    const localDate = new Date(
      now.toLocaleString("en-US", { timeZone: timezone || "UTC" }),
    );

    return localDate.toISOString().split("T")[0]!;
  } catch (error) {
    console.warn("Error getting timezone for coordinates:", error);
    // Fallback to UTC if timezone lookup fails
    return new Date().toISOString().split("T")[0]!;
  }
}

/**
 * Generate a 4-digit access code based on hospital location and local date
 * @param hospitalId Hospital ID for uniqueness
 * @param latitude Hospital latitude
 * @param longitude Hospital longitude
 * @returns 4-digit access code
 */
export function generateHospitalAccessCode(
  hospitalId: string,
  latitude: string | null | undefined,
  longitude: string | null | undefined,
): string {
  // Get the hospital's local date
  const dateString = getHospitalLocalDate(latitude, longitude);

  // Create a hash input string combining all parameters
  const hashInput = `${hospitalId}-${latitude || "0"}-${longitude || "0"}-${dateString}`;

  // Generate a hash using SHA-256
  const hash = crypto.createHash("sha256").update(hashInput).digest("hex");

  // Extract first 4 characters and convert to a 4-digit number
  const hexString = hash.substring(0, 8); // Take first 8 hex chars for better distribution
  const number = parseInt(hexString, 16);

  // Convert to 4-digit code (0000-9999)
  const code = (number % 10000).toString().padStart(4, "0");

  return code;
}

/**
 * Check if an access code is valid for a hospital
 * @param code Access code to validate
 * @param hospitalId Hospital ID
 * @param latitude Hospital latitude
 * @param longitude Hospital longitude
 * @returns true if code is valid, false otherwise
 */
export function validateHospitalAccessCode(
  code: string,
  hospitalId: string,
  latitude: string | null | undefined,
  longitude: string | null | undefined,
): boolean {
  const expectedCode = generateHospitalAccessCode(
    hospitalId,
    latitude,
    longitude,
  );
  return code === expectedCode;
}
