import axios from "axios";
import {API_URL} from "../Constants";

export const fetchChallengesData = async (user) => {

    const url = API_URL + '/round/1';
    console.log(url, new Date().toLocaleString())
    try {

        return await axios.get(url,{
            headers: {
                'Authorization': `Bearer ${user ? user.token : ''}` // Include bearer token in the headers
            }
        });
    } catch (error) {
        console.log(error, "Error:"+url);
    }
};

export const postInsidePolygon = async (payload,user) => {
    try {
        const url =API_URL + '/round/inside/1';
        console.log(url,":url");
        console.log(payload,"payload");
        const response = await axios.post(url, payload,{
            headers: {
                'Authorization': `Bearer ${user ? user.token : ''}` // Include bearer token in the headers
            }
        });
        return response.data.status ?? false
    } catch (error) {
        console.log(error, "Error");
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
    }
};