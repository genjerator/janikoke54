import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

// "Location tracking is on" disclosure banner (Google Play requirement).
const TrackingBanner = ({ dotOpacity }) => {
    const { t } = useTranslation();

    return (
        <View style={styles.trackingBanner}>
            <Animated.View style={[styles.trackingDot, { opacity: dotOpacity }]} />
            <Text style={styles.trackingText}>{t('map.locationTracking')}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    trackingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(238, 244, 255, 0.55)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(219, 230, 255, 0.5)',
    },
    trackingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 8,
    },
    trackingText: {
        color: '#3a5a8c',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default TrackingBanner;
