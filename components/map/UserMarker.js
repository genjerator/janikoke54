import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

// Current-location marker — a bigger blue pin that gently pulses.
const UserMarker = ({ coordinate, title }) => {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(scale, { toValue: 1.12, duration: 800, useNativeDriver: false }),
                Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: false }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return (
        <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 1 }} zIndex={999} title={title}>
            <Animated.View style={[styles.userPinWrap, { transform: [{ scale }] }]}>
                <View style={styles.userPin}>
                    <View style={styles.userPinCore} />
                </View>
            </Animated.View>
        </Marker>
    );
};

const styles = StyleSheet.create({
    userPinWrap: {
        width: 38,
        height: 48,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    userPin: {
        width: 32,
        height: 32,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        borderBottomLeftRadius: 2,
        backgroundColor: '#1976D2',
        borderWidth: 3,
        borderColor: '#fff',
        transform: [{ rotate: '-45deg' }],
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    userPinCore: {
        width: 11,
        height: 11,
        borderRadius: 5.5,
        backgroundColor: '#fff',
    },
});

export default UserMarker;
