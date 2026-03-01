import React, { createContext, useContext, useState } from 'react';

const GlobalContext = createContext();

const GlobalContextProvider = ({ children }) => {
    const [challenges, setChallenges] = useState([]);
    const [results, setResults] = useState([]);
    const [user, setUser] = useState([]);

    const setAllChallenges = (items) => {
        setChallenges(items);
    };

    const setAllResults = (items) => {
        setResults(items);
    };

    const setSignedUser = (items) => {
        setUser(items);
    };

    const sumPoints = ()  => {
        console.log("resultxxx",results);
        return Object.values(results).reduce((sum, challenge) => sum + challenge.points, 0);
    };

    return (
        <GlobalContext.Provider value={{ challenges, setAllChallenges,results,setAllResults,user, setSignedUser  }}>
            {children}
        </GlobalContext.Provider>
    );
};

const useGlobalContext = () => {
    return useContext(GlobalContext);
};

export { GlobalContextProvider, useGlobalContext };