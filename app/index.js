import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import Challenges from "../component/Challenges";
import {fetchChallengesData} from "../axios/ApiCalls";
import {useChallenges} from "../context/ChallengesContext";
import {useUser} from "../context/UserContext";
import {router} from "expo-router";

const Home = () => {
    const {setChallenges} = useChallenges();
    const {user, loadUserData, clearUser} = useUser();
    const [challengeText, setChallengeText] = useState("");

    const handleResults = async () => {
        router.push({pathname: `Results`});
    };
    const handleLogin = async () => {
        router.push({pathname: `Login`});
    };
    const fetchData = async () => {
        try {
            console.log("user",user)
            const data = await fetchChallengesData(user);
            setChallenges(data.data)
            setChallengeText("Choose a challenge: ")
        } catch (error) {
            console.error('Error setting data:', error);
        }
    };
    const handleLogout = async () => {
        try {
            clearUser()
            setChallenges([]);
            setChallengeText("Please login to continue ")
        } catch (e) {
            console.log("userlogout", user);
        }
    };
    useEffect(() => {
        setChallengeText("Loading user...");
        loadUserData();
        setChallengeText("Welcome ");
    }, []);
    useEffect(() => {
        console.log("kjkjk", user);


        if (user && user.name) {
            fetchData();
        } else {
            router.push({pathname: `Login`});
        }
    }, [user]);


    return (
        <>
            <View style={styles.container}>
                {(user && user.name) ? (
                    <View style={styles.loggedInContainer}>
                        <Text style={styles.greetingText}>
                            {challengeText} {user.name}
                        </Text>
                        <View style={styles.buttonContainer}>
                            <Challenges></Challenges>
                        </View>
                        {/* Results Button */}
                        <View style={styles.buttonContainer}>
                            <Button
                                color="#6200EE"
                                title="Results"
                                onPress={handleResults}
                            />
                        </View>

                        {/* Logout Button */}
                        <View style={styles.buttonContainer}>
                            <Button
                                color="#6200EE"
                                title="Logout"
                                onPress={handleLogout}
                            />
                        </View>
                    </View>
                ) : <View style={styles.loggedOutContainer}>
                    <Button color="#6200EE" title="Login" onPress={handleLogin}/>
                </View>}

            </View>
        </>
    );
};
const styles = StyleSheet.create({
    loggedInContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        //padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5, // Android shadow
    },
    greetingText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        marginVertical: 8, // Add spacing between buttons
    },
    loggedOutContainer: {
        width: '90%',
        alignItems: 'center',
        padding: 16,
    },
});


export default Home;
