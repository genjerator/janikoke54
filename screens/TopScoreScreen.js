import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { API_URL } from '../Constants';
import { fetchResults } from '../axios/ApiCalls';

const TopScoreScreen = ({ user }) => {
    const [groupedScores, setGroupedScores] = useState([]);
    const [expandedIds, setExpandedIds] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadScores = async () => {
            setLoading(true);
            try {
                const data = await fetchResults(user);
                if (data) {
                    const scoresArray = Object.values(data);
                    
                    // Group by challenge_id
                    const groups = {};
                    scoresArray.forEach(item => {
                        const cid = item.challenge_id;
                        if (!groups[cid]) {
                            groups[cid] = {
                                id: cid,
                                name: item.challenge_name,
                                totalPoints: 0,
                                data: []
                            };
                        }
                        groups[cid].totalPoints += (item.points || 0);
                        groups[cid].data.push(item);
                    });

                    // Sort groups by total points or name if you prefer
                    const sortedGroups = Object.values(groups).sort((a, b) => b.totalPoints - a.totalPoints);
                    setGroupedScores(sortedGroups);
                }
            } catch (err) {
                console.error("Error loading scores:", err);
                setError('Failed to load scores');
            } finally {
                setLoading(false);
            }
        };
        loadScores();
    }, [user]);

    const toggleExpand = (id) => {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#4A90E2" />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    const grandTotal = groupedScores.reduce((acc, curr) => acc + curr.totalPoints, 0);

    return (
        <FlatList
            data={groupedScores}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
                <View style={styles.header}>
                    <Text style={styles.headerText}>⭐ My Scoreboard</Text>
                    <Text style={styles.grandTotalText}>{grandTotal} Total Points</Text>
                </View>
            }
            renderItem={({ item }) => {
                const isExpanded = expandedIds[item.id];
                return (
                    <View style={styles.challengeGroup}>
                        <TouchableOpacity 
                            style={[styles.challengeHeader, isExpanded && styles.expandedHeader]} 
                            onPress={() => toggleExpand(item.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.headerMain}>
                                <Text style={styles.challengeName}>{item.name}</Text>
                                <Text style={styles.countText}>{item.data.length} collections</Text>
                            </View>
                            <View style={styles.headerRight}>
                                <Text style={styles.totalPoints}>{item.totalPoints} pts</Text>
                                <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
                            </View>
                        </TouchableOpacity>

                        {isExpanded && (
                            <View style={styles.detailsContainer}>
                                {item.data.map((col, idx) => (
                                    <View key={col.cidaid || idx} style={styles.detailRow}>
                                        <View style={styles.detailInfo}>
                                            <Text style={styles.areaName}>{col.area_name}</Text>
                                            <Text style={styles.dateText}>
                                                {new Date(col.created_at_unix * 1000).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <Text style={styles.detailPoints}>+{col.points} pts</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                );
            }}
            ListEmptyComponent={<Text style={styles.empty}>No collections yet. Start exploring!</Text>}
        />
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, marginTop: 40 },
    list: { padding: 16 },
    header: {
        backgroundColor: '#4A90E2',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    headerText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    grandTotalText: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '600' },
    challengeGroup: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    challengeHeader: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    expandedHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#f8fbc2' + '22', // Light yellow hint when open
    },
    headerMain: { flex: 1 },
    challengeName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    countText: { fontSize: 13, color: '#888', marginTop: 2 },
    headerRight: { 
        flexDirection: 'row', 
        alignItems: 'center',
        gap: 12
    },
    totalPoints: { 
        fontSize: 18, 
        fontWeight: '800', 
        color: '#4A90E2' 
    },
    chevron: { fontSize: 14, color: '#aaa', width: 20, textAlign: 'center' },
    detailsContainer: {
        backgroundColor: '#fafafa',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    detailInfo: { flex: 1 },
    areaName: { fontSize: 15, fontWeight: '600', color: '#444' },
    dateText: { fontSize: 12, color: '#999', marginTop: 2 },
    detailPoints: { fontSize: 14, fontWeight: 'bold', color: '#2ecc71' },
    error: { color: 'red', textAlign: 'center', marginTop: 40 },
    empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});

export default TopScoreScreen;
