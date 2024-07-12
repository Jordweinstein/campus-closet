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

  let userDocRef;

  if (auth.currentUser) {
    userDocRef = doc(db, 'users', auth.currentUser.uid);
  }

  const setNullData = () => {
    setUser(null);
    setUserData(null);
    setIsProfileComplete(false);
    setLikedListings([]);
  }
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authenticatedUser) => {
      if (authenticatedUser) {

        
        const unsubscribeUserDoc = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userDetails = userDocSnap.data();
            setUser(authenticatedUser);
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

        return () => unsubscribeUserDoc();
      } else {
        setNullData();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchLikedListings = async () => {
      const likedListingsDocs = await Promise.all(
        likedListings.map(async (listingId) => {
          const docSnap = await getDoc(doc(db, 'listings', listingId));
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        })
      );
  
      const uniqueListings = Array.from(new Set(likedListingsDocs.filter((doc) => doc !== null).map(item => item.id)))
        .map(id => likedListingsDocs.find(item => item.id === id));
  
      setLikedListingsData(uniqueListings);
    };
  
    if (likedListings.length > 0) {
      fetchLikedListings();
    } else {
      setLikedListingsData([]);
    }
  }, [likedListings]);

  const addLikedListing = async (listingId) => {
    try {
      if (!likedListings.includes(listingId)) {
        const listingRef = doc(db, 'listings', listingId);
        await updateDoc(userDocRef, {
          likedListings: arrayUnion(listingId),
        });
        await updateDoc(listingRef, {
          likes: increment(1),
        });

        setLikedListings((prev) => [...prev, listingId]);
      } else {
        console.log(`listing ${listingId} already here`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeLikedListing = async (listingId) => {
    try {
      const listingRef = doc(db, 'listings', listingId);
      await updateDoc(userDocRef, {
        likedListings: arrayRemove(listingId),
      });
      await updateDoc(listingRef, {
        likes: increment(-1),
      });

      setLikedListings((prev) => prev.filter((id) => id !== listingId));
    } catch (error) {
      console.log(error);
    }
  };

  const addListingReferenceToUser = async listingId => {
    try {
      await updateDoc(userDocRef, {
        listings: arrayUnion(listingId)
      });
    } catch (error) {
      console.error("Error updating user document: ", error);
    }
  };

  const removeListingReferenceFromUser = async listingId => {
    try {
      await updateDoc(userDocRef, {
        listings: arrayRemove(listingId)
      });
    } catch (error) {
      console.error("Error removing listing from user document: " + error);
    }
  }

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
        addListingReferenceToUser,
        removeListingReferenceFromUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};