import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import db from '../db';

export const ListingsContext = createContext();

export const ListingsProvider = ({ children }) => {
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "listings"));
                const listingsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setListings(listingsData); 
            } catch (error) {
                console.error("Error fetching listings data:", error);
            }
        };

        fetchListings(); 
        
        return () => unsubscribe();
    }, []);

    return (
        <ListingsContext.Provider value={{ listings }}>
            {children}
        </ListingsContext.Provider>
    );
};