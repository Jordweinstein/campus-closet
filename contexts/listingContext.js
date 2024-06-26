import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase-config'; // Adjust according to your project structure

export const ListingContext = createContext();

export const ListingProvider = ({ children }) => {
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const unsubscribe = db.collection('listings').onSnapshot(snapshot => {
            const listingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setListings(listingData);
        });

        return () => unsubscribe();
    }, []);

    return <ListingContext.Provider value={listings}>{children}</ListingContext.Provider>;
};