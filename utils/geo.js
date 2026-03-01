// Helper function to calculate distance using Haversine formula
export const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const toRadians = (deg) => (deg * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Helper function to calculate the center of a polygon
export const getPolygonCenter = (coords) => {
    if (!coords || coords.length === 0) return null;
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    coords.forEach(c => {
        minLat = Math.min(minLat, c.latitude);
        maxLat = Math.max(maxLat, c.latitude);
        minLng = Math.min(minLng, c.longitude);
        maxLng = Math.max(maxLng, c.longitude);
    });
    return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
    };
};

// Helper function to check if a point is inside a polygon (ray-casting algorithm)
export const isPointInPolygon = (point, vs) => {
    const x = point.longitude, y = point.latitude;

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i].longitude, yi = vs[i].latitude;
        const xj = vs[j].longitude, yj = vs[j].latitude;

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};
