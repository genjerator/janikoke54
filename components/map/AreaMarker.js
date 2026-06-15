import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker, Polygon } from 'react-native-maps';
import { getPolygonCenter } from '../../utils/geo';

// Renders one challenge area: the filled polygon plus a small pin at its center.
// Green = available (status 0), red = completed (status 1).
const AreaMarker = ({ area }) => {
    const isCompleted = area.status === 1;
    const center = getPolygonCenter(area.polyCoords);

    return (
        <>
            <Polygon
                coordinates={area.polyCoords}
                fillColor={isCompleted ? 'rgba(244, 67, 54, 0.4)' : 'rgba(76, 175, 80, 0.4)'}
                strokeColor={isCompleted ? '#F44336' : '#4CAF50'}
                strokeWidth={2}
            />
            {center && (
                <Marker coordinate={center} title={area.name} anchor={{ x: 0.5, y: 1 }}>
                    <View style={styles.pinSmallWrap}>
                        <View style={[styles.pinSmall, { backgroundColor: isCompleted ? '#F44336' : '#4CAF50' }]}>
                            <View style={styles.pinSmallCore} />
                        </View>
                    </View>
                </Marker>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    pinSmallWrap: {
        width: 28,
        height: 36,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    pinSmall: {
        width: 22,
        height: 22,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        borderBottomLeftRadius: 2,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#fff',
        transform: [{ rotate: '-45deg' }],
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinSmallCore: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
    },
});

export default AreaMarker;
