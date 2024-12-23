import React, { createContext, useState, useEffect, useContext } from "react";
import { collection, query, where, onSnapshot, orderBy, limit, getDoc, deleteDoc, writeBatch, doc, getDocs, startAfter } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import db from "../firebase/db";
import { AuthContext } from "./authContext";
import { useNavigation } from "@react-navigation/core";

export const ListingsContext = createContext();

export const ListingsProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [trendingListings, setTrendingListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [acceptedOffers, setAcceptedOffers] = useState([]);

  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, removeListingReferenceFromUser } = useContext(AuthContext);
  const navigation = useNavigation();
  const listingsRef = collection(db, "listings");

  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState({});

  // fetch initial listings with real time listener to detect updates
  const fetchInitialListings = () => {
    setLoading(true);
  
    const listingsQuery = query(
      collection(db, "listings"),
      orderBy("timestamp", "desc"),
      limit(10)
    );
  
    const unsubscribe = onSnapshot(listingsQuery, (querySnapshot) => {
      const fetchedListings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setListings(fetchedListings);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);  // store last document for pagination
      setLoading(false);
    });
  
    setUnsubscribeFunctions((prev) => ({ ...prev, initialLoad: unsubscribe }));
  };
  
  useEffect(() => {
    fetchInitialListings();
  
    return () => {
      if (unsubscribeFunctions.initialLoad) unsubscribeFunctions.initialLoad();
    };
  }, [user]);

  // fetch more paginated listings
  const fetchMoreListings = async () => {
    if (loadingMore || !lastDoc) return;
  
    setLoadingMore(true);
    const listingsQuery = query(
      collection(db, "listings"),
      orderBy("timestamp", "desc"),
      startAfter(lastDoc),  // fetch after the last document
      limit(6)
    );
  
    const querySnapshot = await getDocs(listingsQuery);

    if (querySnapshot.empty) {
      setLoadingMore(false);
      return;  
    }
    
    const moreListings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  
    setListings((prevListings) => [...prevListings, ...moreListings]);  // append new listings
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);  // update last document for pagination
    setLoadingMore(false);
  };

  // Function to fetch data with real-time updates
  const fetchData = (queryKey, setData, queryRef) => {
    const unsubscribe = onSnapshot(
      queryRef,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(data);
      },
      (error) => {
        console.error(`Error fetching ${queryKey} data:`, error);
      }
    );

    setUnsubscribeFunctions((prev) => ({ ...prev, [queryKey]: unsubscribe }));
  };

  // fetch listings by listingIds
  const fetchListingsByIds = async (listingIds) => {
    if (!user) return [];

    const listings = [];
    for (const id of listingIds) {
      const docRef = doc(db, "listings", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        listings.push({ id: docSnap.id, ...docSnap.data() });
      }
    }
    return listings;
  };

  const unsubscribeAllListeners = () => {
    Object.values(unsubscribeFunctions).forEach((unsubscribe) => unsubscribe && unsubscribe());
    setUnsubscribeFunctions({});
  };

  useEffect(() => {
    // Unsubscribe from all listeners and clear data when the user logs out
    if (!user) {
      unsubscribeAllListeners();
      setListings([]);
      setUserListings([]);
      setTrendingListings([]);
      setRecentListings([]);
      return;
    }

    // fetch all listings
    // const fetchAllListings = () => {
    //   setLoading(true);
    //   const listingsQuery = query(collection(db, "listings"));

    //   const unsubscribe = onSnapshot(listingsQuery, (querySnapshot) => {
    //     const allListings = querySnapshot.docs.map(doc => ({
    //       id: doc.id,
    //       ...doc.data(),
    //     }));
    //     setListings(allListings);
    //     setLoading(false);
    //   }, (error) => {
    //     console.error("Error fetching listings: ", error);
    //     setLoading(false);
    //   });

    //   setUnsubscribeFunctions((prev) => ({ ...prev, allListings: unsubscribe }));
    // };

    // fetchAllListings();

    // return () => {
    //   if (unsubscribeFunctions["allListings"]) unsubscribeFunctions["allListings"]();
    // };
  }, [user]);

  // fetch user listings
  useEffect(() => {
    if (!user) {
      if (unsubscribeFunctions["userListings"]) unsubscribeFunctions["userListings"]();
      return;
    }
    const userQuery = query(listingsRef, where("owner", "==", user.uid));
    fetchData(`userListings`, setUserListings, userQuery);

    return () => {
      if (unsubscribeFunctions["userListings"]) unsubscribeFunctions["userListings"]();
    };
  }, [user]);

  // fetch trending listings (descending order in number of likes)
  useEffect(() => {
    if (!user) {
      if (unsubscribeFunctions["trendingListings"]) unsubscribeFunctions["trendingListings"]();
      return;
    }
    const trendingQuery = query(listingsRef, orderBy("likes", "desc"), limit(10));
    fetchData("trendingListings", setTrendingListings, trendingQuery);

    return () => {
      if (unsubscribeFunctions["trendingListings"]) unsubscribeFunctions["trendingListings"]();
    };
  }, [user]);

  // fetch recent listings (descending order by timestamp posted)
  useEffect(() => {
    if (!user) {
      if (unsubscribeFunctions["recentListings"]) unsubscribeFunctions["recentListings"]();
      return;
    }
    const recentQuery = query(listingsRef, orderBy("timestamp", "desc"), limit(10));
    fetchData("recentListings", setRecentListings, recentQuery);

    return () => {
      if (unsubscribeFunctions["recentListings"]) unsubscribeFunctions["recentListings"]();
    };
  }, [user]);

  // deletes offers associated with a listing
  const deleteListingOffers = async (listingId) => {
    const offersRef = collection(db, "offers");
    const q = query(offersRef, where("listing", "==", listingId));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log("No offers to delete for listingId:", listingId);
        return;
      }

      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error("Error deleting offers:", error);
    }
  };

  // deletes listing
  const removeListing = async (listing) => {
    setLoading(true);
    const storage = getStorage();
    const promises = listing.images.map(async (url) => {
      const decodedUrl = decodeURIComponent(url);
      const startIndex = decodedUrl.indexOf("/o/") + 3;
      const endIndex = decodedUrl.indexOf("?alt=");
      const filePath = decodedUrl.substring(startIndex, endIndex);

      const imageRef = ref(storage, filePath);
      return deleteObject(imageRef);
    });

    try {
      await Promise.all(promises);

      await removeListingReferenceFromUser(listing.id);
      await deleteListingOffers(listing.id);

      await deleteDoc(doc(db, "listings", listing.id));
      navigation.goBack();
      alert("Listing successfully deleted.");
    } catch (error) {
      console.error("Error during the listing removal process:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ListingsContext.Provider
      value={{ listings, removeListing, userListings, trendingListings, recentListings, fetchMoreListings, loadingMore, fetchListingsByIds, acceptedOffers, setLastDoc, setLoading, loading }}
    >
      {children}
    </ListingsContext.Provider>
  );
};