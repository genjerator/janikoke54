import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react-native';
import { API_URL } from '../Constants';

const STATUS_COLORS = {
    approved:  { bg: '#e8f5e9', border: '#4CAF50', text: '#2e7d32' },
    completed: { bg: '#e3f2fd', border: '#2196F3', text: '#1565c0' },
    cancelled: { bg: '#fce4ec', border: '#e91e63', text: '#880e4f' },
};

const statusStyle = (status) => STATUS_COLORS[status] ?? { bg: '#f5f5f5', border: '#bbb', text: '#555' };

const MyPrizesScreen = ({ user }) => {
    const { t } = useTranslation();
    const [redemptions, setRedemptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const fetchRedemptions = async ({ silent = false, nextPage = 1 } = {}) => {
        if (nextPage === 1) {
            silent ? setRefreshing(true) : setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await fetch(`${API_URL}/prizes/redemptions?page=${nextPage}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
            });
            const data = await response.json();
            Sentry.logger.info('fetchRedemptions', data);

            const items = data.data || [];
            setRedemptions(prev => nextPage === 1 ? items : [...prev, ...items]);
            setPage(data.meta?.current_page ?? nextPage);
            setLastPage(data.meta?.last_page ?? 1);
        } catch (e) {
            setError(t('errors.couldNotLoadMyPrizes'));
            Sentry.captureException(new Error('MyPrizesScreen.fetchRedemptions', e));
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => { fetchRedemptions(); }, []);

    const handleLoadMore = () => {
        if (!loadingMore && page < lastPage) {
            fetchRedemptions({ nextPage: page + 1 });
        }
    };

    const formatDate = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#4A90E2" />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    return (
        <FlatList
            data={redemptions}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => fetchRedemptions({ silent: true, nextPage: 1 })}
                    colors={['#4A90E2']}
                    tintColor="#4A90E2"
                />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color="#4A90E2" /> : null}
            renderItem={({ item }) => {
                const s = statusStyle(item.status);
                return (
                    <View style={styles.card}>
                        <View style={styles.cardTop}>
                            <Text style={styles.prizeName}>{item.prize_name}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                                <Text style={[styles.statusText, { color: s.text }]}>
                                    {t(`myPrizes.status.${item.status}`, { defaultValue: item.status })}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.codeRow}>
                            <Text style={styles.codeLabel}>{t('myPrizes.code')}</Text>
                            <Text style={styles.codeValue}>{item.redemption_code}</Text>
                        </View>

                        <View style={styles.detailsRow}>
                            <Text style={styles.detail}>⭐ {item.score_cost} {t('myPrizes.pts')}</Text>
                            <Text style={styles.detail}>📦 {t('myPrizes.amount', { count: item.prize_amount })}</Text>
                            <Text style={styles.detail}>🗓 {formatDate(item.redeemed_at)}</Text>
                        </View>

                        {item.notes ? (
                            <Text style={styles.notes}>{item.notes}</Text>
                        ) : null}
                    </View>
                );
            }}
            ListEmptyComponent={<Text style={styles.empty}>{t('myPrizes.noRedemptions')}</Text>}
        />
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, marginTop: 40 },
    list: { padding: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 14,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    prizeName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    codeLabel: {
        fontSize: 12,
        color: '#888',
        marginRight: 8,
        fontWeight: '600',
    },
    codeValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4A90E2',
        letterSpacing: 1,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    detail: {
        fontSize: 12,
        color: '#666',
    },
    notes: {
        marginTop: 8,
        fontSize: 13,
        color: '#888',
        fontStyle: 'italic',
    },
    error: { color: 'red', textAlign: 'center', marginTop: 40 },
    empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});

export default MyPrizesScreen;
