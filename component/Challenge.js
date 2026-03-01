import {View} from "react-native";
import React, { useState} from 'react';
import moment from 'moment';
import WorldMap from '../component/WorldMap'

const Challenge = ({challenge}) => {
    const [errorMsg, setErrorMsg] = useState(null);
    const [currentTimestamp, setCurrentTimestamp] = useState(moment.now());
    //console.log(challenge,"challenge");
    let text = 'Waiting...';

    if (errorMsg) {
        text = errorMsg;
    } else {
        const formattedTime = moment(currentTimestamp).format('HH:mm:ss');
        text = `time: ${formattedTime} `;
    }
    return (
        <>
            <View>
                <WorldMap  style={{flex: 1}}
                    challenge={challenge}
                />
            </View>
        </>
    );
};

export default Challenge;
