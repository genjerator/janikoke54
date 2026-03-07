import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as Sentry from '@sentry/react-native';
import * as Location from 'expo-location';

import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { API_URL } from '../Constants';
import { getDistanceInMeters } from '../utils/geo';

const PulsingIcon = ({ children }) => {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scale, {
                    toValue: 1.05,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            {children}
        </Animated.View>
    );
};

const ChallengesScreen = ({ user, onOpenMap }) => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    // Get current location when the screen loads
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Location permission denied');
                    Sentry.logger.info('Location permission denied');
                    return;
                }

                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setUserLocation(location.coords);
                console.log('Current location:', location.coords);
                Sentry.logger.info('Current location', {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (e) {
                console.error('Error getting location:', e);
                Sentry.logger.error('Error getting location', e);
            }
        })();
    }, []);

    const fetchChallenges = async ({ silent = false } = {}) => {
        silent ? setRefreshing(true) : setLoading(true);
        try {
            const response = await fetch(`${API_URL}/round/1`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
            });
            const data = await response.json();
            Sentry.logger.info("fetchChallenges",data);
            setChallenges(data.data || data);
        } catch (e) {
            setError('Could not load challenges');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchChallenges(); }, []);

    // Sort challenges by distance from user location using center_point
    const sortedChallenges = useMemo(() => {
        if (!userLocation || !challenges.length) return challenges;
        
        return [...challenges]
            .map(challenge => {
                const cp = challenge.center_point;
                if (cp && cp.latitude && cp.longitude) {
                    const distance = getDistanceInMeters(
                        userLocation.latitude,
                        userLocation.longitude,
                        Number(cp.latitude),
                        Number(cp.longitude)
                    );
                    return { ...challenge, _distance: distance };
                }
                return { ...challenge, _distance: Infinity };
            })
            .sort((a, b) => a._distance - b._distance);
    }, [challenges, userLocation]);

    // Format distance for display
    const formatDistance = (dist) => {
        if (dist === null || dist === undefined || dist === Infinity) return "";
        if (dist < 1000) return `${Math.round(dist)} m`;
        return `${(dist / 1000).toFixed(1)} km`;
    };

    const [expandedIds, setExpandedIds] = useState({});
    const toggleExpand = (id) =>
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#4A90E2" />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    return (
        <FlatList
            data={sortedChallenges}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => fetchChallenges({ silent: true })}
                    colors={['#4A90E2']}
                    tintColor="#4A90E2"
                />
            }
            renderItem={({ item }) => (
                <View style={styles.challengeCard}>
                    {/* Tappable header */}
                    <TouchableOpacity
                        style={styles.challengeHeader}
                        onPress={() => toggleExpand(item.id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.challengeHeaderRow}>
                            <Text style={styles.challengeName}>{item.name} {formatDistance(item._distance) && (
                                <Text style={styles.distanceInline}>📍 {formatDistance(item._distance)}</Text>
                            )}</Text>
                            <View style={styles.headerActions}>
                                <PulsingIcon>
                                    <TouchableOpacity
                                        style={styles.mapButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            onOpenMap && onOpenMap(item);
                                        }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.mapIconEmoji}>📍</Text>
                                            <Text style={styles.mapIconText}> Map</Text>
                                        </View>
                                    </TouchableOpacity>
                                </PulsingIcon>
                                <Text style={styles.chevron}>
                                    {expandedIds[item.id] ? '▲' : '▼'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Areas — only shown when expanded */}
                    {expandedIds[item.id] && item.areas && item.areas.length > 0 && (
                        <View style={styles.areasContainer}>
                            <Text style={styles.areasLabel}>Areas ({item.areas.length})</Text>
                            {item.areas.map((area) => (
                                <View key={area.id} style={styles.areaRow}>
                                    <View style={styles.statusDotContainer}>
                                        {area.status === 0 && (
                                            <PulsingIcon>
                                                <View style={[styles.statusDot, { backgroundColor: '#bbb', position: 'absolute' }]} />
                                            </PulsingIcon>
                                        )}
                                        <View style={[
                                            styles.statusDot,
                                            { backgroundColor: area.status === 1 ? '#4CAF50' : '#bbb' }
                                        ]} />
                                    </View>
                                    <View style={styles.areaInfo}>
                                        <Text style={styles.areaName}>{area.name}</Text>
                                        {area.description ? (
                                            <Text style={styles.areaDesc}>{area.description}</Text>
                                        ) : null}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No challenges found.</Text>}
        />
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, marginTop: 40 },
    list: { padding: 16 },
    challengeCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.09,
        shadowRadius: 5,
        elevation: 4,
    },
    challengeHeader: {
        backgroundColor: '#4A90E2',
        padding: 14,
    },
    challengeHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapButton: {
        backgroundColor: 'rgba(255,255,255,0.4)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    mapIconEmoji: {
        fontSize: 18,
        marginRight: 4,
    },
    mapIconText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    chevron: {
        color: '#fff',
        fontSize: 12,
    },
    challengeName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
    },
    challengeDesc: {
        fontSize: 13,
        color: '#d0e6ff',
        marginTop: 2,
    },
    areasContainer: {
        padding: 12,
    },
    areasLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    areaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    statusDotContainer: {
        width: 10,
        height: 10,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    areaInfo: { flex: 1 },
    areaName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    areaDesc: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    descRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    distanceInline: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.85,
        marginLeft: 8,
    },
    error: { color: 'red', textAlign: 'center', marginTop: 40 },
    empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});

export default ChallengesScreen;
