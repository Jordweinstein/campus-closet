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
        setNullData(); // Clear user data and unsubscribe listeners
      }

      return () => {
        if (unsubscribeUserDoc) unsubscribeUserDoc(); // Unsubscribe from user document listener
      };
    });

    return () => {
      unsubscribeAuth(); // Unsubscribe from auth state listener
    };
  }, [auth]);

  useEffect(() => {
    if (!likedListings.length || !user) {
      setLikedListingsData([]);
      return;
    }

    const fetchLikedListings = async () => {
      if (likedListings.length === 0) {
        setLikedListingsData([]);
        return;
      }
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
  }, [likedListings, user]); // Depend on user state

  const fetchInstaById = async (userId) => {
    const docRef = doc(db, "users", userId);
    const docRefSnapshot = await getDoc(docRef);

    if (docRefSnapshot.exists()) {
      return docRefSnapshot.data().insta; 
    } else {
      throw new Error('User not found'); 
    }
  };

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
    if (!user || likedListings.includes(listingId)) return; // Check if user is null

    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(doc(db, 'users', user.uid), {
      likedListings: arrayUnion(listingId),
    });
    await updateDoc(listingRef, {
      likes: increment(1),
    });

    setLikedListings(prev => [...prev, listingId]);
  };

  // Function to remove liked listing
  const removeLikedListing = async (listingId) => {
    if (!user) return; // Check if user is null

    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(doc(db, 'users', user.uid), {
      likedListings: arrayRemove(listingId),
    });
    await updateDoc(listingRef, {
      likes: increment(-1),
    });

    setLikedListings(prev => prev.filter(id => id !== listingId));
  };

  // Function to add listing reference to user's listing
  const addListingReferenceToUser = async (listingId) => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) return; // Check if user is null

      const userRef = doc(db, "users", currentUser.uid);

      await updateDoc(userRef, {
        listings: arrayUnion(listingId)
      });

    } catch (error) {
      console.error("Error updating user document: ", error);
    }
  };

  // Function to remove listing reference to user's listing
  const removeListingReferenceFromUser = async (listingId) => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) return; // Check if user is null

      const userRef = doc(db, "users", currentUser.uid);

      await updateDoc(userRef, {
        listings: arrayRemove(listingId)
      });

    } catch (error) {
      console.error("Error updating user document: ", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        setUser,
        fetchInstaById,
        isProfileComplete,
        setIsProfileComplete,
        likedListings,
        addLikedListing,
        removeLikedListing,
        likedListingsData,
        addListingReferenceToUser,
        removeListingReferenceFromUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
