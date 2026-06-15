import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

// Returns an opacity value that gently pulses while `active` is true — used for
// the "location tracking is on" indicator dot.
export function useTrackingPulse(active) {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!active) return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.2, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [active]);

    return opacity;
}
