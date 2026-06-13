import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration, BackHandler } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { getDistanceInMeters, getPolygonCenter, isPointInPolygon } from '../utils/geo';
import { postInsidePolygon, fetchChallengesData } from '../axios/ApiCalls';
import * as Sentry from '@sentry/react-native';


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

const MapScreen = ({ challenge, user, onBack }) => {
    const { t } = useTranslation();
    const [locationPermission, setLocationPermission] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [closestArea, setClosestArea] = useState(null);
    const [collectedArea, setCollectedArea] = useState(null); // The area we just entered
    const [currentChallenge, setCurrentChallenge] = useState(challenge);
    const [mapReady, setMapReady] = useState(false);

    const mapRef = useRef(null);
    const fittedWithUser = useRef(false);

    // Animation refs for the closest area pill
    const pillOpacity = useRef(new Animated.Value(0)).current;
    const fadeTimeout = useRef(null);

    // Pulsing dot for the "location tracking is on" disclosure
    const trackingDot = useRef(new Animated.Value(1)).current;

    const handleMapMove = () => {
        if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
        Animated.timing(pillOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleMapMoveComplete = () => {
        if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
        fadeTimeout.current = setTimeout(() => {
            Animated.timing(pillOpacity, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start();
        }, 1500); 
    };

    const refreshChallengeData = async () => {
        if (!user) return;
        try {
            const response = await fetchChallengesData(user);
            const allChallenges = response.data.data || response.data;
            const updated = allChallenges.find(c => c.id === currentChallenge.id);
            if (updated) {
                setCurrentChallenge(updated);
            }
        } catch (err) {
            console.error("Error refreshing challenge data:", err);
        }
    };

    useEffect(() => {
        let locationSubscription;

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setLocationPermission(true);
                // Start tracking location
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

    // Pulse the tracking dot while location tracking is active
    useEffect(() => {
        if (!locationPermission) return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(trackingDot, { toValue: 0.2, duration: 800, useNativeDriver: true }),
                Animated.timing(trackingDot, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [locationPermission]);

    // Handle hardware back button
    useEffect(() => {
        const backAction = () => {
            if (onBack) {
                onBack();
                return true; // Return true to indicate we handled the event and prevent default behavior
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [onBack]);

    // Get all valid polygons from the challenge areas
    const allPolygons = React.useMemo(() => {
        console.log(currentChallenge);
        Sentry.logger.info("currentChallenge", currentChallenge);
        if (!currentChallenge?.areas) return [];
        return currentChallenge.areas.flatMap(area => {
            if (!area.polygons) return [];
            return {
                ...area,
                polyCoords: area.polygons.map(p => ({
                    latitude: Number(p.latitude),
                    longitude: Number(p.longitude)
                }))
            };
        });
    }, [currentChallenge]);

    // Calculate initial region based on all polygons, or fallback to Novi Sad
    const mapRegion = React.useMemo(() => {
        Sentry.captureException(new Error('First error'));
        console.log("allPolygons", allPolygons);
        Sentry.logger.info("allPolygons", allPolygons);
        if (allPolygons.length > 0) {
            let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
            let hasValidCoords = false;

            allPolygons.forEach(area => {
                area.polyCoords.forEach(c => {
                    hasValidCoords = true;
                    minLat = Math.min(minLat, c.latitude);
                    maxLat = Math.max(maxLat, c.latitude);
                    minLng = Math.min(minLng, c.longitude);
                    maxLng = Math.max(maxLng, c.longitude);
                });
            });

            if (hasValidCoords) {
                return {
                    latitude: (minLat + maxLat) / 2,
                    longitude: (minLng + maxLng) / 2,
                    latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.5),
                    longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.5),
                };
            }
        }
        return {
            latitude: 45.267136,
            longitude: 19.833549,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        };
    }, [allPolygons]);

    // Calculate closest area when user location or polygons change
    useEffect(() => {
        if (!userLocation || allPolygons.length === 0) return;

        let minDistance = Infinity;
        let closest = null;
        let insideArea = null;

        allPolygons.forEach(area => {
            // Check if user is inside this polygon and it is NOT collected yet (status === 0)
            console.log("area.status", area.status);
            if (area.status === 0 && isPointInPolygon(userLocation, area.polyCoords)) {
                console.log("User is inside area:", area);
                Sentry.logger.info("User is inside area:", area);
                insideArea = area;
            }

            const center = getPolygonCenter(area.polyCoords);
            if (center) {
                const dist = getDistanceInMeters(
                    userLocation.latitude,
                    userLocation.longitude,
                    center.latitude,
                    center.longitude
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    closest = { ...area, distance: dist };
                }
            }
        });

        if (insideArea && !collectedArea) {
            setCollectedArea(insideArea);
            Vibration.vibrate([0, 500, 200, 500]); // Vibrate pattern: wait 0ms, vibrate 500ms, wait 200ms, vibrate 500ms
            
            // Call the API endpoint
            if (user) {
                postInsidePolygon({
                    area_id: insideArea.id,
                    challenge_id: currentChallenge.id
                }, user).then(() => {
                    // Refresh data from server to sync state
                    console.log("Collection posted successfully");
                    Sentry.logger.info("Collection posted successfully");
                    refreshChallengeData();
                }).catch(err => {
                    console.error("Error posting collection:", err); 
                    Sentry.logger.error("Error posting collection:", err)
                });
            }
        }

        setClosestArea(closest);
    }, [userLocation, allPolygons]);

    // Fit the map so all areas AND the user's position are visible, zoomed in
    // as close as possible. Fit once on load, then once more when the user's
    // location first arrives — after that, stop so we don't fight panning/zoom.
    useEffect(() => {
        if (!mapReady || !mapRef.current || fittedWithUser.current) return;

        const coords = [];
        allPolygons.forEach(area => area.polyCoords.forEach(c => coords.push(c)));
        if (userLocation) {
            coords.push({ latitude: userLocation.latitude, longitude: userLocation.longitude });
        }
        if (coords.length === 0) return;

        mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 90, right: 60, bottom: 120, left: 60 },
            animated: true,
        });

        // Only lock once we've framed the user too; until then keep re-fitting.
        if (userLocation) fittedWithUser.current = true;
    }, [mapReady, allPolygons, userLocation]);

    // Format distance for display
    const formatDistance = (dist) => {
        if (dist === null || dist === undefined) return '';
        if (dist < 1000) return `${Math.round(dist)} m`;
        return `${(dist / 1000).toFixed(1)} km`;
    };
    return (
        <View style={styles.container}>
            {/* Header / Breadcrumb */}
            <TouchableOpacity style={styles.header} onPress={onBack}>
                <Text style={styles.breadcrumbText}>{t('challenges.title')}</Text>
                <Text style={styles.breadcrumbSeparator}> / </Text>
                <Text style={styles.title} numberOfLines={1}>{challenge?.name}</Text>
            </TouchableOpacity>

            {/* Location tracking disclosure (Google Play requirement) */}
            {locationPermission && (
                <View style={styles.trackingBanner}>
                    <Animated.View style={[styles.trackingDot, { opacity: trackingDot }]} />
                    <Text style={styles.trackingText}>{t('map.locationTracking')}</Text>
                </View>
            )}

            {/* Google Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={mapRegion}
                onMapReady={() => setMapReady(true)}
                showsUserLocation={false}
                showsMyLocationButton={false}
                onRegionChange={handleMapMove}
                onRegionChangeComplete={handleMapMoveComplete}
            >
                {allPolygons.map((area, index) => {
                    const isCompleted = area.status === 1;
                    const center = getPolygonCenter(area.polyCoords);
                    return (
                        <React.Fragment key={`${area.id}-${index}`}>
                            <Polygon
                                coordinates={area.polyCoords}
                                fillColor={isCompleted ? 'rgba(244, 67, 54, 0.4)':'rgba(76, 175, 80, 0.4)' }
                                strokeColor={isCompleted ? '#F44336':'#4CAF50' }
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
                        </React.Fragment>
                    );
                })}

                {/* Current location — bigger, solid blue pin (slightly pulsing) */}
                {userLocation && (
                    <UserMarker
                        coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
                        title={t('map.you')}
                    />
                )}
            </MapView>

            {/* Closest Area Info Pill */}
            {closestArea && (
                <Animated.View style={[styles.closestPill, { opacity: pillOpacity }]}>
                    <Text style={styles.closestLabel}>{t('map.closestArea')}</Text>
                    <Text style={styles.closestName} numberOfLines={1}>{closestArea.name}</Text>
                    <View style={styles.distanceBadge}>
                        <Text style={styles.distanceText}>📍 {formatDistance(closestArea.distance)}</Text>
                    </View>
                </Animated.View>
            )}

            {/* Congratulations Popup Overlay */}
            {collectedArea && (
                <View style={styles.popupOverlay}>
                    <View style={styles.popupBox}>
                        <Text style={styles.popupEmoji}>🎉</Text>
                        <Text style={styles.popupTitle}>{t('score.congratulations')}</Text>
                        <Text style={styles.popupText}>{t('score.collectedPoint')}</Text>
                        <Text style={styles.popupSubtext}>({collectedArea.name})</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setCollectedArea(null)}
                        >
                            <Text style={styles.closeButtonText}>{t('score.close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
    trackingText: {
        color: '#3a5a8c',
        fontSize: 12,
        fontWeight: '600',
    },
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
    popupOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    popupBox: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    popupEmoji: {
        fontSize: 50,
        marginBottom: 10,
    },
    popupTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 8,
        textAlign: 'center',
    },
    popupText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    popupSubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#4A90E2',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default MapScreen;
