import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion, increment } from 'firebase/firestore';
import db from '../db';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [likedListings, setLikedListings] = useState([]);
    const [likedListingsData, setLikedListingsData] = useState([]);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
            if (authenticatedUser) {
                const userDocRef = doc(db, "users", authenticatedUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userDetails = userDoc.data();
                    console.log(userDetails);
                    setIsProfileComplete(userDetails.isProfileComplete || false);
                    setUserData(userDetails);
                    setLikedListings(userDetails.likedListings || []);
                } else {
                    console.log("No user document found");
                    setUserData(null);
                    setLikedListings([]);
                }
                setUser(authenticatedUser); 
            } else {
                setUser(null);
                setUserData(null);
                setIsProfileComplete(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchLikedListings = async () => {
            const likedListingsDocs = await Promise.all(likedListings.map(async (listingId) => {
                const docSnap = await getDoc(doc(db, "listings", listingId));
                return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
            }));

            setLikedListingsData(likedListingsDocs.filter(doc => doc !== null));
        };

        if (likedListings.length > 0) {
            fetchLikedListings();
        } else {
            setLikedListingsData([]);
        }
    }, [likedListings]);

    const addLikedListing = async (listingId) => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const listingRef = doc(db, "listings", listingId);
            await updateDoc(userDocRef, {
                likedListings: arrayUnion(listingId)
            });
            await updateDoc(listingRef, {
                likes: increment(1)
            });

            setLikedListings(prev => [...prev, listingId]);
        } catch (error) {
            console.log(error);
        }
    };

    const removeLikedListing = async (listingId) => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const listingRef = doc(db, "listings", listingId);
            await updateDoc(userDocRef, {
                likedListings: arrayRemove(listingId)
            });
            await updateDoc(listingRef, {
                likes: increment(-1)
            });

            setLikedListings(prev => prev.filter(id => id !== listingId));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            userData, 
            setUser, 
            isProfileComplete, 
            likedListings, 
            setLikedListings,
            addLikedListing,
            removeLikedListing,
            likedListingsData,
        }}>
            {children}
        </AuthContext.Provider>
    );
};