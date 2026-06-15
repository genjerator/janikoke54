import { useState, useEffect } from 'react';
import { Vibration } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { getDistanceInMeters, getPolygonCenter, isPointInPolygon } from '../utils/geo';
import { postInsidePolygon } from '../axios/ApiCalls';

// Watches the user's position against the challenge areas. Tracks the nearest
// area for display, and when the user steps into an un-collected area it
// vibrates, posts the collection, and calls onCollected() to re-sync.
export function useAreaCollection({ userLocation, allPolygons, user, currentChallenge, onCollected, getRandomArticle }) {
    const [closestArea, setClosestArea] = useState(null);
    const [collectedArea, setCollectedArea] = useState(null); // The area we just entered
    const [activeArticle, setActiveArticle] = useState(null); // Random article for that area (if any)

    useEffect(() => {
        if (!userLocation || allPolygons.length === 0) return;

        let minDistance = Infinity;
        let closest = null;
        let insideArea = null;

        allPolygons.forEach(area => {
            // Inside this polygon and not collected yet (status === 0)?
            if (area.status === 0 && isPointInPolygon(userLocation, area.polyCoords)) {
                Sentry.logger.info('User is inside area:', area);
                insideArea = area;
            }

            const center = getPolygonCenter(area.polyCoords);
            if (center) {
                const dist = getDistanceInMeters(
                    userLocation.latitude,
                    userLocation.longitude,
                    center.latitude,
                    center.longitude
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    closest = { ...area, distance: dist };
                }
            }
        });

        if (insideArea && !collectedArea) {
            setCollectedArea(insideArea);
            setActiveArticle(getRandomArticle ? getRandomArticle(insideArea.id) : null);
            Vibration.vibrate([0, 500, 200, 500]); // wait 0ms, buzz 500, wait 200, buzz 500

            if (user) {
                postInsidePolygon({
                    area_id: insideArea.id,
                    challenge_id: currentChallenge.id,
                }, user).then(() => {
                    Sentry.logger.info('Collection posted successfully');
                    onCollected?.();
                }).catch(err => {
                    Sentry.logger.error('Error posting collection:', err);
                });
            }
        }

        setClosestArea(closest);
    }, [userLocation, allPolygons]);

    return {
        closestArea,
        collectedArea,
        activeArticle,
        clearCollectedArea: () => {
            setCollectedArea(null);
            setActiveArticle(null);
        },
    };
}
