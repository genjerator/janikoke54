// Detail.js
import React, {useContext} from 'react';
import { View, Text } from 'react-native';
import {useLocalSearchParams} from "expo-router";
import Challenge from "../component/Challenge";
import {useChallenges} from "../context/ChallengesContext";

const Detail = ( {route}) => {
    const challengeId = useLocalSearchParams();
    const { items } = useChallenges();

    const findChallengeById = items.find(
        (challenge) => challenge.id === parseInt(challengeId.challenge_id)
    );

    return (
        <View>
            <Text>Detail Screen</Text>
            <Challenge challenge={findChallengeById}></Challenge>
        </View>
    );
};


export default Detail;
