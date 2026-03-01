import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { fetchResults } from "../axios/ApiCalls";
import { useResults } from "../context/ResultsContext";
import { useUser } from "../context/UserContext";

const Results = ({ route }) => {
    const { items, setResults } = useResults();
    const { user, loadUserData } = useUser();
    const [areaNamesPoints, setAreaNamesPoints] = useState([]);
    const [sum, setSum] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setResults([]);
                const data = await fetchResults(user);
                setResults(data);
                console.log("results", items);
                console.log("data", data);
            } catch (error) {
                console.error('Error setting data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log(items, "areaNamesAndPoints");
        let total = 0;
        const test = Object.keys(items).map(key => {
            const challenge = items[key];
            total += challenge.points;
            return { area_name: challenge.area_name, points: challenge.points };
        });
        setSum(total);
        setAreaNamesPoints(test);
        console.log(areaNamesPoints, "areaNamesAndPoints");
    }, [items]);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.areaName}>{item.area_name}</Text>
            <Text style={styles.points}>Points: {item.points}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.totalScore}>Score total: {sum}</Text>
            </View>
            <FlatList
                data={areaNamesPoints}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 16,
    },
    header: {
        backgroundColor: '#6200EE',
        paddingVertical: 16,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    totalScore: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    areaName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    points: {
        fontSize: 16,
        color: '#6200EE',
    },
});

export default Results;
