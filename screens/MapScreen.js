import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistanceInMeters, getPolygonCenter, isPointInPolygon } from '../utils/geo';
import { postInsidePolygon, fetchChallengesData } from '../axios/ApiCalls';
import * as Sentry from '@sentry/react-native';


const MapScreen = ({ challenge, user, onBack }) => {
    const [locationPermission, setLocationPermission] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [closestArea, setClosestArea] = useState(null);
    const [collectedArea, setCollectedArea] = useState(null); // The area we just entered
    const [currentChallenge, setCurrentChallenge] = useState(challenge);

    // Animation refs for the closest area pill
    const pillOpacity = useRef(new Animated.Value(0)).current;
    const fadeTimeout = useRef(null);

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
                <Text style={styles.breadcrumbText}>Challenges</Text>
                <Text style={styles.breadcrumbSeparator}> / </Text>
                <Text style={styles.title} numberOfLines={1}>{challenge?.name}</Text>
            </TouchableOpacity>

            {/* Google Map */}
            <MapView
                style={styles.map}
                initialRegion={mapRegion}
                showsUserLocation={locationPermission}
                showsMyLocationButton={locationPermission}
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
                                <Marker
                                    coordinate={center}
                                    title={area.name}
                                    pinColor={isCompleted ? '#F44336' : '#4CAF50'}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </MapView>

            {/* Closest Area Info Pill */}
            {closestArea && (
                <Animated.View style={[styles.closestPill, { opacity: pillOpacity }]}>
                    <Text style={styles.closestLabel}>Closest Area:</Text>
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
                        <Text style={styles.popupTitle}>Congratulations!</Text>
                        <Text style={styles.popupText}>You have collected a point.</Text>
                        <Text style={styles.popupSubtext}>({collectedArea.name})</Text>
                        <TouchableOpacity 
                            style={styles.closeButton} 
                            onPress={() => setCollectedArea(null)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
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
