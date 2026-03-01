
import React from 'react';
import {View, FlatList, Button} from 'react-native';
import ChallengeListItem from './list/ChallengeListItem';
import {router} from "expo-router";
import {useChallenges} from "../context/ChallengesContext";

const Challenges = () => {
    const { items } = useChallenges();

    const handlePressItem = ({item}) => {
        console.log(item.id,"SDSDS");
        router.push({pathname: `Details`, params: {"challenge_id":item.id}}); // Remove the braces in params
    };

    return (
        <View>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => <ChallengeListItem item={item} onPressItem={handlePressItem}/>}
            />
        </View>
    );
};

export default Challenges;
