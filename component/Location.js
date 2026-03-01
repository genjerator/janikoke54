import * as Location from "expo-location";
export const getLocation = async () => {
    try {
        let {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        return currentLocation = await Location.getCurrentPositionAsync({});

    } catch (error) {
        console.error('Error getting location:', error);
    }
};
