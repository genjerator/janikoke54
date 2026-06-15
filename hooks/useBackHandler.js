import { useEffect } from 'react';
import { BackHandler } from 'react-native';

// Routes the Android hardware back button to onBack while this screen is mounted.
export function useBackHandler(onBack) {
    useEffect(() => {
        const backAction = () => {
            if (onBack) {
                onBack();
                return true; // handled — prevent default behavior
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [onBack]);
}
