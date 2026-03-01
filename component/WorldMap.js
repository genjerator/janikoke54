import React, {useEffect, useRef, useState} from "react";
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    Vibration,
} from "react-native";
import * as Location from "expo-location";
import MapView, {Marker, Polygon} from "react-native-maps";
import {getPolygonColor, processPolygonFromChallenge, waitForChallengesData} from "./Polygons";
import {postInsidePolygon} from "../axios/ApiCalls";
import {useUser} from "../context/UserContext";


const WorldMap = ({challenge}) => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [initialRegion, setInitialRegion] = useState(null);
    const [polygons, setPolygons] = useState([]);
    const [textx, setTextx] = useState("Loading...");
    const [countL, setCountL] = useState(0);
    const {user, loadUserData} = useUser();
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const locationSubscription = useRef(null); // Using useRef to persist subscription across renders

    useEffect(() => {
        loadUserData();
        var ok = true;
        const startWatchingLocation = async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Start watching the location and store the subscription in ref
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 5000, // 5 seconds interval
                    distanceInterval: 0, // Update if the user moves by 1 meter
                },
                (newLocation) => {
                    setLocation(newLocation); // Update location
                    setCountL((prevCount) => {
                        const newCount = prevCount + 1;
                        console.log('Location updated: Update Count:', newCount); // Log updated count
                        return newCount;
                    });
                    setTextx(newLocation.timestamp + ":" + newLocation.coords.latitude);
                    setCurrentLocation(newLocation);
                    console.log('Location changed:', newLocation, new Date().toLocaleString());
                    setInitialRegion({
                        latitude: newLocation.coords.latitude,
                        longitude: newLocation.coords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    });
                    const polygonsToRender = processPolygonFromChallenge(newLocation, challenge)
                    setPolygons(polygonsToRender);
                    const insidePolygon = polygonsToRender.find(polygon => polygon.inside !== false);
                    console.log("polygonsToRender:", polygonsToRender);
                    console.log("insidePolygons:", insidePolygon);
                    if (insidePolygon && insidePolygon.inside !== false && insidePolygon.status === 0) {
                        console.log("First polygon with inside property true:", insidePolygon);
                        console.log("22s22:", insidePolygon.inside, insidePolygon.status, getPolygonColor(insidePolygon.inside, insidePolygon.status));
                        postInsidePolygon({
                            'area_id': insidePolygon.inside,
                            'challenge_id': insidePolygon.id
                        }, user)
                            .then((result) => {
                                // Use the resolved value from postInsidePolygon
                                console.log(result, "Result from posstInsidePolygon");
                                if (result) {
                                    // Do something with the result
                                    console.log("Operation successful:", result);
                                    processInside(insidePolygon, polygonsToRender);
                                    Vibration.vibrate(1000, false);
                                    challenge = data.map(item => {
                                        if (item.area_id === insidePolygon.inside) {
                                            item.status = 1;
                                        }
                                        return item;
                                    });
                                    console.log("new challenge:", challenge);
                                }
                            })
                    }
                }
            );
        };

        startWatchingLocation().then(() => {
            console.log("ASASA")
        });

        // Cleanup function to stop watching location on component unmount
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                console.log("Stopped watcshing location");
            }
        };
    }, []);
    const vibrateIfTrue = (condition) => {
        if (condition) {
            Vibration.vibrate(500); // Vibrates for 500 milliseconds (0.5 sec)
        }
    };
    const delayxx = (ms) => {
        return new Promise((resolve) =>
            setTimeout(resolve, ms));
    };
    const processInside = (insidePolygon, polygonsxxx) => {
        try {
            console.log("before vibrate:x", new Date().getTime());


            insidePolygon.status = 1;
            insidePolygon.color = getPolygonColor(true, insidePolygon.status);
            console.log("after vibrateeeeeeee:", new Date().getTime());
            const t = polygonsxxx.map(item => {
                if (item.area_id === insidePolygon.area_id) {
                    return insidePolygon;
                }
                return item;
            });
            console.log("after vibrats:", t);
            setPolygons(t);
        } catch (error) {
            console.log("ERRRROsR", error)
        }
    }
    return (

        <View style={{flex: 1}}>
            <View style={styles.textContainer}>
                <Text style={styles.text}>{textx}:{countL}</Text>
            </View>
            {initialRegion && (
                <MapView style={styles.map} initialRegion={initialRegion}>
                    {currentLocation && (
                        <Marker
                            coordinate={{
                                latitude: currentLocation.coords.latitude,
                                longitude: currentLocation.coords.longitude,
                            }}
                            title="Your Location"
                        />
                    )}

                    {currentLocation && polygons && polygons.map((polygon, index) => (
                        <Polygon
                            key={index}
                            coordinates={polygon.coords}
                            fillColor={polygon.color}
                            strokeColor="rgba(255,0,0,1)"
                            strokeWidth={2}
                        />
                    ))}
                </MapView>
            )}
            {/* Rest of your code */}
        </View>
    );
};
const {width, height} = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    map: {
        width: width,
        height: height,

    },
    textContainer: {
        //padding: 10,
        height: 40,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default WorldMap;