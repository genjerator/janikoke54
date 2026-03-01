import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

const MapScreen = ({ challenge, onBack }) => {
    return (
        <View style={styles.container}>
            {/* Header / Breadcrumb */}
            <TouchableOpacity style={styles.header} onPress={onBack}>
                <Text style={styles.breadcrumbText}>Challenges</Text>
                <Text style={styles.breadcrumbSeparator}> / </Text>
                <Text style={styles.title} numberOfLines={1}>{challenge?.name}</Text>
            </TouchableOpacity>

            {/* Google Map */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 45.267136,
                    longitude: 19.833549,
                    latitudeDelta: 0.1, // Zoom level (around 10km)
                    longitudeDelta: 0.1,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    breadcrumbText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
        fontWeight: '600',
    },
    breadcrumbSeparator: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 15,
        marginHorizontal: 4,
    },
    title: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

export default MapScreen;
