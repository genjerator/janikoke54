import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// Requests foreground location permission and, once granted, streams the user's
// position. Returns the permission state and the latest coordinates.
export function useUserLocation() {
    const [locationPermission, setLocationPermission] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        let locationSubscription;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setLocationPermission(true);
                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        distanceInterval: 10, // Update every 10 meters
                    },
                    (location) => {
                        setUserLocation(location.coords);
                    }
                );
            } else {
                setLocationPermission(false);
            }
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    return { locationPermission, userLocation };
}
