/**
 * Location utility functions for attendance system
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check if coordinates are within radius of office location
 * @param {number} userLat - User latitude
 * @param {number} userLng - User longitude
 * @param {number} officeLat - Office latitude
 * @param {number} officeLng - Office longitude
 * @param {number} radius - Allowed radius in meters
 * @returns {boolean} True if within radius
 */
exports.isWithinRadius = (userLat, userLng, officeLat, officeLng, radius) => {
  const distance = this.calculateDistance(
    userLat,
    userLng,
    officeLat,
    officeLng
  );
  return distance <= radius;
};

/**
 * Validate latitude value
 * @param {number} lat - Latitude to validate
 * @returns {boolean} True if valid
 */
exports.isValidLatitude = (lat) => {
  return typeof lat === 'number' && lat >= -90 && lat <= 90;
};

/**
 * Validate longitude value
 * @param {number} lng - Longitude to validate
 * @returns {boolean} True if valid
 */
exports.isValidLongitude = (lng) => {
  return typeof lng === 'number' && lng >= -180 && lng <= 180;
};

/**
 * Validate coordinates object
 * @param {Object} coords - Coordinates object with lat and lng
 * @returns {boolean} True if valid
 */
exports.isValidCoordinates = (coords) => {
  return (
    coords &&
    typeof coords === 'object' &&
    this.isValidLatitude(coords.lat) &&
    this.isValidLongitude(coords.lng)
  );
};

/**
 * Format distance for display
 * @param {number} distance - Distance in meters
 * @returns {string} Formatted distance
 */
exports.formatDistance = (distance) => {
  if (distance < 1000) {
    return `${distance}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

/**
 * Get location accuracy description
 * @param {number} accuracy - GPS accuracy in meters
 * @returns {string} Accuracy description
 */
exports.getAccuracyDescription = (accuracy) => {
  if (accuracy <= 5) {
    return 'Sangat Akurat';
  } else if (accuracy <= 10) {
    return 'Akurat';
  } else if (accuracy <= 20) {
    return 'Cukup Akurat';
  } else {
    return 'Kurang Akurat';
  }
};

/**
 * Generate random coordinates within radius (for testing)
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} radiusInMeters - Radius in meters
 * @returns {Object} Random coordinates {lat, lng}
 */
exports.generateRandomCoordinatesWithinRadius = (
  centerLat,
  centerLng,
  radiusInMeters
) => {
  const radiusInDegrees = radiusInMeters / 111000; // Approximate conversion

  const u = Math.random();
  const v = Math.random();

  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;

  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  const newLat = centerLat + y;
  const newLng = centerLng + x / Math.cos(toRadians(centerLat));

  return {
    lat: parseFloat(newLat.toFixed(6)),
    lng: parseFloat(newLng.toFixed(6))
  };
};

/**
 * Get compass direction between two points
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {string} Compass direction
 */
exports.getDirection = (lat1, lng1, lat2, lng2) => {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  let bearing = Math.atan2(y, x);
  bearing = ((bearing * 180) / Math.PI + 360) % 360;

  const directions = [
    'Utara',
    'Timur Laut',
    'Timur',
    'Tenggara',
    'Selatan',
    'Barat Daya',
    'Barat',
    'Barat Laut'
  ];
  const index = Math.round(bearing / 45) % 8;

  return directions[index];
};
