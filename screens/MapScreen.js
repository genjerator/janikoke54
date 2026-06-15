import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { styles } from './MapScreen.styles';
import UserMarker from '../components/map/UserMarker';
import AreaMarker from '../components/map/AreaMarker';
import ClosestAreaPill from '../components/map/ClosestAreaPill';
import CongratsPopup from '../components/map/CongratsPopup';
import ArticlePopup from '../components/map/ArticlePopup';
import TrackingBanner from '../components/map/TrackingBanner';
import { useChallengeData } from '../hooks/useChallengeData';
import { useUserLocation } from '../hooks/useUserLocation';
import { useChallengePolygons } from '../hooks/useChallengePolygons';
import { useAreaArticles } from '../hooks/useAreaArticles';
import { useAreaCollection } from '../hooks/useAreaCollection';
import { useBackHandler } from '../hooks/useBackHandler';
import { useTrackingPulse } from '../hooks/useTrackingPulse';
import { useMovementPill } from '../hooks/useMovementPill';
import { useFitToCoordinates } from '../hooks/useFitToCoordinates';

const MapScreen = ({ challenge, user, onBack }) => {
    const { t } = useTranslation();
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef(null);

    const { currentChallenge, refreshChallengeData } = useChallengeData(challenge, user);
    const { locationPermission, userLocation } = useUserLocation();
    const { allPolygons, mapRegion } = useChallengePolygons(currentChallenge);
    const { getRandomArticle } = useAreaArticles(currentChallenge?.id, user);
    const { closestArea, collectedArea, activeArticle, clearCollectedArea } = useAreaCollection({
        userLocation,
        allPolygons,
        user,
        currentChallenge,
        onCollected: refreshChallengeData,
        getRandomArticle,
    });

    const trackingDot = useTrackingPulse(locationPermission);
    const { pillOpacity, handleMapMove, handleMapMoveComplete } = useMovementPill();
    useBackHandler(onBack);
    useFitToCoordinates({ mapReady, mapRef, allPolygons, userLocation });

    return (
        <View style={styles.container}>
            {/* Header / Breadcrumb */}
            <TouchableOpacity style={styles.header} onPress={onBack}>
                <Text style={styles.breadcrumbText}>{t('challenges.title')}</Text>
                <Text style={styles.breadcrumbSeparator}> / </Text>
                <Text style={styles.title} numberOfLines={1}>{challenge?.name}</Text>
            </TouchableOpacity>

            {locationPermission && <TrackingBanner dotOpacity={trackingDot} />}

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
                {allPolygons.map((area, index) => (
                    <AreaMarker key={`${area.id}-${index}`} area={area} />
                ))}

                {userLocation && (
                    <UserMarker
                        coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
                        title={t('map.you')}
                    />
                )}
            </MapView>

            <ClosestAreaPill area={closestArea} opacity={pillOpacity} />

            {/* Show a random article for the area; fall back to the congrats
                popup when that area has no articles. */}
            {activeArticle ? (
                <ArticlePopup
                    article={activeArticle}
                    areaName={collectedArea?.name}
                    onClose={clearCollectedArea}
                />
            ) : (
                <CongratsPopup area={collectedArea} onClose={clearCollectedArea} />
            )}
        </View>
    );
};

export default MapScreen;
