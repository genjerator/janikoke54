import React, { createContext, useContext, useState } from 'react';

const ResultsContext = createContext();

const ResultsProvider = ({ children }) => {
    const [items, setItems] = useState([]);

    const setResults = (items) => {
        setItems(items);
    };

    return (
        <ResultsContext.Provider value={{ items, setResults }}>
            {children}
        </ResultsContext.Provider>
    );
};

const useResults = () => {
    return useContext(ResultsContext);
};

export { ResultsProvider, useResults };