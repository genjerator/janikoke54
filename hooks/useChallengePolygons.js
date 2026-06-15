import { useMemo } from 'react';

// Fallback view (Novi Sad) when a challenge has no usable coordinates.
const FALLBACK_REGION = {
    latitude: 45.267136,
    longitude: 19.833549,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};

// Derives the renderable polygons for a challenge and an initial map region that
// frames all of them. Both are memoized so they only recompute when the
// challenge changes.
export function useChallengePolygons(challenge) {
    const allPolygons = useMemo(() => {
        if (!challenge?.areas) return [];
        return challenge.areas.flatMap(area => {
            if (!area.polygons) return [];
            return {
                ...area,
                polyCoords: area.polygons.map(p => ({
                    latitude: Number(p.latitude),
                    longitude: Number(p.longitude),
                })),
            };
        });
    }, [challenge]);

    const mapRegion = useMemo(() => {
        if (allPolygons.length > 0) {
            let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
            let hasValidCoords = false;

            allPolygons.forEach(area => {
                area.polyCoords.forEach(c => {
                    hasValidCoords = true;
                    minLat = Math.min(minLat, c.latitude);
                    maxLat = Math.max(maxLat, c.latitude);
                    minLng = Math.min(minLng, c.longitude);
                    maxLng = Math.max(maxLng, c.longitude);
                });
            });

            if (hasValidCoords) {
                return {
                    latitude: (minLat + maxLat) / 2,
                    longitude: (minLng + maxLng) / 2,
                    latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.5),
                    longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.5),
                };
            }
        }
        return FALLBACK_REGION;
    }, [allPolygons]);

    return { allPolygons, mapRegion };
}
