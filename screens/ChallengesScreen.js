import React, { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react-native';

import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { API_URL } from '../Constants';

const ChallengesScreen = ({ user, onOpenMap }) => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

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
            console.log(data);
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

    const [expandedIds, setExpandedIds] = useState({});
    const toggleExpand = (id) =>
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#4A90E2" />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    return (
        <FlatList
            data={challenges}
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
                            <Text style={styles.challengeName}>{item.name}</Text>
                            <View style={styles.headerActions}>
                                <TouchableOpacity
                                    style={styles.mapButton}
                                    onPress={(e) => {
                                        // Prevent the click from bubbling up to the expand/collapse tracker
                                        e.stopPropagation();
                                        onOpenMap && onOpenMap(item);
                                    }}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text style={styles.mapIcon}>📍 Map</Text>
                                </TouchableOpacity>
                                <Text style={styles.chevron}>
                                    {expandedIds[item.id] ? '▲' : '▼'}
                                </Text>
                            </View>
                        </View>
                        {item.description ? (
                            <Text style={styles.challengeDesc}>{item.description}</Text>
                        ) : null}
                    </TouchableOpacity>

                    {/* Areas — only shown when expanded */}
                    {expandedIds[item.id] && item.areas && item.areas.length > 0 && (
                        <View style={styles.areasContainer}>
                            <Text style={styles.areasLabel}>Areas ({item.areas.length})</Text>
                            {item.areas.map((area) => (
                                <View key={area.id} style={styles.areaRow}>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: area.status === 1 ? '#4CAF50' : '#bbb' }
                                    ]} />
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
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        marginRight: 10,
    },
    mapIcon: {
        color: '#fff',
        fontSize: 12,
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
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
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
    error: { color: 'red', textAlign: 'center', marginTop: 40 },
    empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});

export default ChallengesScreen;
