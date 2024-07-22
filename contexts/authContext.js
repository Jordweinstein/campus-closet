import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, arrayRemove, arrayUnion, updateDoc, increment } from 'firebase/firestore';
import db from '../firebase/db';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [likedListings, setLikedListings] = useState([]);
  const [likedListingsData, setLikedListingsData] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authenticatedUser) => {
      let unsubscribeUserDoc;

      if (authenticatedUser) {
        setUser(authenticatedUser);
        const userDocRef = doc(db, 'users', authenticatedUser.uid);

        unsubscribeUserDoc = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userDetails = userDocSnap.data();
            setUserData(userDetails);
            setIsProfileComplete(userDetails.isProfileComplete || false);
            setLikedListings(userDetails.likedListings || []);
          } else {
            setNullData(); 
          }
        }, (error) => {
          console.error("Error fetching user data: ", error);
          setNullData();
        });
      } else {
        setNullData(); 
      }
      return () => {
        if (unsubscribeUserDoc) unsubscribeUserDoc();
        setNullData();
      };
    });
    return () => unsubscribeAuth();
  }, [auth]);

  // Fetch listings data for liked listings
  useEffect(() => {
    if (!likedListings.length) {
      setLikedListingsData([]);
      return;
    }

    const fetchLikedListings = async () => {
      const likedListingsDocs = await Promise.all(
        likedListings.map(async (listingId) => {
          const docSnap = await getDoc(doc(db, 'listings', listingId));
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        })
      );

      const uniqueListings = Array.from(new Set(likedListingsDocs.filter(doc => doc !== null).map(item => item.id)))
        .map(id => likedListingsDocs.find(item => item.id === id));

      setLikedListingsData(uniqueListings);
    };

    fetchLikedListings();
  }, [likedListings]);

  // Function to clear all user-specific data
  const setNullData = () => {
    setUser(null);
    setUserData(null);
    setIsProfileComplete(false);
    setLikedListings([]);
    setLikedListingsData([]);
  };

  // Function to add liked listing
  const addLikedListing = async (listingId) => {
    if (!likedListings.includes(listingId)) {
      const listingRef = doc(db, 'listings', listingId);
      await updateDoc(doc(db, 'users', user.uid), {
        likedListings: arrayUnion(listingId),
      });
      await updateDoc(listingRef, {
        likes: increment(1),
      });

      setLikedListings(prev => [...prev, listingId]);
    }
  };

  // Function to remove liked listing
  const removeLikedListing = async (listingId) => {
    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(doc(db, 'users', user.uid), {
      likedListings: arrayRemove(listingId),
    });
    await updateDoc(listingRef, {
        likes: increment(-1),
    });

    setLikedListings(prev => prev.filter(id => id !== listingId));
  };

  // Providing context values
  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        setUser,
        isProfileComplete,
        setIsProfileComplete,
        likedListings,
        addLikedListing,
        removeLikedListing,
        likedListingsData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};