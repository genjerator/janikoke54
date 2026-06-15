// Format a distance in meters for display, e.g. "240 m" or "1.3 km".
export const formatDistance = (dist) => {
    if (dist === null || dist === undefined) return '';
    if (dist < 1000) return `${Math.round(dist)} m`;
    return `${(dist / 1000).toFixed(1)} km`;
};
