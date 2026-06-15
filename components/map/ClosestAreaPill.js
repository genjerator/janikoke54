import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDistance } from '../../utils/format';

// Floating pill showing the nearest area and how far away it is. Renders nothing
// until there's an area to show; `opacity` is driven by useMovementPill.
const ClosestAreaPill = ({ area, opacity }) => {
    const { t } = useTranslation();
    if (!area) return null;

    return (
        <Animated.View style={[styles.closestPill, { opacity }]}>
            <Text style={styles.closestLabel}>{t('map.closestArea')}</Text>
            <Text style={styles.closestName} numberOfLines={1}>{area.name}</Text>
            <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>📍 {formatDistance(area.distance)}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    closestPill: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.70)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
        alignItems: 'center',
        maxWidth: '85%',
    },
    closestLabel: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    closestName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 6,
        textAlign: 'center',
    },
    distanceBadge: {
        backgroundColor: '#e8efff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    distanceText: {
        color: '#4A90E2',
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default ClosestAreaPill;
