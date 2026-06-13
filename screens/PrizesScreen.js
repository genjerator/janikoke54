import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Image, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react-native';
import { API_URL } from '../Constants';
import RenderHtml from '../utils/html';

const PrizesScreen = ({ user }) => {
    const { t } = useTranslation();
    const [prizes, setPrizes] = useState([]);
    const [totalScore, setTotalScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [redeeming, setRedeeming] = useState(null); // prize id being redeemed

    const fetchData = async ({ silent = false } = {}) => {
        silent ? setRefreshing(true) : setLoading(true);
        try {
            const [prizesRes, scoreRes] = await Promise.all([
                fetch(`${API_URL}/prizes/1`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${user?.token}`,
                    },
                }),
                fetch(`${API_URL}/scores/1/total`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${user?.token}`,
                    },
                }),
            ]);

            const prizesData = await prizesRes.json();
            const scoreData = await scoreRes.json();

            Sentry.logger.info('fetchPrizes', prizesData);
            Sentry.logger.info('fetchTotalScore', scoreData);

            setPrizes(prizesData.data || []);
            setTotalScore(scoreData.data?.total ?? scoreData.total ?? 0);
        } catch (e) {
            setError(t('errors.couldNotLoadPrizes'));
            Sentry.captureException(new Error('PrizesScreen.fetchData', e));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const confirmRedeem = (prize) => {
        Alert.alert(
            t('prizes.redeemTitle'),
            t('prizes.redeemConfirm', { name: prize.name, cost: prize.cost }),
            [
                { text: t('prizes.cancel'), style: 'cancel' },
                { text: t('prizes.redeem'), style: 'default', onPress: () => doRedeem(prize) },
            ]
        );
    };

    const doRedeem = async (prize) => {
        setRedeeming(prize.id);
        try {
            const response = await fetch(`${API_URL}/prizes/redeem`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ prize_id: prize.id }),
            });

            const data = await response.json();
            Sentry.logger.info('redeemPrize', data);

            if (!response.ok || !data.success) {
                Alert.alert(t('prizes.redeemFailed'), data.message || t('errors.networkError'));
                return;
            }

            // Update balance with value returned by server
            if (data.new_balance?.available_scores !== undefined) {
                setTotalScore(data.new_balance.available_scores);
            }

            Alert.alert(
                t('prizes.redeemSuccess'),
                t('prizes.redeemCode', { code: data.redemption?.redemption_code ?? '' }),
            );
        } catch (e) {
            Alert.alert(t('prizes.redeemFailed'), t('errors.networkError'));
            Sentry.captureException(new Error('PrizesScreen.doRedeem', e));
        } finally {
            setRedeeming(null);
        }
    };

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#4A90E2" />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    return (
        <FlatList
            data={prizes}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => fetchData({ silent: true })}
                    colors={['#4A90E2']}
                    tintColor="#4A90E2"
                />
            }
            ListHeaderComponent={
                totalScore !== null ? (
                    <View style={styles.scoreBanner}>
                        <Text style={styles.scoreBannerText}>
                            ⭐ {t('prizes.yourScore', { score: totalScore })}
                        </Text>
                    </View>
                ) : null
            }
            renderItem={({ item }) => {
                const canRedeem = totalScore !== null && totalScore >= item.cost;
                const missing = item.cost - (totalScore ?? 0);
                const isRedeeming = redeeming === item.id;

                return (
                    <View style={styles.card}>
                        {item.image_url ? (
                            <Image
                                source={{ uri: item.image_url }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderIcon}>🎁</Text>
                            </View>
                        )}
                        <View style={styles.cardBody}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.prizeName} numberOfLines={2}>{item.name}</Text>
                                <View style={styles.costBadge}>
                                    <Text style={styles.costText}>⭐ {item.cost} pts</Text>
                                </View>
                            </View>
                            {item.description ? (
                                <RenderHtml html={item.description} style={styles.description} />
                            ) : null}
                            {item.content ? (
                                <RenderHtml html={item.content} style={styles.content} />
                            ) : null}
                            <View style={styles.footer}>
                                <Text style={styles.amount}>
                                    {t('prizes.available', { count: item.amount })}
                                </Text>
                                {canRedeem ? (
                                    <TouchableOpacity
                                        style={[styles.redeemBtn, isRedeeming && styles.redeemBtnDisabled]}
                                        onPress={() => confirmRedeem(item)}
                                        activeOpacity={0.8}
                                        disabled={isRedeeming}
                                    >
                                        {isRedeeming
                                            ? <ActivityIndicator size="small" color="#fff" />
                                            : <Text style={styles.redeemBtnText}>🎁 {t('prizes.redeem')}</Text>
                                        }
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.needMoreBadge}>
                                        <Text style={styles.needMoreText}>
                                            {t('prizes.needMore', { count: missing })}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                );
            }}
            ListEmptyComponent={<Text style={styles.empty}>{t('prizes.noPrizes')}</Text>}
        />
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, marginTop: 40 },
    list: { padding: 16 },
    scoreBanner: {
        backgroundColor: '#4A90E2',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    scoreBannerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    card: {
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
    image: {
        width: '100%',
        height: 160,
    },
    imagePlaceholder: {
        width: '100%',
        height: 100,
        backgroundColor: '#f0f4ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePlaceholderIcon: {
        fontSize: 40,
    },
    cardBody: {
        padding: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    prizeName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#222',
        flex: 1,
        marginRight: 10,
    },
    costBadge: {
        backgroundColor: '#4A90E2',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    costText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    description: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 6,
    },
    content: {
        fontSize: 13,
        color: '#888',
        lineHeight: 19,
        marginBottom: 6,
    },
    footer: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        fontSize: 13,
        color: '#4CAF50',
        fontWeight: '600',
    },
    redeemBtn: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 90,
        alignItems: 'center',
    },
    redeemBtnDisabled: {
        opacity: 0.6,
    },
    redeemBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    needMoreBadge: {
        backgroundColor: '#fff3e0',
        borderWidth: 1,
        borderColor: '#FFB300',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    needMoreText: {
        color: '#E65100',
        fontSize: 12,
        fontWeight: '600',
    },
    error: { color: 'red', textAlign: 'center', marginTop: 40 },
    empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});

export default PrizesScreen;
