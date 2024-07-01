import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import db from '../db';
import { AuthContext } from './authContext';

export const ListingsContext = createContext();

export const ListingsProvider = ({ children }) => {
    const [listings, setListings] = useState([]);
    const [userListings, setUserListings] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) {
            return;
        }

        const unsubscribe = onSnapshot(
            collection(db, "listings"),
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

        return () => {
            unsubscribe();
        };
    }, [user]);

    useEffect(() => {
        let unsubscribe;

        if (user) {
            const listingsRef = collection(db, "listings");
            const q = query(listingsRef, where("owner", "==", user.uid));

            unsubscribe = onSnapshot(q,
                (querySnapshot) => {
                    const listingsData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setUserListings(listingsData);
                },
                (error) => {
                    console.error("Error fetching user listings", error);
                }
            );
        } else {
            setUserListings([]); 
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);

    return (
        <ListingsContext.Provider value={{ listings, userListings }}>
            {children}
        </ListingsContext.Provider>
    );
};