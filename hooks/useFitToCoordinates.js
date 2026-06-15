import { useRef, useEffect } from 'react';

// Frames the map so all areas AND the user's position are visible. Fits once on
// load, then once more when the user's location first arrives — after that it
// stops so it doesn't fight the user's panning/zooming.
export function useFitToCoordinates({ mapReady, mapRef, allPolygons, userLocation }) {
    const fittedWithUser = useRef(false);

    useEffect(() => {
        if (!mapReady || !mapRef.current || fittedWithUser.current) return;

        const coords = [];
        allPolygons.forEach(area => area.polyCoords.forEach(c => coords.push(c)));
        if (userLocation) {
            coords.push({ latitude: userLocation.latitude, longitude: userLocation.longitude });
        }
        if (coords.length === 0) return;

        mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 90, right: 60, bottom: 120, left: 60 },
            animated: true,
        });

        // Only lock once we've framed the user too; until then keep re-fitting.
        if (userLocation) fittedWithUser.current = true;
    }, [mapReady, allPolygons, userLocation]);
}
