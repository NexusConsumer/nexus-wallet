/**
 * Calculate the distance between two geographic coordinates
 * using the Haversine formula.
 * @returns distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display.
 * Under 1km: show meters rounded to nearest 50m (e.g., "800 m" / "800 מ'")
 * 1km+: show km with one decimal (e.g., "2.3 km" / "2.3 ק"מ")
 */
export function formatDistance(km: number, isHe: boolean): string {
  if (km < 1) {
    const meters = Math.round((km * 1000) / 50) * 50;
    return isHe ? `${meters} מ'` : `${meters} m`;
  }
  const rounded = Math.round(km * 10) / 10;
  return isHe ? `${rounded} ק"מ` : `${rounded} km`;
}
