import * as geolib from "geolib";
import {fetchChallengesData} from "../axios/ApiCalls";


export const polygonCoordinates = [{longitude: 19.840782, latitude: 45.239443}, {
    longitude: 19.840858,
    latitude: 45.239186
}, {longitude: 19.841212, latitude: 45.239247}, {longitude: 19.841120, latitude: 45.239477}];
export const polygonsCoordinates = [

    [
        {longitude: 19.4723957, latitude: 44.2208144},
        {longitude: 19.4718119, latitude: 44.2193685},
        {longitude: 19.4690957, latitude: 44.2200148}
    ],

    [
        {longitude: 19.8384440, latitude: 45.2378003},
        {longitude: 19.8386800, latitude: 45.2373319},
        {longitude: 19.8391145, latitude: 45.2374566},
        {longitude: 19.8388839, latitude: 45.2379061},
        {longitude: 19.8384440, latitude: 45.2378003}
    ],
    [
        {longitude: 19.8416734, latitude: 45.2356698},
        {longitude: 19.8420113, latitude: 45.2347329},
        {longitude: 19.843685, latitude: 45.2349596},
        {longitude: 19.8431325, latitude: 45.2360022},
        {longitude: 19.8416734, latitude: 45.2356698}
    ],
    [
        {longitude: 19.840782, latitude: 45.239443},
        {longitude: 19.840858, latitude: 45.239186},
        {longitude: 19.841212, latitude: 45.239247},
        {longitude: 19.841120, latitude: 45.239477}
    ]
];

export const polygoneer = (location = []) => {
    return polygonsCoordinates.map((coords, index) => ({
        coords: coords,
        id: index + 1,
        name: `Polygon ${index + 1}`,
        distanceFromCenter: distanceFromCenterPolygon(location?.coords?.latitude, location?.coords?.longitude, coords),
        inside: geolib.isPointInPolygon({
            latitude: (location && location.coords && location.coords.latitude) ?? 45.8,
            longitude: (location && location.coords && location.coords.longitude) ?? 9.3,
        }, coords)
    }));
}

export const processPolygonFromChallenge = (location = [], challenge) => {
    try {
        return challenge.areas.map((area, index) => {

            const inside = isInsidePolygon(location, area, area.status);
            console.log("INSIDE:",inside,"location:",location)
            return {
                coords: area.polygons,
                id: challenge.id,
                name: challenge.name,
                distanceFromCenter: distanceFromCenterPolygon(
                    (location && location.coords && location.coords.latitude) ?? 45.8,
                    (location && location.coords && location.coords.longitude) ?? 9.3, area.polygons),
                loc: (location && location.coords && location.coords.latitude),
                status: area.status,
                area_id: area.id,
                inside: inside,
                color: getPolygonColor(inside, area.status)
            };

        });
    } catch (error) {
        console.error("Error occurred:", error);
        // Handle the error, e.g., return a default value or log it
        return null;
    }
}
export const testCenter = geolib.getCenter(polygonCoordinates);

export const distanceFromCenterPolygon = (lat, lng, polygon) => {
    if (lat && lng) {
        const center = geolib.getCenter(polygon);
        return geolib.getDistance({latitude: lat, longitude: lng}, center);
    }
    return 666;
}

const isInsidePolygon = (location, area, status) => {
    const inside = geolib.isPointInPolygon({
        latitude: (location && location.coords && location.coords.latitude),
        longitude: (location && location.coords && location.coords.longitude),
    }, area.polygons) ? area.id : false
    return inside;
}

export const replaceAreaInChallenge = (challenges, challengeId, newArea) => {
    return challenges.map(challenge => {
        if (challenge.id === challengeId) {
            const updatedAreas = challenge.areas.map(area => {
                if (area.id === newArea.id) {
                    return newArea;
                }
                return area;
            });
            return {
                ...challenge,
                areas: updatedAreas
            };
        }
        return challenge;
    });
};
export const getPolygonColor = (inside, status) => {
    console.log("getPolygonColor");
    switch (true) {
        case (inside !== false && status === 0) :
            return "rgba(0,0,0,0.5)";//black
        case (status === 1):
            return "rgba(255,0,0,0.5)";//red
        case (!inside && status === 0) :
            return "rgba(0,0,255,0.5)";//blue
        default:
            return "rgba(0,250,55,0.5)";//green
    }
}

export const waitForChallengesData = async (user) => {
    const start = Date.now();

    try {
        const response = await fetchChallengesData(user)

        const duration = Date.now() - start;
        const remainingTime = 5000 - duration;

        if (remainingTime > 0) {
            await wait(remainingTime);
        }


        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
//another file helper
export const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));