import React, { createContext, useState, useEffect, useContext } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  getDocs,
  query,
  where
} from "@firebase/firestore";
import db from "../firebase/db";
import { AuthContext } from "./authContext";

export const ListingsContext = createContext();

export const ListingsProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [trendingListings, setTrendingListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const { user } = useContext(AuthContext);
  const listingsRef = collection(db, "listings");

  // fetch all listings
  useEffect(
    () => {
      if (!user) {
        return;
      }

      const unsubscribe = onSnapshot(
        collection(db, "listings"),
        querySnapshot => {
          const listingsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setListings(listingsData);
        },
        error => {
          console.error("Error fetching listings data:", error);
        }
      );

      return () => {
        unsubscribe();
      };
    },
    [user]
  );

  // fetch user's listings
  useEffect(
    () => {
      let unsubscribe;

      if (user) {
        const q = query(listingsRef, where("owner", "==", user.uid));

        unsubscribe = onSnapshot(
          q,
          querySnapshot => {
            const listingsData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setUserListings(listingsData);
          },
          error => {
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
    },
    [user]
  );

  // Fetch trending listings based on like count
  useEffect(() => {
    let unsubscribe;

    if (user) {
      const q = query(listingsRef, orderBy("likes", "desc"), limit(10));

      unsubscribe = onSnapshot(
        q,
        querySnapshot => {
          const trendingListingsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTrendingListings(trendingListingsData);
        },
        error => {
          console.error("Error fetching trending listings", error);
        }
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  // Fetch recent listings based on timestamp of upload
  useEffect(() => {
    let unsubscribe;
    if (user) {
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(10));

      unsubscribe = onSnapshot(
        q,
        querySnapshot => {
          const recentListingsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRecentListings(recentListingsData);
        },
        error => {
          console.error("Error fetching recent listings", error);
        }
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return (
    <ListingsContext.Provider
      value={{ listings, userListings, trendingListings, recentListings }}
    >
      {children}
    </ListingsContext.Provider>
  );
};