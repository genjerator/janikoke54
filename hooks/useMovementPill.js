import { useRef } from 'react';
import { Animated } from 'react-native';

// Drives the fade of the "closest area" pill: fade in while the map is moving,
// then fade out a moment after movement stops. Wire the handlers to MapView's
// onRegionChange / onRegionChangeComplete.
export function useMovementPill() {
    const pillOpacity = useRef(new Animated.Value(0)).current;
    const fadeTimeout = useRef(null);

    const handleMapMove = () => {
        if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
        Animated.timing(pillOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleMapMoveComplete = () => {
        if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
        fadeTimeout.current = setTimeout(() => {
            Animated.timing(pillOpacity, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start();
        }, 1500);
    };

    return { pillOpacity, handleMapMove, handleMapMoveComplete };
}
