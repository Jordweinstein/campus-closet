import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import db from '../db';
import { AuthContext } from './authContext';

export const ListingsContext = createContext();

export const ListingsProvider = ({ children }) => {
    const [listings, setListings] = useState([]);
    const [userListings, setUserListings] = useState([]);
    const [likedListingsData, setLikedListingsData] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "listings"),
            (querySnapshot) => {
                const listingsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setListings(listingsData);
            }, 
            (error) => {
                console.error("Error fetching listings data:", error);
            }
        );

        return () => unsubscribe(); 
        
    }, []);

    useEffect(() => {
        if (!user) {
            return null;
        }
        const listingsRef = collection(db, "listings");
        const q = query(listingsRef, where("owner", "==", user.uid));

        const unsubscribe = onSnapshot(q,
                (querySnapshot) => {
                    const listingsData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    setUserListings(listingsData);
                },
                (error) => {
                    console.error("error fetching user listings", error);
                }
            )

            return () => unsubscribe();
    }, [user]);

    return (
        <ListingsContext.Provider value={{ listings, userListings, likedListingsData }}>
            {children}
        </ListingsContext.Provider>
    );
};