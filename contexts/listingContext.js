import React, { createContext, useState, useEffect, useContext } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, startAfter, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
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
  const [loading, setLoading] = useState(false);
  const { user, removeListingReferenceFromUser } = useContext(AuthContext);
  const navigation = useNavigation();
  const listingsRef = collection(db, "listings");

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

    return () => {
      unsubscribe();
    };
  };

  const fetchListingsByIds = async (listingIds) => {
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

  useEffect(() => {
    if (!user) return;

    const fetchPaginatedData = async () => {
      setLoading(true);
      let paginatedQuery;
      if (lastDoc) {
        paginatedQuery = query(listingsRef, orderBy("timestamp", "desc"), startAfter(lastDoc), limit(10));
      } else {
        paginatedQuery = query(listingsRef, orderBy("timestamp", "desc"), limit(10));
      }

      const querySnapshot = await getDocs(paginatedQuery);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings((prevData) => [...prevData, ...data]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setLoading(false);
    };

    fetchPaginatedData();
  }, [user]);

  // fetch user listings
  useEffect(() => {
    if (!user) {
      setUserListings([]);
      return;
    }
    const userQuery = query(listingsRef, where("owner", "==", user.uid));
    fetchData(`userListingsCache_${user.uid}`, setUserListings, userQuery);
  }, [user]);

  // fetch trending listings
  useEffect(() => {
    if (!user) return;
    const trendingQuery = query(listingsRef, orderBy("likes", "desc"), limit(10));
    fetchData("trendingListingsCache", setTrendingListings, trendingQuery);
  }, [user]);

  // fetch recent listings
  useEffect(() => {
    if (!user) return;
    const recentQuery = query(listingsRef, orderBy("timestamp", "desc"), limit(10));
    fetchData("recentListingsCache", setRecentListings, recentQuery);
  }, [user]);
  
  const removeListing = async (listing) => {
    setLoading(true);
    const storage = getStorage();
    const promises = listing.images.map(async (url) => {
      const decodedUrl = decodeURIComponent(url);
      const startIndex = decodedUrl.indexOf("/o/") + 3;
      const endIndex = decodedUrl.indexOf("?alt=");
      const filePath = decodedUrl.substring(startIndex, endIndex);

      const imageRef = ref(storage, filePath);
      await deleteObject(imageRef).then(() => {
        console.log(filePath + " image deleted successfully");
      }).catch((error) => {
        console.log(error);
      });
    });

    try {
      await Promise.all(promises);
      console.log("All files deleted successfully");

      try {
        await removeListingReferenceFromUser(listing.id);
        console.log("successfully removed listing reference from user doc");
      } catch (error) {
        console.log(error)
      }

      await deleteDoc(doc(db, "listings", listing.id));

      navigation.goBack();
      alert("Listing successfully deleted.");
    } catch (error) {
      console.error("Error deleting files:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ListingsContext.Provider
      value={{ listings, removeListing, userListings, trendingListings, recentListings, fetchListingsByIds, acceptedOffers, setLastDoc, setLoading, loading }}
    >
      {children}
    </ListingsContext.Provider>
  );
};