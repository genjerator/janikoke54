import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { API_URL } from '../Constants';

const TopScoreScreen = ({ user }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/results`, {
                    headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();
                setScores(data.data || data);
            } catch (e) {
                setError('Could not load top scores');
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
    }, []);

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#4A90E2" />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    return (
        <FlatList
            data={scores}
            keyExtractor={(item, index) => String(item.id || index)}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
                <View style={styles.header}>
                    <Text style={styles.headerText}>⭐ Top Scores</Text>
                </View>
            }
            renderItem={({ item, index }) => (
                <View style={styles.card}>
                    <Text style={styles.rank}>#{index + 1}</Text>
                    <View style={styles.info}>
                        <Text style={styles.name}>{item.name || item.user?.name || 'Player'}</Text>
                        <Text style={styles.points}>{item.points ?? item.score ?? '-'} pts</Text>
                    </View>
                </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No scores yet.</Text>}
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    rank: { fontSize: 20, fontWeight: '800', color: '#4A90E2', width: 40 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600', color: '#333' },
    points: { fontSize: 14, color: '#888', marginTop: 2 },
    error: { color: 'red', textAlign: 'center', marginTop: 40 },
    empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});

export default TopScoreScreen;
