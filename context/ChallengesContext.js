import React, { createContext, useContext, useState } from 'react';

const ChallengesContext = createContext();

const ChallengesProvider = ({ children }) => {
    const [items, setItems] = useState([]);

    const setChallenges = (items) => {
        setItems(items);
    };
    const getChallenges = () => {
        return items
    };


    return (
        <ChallengesContext.Provider value={{ items, setChallenges,getChallenges }}>
            {children}
        </ChallengesContext.Provider>
    );
};

const useChallenges = () => {
    return useContext(ChallengesContext);
};

export { ChallengesProvider, useChallenges };