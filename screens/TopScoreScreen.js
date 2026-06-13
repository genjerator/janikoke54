import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, BackHandler, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../Constants';
import { fetchResults, fetchTotalScore } from '../axios/ApiCalls';

const TopScoreScreen = ({ user, onBack }) => {
    const { t } = useTranslation();
    const [groupedScores, setGroupedScores] = useState([]);
    const [availableScore, setAvailableScore] = useState(0);
    const [expandedIds, setExpandedIds] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const backAction = () => {
            if (onBack) {
                onBack();
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [onBack]);

    const loadScores = async ({ silent = false } = {}) => {
        silent ? setRefreshing(true) : setLoading(true);
        try {
            const [data, totalResp] = await Promise.all([
                fetchResults(user),
                fetchTotalScore(user),
            ]);
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
                    // Count everything earned here. Spending is tracked via prize
                    // redemptions (see the Available figure), not by flipping rows.
                    groups[cid].totalPoints += (item.points || 0);
                    groups[cid].data.push(item);
                });

                // Sort groups by total points or name if you prefer
                const sortedGroups = Object.values(groups).sort((a, b) => b.totalPoints - a.totalPoints);
                setGroupedScores(sortedGroups);
            }
            // Available balance = earned - redeemed, from the same endpoint
            // the Prizes screen uses, so the two always agree.
            setAvailableScore(totalResp?.data?.total ?? totalResp?.total ?? 0);
        } catch (err) {
            console.error("Error loading scores:", err);
            setError(t('errors.failedToLoadScores'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadScores(); }, [user]);

    const toggleExpand = (id) => {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#4A90E2" />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    const grandTotal = groupedScores.reduce((acc, curr) => acc + curr.totalPoints, 0);
    const redeemed = Math.max(0, grandTotal - availableScore);

    return (
        <FlatList
            data={groupedScores}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => loadScores({ silent: true })}
                    colors={['#4A90E2']}
                    tintColor="#4A90E2"
                />
            }
            ListHeaderComponent={
                <View style={styles.header}>
                    <Text style={styles.headerText}>⭐ {t('score.myScoreboard')}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{grandTotal}</Text>
                            <Text style={styles.statLabel}>{t('score.earned')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{redeemed}</Text>
                            <Text style={styles.statLabel}>{t('score.redeemed')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, styles.statValueAvailable]}>{availableScore}</Text>
                            <Text style={styles.statLabel}>{t('score.available')}</Text>
                        </View>
                    </View>
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
                                <Text style={styles.countText}>{t('score.collections', { count: item.data.length })}</Text>
                            </View>
                            <View style={styles.headerRight}>
                                <Text style={styles.totalPoints}>{t('score.points', { points: item.totalPoints })}</Text>
                                <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
                            </View>
                        </TouchableOpacity>

                        {isExpanded && (
                            <View style={styles.detailsContainer}>
                                {item.data.map((col, idx) => {
                                    const spent = col.status === 0;
                                    return (
                                    <View key={col.cidaid || idx} style={[styles.detailRow, spent && styles.detailRowSpent]}>
                                        <View style={styles.detailInfo}>
                                            <Text style={[styles.areaName, spent && styles.textSpent]}>{col.area_name}</Text>
                                            <Text style={[styles.dateText, spent && styles.textSpent]}>
                                                {new Date(col.created_at_unix * 1000).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <View style={styles.pointsCol}>
                                            <Text style={[styles.detailPoints, spent && styles.detailPointsSpent]}>
                                                {t('score.plusPoints', { points: col.points })}
                                            </Text>
                                            {spent && <Text style={styles.spentLabel}>{t('score.spent')}</Text>}
                                        </View>
                                    </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                );
            }}
            ListEmptyComponent={<Text style={styles.empty}>{t('score.noCollections')}</Text>}
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
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'stretch',
        marginTop: 14,
    },
    statBox: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
    statValueAvailable: { color: '#ffe082' },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: '600' },
    statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.25)' },
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
    detailPointsSpent: { color: '#e74c3c', textDecorationLine: 'line-through' },
    pointsCol: { alignItems: 'flex-end' },
    spentLabel: { fontSize: 10, color: '#e74c3c', fontWeight: '600', marginTop: 2 },
    detailRowSpent: { backgroundColor: '#fff5f5' },
    textSpent: { color: '#e74c3c', opacity: 0.7 },
    error: { color: 'red', textAlign: 'center', marginTop: 40 },
    empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});

export default TopScoreScreen;
