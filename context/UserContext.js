import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


const UserContext = createContext();

const UserProvider = ({children}) => {
    const [user, setUser] = useState({});
    const loadUserData = async () => {
        try {
            console.log("userstart");
            const userData = await AsyncStorage.getItem('user');
            console.log("userend2",userData);
            if (userData) {
                console.log("userend3",user);
                setUser(JSON.parse(userData));
                console.log("userend4",user);
            }
            console.log("userend5",user);
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    const setSignedUser = async (item) => {
        setUser(item);
        try {
            // Save user data to AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(item));
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    };

    const clearUser = async () => {
        setUser(null);
        try {
            // Remove user data from AsyncStorage
            await AsyncStorage.removeItem('user');
            const userData = await AsyncStorage.getItem('user');
            console.log(userData,"OOOOOO")
        } catch (error) {
            console.error('Failed to clear user data:', error);
        }
    };

    return (
        <UserContext.Provider value={{user,setUser, setSignedUser,clearUser,loadUserData}}>
            {children}
        </UserContext.Provider>
    );
};

const useUser = () => {
    return useContext(UserContext);
};

export {UserProvider, useUser};