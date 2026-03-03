import axios from "axios";
import {API_URL} from "../Constants";
import * as Sentry from '@sentry/react-native';


export const fetchChallengesData = async (user) => {

    const url = API_URL + '/round/1';
    console.log(url, new Date().toLocaleString())
    Sentry.logger.info(url, new Date().toLocaleString())
    try {

        return await axios.get(url,{
            headers: {
                'Authorization': `Bearer ${user ? user.token : ''}` // Include bearer token in the headers
            }
        });
    } catch (error) {
        console.log(error, "Error:"+url);
        Sentry.captureException(new Error('FetchChallengesData', error,url));
    }
};

export const postInsidePolygon = async (payload,user) => {
    try {
        const url =API_URL + '/round/inside/1';
        console.log(url,":url");
        Sentry.logger.info(url,":url");
        console.log(payload,"payload");
        Sentry.logger.info(payload,"payload");
        const response = await axios.post(url, payload,{
            headers: {
                'Authorization': `Bearer ${user ? user.token : ''}` // Include bearer token in the headers
            }
        });
        return response.data.status ?? false
    } catch (error) {
        console.log(error, "Error");
        Sentry.captureException(new Error('postInsidePolygon', error,url));
    }
};

export const fetchResults = async (user) => {

    const url = API_URL + '/round/1/result';

    try {
        const response = await axios.get(url,{
            headers: {
                'Authorization': `Bearer ${user ? user.token : ''}` // Include bearer token in the headers
            }
        });

        return response.data;
    } catch (error) {
        console.log(error, "Error:"+url);
        Sentry.captureException(new Error('FetchResults', error,url));
    }
};